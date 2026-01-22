import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ClientEditForm from './ClientEditForm'

interface Props {
  params: { id: string }
}

export default async function ClientDetailPage({ params }: Props) {
  const supabase = createClient()

  const { data: client, error } = await supabase
    .from('clients')
    .select(`
      *,
      sites(id, name, address, status),
      subscriptions(id, status, plan_name, price_usd, started_at, next_billing_date)
    `)
    .eq('id', params.id)
    .single()

  if (error || !client) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-brand-primary">Editar Cliente</h1>
          <p className="text-gray-600">{client.name}</p>
        </div>
        <a href="/dashboard/clients" className="btn-secondary">
          ← Volver
        </a>
      </div>

      <ClientEditForm client={client} />
    </div>
  )
}
