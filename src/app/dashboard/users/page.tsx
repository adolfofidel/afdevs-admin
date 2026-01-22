import { createClient } from '@/lib/supabase/server'

interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  staff_role: 'admin' | 'coordinator' | 'technician' | 'viewer'
  is_active: boolean
  created_at: string
}

export default async function UsersPage() {
  const supabase = createClient()

  const { data: users, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  const roleColors: Record<string, string> = {
    admin: 'bg-red-100 text-red-800',
    coordinator: 'bg-blue-100 text-blue-800',
    technician: 'bg-green-100 text-green-800',
    viewer: 'bg-gray-100 text-gray-800'
  }

  const roleLabels: Record<string, string> = {
    admin: 'Administrador',
    coordinator: 'Coordinador',
    technician: 'Tecnico',
    viewer: 'Visor'
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-brand-primary">Usuarios</h1>
          <p className="text-gray-600">Gestiona el equipo de AF DEVS</p>
        </div>
      </div>
      <div className="card">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users?.map((user: Profile) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">{user.full_name || user.email}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{user.email}</td>
                <td className="px-6 py-4">
                  <span className={roleColors[user.staff_role]}>
                    {roleLabels[user.staff_role] || user.staff_role}
                  </span>
                </td>
                <td className="px-6 py-4">{user.is_active ? 'Activo' : 'Inactivo'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
