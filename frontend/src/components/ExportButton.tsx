'use client'

import { ScreenerRow } from '../types/screener'
import { Button } from './ui/button'

interface ExportButtonProps {
  data: ScreenerRow[]
  filename?: string
  label?: string
  className?: string
}

export default function ExportButton({ 
  data, 
  filename = 'sp500-screener-export.csv',
  label = 'Export CSV',
  className = ''
}: ExportButtonProps) {
  const handleExport = () => {
    if (!data || data.length === 0) {
      alert('No data to export')
      return
    }

    // Define columns to export (customize as needed)
    const columns = [
      'symbol',
      'name',
      'sector',
      'industry',
      'price',
      'changePct',
      'marketCap',
      'pe',
      'forwardPE',
      'pb',
      'dividendYield',
      'beta',
      'roeTTM',
      'netMarginTTM',
      'evEbitda'
    ]

    // Format headers for CSV
    const headers = [
      'Symbol',
      'Company Name',
      'Sector',
      'Industry',
      'Price ($)',
      'Change (%)',
      'Market Cap ($)',
      'P/E Ratio',
      'Forward P/E',
      'P/B Ratio',
      'Dividend Yield (%)',
      'Beta',
      'ROE (%)',
      'Net Margin (%)',
      'EV/EBITDA'
    ]

    // Format data for CSV
    const csvContent = [
      headers.join(','),
      ...data.map(row => {
        return columns.map(col => {
          const value = row[col as keyof ScreenerRow]
          
          // Format values appropriately
          if (value === undefined || value === null) {
            return 'N/A'
          }
          
          if (typeof value === 'string') {
            // Escape quotes and wrap in quotes if contains comma
            return value.includes(',') ? `"${value.replace(/"/g, '""')}"` : value
          }
          
          // Format numbers
          if (col === 'changePct' || col === 'dividendYield' || col === 'roeTTM' || col === 'netMarginTTM') {
            return value ? (Number(value) * 100).toFixed(2) : 'N/A'
          }
          
          if (col === 'marketCap') {
            return value ? value.toString() : 'N/A'
          }
          
          return value ? value.toString() : 'N/A'
        }).join(',')
      })
    ].join('\n')

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Button
      onClick={handleExport}
      variant="outline"
      size="sm"
      className={`bg-green-50 border-green-200 text-green-700 hover:bg-green-100 hover:border-green-300 ${className}`}
    >
      <span className="mr-2">📊</span>
      {label}
    </Button>
  )
}
