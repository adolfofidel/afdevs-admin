import { createClient } from '@/lib/supabase/server'

interface Task {
  id: string
  title: string
  description: string | null
  status: 'pending' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  urgency: 'low' | 'normal' | 'high' | 'urgent'
  task_type: string | null
  scheduled_start: string | null
  created_at: string
  site: {
    id: string
    name: string
  } | null
  assignee: {
    id: string
    full_name: string | null
    email: string
  } | null
}

export default async function TasksPage() {
  const supabase = createClient()

  const { data: tasks, error } = await supabase
    .from('tasks')
    .select(`
      *,
      site:sites(id, name),
      assignee:profiles!tasks_assigned_to_fkey(id, full_name, email)
    `)
    .order('created_at', { ascending: false })
    .limit(100)

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    scheduled: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-gray-100 text-gray-800'
  }

  const statusLabels: Record<string, string> = {
    pending: 'Pendiente',
    scheduled: 'Programada',
    in_progress: 'En Progreso',
    completed: 'Completada',
    cancelled: 'Cancelada'
  }

  const urgencyColors: Record<string, string> = {
    low: 'text-gray-500',
    normal: 'text-blue-500',
    high: 'text-orange-500',
    urgent: 'text-red-500'
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-brand-primary">Tareas</h1>
          <p className="text-gray-600">Gestiona las tareas y Ã³rdenes de trabajo</p>
        </div>
        <a href="/dashboard/tasks/new" className="btn-primary">
          + Nueva Tarea
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tarea</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Propiedad</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Asignado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tasks?.map((task: Task) => (
              <tr key={task.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <span className={`mr-2 ${urgencyColors[task.urgency] || 'text-gray-500'}`}>
                      {task.urgency === 'urgent' ? 'ð´' : task.urgency === 'high' ? 'ð ' : task.urgency === 'normal' ? 'ðµ' : 'âª'}
                    </span>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{task.title}</div>
                      <div className="text-sm text-gray-500">{task.task_type || 'General'}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {task.site?.name || 'Sin asignar'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {task.assignee?.full_name || task.assignee?.email || 'Sin asignar'}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[task.status] || 'bg-gray-100 text-gray-800'}`}>
                    {statusLabels[task.status] || task.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {task.scheduled_start
                    ? new Date(task.scheduled_start).toLocaleDateString('es-DO')
                    : 'Sin programar'}
                </td>
                <td className="px-6 py-4 text-right">
                  <a href={`/dashboard/tasks/${task.id}`} className="text-brand-accent hover:text-brand-primary">
                    Ver
                  </a>
                </td>
              </tr>
            ))}
            {(!tasks || tasks.length === 0) && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  No hay tareas registradas
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
