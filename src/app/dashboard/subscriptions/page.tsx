import { createClient } from '@/lib/supabase/server'

interface Subscription {
  id: string
  status: string
  plan_name: string
  price_usd: number
  started_at: string
  next_billing_date: string | null
  cancelled_at: string | null
  client: {
    id: string
    name: string
    company_name: string | null
    primary_email: string | null
  }
}

export default async function SubscriptionsPage() {
  const supabase = createClient()

  const { data: subscriptions, error } = await supabase
    .from('subscriptions')
    .select(`
      *,
      client:clients(id, name, company_name, primary_email)
    `)
    .order('created_at', { ascending: false })

  // Calculate stats
  const activeCount = subscriptions?.filter(s => s.status === 'active').length || 0
  const totalRevenue = (subscriptions?.filter(s => s.status === 'active').reduce((sum, s) => sum + (s.price_usd || 255), 0)) || 0

  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    paused: 'bg-yellow-100 text-yellow-800',
    past_due: 'bg-orange-100 text-orange-800'
  }

  const statusLabels: Record<string, string> = {
    active: 'Activa',
    cancelled: 'Cancelada',
    paused: 'Pausada',
    past_due: 'Pago Pendiente'
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-brand-primary">Suscripciones</h1>
          <p className="text-gray-600">Gestiona las suscripciones de mantenimiento preventivo</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Suscripciones Activas</p>
              <p className="text-2xl font-bold text-gray-900">{activeCount}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Ingresos Mensuales</p>
              <p className="text-2xl font-bold text-gray-900">${totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Precio por Plan</p>
              <p className="text-2xl font-bold text-gray-900">$255/mes</p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Error: {error.message}
        </div>
      )}

      {/* Subscriptions Table */}
      <div className="card">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha Inicio</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Próximo Cobro</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {subscriptions?.map((subscription: Subscription) => (
              <tr key={subscription.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-brand-accent text-white flex items-center justify-center font-semibold">
                      {subscription.client?.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{subscription.client?.name || 'Sin nombre'}</div>
                      <div className="text-sm text-gray-500">{subscription.client?.company_name || subscription.client?.primary_email || '-'}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {subscription.plan_name || 'Preventive Tech Maintenance'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                  ${subscription.price_usd || 255}/mes
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[subscription.status] || 'bg-gray-100 text-gray-800'}`}>
                    {statusLabels[subscription.status] || subscription.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {subscription.started_at ? new Date(subscription.started_at).toLocaleDateString() : '-'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {subscription.next_billing_date ? new Date(subscription.next_billing_date).toLocaleDateString() : '-'}
                </td>
                <td className="px-6 py-4 text-right">
                  <a href={`/dashboard/clients/${subscription.client?.id}`} className="text-brand-accent hover:text-brand-primary text-sm">
                    Ver Cliente
                  </a>
                </td>
              </tr>
            ))}
            {(!subscriptions || subscriptions.length === 0) && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  No hay suscripciones registradas
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
