// components/Search.jsx
'use client'

import React, { Suspense, memo, useEffect, useRef, useState } from 'react'
import { IoSearch } from 'react-icons/io5'
import { GoTriangleDown } from 'react-icons/go'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { FaArrowLeft } from 'react-icons/fa'
import useMobile from './../hooks/useMobile'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { useCategoriesQuery } from '@/hooks/queries/useCatalogQueries'

function SearchInner() {
  const { t } = useTranslation()
  const router = useRouter()
  const pathname = usePathname()
  const [isMobile] = useMobile()
  const searchParams = useSearchParams()
  const searchText = searchParams.get('q') || ''
  const categoryParam = searchParams.get('category') || ''
  const isSearchPage = pathname === '/search'
  const inputRef = useRef(null)

  const { data: categories = [] } = useCategoriesQuery()
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false)
  const categoryMenuRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (categoryMenuRef.current && !categoryMenuRef.current.contains(e.target)) {
        setCategoryMenuOpen(false)
      }
    }
    if (categoryMenuOpen) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [categoryMenuOpen])

  const selectedCategory = categories.find((category) => category._id === categoryParam)
  const selectedCategoryLabel = selectedCategory?.name || t('search.allCategories')

  const buildSearchUrl = (nextQuery, nextCategory) => {
    const params = new URLSearchParams()
    if (nextQuery) params.set('q', nextQuery)
    if (nextCategory) params.set('category', nextCategory)
    const qs = params.toString()
    return qs ? `/search?${qs}` : '/search'
  }

  const navigateToSearch = (value, category) => {
    const url = buildSearchUrl(value, category)
    if (isSearchPage) {
      router.replace(url)
    } else {
      router.push(url)
    }
  }

  const handleOnChange = (e) => {
    navigateToSearch(e.target.value, categoryParam)
  }

  const handleSubmit = () => {
    navigateToSearch(inputRef.current?.value ?? searchText, categoryParam)
  }

  const handleCategorySelect = (categoryId) => {
    setCategoryMenuOpen(false)
    router.push(buildSearchUrl(inputRef.current?.value ?? searchText, categoryId))
  }

  return (
    <div
      className="
        w-100 min-w-[10px] xs:min-w-[10px] sm:min-w-[10px] md:min-w-[10px] lg:min-w-[30px]
        max-w-full h-7 sm:h-11 md:h-12 flex items-stretch rounded-md
        focus-within:ring-2 focus-within:ring-yellow-400 transition-shadow
      "
    >
      <div className="relative flex-shrink-0 h-full" ref={categoryMenuRef}>
        <button
          type="button"
          onClick={() => setCategoryMenuOpen((open) => !open)}
          className="h-full flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-3 bg-gray-100 hover:bg-gray-200 text-black text-[11px] sm:text-sm rounded-l-md border border-gray-300 transition-colors"
          aria-haspopup="listbox"
          aria-expanded={categoryMenuOpen}
          aria-label={t('search.allCategories')}
        >
          <span className="max-w-[2.75rem] sm:max-w-[9rem] truncate">{selectedCategoryLabel}</span>
          <GoTriangleDown
            size={11}
            className={`shrink-0 transition-transform ${categoryMenuOpen ? 'rotate-180' : ''}`}
          />
        </button>
        {categoryMenuOpen && (
          <div
            role="listbox"
            className="absolute left-0 top-full mt-2 z-50 w-60 max-h-[32rem] overflow-y-auto rounded bg-white text-black shadow-lg py-1 border border-gray-200 [scrollbar-width:thin] [scrollbar-color:#e5e7eb_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full"
          >
            <button
              type="button"
              onClick={() => handleCategorySelect('')}
              className={`block w-full text-left px-4 py-2 text-sm hover:bg-pink-50 hover:text-pink-700 transition-colors ${
                !categoryParam ? 'font-semibold text-pink-600' : ''
              }`}
            >
              {t('search.allCategories')}
            </button>
            {categories.map((category) => (
              <button
                key={category._id}
                type="button"
                onClick={() => handleCategorySelect(category._id)}
                className={`block w-full text-left px-4 py-2 text-sm hover:bg-pink-50 hover:text-pink-700 transition-colors ${
                  categoryParam === category._id ? 'font-semibold text-pink-600' : ''
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0 h-full flex items-center bg-white border-t border-b border-gray-300 px-1.5 sm:px-3">
        {isMobile && isSearchPage && (
          <Link
            href="/"
            className="flex-shrink-0 flex justify-center items-center h-8 w-8 mr-1 text-gray-600 hover:text-black transition"
            aria-label={t('common.back')}
          >
            <FaArrowLeft size={16} />
          </Link>
        )}
        <input
          ref={inputRef}
          type="text"
          placeholder={t('search.placeholder')}
          autoFocus={isSearchPage}
          defaultValue={searchText}
          key={isSearchPage ? searchText : 'idle'}
          className="bg-transparent w-full h-full outline-none text-black placeholder-gray-500 text-[0.95rem] md:text-base"
          onChange={handleOnChange}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSubmit()
          }}
          style={{ minWidth: 0 }}
          aria-label={t('search.inputAria')}
        />
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        className="flex-shrink-0 h-full px-2.5 sm:px-4 flex items-center justify-center bg-yellow-400 hover:bg-yellow-500 rounded-r-md border border-gray-300 text-black transition-colors"
        aria-label={t('search.aria')}
      >
        <IoSearch size={18} className="sm:w-5 sm:h-5" />
      </button>
    </div>
  )
}

function Search() {
  return (
    <Suspense
      fallback={
        <div
          className="w-full h-10 sm:h-11 md:h-12 rounded-md border border-gray-300 px-2 bg-white animate-pulse"
          aria-hidden="true"
        />
      }
    >
      <SearchInner />
    </Suspense>
  )
}

export default memo(Search)
