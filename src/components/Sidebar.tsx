'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { name: 'Usuarios', href: '/dashboard/usuarios', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
  { name: 'Propiedades', href: '/dashboard/propiedades', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
  { name: 'Tareas', href: '/dashboard/tareas', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
  { name: 'Finanzas', href: '/dashboard/finanzas', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  ]

export default function Sidebar() {
    const pathname = usePathname()

  return (
        <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
              <div className="flex min-h-0 flex-1 flex-col bg-primary">
                      <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
                                <div className="flex flex-shrink-0 items-center px-4">
                                            <span className="text-2xl font-bold text-white">AF DEVS</span>span>
                                </div>div>
                                <nav className="mt-8 flex-1 space-y-1 px-2">
                                  {navigation.map((item) => {
                        const isActive = pathname === item.href
                                        return (
                                                          <Link
                                                                              key={item.name}
                                                                              href={item.href}
                                                                              className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                                                                                                    isActive
                                                                                                      ? 'bg-primary-dark text-white'
                                                                                                      : 'text-primary-light hover:bg-primary-dark hover:text-white'
                                                                              }`}
                                                                            >
                                                                            <svg
                                                                                                  className={`mr-3 h-6 w-6 flex-shrink-0 ${
                                                                                                                          isActive ? 'text-white' : 'text-primary-light group-hover:text-white'
                                                                                                    }`}
                                                                                                  fill="none"
                                                                                                  viewBox="0 0 24 24"
                                                                                                  stroke="currentColor"
                                                                                                >
                                                                                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                                                                            </svg>svg>
                                                            {item.name}
                                                          </Link>Link>
                                                        )
                                  })}
                                </nav>nav>
                      </div>div>
              </div>div>
        </div>div>
      )
}</div>
