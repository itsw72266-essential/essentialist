// src/components/BrandSearch.jsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const brands = ['NYX', 'LA Girl', 'ELF', 'SMASHBOX', 'BOBBI BROWN', 'TOO FACED', 'ESTEE LAUDER', 'MAC', 'CLINIC', 'ONE SIZE', 'JUVIA']

export default function BrandSearch() {
  const [searchTerm, setSearchTerm] = useState('')
  const router = useRouter()

  const filteredBrands = brands.filter(brand =>
    brand.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleBrandSelect = (brand) => {
    const brandSlug = brand.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    router.push(`/brands/${brandSlug}`)
  }

  return (
    <div className="mb-6 max-w-md mx-auto">
      <div className="relative">
        <input
          type="text"
          placeholder="Search brands..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-400 text-base"
        />
        <svg className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      
      {searchTerm && (
        <div className="mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {filteredBrands.length > 0 ? (
            filteredBrands.map((brand) => (
              <button
                key={brand}
                onClick={() => handleBrandSelect(brand)}
                className="w-full text-left px-4 py-2 hover:bg-pink-50 transition-colors border-b border-gray-100 last:border-b-0"
              >
                {brand}
              </button>
            ))
          ) : (
            <div className="px-4 py-2 text-gray-500">No brands found</div>
          )}
        </div>
      )}
    </div>
  )
}