'use client'

import { useState } from 'react'
import { ScreenerRow } from '../app/api/screener/route'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet'

interface FilterState {
  search: string
  sectors: string[]
  industries: string[]
  priceMin: number | null
  priceMax: number | null
  marketCapMin: number | null
  marketCapMax: number | null
  peMin: number | null
  peMax: number | null
  dividendYieldMin: number | null
  dividendYieldMax: number | null
  betaMin: number | null
  betaMax: number | null
  revenueGrowthMin: number | null
  profitable: boolean
  dividendPayers: boolean
  lowVolatility: boolean
}

interface FilterPanelProps {
  data: ScreenerRow[]
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  isOpen: boolean
  onClose: () => void
}

export const initialFilters: FilterState = {
  search: '',
  sectors: [],
  industries: [],
  priceMin: null,
  priceMax: null,
  marketCapMin: null,
  marketCapMax: null,
  peMin: null,
  peMax: null,
  dividendYieldMin: null,
  dividendYieldMax: null,
  betaMin: null,
  betaMax: null,
  revenueGrowthMin: null,
  profitable: false,
  dividendPayers: false,
  lowVolatility: false
}

export default function FilterPanel({ 
  data, 
  filters, 
  onFiltersChange, 
  isOpen, 
  onClose 
}: FilterPanelProps) {
  const updateFilter = (key: keyof FilterState, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    })
  }

  const resetFilters = () => {
    onFiltersChange(initialFilters)
  }

  // Get unique sectors and industries from data
  const sectors = [...new Set(data.map(d => d.sector))].sort()
  const industries = [...new Set(data.map(d => d.industry))].sort()

  // Preset filters
  const applyPreset = (preset: string) => {
    switch (preset) {
      case 'value':
        onFiltersChange({
          ...initialFilters,
          peMax: 15,
          dividendYieldMin: 0.001 // >0%
        })
        break
      case 'growth':
        onFiltersChange({
          ...initialFilters,
          revenueGrowthMin: 0.1, // >10%
          peMax: 40
        })
        break
      case 'quality':
        onFiltersChange({
          ...initialFilters,
          profitable: true,
          // roeTTM > 15%, netMarginTTM > 10% would go here
        })
        break
      case 'dividend':
        onFiltersChange({
          ...initialFilters,
          dividendYieldMin: 0.02, // >2%
          dividendPayers: true
        })
        break
      case 'lowvol':
        onFiltersChange({
          ...initialFilters,
          betaMax: 0.9,
          lowVolatility: true
        })
        break
    }
  }

  const panelContent = (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
        <button
          onClick={onClose}
          className="lg:hidden text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>

      {/* Filter Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search Symbol or Name
          </label>
          <Input
            type="text"
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            placeholder="e.g. AAPL or Apple"
          />
        </div>

        {/* Preset Filters */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quick Presets
          </label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => applyPreset('value')}
              variant="outline"
              size="sm"
              className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
            >
              📊 Value
            </Button>
            <Button
              onClick={() => applyPreset('growth')}
              variant="outline"
              size="sm"
              className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
            >
              🚀 Growth
            </Button>
            <Button
              onClick={() => applyPreset('quality')}
              variant="outline"
              size="sm"
              className="bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
            >
              ⭐ Quality
            </Button>
            <Button
              onClick={() => applyPreset('dividend')}
              variant="outline"
              size="sm"
              className="bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100"
            >
              💰 Dividend
            </Button>
            <Button
              onClick={() => applyPreset('lowvol')}
              variant="outline"
              size="sm"
              className="bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
            >
              📉 Low Vol
            </Button>
          </div>
        </div>

        {/* Sectors */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sectors
          </label>
          <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-md p-2">
            {sectors.map(sector => (
              <label key={sector} className="flex items-center space-x-2 py-1">
                <input
                  type="checkbox"
                  checked={filters.sectors.includes(sector)}
                  onChange={(e) => {
                    const newSectors = e.target.checked
                      ? [...filters.sectors, sector]
                      : filters.sectors.filter(s => s !== sector)
                    updateFilter('sectors', newSectors)
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{sector}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Price Range ($)
          </label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={filters.priceMin || ''}
              onChange={(e) => updateFilter('priceMin', e.target.value ? Number(e.target.value) : null)}
            />
            <Input
              type="number"
              placeholder="Max"
              value={filters.priceMax || ''}
              onChange={(e) => updateFilter('priceMax', e.target.value ? Number(e.target.value) : null)}
            />
          </div>
        </div>

        {/* Market Cap Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Market Cap (Billions)
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder="Min"
              value={filters.marketCapMin ? filters.marketCapMin / 1e9 : ''}
              onChange={(e) => updateFilter('marketCapMin', e.target.value ? Number(e.target.value) * 1e9 : null)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="number"
              placeholder="Max"
              value={filters.marketCapMax ? filters.marketCapMax / 1e9 : ''}
              onChange={(e) => updateFilter('marketCapMax', e.target.value ? Number(e.target.value) * 1e9 : null)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* P/E Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            P/E Ratio
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder="Min"
              value={filters.peMin || ''}
              onChange={(e) => updateFilter('peMin', e.target.value ? Number(e.target.value) : null)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="number"
              placeholder="Max"
              value={filters.peMax || ''}
              onChange={(e) => updateFilter('peMax', e.target.value ? Number(e.target.value) : null)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Beta Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Beta
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              step="0.1"
              placeholder="Min"
              value={filters.betaMin || ''}
              onChange={(e) => updateFilter('betaMin', e.target.value ? Number(e.target.value) : null)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="number"
              step="0.1"
              placeholder="Max"
              value={filters.betaMax || ''}
              onChange={(e) => updateFilter('betaMax', e.target.value ? Number(e.target.value) : null)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Boolean Filters */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Filters
          </label>
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={filters.profitable}
                onChange={(e) => updateFilter('profitable', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Profitable Companies</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={filters.dividendPayers}
                onChange={(e) => updateFilter('dividendPayers', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Dividend Payers</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={filters.lowVolatility}
                onChange={(e) => updateFilter('lowVolatility', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Low Volatility (Beta &lt; 1)</span>
            </label>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={resetFilters}
          className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
        >
          Reset All Filters
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50" onClick={onClose} />
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-80 bg-white border-r border-gray-200 h-full">
        {panelContent}
      </div>

      {/* Mobile Drawer */}
      <div className={`lg:hidden fixed inset-y-0 left-0 z-50 w-80 bg-white transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {panelContent}
      </div>
    </>
  )
}
