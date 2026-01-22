import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createAzulClient, AzulClient } from '@/lib/azul/client'

/**
 * This endpoint processes recurring payments for active subscriptions.
 * It should be called by a cron job daily to process payments due.
 *
 * Note: Unlike PayPal, Azul doesn't automatically process recurring payments
 * from their side when using the API directly. We need to trigger payments
 * ourselves using saved card tokens (DataVault).
 */
export async function POST(request: NextRequest) {
  // Initialize Supabase with service role key
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    // Verify cron secret (for security)
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all active subscriptions due for billing today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select(`
        id,
        client_id,
        price_usd,
        azul_token,
        next_billing_date,
        client:clients(id, name, email, azul_customer_token)
      `)
      .eq('status', 'active')
      .gte('next_billing_date', today.toISOString())
      .lt('next_billing_date', tomorrow.toISOString())

    if (error) {
      console.error('Error fetching subscriptions:', error)
      return NextResponse.json(
        { error: 'Failed to fetch subscriptions' },
        { status: 500 }
      )
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({
        message: 'No subscriptions due for billing today',
        processed: 0
      })
    }

    const azul = createAzulClient()
    const results = {
      successful: 0,
      failed: 0,
      errors: [] as string[]
    }

    // Process each subscription
    for (const subscription of subscriptions) {
      const token = subscription.azul_token ||
                    (subscription.client as any)?.azul_customer_token

      if (!token) {
        results.failed++
        results.errors.push(`Subscription ${subscription.id}: No payment token found`)

        // Mark subscription as past_due
        await supabase
          .from('subscriptions')
          .update({ status: 'past_due' })
          .eq('id', subscription.id)

        continue
      }

      try {
        // Calculate amounts
        const amountInCents = subscription.price_usd * 100
        const itbisInCents = Math.round(amountInCents * 0.18)
        const totalInCents = amountInCents + itbisInCents
        const customOrderId = `AFDEVS-REC-${subscription.id}-${Date.now()}`

        // Process payment with saved token
        const response = await azul.processTokenSale(
          token,
          totalInCents,
          itbisInCents,
          customOrderId
        )

        if (AzulClient.isApproved(response)) {
          results.successful++

          // Record successful payment
          await supabase.from('payment_history').insert({
            subscription_id: subscription.id,
            client_id: subscription.client_id,
            amount_usd: subscription.price_usd,
            amount_itbis: subscription.price_usd * 0.18,
            azul_transaction_id: response.AzulOrderId,
            azul_authorization_code: response.AuthorizationCode,
            status: 'completed',
            payment_date: new Date().toISOString()
          })

          // Update next billing date
          await supabase
            .from('subscriptions')
            .update({
              next_billing_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              status: 'active'
            })
            .eq('id', subscription.id)
        } else {
          results.failed++
          results.errors.push(
            `Subscription ${subscription.id}: ${AzulClient.getErrorMessage(response)}`
          )

          // Record failed payment attempt
          await supabase.from('payment_history').insert({
            subscription_id: subscription.id,
            client_id: subscription.client_id,
            amount_usd: subscription.price_usd,
            status: 'failed',
            payment_date: new Date().toISOString()
          })

          // Mark subscription as past_due
          await supabase
            .from('subscriptions')
            .update({ status: 'past_due' })
            .eq('id', subscription.id)

          await supabase
            .from('clients')
            .update({ subscription_status: 'past_due' })
            .eq('id', subscription.client_id)
        }
      } catch (err) {
        results.failed++
        results.errors.push(`Subscription ${subscription.id}: ${err}`)
      }
    }

    return NextResponse.json({
      message: 'Recurring payments processed',
      total: subscriptions.length,
      successful: results.successful,
      failed: results.failed,
      errors: results.errors
    })
  } catch (error) {
    console.error('Recurring payment processing error:', error)
    return NextResponse.json(
      { error: 'Failed to process recurring payments' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'
