import { createClient } from '@/lib/supabase/server'

interface Subscription {
  id: string
  status: string
}

interface Client {
  id: string
  name: string
  company_name: string | null
  primary_email: string | null
  primary_phone: string | null
  billing_address: string | null
  is_active: boolean
  is_subscribed: boolean
  created_at: string
  subscriptions: Subscription[]
}

export default async function ClientsPage() {
  const supabase = createClient()

  const { data: clients, error } = await supabase
    .from('clients')
    .select(`
      *,
      subscriptions(id, status)
    `)
    .order('name', { ascending: true })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-brand-primary">Clientes</h1>
          <p className="text-gray-600">Gestiona los clientes y propietarios</p>
        </div>
        <a href="/dashboard/clients/new" className="btn-primary">
          + Nuevo Cliente
        </a>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Error: {error.message}
        </div>
      )}

      <div className="card">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Empresa</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contacto</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Suscripción</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {clients?.map((client: Client) => {
              const hasActiveSubscription = client.subscriptions?.some(s => s.status === 'active')
              return (
                <tr key={client.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-brand-accent text-white flex items-center justify-center font-semibold">
                        {client.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{client.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {client.company_name || '-'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{client.primary_email || '-'}</div>
                    <div className="text-sm text-gray-500">{client.primary_phone || '-'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${client.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {client.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {hasActiveSubscription ? (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        Suscrito
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-600">
                        No suscrito
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <a href={`/dashboard/clients/${client.id}`} className="text-brand-accent hover:text-brand-primary">
                      Ver
                    </a>
                  </td>
                </tr>
              )
            })}
            {(!clients || clients.length === 0) && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  No hay clientes registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
