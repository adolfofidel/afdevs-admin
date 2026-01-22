import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import SiteEditForm from './SiteEditForm'

interface Props {
  params: { id: string }
}

export default async function SiteDetailPage({ params }: Props) {
  const supabase = createClient()

  // Fetch site with client and tech packages
  const { data: site, error } = await supabase
    .from('sites')
    .select(`
      *,
      client:clients(id, name),
      site_tech_packages(
        id,
        notes,
        tech_package:tech_packages(id, name, icon, is_predefined)
      )
    `)
    .eq('id', params.id)
    .single()

  if (error || !site) {
    notFound()
  }

  // Fetch all clients for dropdown
  const { data: clients } = await supabase
    .from('clients')
    .select('id, name, company_name')
    .order('name', { ascending: true })

  // Fetch all tech packages
  const { data: techPackages } = await supabase
    .from('tech_packages')
    .select('*')
    .order('is_predefined', { ascending: false })
    .order('name', { ascending: true })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-brand-primary">Editar Propiedad</h1>
          <p className="text-gray-600">{site.name}</p>
        </div>
        <a href="/dashboard/sites" className="btn-secondary">
          ← Volver
        </a>
      </div>

      <SiteEditForm
        site={site}
        clients={clients || []}
        techPackages={techPackages || []}
      />
    </div>
  )
}
