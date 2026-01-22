'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Site {
  id: string
  name: string
  address: string | null
  status: string
}

interface Subscription {
  id: string
  status: string
  plan_name: string
  price_usd: number
  started_at: string
  next_billing_date: string | null
}

interface Client {
  id: string
  name: string
  company_name: string | null
  primary_email: string | null
  primary_phone: string | null
  billing_address: string | null
  notes: string | null
  is_active: boolean
  is_subscribed: boolean
  subscription_status: string | null
  sites: Site[]
  subscriptions: Subscription[]
}

interface Props {
  client: Client
}

export default function ClientEditForm({ client }: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [formData, setFormData] = useState({
    name: client.name || '',
    company_name: client.company_name || '',
    primary_email: client.primary_email || '',
    primary_phone: client.primary_phone || '',
    billing_address: client.billing_address || '',
    notes: client.notes || '',
    is_active: client.is_active
  })

  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setMessage(null)

    const { error } = await supabase
      .from('clients')
      .update(formData)
      .eq('id', client.id)

    setIsSaving(false)

    if (error) {
      setMessage({ type: 'error', text: 'Error al guardar: ' + error.message })
    } else {
      setMessage({ type: 'success', text: 'Cliente actualizado correctamente' })
      router.refresh()
    }
  }

  const activeSubscription = client.subscriptions?.find(s => s.status === 'active')

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Form */}
      <div className="lg:col-span-2 space-y-6">
        <form onSubmit={handleSubmit} className="card p-6 space-y-6">
          <h2 className="text-lg font-semibold text-brand-primary border-b pb-2">Información del Cliente</h2>

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
              <label className="block text-sm font-medium text-gray-700 mb-1">Empresa</label>
              <input
                type="text"
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.primary_email}
                onChange={(e) => setFormData({ ...formData, primary_email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
              <input
                type="tel"
                value={formData.primary_phone}
                onChange={(e) => setFormData({ ...formData, primary_phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Dirección de Facturación</label>
              <input
                type="text"
                value={formData.billing_address}
                onChange={(e) => setFormData({ ...formData, billing_address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent"
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
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-brand-accent focus:ring-brand-accent"
                />
                <span className="text-sm font-medium text-gray-700">Cliente Activo</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <a href="/dashboard/clients" className="btn-secondary">Cancelar</a>
            <button type="submit" disabled={isSaving} className="btn-primary">
              {isSaving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>

        {/* Properties Section */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-brand-primary border-b pb-2 mb-4">Propiedades Asociadas</h2>
          {client.sites && client.sites.length > 0 ? (
            <div className="space-y-3">
              {client.sites.map((site) => (
                <a
                  key={site.id}
                  href={`/dashboard/sites/${site.id}`}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <div>
                    <div className="font-medium text-gray-900">{site.name}</div>
                    <div className="text-sm text-gray-500">{site.address || 'Sin dirección'}</div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    site.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {site.status === 'active' ? 'Activo' : site.status}
                  </span>
                </a>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No hay propiedades asociadas a este cliente</p>
          )}
        </div>
      </div>

      {/* Sidebar - Subscription Status */}
      <div className="space-y-6">
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-brand-primary border-b pb-2 mb-4">Estado de Suscripción</h2>

          {activeSubscription ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                <span className="text-green-700 font-medium">Suscrito</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Plan:</span>
                  <span className="font-medium">{activeSubscription.plan_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Precio:</span>
                  <span className="font-medium">${activeSubscription.price_usd}/mes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Desde:</span>
                  <span className="font-medium">{new Date(activeSubscription.started_at).toLocaleDateString()}</span>
                </div>
                {activeSubscription.next_billing_date && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Próximo cobro:</span>
                    <span className="font-medium">{new Date(activeSubscription.next_billing_date).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-gray-400 rounded-full"></span>
                <span className="text-gray-600 font-medium">No suscrito</span>
              </div>
              <p className="text-sm text-gray-500">
                Este cliente no tiene una suscripción activa al paquete de mantenimiento preventivo.
              </p>
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700 font-medium">Preventive Tech Maintenance</p>
                <p className="text-lg font-bold text-blue-900">$255/mes</p>
              </div>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-brand-primary border-b pb-2 mb-4">Resumen</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Propiedades:</span>
              <span className="font-medium">{client.sites?.length || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Estado:</span>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${client.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {client.is_active ? 'Activo' : 'Inactivo'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
