'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface Subscription {
  id: string
  status: string
  plan_name: string
  price_usd: number
  started_at: string
  next_billing_date: string | null
}

interface Site {
  id: string
  name: string
  address: string | null
  status: string
}

interface ClientData {
  id: string
  name: string
  company_name: string | null
  is_subscribed: boolean
  subscriptions: Subscription[]
  sites: Site[]
}

export default function ClientDashboard() {
  const supabase = createClient()
  const [clientData, setClientData] = useState<ClientData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchClientData = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      // Get client_user link
      const { data: clientUser } = await supabase
        .from('client_users')
        .select('client_id')
        .eq('auth_user_id', session.user.id)
        .single()

      if (!clientUser) return

      // Get full client data
      const { data: client } = await supabase
        .from('clients')
        .select(`
          *,
          subscriptions(*),
          sites(id, name, address, status)
        `)
        .eq('id', clientUser.client_id)
        .single()

      if (client) {
        setClientData(client)
      }
      setLoading(false)
    }

    fetchClientData()
  }, [supabase])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
      </div>
    )
  }

  if (!clientData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No se encontró información del cliente.</p>
      </div>
    )
  }

  const activeSubscription = clientData.subscriptions?.find(s => s.status === 'active')

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-brand-primary to-brand-secondary rounded-xl p-8 text-white">
        <h1 className="text-2xl font-bold">¡Bienvenido, {clientData.name}!</h1>
        <p className="mt-2 opacity-90">
          {clientData.company_name ? `${clientData.company_name} • ` : ''}
          Portal de Cliente AF DEVS
        </p>
      </div>

      {/* Subscription Status Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Estado de Suscripción</h2>
              <p className="text-sm text-gray-500 mt-1">Mantenimiento Preventivo Tecnológico</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              activeSubscription ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
            }`}>
              {activeSubscription ? 'Activa' : 'Sin Suscripción'}
            </div>
          </div>

          {activeSubscription ? (
            <div className="mt-6 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Plan:</span>
                <span className="font-medium">{activeSubscription.plan_name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Precio:</span>
                <span className="font-medium">${activeSubscription.price_usd}/mes</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Próximo cobro:</span>
                <span className="font-medium">
                  {activeSubscription.next_billing_date
                    ? new Date(activeSubscription.next_billing_date).toLocaleDateString()
                    : '-'}
                </span>
              </div>
              <div className="pt-4 border-t mt-4">
                <Link
                  href="/client-portal/subscription"
                  className="text-brand-accent hover:underline text-sm font-medium"
                >
                  Gestionar suscripción →
                </Link>
              </div>
            </div>
          ) : (
            <div className="mt-6">
              <p className="text-sm text-gray-600 mb-4">
                Suscríbete a nuestro plan de mantenimiento preventivo para mantener tu tecnología funcionando perfectamente.
              </p>
              <Link
                href="/client-portal/subscription"
                className="inline-block bg-brand-accent hover:bg-brand-primary text-white font-semibold py-2 px-4 rounded-lg transition text-sm"
              >
                Ver Planes de Suscripción
              </Link>
            </div>
          )}
        </div>

        {/* Properties Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Mis Propiedades</h2>
              <p className="text-sm text-gray-500 mt-1">Propiedades con servicio tecnológico</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>

          <div className="mt-4">
            {clientData.sites && clientData.sites.length > 0 ? (
              <div className="space-y-3">
                {clientData.sites.slice(0, 3).map((site) => (
                  <div key={site.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{site.name}</p>
                      <p className="text-xs text-gray-500">{site.address || 'Sin dirección'}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      site.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {site.status === 'active' ? 'Activo' : site.status}
                    </span>
                  </div>
                ))}
                {clientData.sites.length > 3 && (
                  <Link
                    href="/client-portal/properties"
                    className="block text-center text-sm text-brand-accent hover:underline pt-2"
                  >
                    Ver todas ({clientData.sites.length})
                  </Link>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No hay propiedades registradas.</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/client-portal/subscription"
            className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-brand-accent hover:bg-blue-50 transition"
          >
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900">Suscripción</p>
              <p className="text-xs text-gray-500">Gestionar pagos</p>
            </div>
          </Link>

          <Link
            href="/client-portal/properties"
            className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-brand-accent hover:bg-blue-50 transition"
          >
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900">Propiedades</p>
              <p className="text-xs text-gray-500">Ver mis sitios</p>
            </div>
          </Link>

          <a
            href="mailto:support@afdevs.com"
            className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-brand-accent hover:bg-blue-50 transition"
          >
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900">Soporte</p>
              <p className="text-xs text-gray-500">Contactar equipo</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  )
}
