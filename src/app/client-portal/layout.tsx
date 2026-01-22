'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function ClientPortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [clientData, setClientData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const isAuthPage = pathname.startsWith('/client-portal/auth')

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session && !isAuthPage) {
        router.push('/client-portal/auth/login')
        return
      }

      if (session) {
        setUser(session.user)

        // Get client data linked to this user
        const { data: clientUser } = await supabase
          .from('client_users')
          .select(`
            *,
            client:clients(*)
          `)
          .eq('auth_user_id', session.user.id)
          .single()

        if (clientUser) {
          setClientData(clientUser)
        }
      }

      setLoading(false)
    }

    checkUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        router.push('/client-portal/auth/login')
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase, router, isAuthPage])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/client-portal/auth/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-light">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
      </div>
    )
  }

  // Auth pages don't need the portal layout
  if (isAuthPage) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-surface-light">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link href="/client-portal/dashboard" className="text-xl font-bold text-brand-primary">
                AF DEVS
              </Link>
              <span className="text-sm text-gray-500">Portal de Cliente</span>
            </div>

            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/client-portal/dashboard"
                className={`text-sm font-medium ${pathname === '/client-portal/dashboard' ? 'text-brand-accent' : 'text-gray-600 hover:text-brand-primary'}`}
              >
                Inicio
              </Link>
              <Link
                href="/client-portal/subscription"
                className={`text-sm font-medium ${pathname === '/client-portal/subscription' ? 'text-brand-accent' : 'text-gray-600 hover:text-brand-primary'}`}
              >
                Mi Suscripción
              </Link>
              <Link
                href="/client-portal/properties"
                className={`text-sm font-medium ${pathname === '/client-portal/properties' ? 'text-brand-accent' : 'text-gray-600 hover:text-brand-primary'}`}
              >
                Propiedades
              </Link>
            </nav>

            <div className="flex items-center gap-4">
              {clientData && (
                <span className="text-sm text-gray-600">
                  {clientData.client?.name || user?.email}
                </span>
              )}
              <button
                onClick={handleLogout}
                className="text-sm text-gray-500 hover:text-red-600"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">
              © 2025 AF DEVS. Todos los derechos reservados.
            </p>
            <div className="flex gap-4">
              <a href="mailto:support@afdevs.com" className="text-sm text-gray-500 hover:text-brand-accent">
                Soporte
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
