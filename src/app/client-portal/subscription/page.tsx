'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Subscription {
  id: string
  status: string
  plan_name: string
  price_usd: number
  started_at: string
  next_billing_date: string | null
  azul_order_id: string | null
  cancelled_at: string | null
}

interface PaymentHistory {
  id: string
  amount_usd: number
  status: string
  payment_date: string
  azul_transaction_id: string | null
}

export default function SubscriptionPage() {
  const supabase = createClient()
  const [clientId, setClientId] = useState<string | null>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Card form state
  const [cardNumber, setCardNumber] = useState('')
  const [expMonth, setExpMonth] = useState('')
  const [expYear, setExpYear] = useState('')
  const [cvc, setCvc] = useState('')
  const [cardholderName, setCardholderName] = useState('')
  const [saveCard, setSaveCard] = useState(true)

  const PLAN_PRICE = 255
  const PLAN_NAME = 'Preventive Tech Maintenance'
  const ITBIS_RATE = 0.18

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

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ''
    const parts = []

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }

    if (parts.length) {
      return parts.join(' ')
    } else {
      return value
    }
  }

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value)
    if (formatted.replace(/\s/g, '').length <= 16) {
      setCardNumber(formatted)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setProcessing(true)

    try {
      // Format expiration as YYYYMM
      const expiration = `20${expYear}${expMonth.padStart(2, '0')}`

      const response = await fetch('/api/azul/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          clientId,
          cardNumber: cardNumber.replace(/\s/g, ''),
          expiration,
          cvc,
          cardholderName,
          saveCard
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Error al procesar el pago')
        setProcessing(false)
        return
      }

      if (data.requires3DS) {
        // Handle 3DS authentication if needed
        setError('Se requiere autenticación adicional. Por favor contacte soporte.')
        setProcessing(false)
        return
      }

      // Success - reload page
      window.location.reload()
    } catch (err) {
      console.error('Payment error:', err)
      setError('Error al procesar el pago. Por favor intente de nuevo.')
      setProcessing(false)
    }
  }

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

    window.location.reload()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
      </div>
    )
  }

  const totalWithTax = PLAN_PRICE * (1 + ITBIS_RATE)

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
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-4xl font-bold text-gray-900">${PLAN_PRICE}</span>
              <span className="text-gray-500">/mes</span>
            </div>
            <p className="text-sm text-gray-500 mb-6">+ ITBIS (18%): ${(PLAN_PRICE * ITBIS_RATE).toFixed(2)} = <strong>${totalWithTax.toFixed(2)}</strong> total</p>

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
                {/* Show payment form for resubscription */}
                <PaymentForm
                  cardNumber={cardNumber}
                  expMonth={expMonth}
                  expYear={expYear}
                  cvc={cvc}
                  cardholderName={cardholderName}
                  saveCard={saveCard}
                  processing={processing}
                  error={error}
                  onCardNumberChange={handleCardNumberChange}
                  onExpMonthChange={(e) => setExpMonth(e.target.value)}
                  onExpYearChange={(e) => setExpYear(e.target.value)}
                  onCvcChange={(e) => setCvc(e.target.value.slice(0, 4))}
                  onCardholderNameChange={(e) => setCardholderName(e.target.value)}
                  onSaveCardChange={(e) => setSaveCard(e.target.checked)}
                  onSubmit={handleSubmit}
                  totalAmount={totalWithTax}
                />
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-500 mb-4">Suscríbete ahora con tarjeta de crédito o débito:</p>
                <PaymentForm
                  cardNumber={cardNumber}
                  expMonth={expMonth}
                  expYear={expYear}
                  cvc={cvc}
                  cardholderName={cardholderName}
                  saveCard={saveCard}
                  processing={processing}
                  error={error}
                  onCardNumberChange={handleCardNumberChange}
                  onExpMonthChange={(e) => setExpMonth(e.target.value)}
                  onExpYearChange={(e) => setExpYear(e.target.value)}
                  onCvcChange={(e) => setCvc(e.target.value.slice(0, 4))}
                  onCardholderNameChange={(e) => setCardholderName(e.target.value)}
                  onSaveCardChange={(e) => setSaveCard(e.target.checked)}
                  onSubmit={handleSubmit}
                  totalAmount={totalWithTax}
                />
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
                     subscription.status === 'cancelled' ? 'Cancelada' :
                     subscription.status === 'past_due' ? 'Pago pendiente' : subscription.status}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Plan:</span>
                  <span className="font-medium">{subscription.plan_name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Precio:</span>
                  <span className="font-medium">${subscription.price_usd}/mes + ITBIS</span>
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
              <div className="flex gap-1">
                <div className="w-10 h-6 bg-blue-700 rounded flex items-center justify-center">
                  <span className="text-white text-[8px] font-bold">VISA</span>
                </div>
                <div className="w-10 h-6 bg-red-600 rounded flex items-center justify-center">
                  <span className="text-white text-[8px] font-bold">MC</span>
                </div>
              </div>
              <span className="text-sm text-gray-600">
                {subscription?.azul_order_id ? 'Tarjeta guardada' : 'No configurado'}
              </span>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <img src="https://www.azul.com.do/Portals/0/Images/logo-azul.png" alt="AZUL" className="h-6" />
              <span className="text-xs text-gray-400">Procesado por AZUL</span>
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
                      {payment.azul_transaction_id || '-'}
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

// Payment Form Component
interface PaymentFormProps {
  cardNumber: string
  expMonth: string
  expYear: string
  cvc: string
  cardholderName: string
  saveCard: boolean
  processing: boolean
  error: string | null
  totalAmount: number
  onCardNumberChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onExpMonthChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  onExpYearChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  onCvcChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onCardholderNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onSaveCardChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onSubmit: (e: React.FormEvent) => void
}

function PaymentForm({
  cardNumber,
  expMonth,
  expYear,
  cvc,
  cardholderName,
  saveCard,
  processing,
  error,
  totalAmount,
  onCardNumberChange,
  onExpMonthChange,
  onExpYearChange,
  onCvcChange,
  onCardholderNameChange,
  onSaveCardChange,
  onSubmit
}: PaymentFormProps) {
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 10 }, (_, i) => currentYear + i)
  const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'))

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre en la tarjeta
        </label>
        <input
          type="text"
          value={cardholderName}
          onChange={onCardholderNameChange}
          placeholder="NOMBRE APELLIDO"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-brand-accent uppercase"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Número de tarjeta
        </label>
        <div className="relative">
          <input
            type="text"
            value={cardNumber}
            onChange={onCardNumberChange}
            placeholder="1234 5678 9012 3456"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-brand-accent"
            required
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
            <div className="w-8 h-5 bg-blue-700 rounded flex items-center justify-center">
              <span className="text-white text-[6px] font-bold">VISA</span>
            </div>
            <div className="w-8 h-5 bg-red-600 rounded flex items-center justify-center">
              <span className="text-white text-[6px] font-bold">MC</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mes
          </label>
          <select
            value={expMonth}
            onChange={onExpMonthChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-brand-accent"
            required
          >
            <option value="">MM</option>
            {months.map((month) => (
              <option key={month} value={month}>{month}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Año
          </label>
          <select
            value={expYear}
            onChange={onExpYearChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-brand-accent"
            required
          >
            <option value="">AA</option>
            {years.map((year) => (
              <option key={year} value={year.toString().slice(-2)}>
                {year.toString().slice(-2)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            CVV
          </label>
          <input
            type="text"
            value={cvc}
            onChange={onCvcChange}
            placeholder="123"
            maxLength={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-brand-accent"
            required
          />
        </div>
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={saveCard}
          onChange={onSaveCardChange}
          className="w-4 h-4 text-brand-accent border-gray-300 rounded focus:ring-brand-accent"
        />
        <span className="text-sm text-gray-600">Guardar tarjeta para pagos futuros</span>
      </label>

      <button
        type="submit"
        disabled={processing}
        className="w-full py-3 px-4 bg-brand-accent text-white rounded-lg font-medium hover:bg-brand-accent/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {processing ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            Procesando...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Pagar ${totalAmount.toFixed(2)} USD
          </>
        )}
      </button>

      <p className="text-xs text-gray-400 text-center">
        Pago seguro procesado por AZUL. Aceptamos Visa y MasterCard.
      </p>
    </form>
  )
}
