'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'
import { ScreenerRow } from '../app/api/screener/route'

interface CompareContextType {
  compareList: ScreenerRow[]
  isCompareOpen: boolean
  addToCompare: (company: ScreenerRow) => void
  removeFromCompare: (symbol: string) => void
  clearCompare: () => void
  openCompare: () => void
  closeCompare: () => void
  isInCompare: (symbol: string) => boolean
}

const CompareContext = createContext<CompareContextType | undefined>(undefined)

export function CompareProvider({ children }: { children: ReactNode }) {
  const [compareList, setCompareList] = useState<ScreenerRow[]>([])
  const [isCompareOpen, setIsCompareOpen] = useState(false)

  const addToCompare = (company: ScreenerRow) => {
    if (compareList.length >= 5) {
      alert('You can compare up to 5 companies at once')
      return
    }
    
    if (compareList.some(c => c.symbol === company.symbol)) {
      return
    }
    
    setCompareList(prev => [...prev, company])
    
    // Auto-open compare drawer when adding first item
    if (compareList.length === 0) {
      setIsCompareOpen(true)
    }
  }

  const removeFromCompare = (symbol: string) => {
    setCompareList(prev => prev.filter(c => c.symbol !== symbol))
  }

  const clearCompare = () => {
    setCompareList([])
    setIsCompareOpen(false)
  }

  const openCompare = () => {
    if (compareList.length > 0) {
      setIsCompareOpen(true)
    }
  }

  const closeCompare = () => {
    setIsCompareOpen(false)
  }

  const isInCompare = (symbol: string) => {
    return compareList.some(c => c.symbol === symbol)
  }

  return (
    <CompareContext.Provider
      value={{
        compareList,
        isCompareOpen,
        addToCompare,
        removeFromCompare,
        clearCompare,
        openCompare,
        closeCompare,
        isInCompare
      }}
    >
      {children}
    </CompareContext.Provider>
  )
}

export function useCompare() {
  const context = useContext(CompareContext)
  if (context === undefined) {
    throw new Error('useCompare must be used within a CompareProvider')
  }
  return context
}
