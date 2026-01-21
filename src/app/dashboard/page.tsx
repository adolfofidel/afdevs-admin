import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

  return (
          <div className="space-y-6">
                <div>
                        <h1 className="text-2xl font-bold text-brand-primary">
                                  Panel de Administracion
                        </h1>h1>
                        <p className="text-gray-600">
                                  Bienvenido, {user?.email}
                        </p>p>
                </div>div>
          
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="card">
                                  <h3 className="text-sm font-medium text-gray-500">Usuarios</h3>h3>
                                  <p className="text-3xl font-bold text-brand-primary">--</p>p>
                        </div>div>
                        <div className="card">
                                  <h3 className="text-sm font-medium text-gray-500">Propiedades</h3>h3>
                                  <p className="text-3xl font-bold text-brand-primary">--</p>p>
                        </div>div>
                        <div className="card">
                                  <h3 className="text-sm font-medium text-gray-500">Tareas Activas</h3>h3>
                                  <p className="text-3xl font-bold text-brand-primary">--</p>p>
                        </div>div>
                        <div className="card">
                                  <h3 className="text-sm font-medium text-gray-500">Ingresos Mes</h3>h3>
                                  <p className="text-3xl font-bold text-brand-gold">$--</p>p>
                        </div>div>
                </div>div>
          
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="card">
                                  <h2 className="text-lg font-semibold text-brand-primary mb-4">
                                              Actividad Reciente
                                  </h2>h2>
                                  <p className="text-gray-500">No hay actividad reciente</p>p>
                        </div>div>
                        <div className="card">
                                  <h2 className="text-lg font-semibold text-brand-primary mb-4">
                                              Tareas Pendientes
                                  </h2>h2>
                                  <p className="text-gray-500">No hay tareas pendientes</p>p>
                        </div>div>
                </div>div>
          </div>div>
        )
}</div>
