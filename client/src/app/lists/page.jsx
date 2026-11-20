'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Trash2, ListPlus, ShoppingBag } from 'lucide-react'

const STORAGE_KEY = 'essentialistLists'

const readLists = () => {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY) ?? '[]'
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.warn('ListsPage: unable to parse saved lists', error)
    return []
  }
}

const writeLists = (lists) => {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lists))
  } catch (error) {
    console.warn('ListsPage: unable to save lists', error)
  }
}

const formatDate = (isoString) => {
  try {
    return new Date(isoString).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch (error) {
    return ''
  }
}

export default function ListsPage() {
  const searchParams = useSearchParams()
  const shouldAutoCreate = searchParams.get('create') === '1' || searchParams.get('create') === 'true'

  const [lists, setLists] = useState([])
  const [hydrated, setHydrated] = useState(false)
  const [newListName, setNewListName] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    setLists(readLists())
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (shouldAutoCreate && hydrated) {
      inputRef.current?.focus()
    }
  }, [shouldAutoCreate, hydrated])

  const persist = useCallback((next) => {
    setLists(next)
    writeLists(next)
  }, [])

  const handleCreateList = useCallback(
    (e) => {
      e.preventDefault()
      const name = newListName.trim()
      if (!name) return
      const newList = {
        id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `list-${Date.now()}`,
        name,
        createdAt: new Date().toISOString(),
      }
      persist([newList, ...lists])
      setNewListName('')
    },
    [lists, newListName, persist]
  )

  const handleDeleteList = useCallback(
    (id) => {
      persist(lists.filter((list) => list.id !== id))
    },
    [lists, persist]
  )

  const sortedLists = useMemo(
    () => [...lists].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [lists]
  )

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="bg-white shadow-md p-5 rounded-md mb-6">
        <h1 className="text-xl font-semibold mb-1">Your Lists</h1>
        <p className="text-sm text-gray-500">
          Create lists to keep track of makeup you want to buy later.
        </p>

        <form onSubmit={handleCreateList} className="mt-4 flex flex-col sm:flex-row gap-2">
          <input
            ref={inputRef}
            type="text"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            placeholder="Name your list (e.g. Birthday wishlist)"
            className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
            maxLength={60}
          />
          <button
            type="submit"
            disabled={!newListName.trim()}
            className="flex items-center justify-center gap-2 bg-pink-400 hover:bg-pink-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-4 py-2 rounded-md transition-colors"
          >
            <ListPlus size={18} />
            Create List
          </button>
        </form>
      </div>

      {!hydrated ? null : sortedLists.length === 0 ? (
        <div className="bg-white rounded-md shadow-md p-10 flex flex-col items-center text-center">
          <ShoppingBag size={40} className="text-pink-300 mb-3" />
          <h2 className="font-semibold text-lg mb-1">No lists yet</h2>
          <p className="text-sm text-gray-500 max-w-sm">
            You haven&apos;t created any lists. Use the box above to start your first one.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {sortedLists.map((list) => (
            <div key={list.id} className="bg-white rounded-md shadow-md p-4 flex flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-base break-words">{list.name}</h3>
                <button
                  type="button"
                  onClick={() => handleDeleteList(list.id)}
                  aria-label={`Delete ${list.name}`}
                  className="text-gray-400 hover:text-red-500 transition-colors shrink-0"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              <p className="text-xs text-gray-400">Created {formatDate(list.createdAt)}</p>
              <p className="text-sm text-gray-500">No items saved yet.</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
