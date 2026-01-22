import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createAzulClient, AzulClient } from '@/lib/azul/client'

export async function POST(request: NextRequest) {
  // Initialize Supabase with service role key inside the handler
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    const body = await request.json()
    const {
      clientId,
      cardNumber,
      expiration,
      cvc,
      cardholderName,
      saveCard
    } = body

    // Validate required fields
    if (!clientId || !cardNumber || !expiration || !cvc) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify client exists
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id, name, email')
      .eq('id', clientId)
      .single()

    if (clientError || !client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      )
    }

    // Initialize Azul client
    const azul = createAzulClient()

    // Plan details
    const PLAN_PRICE = 255 // USD
    const PLAN_NAME = 'Preventive Tech Maintenance'

    // Convert to cents and calculate ITBIS (18% tax in DR)
    const amountInCents = PLAN_PRICE * 100
    const itbisInCents = Math.round(amountInCents * 0.18)
    const totalInCents = amountInCents + itbisInCents

    // Generate custom order ID
    const customOrderId = `AFDEVS-SUB-${clientId}-${Date.now()}`

    // Process the initial payment and optionally save card
    const saleResponse = await azul.processSale({
      cardNumber,
      expiration,
      cvc,
      amount: totalInCents,
      itbis: itbisInCents,
      customOrderId,
      saveToDataVault: saveCard
    })

    // Check if payment was approved
    if (!AzulClient.isApproved(saleResponse)) {
      // Check if 3DS is required
      if (AzulClient.requires3DS(saleResponse)) {
        return NextResponse.json({
          requires3DS: true,
          azulOrderId: saleResponse.AzulOrderId,
          threeDSData: saleResponse.ThreeDSMethod || saleResponse.ThreeDSChallenge
        })
      }

      return NextResponse.json(
        {
          error: AzulClient.getErrorMessage(saleResponse),
          isoCode: saleResponse.IsoCode
        },
        { status: 400 }
      )
    }

    // Payment successful - create subscription record
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .insert({
        client_id: clientId,
        status: 'active',
        plan_name: PLAN_NAME,
        price_usd: PLAN_PRICE,
        azul_order_id: saleResponse.AzulOrderId,
        azul_token: saleResponse.DataVaultToken || null,
        started_at: new Date().toISOString(),
        next_billing_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      })
      .select()
      .single()

    if (subError) {
      console.error('Error creating subscription:', subError)
      return NextResponse.json(
        { error: 'Failed to create subscription record' },
        { status: 500 }
      )
    }

    // Record the payment
    await supabase.from('payment_history').insert({
      subscription_id: subscription.id,
      client_id: clientId,
      amount_usd: PLAN_PRICE,
      amount_itbis: PLAN_PRICE * 0.18,
      azul_transaction_id: saleResponse.AzulOrderId,
      azul_authorization_code: saleResponse.AuthorizationCode,
      status: 'completed',
      payment_date: new Date().toISOString()
    })

    // Update client subscription status
    await supabase
      .from('clients')
      .update({
        is_subscribed: true,
        subscription_status: 'active',
        azul_customer_token: saleResponse.DataVaultToken || null
      })
      .eq('id', clientId)

    return NextResponse.json({
      success: true,
      subscription: {
        id: subscription.id,
        status: 'active',
        plan_name: PLAN_NAME,
        price_usd: PLAN_PRICE,
        next_billing_date: subscription.next_billing_date
      },
      transaction: {
        azulOrderId: saleResponse.AzulOrderId,
        authorizationCode: saleResponse.AuthorizationCode
      }
    })
  } catch (error) {
    console.error('Azul subscription error:', error)
    return NextResponse.json(
      { error: 'Failed to process subscription' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'
