'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface SearchResult {
  id: string
  name: string
  type: 'client' | 'site'
  subtitle?: string
}

export default function SearchBar() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const searchDebounce = setTimeout(async () => {
      if (query.length < 2) {
        setResults([])
        return
      }

      setIsLoading(true)

      const [clientsResult, sitesResult] = await Promise.all([
        supabase
          .from('clients')
          .select('id, name, company_name')
          .or(`name.ilike.%${query}%,company_name.ilike.%${query}%`)
          .limit(5),
        supabase
          .from('sites')
          .select('id, name, address')
          .or(`name.ilike.%${query}%,address.ilike.%${query}%`)
          .limit(5)
      ])

      const searchResults: SearchResult[] = [
        ...(clientsResult.data || []).map(c => ({
          id: c.id,
          name: c.name,
          type: 'client' as const,
          subtitle: c.company_name || undefined
        })),
        ...(sitesResult.data || []).map(s => ({
          id: s.id,
          name: s.name,
          type: 'site' as const,
          subtitle: s.address || undefined
        }))
      ]

      setResults(searchResults)
      setIsLoading(false)
      setIsOpen(true)
    }, 300)

    return () => clearTimeout(searchDebounce)
  }, [query])

  const handleSelect = (result: SearchResult) => {
    setQuery('')
    setIsOpen(false)
    if (result.type === 'client') {
      router.push(`/dashboard/clients/${result.id}`)
    } else {
      router.push(`/dashboard/sites/${result.id}`)
    }
  }

  return (
    <div ref={wrapperRef} className="relative w-full max-w-md">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar clientes o propiedades..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent text-sm"
        />
        <svg
          className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        {isLoading && (
          <div className="absolute right-3 top-2.5">
            <div className="animate-spin h-5 w-5 border-2 border-brand-accent border-t-transparent rounded-full"></div>
          </div>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto">
          {results.map((result) => (
            <button
              key={`${result.type}-${result.id}`}
              onClick={() => handleSelect(result)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 border-b border-gray-100 last:border-b-0"
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${result.type === 'client' ? 'bg-brand-accent' : 'bg-brand-gold'}`}>
                {result.type === 'client' ? 'C' : 'P'}
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">{result.name}</div>
                {result.subtitle && (
                  <div className="text-xs text-gray-500">{result.subtitle}</div>
                )}
                <div className="text-xs text-gray-400">
                  {result.type === 'client' ? 'Cliente' : 'Propiedad'}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {isOpen && query.length >= 2 && results.length === 0 && !isLoading && (
        <div className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 p-4 text-center text-gray-500 text-sm">
          No se encontraron resultados
        </div>
      )}
    </div>
  )
}
