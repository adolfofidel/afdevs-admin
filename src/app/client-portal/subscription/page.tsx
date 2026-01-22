'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Subscription {
  id: string
  status: string
  plan_name: string
  price_usd: number
  started_at: string
  next_billing_date: string | null
  paypal_subscription_id: string | null
  cancelled_at: string | null
}

interface PaymentHistory {
  id: string
  amount_usd: number
  status: string
  payment_date: string
  paypal_transaction_id: string | null
}

declare global {
  interface Window {
    paypal?: any
  }
}

export default function SubscriptionPage() {
  const supabase = createClient()
  const [clientId, setClientId] = useState<string | null>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [paypalLoaded, setPaypalLoaded] = useState(false)

  const PLAN_PRICE = 255
  const PLAN_NAME = 'Preventive Tech Maintenance'

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      // Get client ID
      const { data: clientUser } = await supabase
        .from('client_users')
        .select('client_id')
        .eq('auth_user_id', session.user.id)
        .single()

      if (!clientUser) {
        setLoading(false)
        return
      }

      setClientId(clientUser.client_id)

      // Get active subscription
      const { data: subs } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('client_id', clientUser.client_id)
        .order('created_at', { ascending: false })
        .limit(1)

      if (subs && subs.length > 0) {
        setSubscription(subs[0])
      }

      // Get payment history
      const { data: payments } = await supabase
        .from('payment_history')
        .select('*')
        .eq('client_id', clientUser.client_id)
        .order('payment_date', { ascending: false })
        .limit(10)

      if (payments) {
        setPaymentHistory(payments)
      }

      setLoading(false)
    }

    fetchData()
  }, [supabase])

  // Load PayPal SDK
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.paypal) {
      const script = document.createElement('script')
      // Use sandbox for testing - replace with live client ID for production
      script.src = 'https://www.paypal.com/sdk/js?client-id=sb&vault=true&intent=subscription'
      script.async = true
      script.onload = () => setPaypalLoaded(true)
      document.body.appendChild(script)
    } else if (window.paypal) {
      setPaypalLoaded(true)
    }
  }, [])

  const initPayPalButtons = useCallback(() => {
    if (!window.paypal || !clientId) return

    const container = document.getElementById('paypal-button-container')
    if (!container) return
    container.innerHTML = ''

    window.paypal.Buttons({
      style: {
        shape: 'rect',
        color: 'blue',
        layout: 'vertical',
        label: 'subscribe'
      },
      createSubscription: async (data: any, actions: any) => {
        // In production, you would create a plan in PayPal Dashboard
        // and use that plan ID here. For now, using a placeholder.
        // Replace 'P-XXXXXXXXXXXXXXXXX' with your actual PayPal plan ID
        return actions.subscription.create({
          plan_id: 'P-SUBSCRIPTION_PLAN_ID' // Replace with real plan ID from PayPal
        })
      },
      onApprove: async (data: any, actions: any) => {
        // Subscription approved - save to database
        const { error } = await supabase
          .from('subscriptions')
          .insert({
            client_id: clientId,
            status: 'active',
            plan_name: PLAN_NAME,
            price_usd: PLAN_PRICE,
            paypal_subscription_id: data.subscriptionID,
            started_at: new Date().toISOString(),
            next_billing_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          })
          .select()
          .single()

        if (!error) {
          // Update client's subscription status
          await supabase
            .from('clients')
            .update({
              is_subscribed: true,
              subscription_status: 'active',
              paypal_customer_id: data.subscriptionID
            })
            .eq('id', clientId)

          // Refresh the page to show updated subscription
          window.location.reload()
        }
      },
      onError: (err: any) => {
        console.error('PayPal error:', err)
        alert('Hubo un error al procesar el pago. Por favor intente de nuevo.')
      }
    }).render('#paypal-button-container')
  }, [clientId, supabase])

  useEffect(() => {
    if (paypalLoaded && clientId && !subscription) {
      initPayPalButtons()
    }
  }, [paypalLoaded, clientId, subscription, initPayPalButtons])

  const handleCancelSubscription = async () => {
    if (!subscription || !confirm('¿Estás seguro de que deseas cancelar tu suscripción?')) {
      return
    }

    // Update subscription status
    await supabase
      .from('subscriptions')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString()
      })
      .eq('id', subscription.id)

    // Update client status
    await supabase
      .from('clients')
      .update({
        is_subscribed: false,
        subscription_status: 'cancelled'
      })
      .eq('id', clientId)

    // Note: In production, you would also cancel the PayPal subscription via API
    // using the paypal_subscription_id

    window.location.reload()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mi Suscripción</h1>
        <p className="text-gray-600 mt-1">Gestiona tu plan de mantenimiento preventivo tecnológico</p>
      </div>

      {/* Plan Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Plan Card */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-brand-primary to-brand-secondary p-6 text-white">
            <h2 className="text-xl font-bold">Preventive Tech Maintenance</h2>
            <p className="opacity-90 mt-1">Plan de mantenimiento preventivo completo</p>
          </div>

          <div className="p-6">
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-bold text-gray-900">${PLAN_PRICE}</span>
              <span className="text-gray-500">/mes</span>
            </div>

            <ul className="space-y-3 mb-6">
              {[
                'Revisión mensual de todos los sistemas',
                'Mantenimiento preventivo de equipos',
                'Soporte técnico prioritario',
                'Actualizaciones de firmware y software',
                'Monitoreo remoto 24/7',
                'Reportes mensuales de estado',
                'Descuentos en servicios adicionales'
              ].map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-600">{feature}</span>
                </li>
              ))}
            </ul>

            {subscription?.status === 'active' ? (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium text-green-800">Suscripción Activa</span>
                  </div>
                  <p className="text-sm text-green-700 mt-1">
                    Próximo cobro: {subscription.next_billing_date ? new Date(subscription.next_billing_date).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <button
                  onClick={handleCancelSubscription}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Cancelar suscripción
                </button>
              </div>
            ) : subscription?.status === 'cancelled' ? (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span className="font-medium text-gray-700">Suscripción Cancelada</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Cancelada el: {subscription.cancelled_at ? new Date(subscription.cancelled_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div id="paypal-button-container" className="mt-4"></div>
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-500 mb-4">Suscríbete ahora con PayPal:</p>
                <div id="paypal-button-container"></div>
                {!paypalLoaded && (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-accent"></div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Subscription Details */}
        <div className="space-y-6">
          {subscription && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Detalles de Suscripción</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Estado:</span>
                  <span className={`font-medium ${
                    subscription.status === 'active' ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {subscription.status === 'active' ? 'Activa' :
                     subscription.status === 'cancelled' ? 'Cancelada' : subscription.status}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Plan:</span>
                  <span className="font-medium">{subscription.plan_name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Precio:</span>
                  <span className="font-medium">${subscription.price_usd}/mes</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Fecha inicio:</span>
                  <span className="font-medium">
                    {new Date(subscription.started_at).toLocaleDateString()}
                  </span>
                </div>
                {subscription.next_billing_date && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Próximo cobro:</span>
                    <span className="font-medium">
                      {new Date(subscription.next_billing_date).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Payment Method */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Método de Pago</h3>
            <div className="flex items-center gap-3">
              <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">PayPal</span>
              </div>
              <span className="text-sm text-gray-600">
                {subscription?.paypal_subscription_id ? 'PayPal conectado' : 'No configurado'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment History */}
      {paymentHistory.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Historial de Pagos</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transacción</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paymentHistory.map((payment) => (
                  <tr key={payment.id}>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(payment.payment_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      ${payment.amount_usd}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                        payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        payment.status === 'failed' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {payment.status === 'completed' ? 'Completado' :
                         payment.status === 'pending' ? 'Pendiente' :
                         payment.status === 'failed' ? 'Fallido' :
                         payment.status === 'refunded' ? 'Reembolsado' : payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                      {payment.paypal_transaction_id || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
