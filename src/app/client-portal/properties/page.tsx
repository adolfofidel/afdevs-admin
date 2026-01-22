'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface TechPackage {
  id: string
  name: string
  icon: string | null
}

interface SiteTechPackage {
  tech_package: TechPackage
}

interface Site {
  id: string
  name: string
  address: string | null
  city: string | null
  region: string | null
  status: string
  site_tech_packages: SiteTechPackage[]
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

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-red-100 text-red-800',
  construction: 'bg-yellow-100 text-yellow-800'
}

const statusLabels: Record<string, string> = {
  active: 'Activo',
  inactive: 'Inactivo',
  construction: 'En Construcción'
}

export default function PropertiesPage() {
  const supabase = createClient()
  const [sites, setSites] = useState<Site[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSite, setSelectedSite] = useState<Site | null>(null)

  useEffect(() => {
    const fetchSites = async () => {
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

      // Get sites with tech packages
      const { data: sitesData } = await supabase
        .from('sites')
        .select(`
          *,
          site_tech_packages(
            tech_package:tech_packages(id, name, icon)
          )
        `)
        .eq('client_id', clientUser.client_id)
        .order('name')

      if (sitesData) {
        setSites(sitesData)
      }
      setLoading(false)
    }

    fetchSites()
  }, [supabase])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mis Propiedades</h1>
        <p className="text-gray-600 mt-1">Propiedades con servicio de mantenimiento tecnológico</p>
      </div>

      {sites.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Sin Propiedades</h3>
          <p className="text-gray-500 max-w-sm mx-auto">
            No tienes propiedades registradas. Contacta al equipo de AF DEVS para agregar tus propiedades al sistema.
          </p>
          <a
            href="mailto:support@afdevs.com"
            className="inline-block mt-4 text-brand-accent hover:underline"
          >
            Contactar Soporte
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sites List */}
          <div className="lg:col-span-2 space-y-4">
            {sites.map((site) => (
              <div
                key={site.id}
                onClick={() => setSelectedSite(site)}
                className={`bg-white rounded-xl shadow-sm border cursor-pointer transition ${
                  selectedSite?.id === site.id
                    ? 'border-brand-accent ring-2 ring-brand-accent ring-opacity-20'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-brand-accent bg-opacity-10 flex items-center justify-center">
                        <svg className="w-6 h-6 text-brand-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{site.name}</h3>
                        <p className="text-sm text-gray-500">
                          {[site.address, site.city, site.region].filter(Boolean).join(', ') || 'Sin dirección'}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${statusColors[site.status] || 'bg-gray-100 text-gray-600'}`}>
                      {statusLabels[site.status] || site.status}
                    </span>
                  </div>

                  {/* Tech Packages */}
                  {site.site_tech_packages && site.site_tech_packages.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-xs text-gray-500 mb-2">Paquetes Tecnológicos:</p>
                      <div className="flex flex-wrap gap-2">
                        {site.site_tech_packages.map((stp, idx) => {
                          const iconPath = stp.tech_package.icon ? techPackageIcons[stp.tech_package.icon] : null
                          return (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs text-gray-700"
                            >
                              {iconPath && (
                                <svg className="w-3 h-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconPath} />
                                </svg>
                              )}
                              {stp.tech_package.name}
                            </span>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Selected Site Details */}
          <div>
            {selectedSite ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{selectedSite.name}</h3>

                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Dirección</p>
                    <p className="text-sm text-gray-900">
                      {selectedSite.address || '-'}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Ubicación</p>
                    <p className="text-sm text-gray-900">
                      {[selectedSite.city, selectedSite.region].filter(Boolean).join(', ') || '-'}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Estado</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColors[selectedSite.status] || 'bg-gray-100 text-gray-600'}`}>
                      {statusLabels[selectedSite.status] || selectedSite.status}
                    </span>
                  </div>

                  {selectedSite.site_tech_packages && selectedSite.site_tech_packages.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Sistemas Instalados</p>
                      <div className="space-y-2">
                        {selectedSite.site_tech_packages.map((stp, idx) => {
                          const iconPath = stp.tech_package.icon ? techPackageIcons[stp.tech_package.icon] : null
                          return (
                            <div key={idx} className="flex items-center gap-2">
                              {iconPath && (
                                <svg className="w-4 h-4 text-brand-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconPath} />
                                </svg>
                              )}
                              <span className="text-sm text-gray-700">{stp.tech_package.name}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-gray-200">
                  <a
                    href="mailto:support@afdevs.com"
                    className="text-sm text-brand-accent hover:underline"
                  >
                    Solicitar servicio para esta propiedad →
                  </a>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl border border-dashed border-gray-300 p-8 text-center">
                <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
                <p className="text-sm text-gray-500">
                  Selecciona una propiedad para ver los detalles
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
