'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface TechPackage {
  id: string
  name: string
  icon: string | null
  is_predefined: boolean
}

interface SiteTechPackage {
  id: string
  notes: string | null
  tech_package: TechPackage
}

interface Client {
  id: string
  name: string
  company_name: string | null
}

interface Site {
  id: string
  name: string
  address: string | null
  city: string | null
  region: string | null
  status: string
  unifi_site_id: string | null
  google_drive_folder_id: string | null
  notes: string | null
  client_id: string | null
  client: { id: string; name: string } | null
  site_tech_packages: SiteTechPackage[]
}

interface Props {
  site: Site
  clients: Client[]
  techPackages: TechPackage[]
}

const techPackageIcons: Record<string, string> = {
  speaker: 'M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z',
  camera: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z',
  tv: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  lock: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
  wifi: 'M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.14 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0',
  sun: 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z',
  home: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  lightbulb: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z'
}

export default function SiteEditForm({ site, clients, techPackages }: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [formData, setFormData] = useState({
    name: site.name || '',
    address: site.address || '',
    city: site.city || '',
    region: site.region || '',
    status: site.status || 'active',
    unifi_site_id: site.unifi_site_id || '',
    google_drive_folder_id: site.google_drive_folder_id || '',
    notes: site.notes || '',
    client_id: site.client_id || ''
  })

  const [selectedTechPackages, setSelectedTechPackages] = useState<string[]>(
    site.site_tech_packages?.map(stp => stp.tech_package.id) || []
  )

  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setMessage(null)

    // Update site
    const { error: siteError } = await supabase
      .from('sites')
      .update({
        ...formData,
        client_id: formData.client_id || null
      })
      .eq('id', site.id)

    if (siteError) {
      setIsSaving(false)
      setMessage({ type: 'error', text: 'Error al guardar: ' + siteError.message })
      return
    }

    // Update tech packages - delete existing and insert new
    await supabase
      .from('site_tech_packages')
      .delete()
      .eq('site_id', site.id)

    if (selectedTechPackages.length > 0) {
      const { error: techError } = await supabase
        .from('site_tech_packages')
        .insert(
          selectedTechPackages.map(techPackageId => ({
            site_id: site.id,
            tech_package_id: techPackageId
          }))
        )

      if (techError) {
        setIsSaving(false)
        setMessage({ type: 'error', text: 'Error al guardar paquetes tecnológicos: ' + techError.message })
        return
      }
    }

    setIsSaving(false)
    setMessage({ type: 'success', text: 'Propiedad actualizada correctamente' })
    router.refresh()
  }

  const toggleTechPackage = (id: string) => {
    setSelectedTechPackages(prev =>
      prev.includes(id)
        ? prev.filter(p => p !== id)
        : [...prev, id]
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Form */}
      <div className="lg:col-span-2 space-y-6">
        <form onSubmit={handleSubmit} className="card p-6 space-y-6">
          <h2 className="text-lg font-semibold text-brand-primary border-b pb-2">Información de la Propiedad</h2>

          {message && (
            <div className={`p-3 rounded ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {message.text}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
              <select
                value={formData.client_id}
                onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent"
              >
                <option value="">Sin cliente asignado</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}{client.company_name ? ` - ${client.company_name}` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Región</label>
              <input
                type="text"
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent"
              >
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
                <option value="construction">En Construcción</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">UniFi Site ID</label>
              <input
                type="text"
                value={formData.unifi_site_id}
                onChange={(e) => setFormData({ ...formData, unifi_site_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent"
                placeholder="ID del sitio en UniFi"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <a href="/dashboard/sites" className="btn-secondary">Cancelar</a>
            <button type="submit" disabled={isSaving} className="btn-primary">
              {isSaving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>

      {/* Sidebar - Tech Packages */}
      <div className="space-y-6">
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-brand-primary border-b pb-2 mb-4">Paquetes Tecnológicos</h2>
          <p className="text-sm text-gray-500 mb-4">Selecciona los sistemas instalados en esta propiedad</p>

          <div className="space-y-2">
            {techPackages.map((pkg) => {
              const isSelected = selectedTechPackages.includes(pkg.id)
              const iconPath = pkg.icon ? techPackageIcons[pkg.icon] : null

              return (
                <button
                  key={pkg.id}
                  type="button"
                  onClick={() => toggleTechPackage(pkg.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border transition ${
                    isSelected
                      ? 'border-brand-accent bg-blue-50 text-brand-accent'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  {iconPath && (
                    <svg
                      className={`w-5 h-5 ${isSelected ? 'text-brand-accent' : 'text-gray-400'}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconPath} />
                    </svg>
                  )}
                  <span className="flex-1 text-left text-sm font-medium">{pkg.name}</span>
                  {isSelected && (
                    <svg className="w-5 h-5 text-brand-accent" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              )
            })}
          </div>

          {selectedTechPackages.length > 0 && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">
                {selectedTechPackages.length} paquete{selectedTechPackages.length !== 1 ? 's' : ''} seleccionado{selectedTechPackages.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>

        {/* Integrations */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-brand-primary border-b pb-2 mb-4">Integraciones</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">UniFi</span>
              {formData.unifi_site_id ? (
                <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">Conectado</span>
              ) : (
                <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">No configurado</span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Google Drive</span>
              {formData.google_drive_folder_id ? (
                <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">Conectado</span>
              ) : (
                <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">No configurado</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
