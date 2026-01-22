import { createClient } from '@/lib/supabase/server'

interface Site {
  id: string
  name: string
  address: string | null
  city: string | null
  region: string | null
  status: 'active' | 'inactive' | 'construction'
  unifi_site_id: string | null
  google_drive_folder_id: string | null
  created_at: string
  client: {
    id: string
    name: string
  } | null
}

export default async function SitesPage() {
  const supabase = createClient()

  const { data: sites, error } = await supabase
    .from('sites')
    .select(`
      *,
      client:clients(id, name)
    `)
    .order('name', { ascending: true })

  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    construction: 'bg-yellow-100 text-yellow-800'
  }

  const statusLabels: Record<string, string> = {
    active: 'Activo',
    inactive: 'Inactivo',
    construction: 'En ConstrucciÃ³n'
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-brand-primary">Propiedades</h1>
          <p className="text-gray-600">Gestiona las villas y propiedades</p>
        </div>
        <a href="/dashboard/sites/new" className="btn-primary">
          + Nueva Propiedad
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Propiedad</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">UbicaciÃ³n</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Integraciones</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sites?.map((site: Site) => (
              <tr key={site.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{site.name}</div>
                  <div className="text-sm text-gray-500">{site.address}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {site.client?.name || 'Sin cliente'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {site.city}{site.region ? `, ${site.region}` : ''}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[site.status] || 'bg-gray-100 text-gray-800'}`}>
                    {statusLabels[site.status] || site.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    {site.unifi_site_id && (
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">UniFi</span>
                    )}
                    {site.google_drive_folder_id && (
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">Drive</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <a href={`/dashboard/sites/${site.id}`} className="text-brand-accent hover:text-brand-primary">
                    Ver
                  </a>
                </td>
              </tr>
            ))}
            {(!sites || sites.length === 0) && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  No hay propiedades registradas
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
