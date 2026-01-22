import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase with service role key for server-side operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// PayPal webhook event types we handle
const PAYMENT_COMPLETED = 'PAYMENT.SALE.COMPLETED'
const SUBSCRIPTION_ACTIVATED = 'BILLING.SUBSCRIPTION.ACTIVATED'
const SUBSCRIPTION_CANCELLED = 'BILLING.SUBSCRIPTION.CANCELLED'
const SUBSCRIPTION_SUSPENDED = 'BILLING.SUBSCRIPTION.SUSPENDED'
const SUBSCRIPTION_PAYMENT_FAILED = 'BILLING.SUBSCRIPTION.PAYMENT.FAILED'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const eventType = body.event_type
    const resource = body.resource

    console.log('PayPal webhook received:', eventType)

    switch (eventType) {
      case PAYMENT_COMPLETED: {
        // A subscription payment was completed
        const subscriptionId = resource.billing_agreement_id
        const amount = parseFloat(resource.amount.total)
        const transactionId = resource.id

        // Find subscription by PayPal ID
        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('id, client_id')
          .eq('paypal_subscription_id', subscriptionId)
          .single()

        if (subscription) {
          // Record the payment
          await supabase.from('payment_history').insert({
            subscription_id: subscription.id,
            client_id: subscription.client_id,
            amount_usd: amount,
            paypal_transaction_id: transactionId,
            status: 'completed',
            payment_date: new Date().toISOString()
          })

          // Update next billing date (30 days from now)
          await supabase
            .from('subscriptions')
            .update({
              next_billing_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            })
            .eq('id', subscription.id)
        }
        break
      }

      case SUBSCRIPTION_ACTIVATED: {
        const subscriptionId = resource.id

        // Update subscription status
        await supabase
          .from('subscriptions')
          .update({ status: 'active' })
          .eq('paypal_subscription_id', subscriptionId)

        // Update client status
        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('client_id')
          .eq('paypal_subscription_id', subscriptionId)
          .single()

        if (subscription) {
          await supabase
            .from('clients')
            .update({
              is_subscribed: true,
              subscription_status: 'active'
            })
            .eq('id', subscription.client_id)
        }
        break
      }

      case SUBSCRIPTION_CANCELLED: {
        const subscriptionId = resource.id

        // Update subscription status
        await supabase
          .from('subscriptions')
          .update({
            status: 'cancelled',
            cancelled_at: new Date().toISOString()
          })
          .eq('paypal_subscription_id', subscriptionId)

        // Update client status
        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('client_id')
          .eq('paypal_subscription_id', subscriptionId)
          .single()

        if (subscription) {
          await supabase
            .from('clients')
            .update({
              is_subscribed: false,
              subscription_status: 'cancelled'
            })
            .eq('id', subscription.client_id)
        }
        break
      }

      case SUBSCRIPTION_SUSPENDED: {
        const subscriptionId = resource.id

        await supabase
          .from('subscriptions')
          .update({ status: 'paused' })
          .eq('paypal_subscription_id', subscriptionId)

        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('client_id')
          .eq('paypal_subscription_id', subscriptionId)
          .single()

        if (subscription) {
          await supabase
            .from('clients')
            .update({
              is_subscribed: false,
              subscription_status: 'paused'
            })
            .eq('id', subscription.client_id)
        }
        break
      }

      case SUBSCRIPTION_PAYMENT_FAILED: {
        const subscriptionId = resource.id

        await supabase
          .from('subscriptions')
          .update({ status: 'past_due' })
          .eq('paypal_subscription_id', subscriptionId)

        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('id, client_id')
          .eq('paypal_subscription_id', subscriptionId)
          .single()

        if (subscription) {
          await supabase
            .from('clients')
            .update({ subscription_status: 'past_due' })
            .eq('id', subscription.client_id)

          // Record failed payment attempt
          await supabase.from('payment_history').insert({
            subscription_id: subscription.id,
            client_id: subscription.client_id,
            amount_usd: 255,
            status: 'failed',
            payment_date: new Date().toISOString()
          })
        }
        break
      }

      default:
        console.log('Unhandled PayPal event type:', eventType)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('PayPal webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

// Route segment config for App Router
export const dynamic = 'force-dynamic'
