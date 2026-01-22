'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function Header() {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <header className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white shadow">
      <div className="flex flex-1 justify-between px-4">
        <div className="flex flex-1 items-center">
          <h2 className="text-lg font-semibold text-brand-primary lg:hidden">
            AF DEVS Admin
          </h2>
        </div>
        <div className="ml-4 flex items-center md:ml-6">
          <button
            onClick={handleSignOut}
            className="btn-secondary text-sm"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    </header>
  )
}
