'use client'

import React, { useMemo, useState } from 'react'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
  SortingState,
  ColumnDef,
  VisibilityState,
} from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
import { ScreenerRow } from '../types/screener'
import Sparkline from './Sparkline'
import ExportButton from './ExportButton'
import CopyLinkButton from './CopyLinkButton'

interface DataTableProps {
  data: ScreenerRow[]
  onRowClick?: (row: ScreenerRow) => void
}

const columnHelper = createColumnHelper<ScreenerRow>()

export default function DataTable({ data, onRowClick }: DataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [columnVisibilityOpen, setColumnVisibilityOpen] = useState(false)

  // Format helper functions
  const formatMarketCap = (value: number) => {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`
    return `$${value.toLocaleString()}`
  }

  const formatPercent = (value: number | undefined) => {
    if (value === undefined) return 'N/A'
    return `${(value * 100).toFixed(2)}%`
  }

  const formatNumber = (value: number | undefined, decimals = 2) => {
    if (value === undefined) return 'N/A'
    return value.toFixed(decimals)
  }

  // Create table columns
  const columns = useMemo<ColumnDef<ScreenerRow>[]>(() => [
    columnHelper.accessor('symbol', {
      header: 'Symbol',
      cell: info => (
        <div>
          <div className="font-medium text-gray-900">{info.getValue()}</div>
          <div className="text-sm text-gray-500 truncate max-w-32">{info.row.original.company_name}</div>
        </div>
      ),
      size: 150,
      enableSorting: true,
    }),
    
    columnHelper.accessor('sector', {
      header: 'Sector',
      cell: info => (
        <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
          {info.getValue()}
        </span>
      ),
      size: 120,
      enableSorting: true,
    }),

    columnHelper.accessor('industry', {
      header: 'Industry',
      cell: info => (
        <div className="text-sm text-gray-600 truncate max-w-32">{info.getValue()}</div>
      ),
      size: 140,
      enableSorting: true,
    }),

    columnHelper.accessor('current_price', {
      header: 'Price',
      cell: info => (
        <div className="text-right font-medium">${info.getValue().toFixed(2)}</div>
      ),
      size: 100,
      enableSorting: true,
    }),

    columnHelper.accessor('day_change_percent', {
      header: 'Change %',
      cell: info => {
        const value = info.getValue()
        return (
          <div className={`text-right font-medium ${value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {value >= 0 ? '+' : ''}{value.toFixed(2)}%
          </div>
        )
      },
      size: 100,
      enableSorting: true,
    }),

    columnHelper.accessor('market_cap', {
      header: 'Market Cap',
      cell: info => (
        <div className="text-right font-medium text-gray-900">
          {formatMarketCap(info.getValue())}
        </div>
      ),
      size: 120,
      enableSorting: true,
    }),

    columnHelper.accessor('pe_ratio', {
      header: 'P/E',
      cell: info => (
        <div className="text-right">{formatNumber(info.getValue(), 1)}</div>
      ),
      size: 80,
      enableSorting: true,
    }),



    columnHelper.accessor('pb_ratio', {
      header: 'P/B',
      cell: info => (
        <div className="text-right">{formatNumber(info.getValue(), 1)}</div>
      ),
      size: 80,
      enableSorting: true,
    }),

    columnHelper.accessor('dividend_yield', {
      header: 'Div Yield',
      cell: info => (
        <div className="text-right">{formatPercent(info.getValue())}</div>
      ),
      size: 100,
      enableSorting: true,
    }),

    columnHelper.accessor('beta', {
      header: 'Beta',
      cell: info => (
        <div className="text-right">{formatNumber(info.getValue(), 2)}</div>
      ),
      size: 80,
      enableSorting: true,
    }),

    columnHelper.accessor('week52_high', {
      header: '52W High',
      cell: info => {
        const value = info.getValue()
        if (value === undefined) return <div className="text-right">N/A</div>
        return (
          <div className="text-right font-medium">
            ${value.toFixed(2)}
          </div>
        )
      },
      size: 80,
      enableSorting: true,
    }),

    columnHelper.accessor('roe', {
      header: 'ROE',
      cell: info => (
        <div className="text-right">{formatPercent(info.getValue())}</div>
      ),
      size: 80,
      enableSorting: true,
    }),

    columnHelper.accessor('net_margin', {
      header: 'Net Margin',
      cell: info => (
        <div className="text-right">{formatPercent(info.getValue())}</div>
      ),
      size: 110,
      enableSorting: true,
    }),

    columnHelper.accessor('enterprise_value', {
      header: 'EV/EBITDA',
      cell: info => (
        <div className="text-right">{formatNumber(info.getValue(), 1)}</div>
      ),
      size: 100,
      enableSorting: true,
    }),

    // Sparkline column with real charts
    columnHelper.display({
      id: 'sparkline',
      header: 'Trend',
      cell: (info) => (
        <Sparkline 
          data={[]} 
          width={64}
          height={32}
          color="auto"
          strokeWidth={1.5}
        />
      ),
      size: 80,
      enableSorting: false,
    }),
  ], [])

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
    },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    enableSorting: true,
    enableMultiSort: true,
  })

  const tableContainerRef = React.useRef<HTMLDivElement>(null)

  const { rows } = table.getRowModel()

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 65, // Row height
    overscan: 10,
  })

  // Get visible columns for visibility menu
  const allColumns = table.getAllColumns().filter(column => column.getCanHide())

  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      {/* Table Header Controls */}
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-medium text-gray-900">
            Results ({data.length} companies)
          </h3>
          
          {/* Sorting indicator */}
          {sorting.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Sorted by:</span>
              {sorting.map((sort, index) => (
                <span key={sort.id} className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                  {sort.id} {sort.desc ? '↓' : '↑'}
                  {index < sorting.length - 1 && ', '}
                </span>
              ))}
            </div>
          )}
          
          {/* Export and Copy Link Buttons */}
          <div className="ml-auto flex items-center gap-2">
            <CopyLinkButton />
            <ExportButton data={data} />
          </div>
        </div>

        {/* Column Visibility Toggle */}
        <div className="relative">
          <button
            onClick={() => setColumnVisibilityOpen(!columnVisibilityOpen)}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
          >
            <span className="mr-2">👁️</span>
            Columns
          </button>

          {columnVisibilityOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
              <div className="p-2 max-h-64 overflow-y-auto">
                {allColumns.map(column => (
                  <label key={column.id} className="flex items-center space-x-2 py-1 px-2 hover:bg-gray-50 rounded">
                    <input
                      type="checkbox"
                      checked={column.getIsVisible()}
                      onChange={column.getToggleVisibilityHandler()}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 capitalize">
                      {typeof column.columnDef.header === 'string' ? column.columnDef.header : column.id}
                    </span>
                  </label>
                ))}
              </div>
              <div className="border-t border-gray-200 p-2">
                <button
                  onClick={() => table.toggleAllColumnsVisible(true)}
                  className="w-full text-left text-sm text-blue-600 hover:text-blue-800 py-1"
                >
                  Show All
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Virtual Table */}
      <div 
        ref={tableContainerRef}
        className="h-[600px] overflow-auto"
        style={{ contain: 'strict' }}
      >
        <div style={{ height: `${rowVirtualizer.getTotalSize()}px` }}>
          {/* Table Header */}
          <div className="sticky top-0 z-10 bg-gray-50 border-b border-gray-200">
            {table.getHeaderGroups().map(headerGroup => (
              <div key={headerGroup.id} className="flex">
                {headerGroup.headers.map(header => (
                  <div
                    key={header.id}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 last:border-r-0"
                    style={{
                      width: header.getSize(),
                      minWidth: header.getSize(),
                      maxWidth: header.getSize(),
                    }}
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        className={`flex items-center ${
                          header.column.getCanSort() ? 'cursor-pointer select-none hover:text-gray-700' : ''
                        }`}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && (
                          <span className="ml-1">
                            {{
                              asc: ' ↑',
                              desc: ' ↓',
                            }[header.column.getIsSorted() as string] ?? ' ↕️'}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Virtual Rows */}
          {rowVirtualizer.getVirtualItems().map(virtualRow => {
            const row = rows[virtualRow.index]
            return (
              <div
                key={row.id}
                className="flex hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-100"
                style={{
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
                onClick={() => onRowClick?.(row.original)}
              >
                {row.getVisibleCells().map(cell => (
                  <div
                    key={cell.id}
                    className="px-4 py-4 text-sm border-r border-gray-100 last:border-r-0 flex items-center"
                    style={{
                      width: cell.column.getSize(),
                      minWidth: cell.column.getSize(),
                      maxWidth: cell.column.getSize(),
                    }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      </div>

      {/* Table Footer */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
        <div className="flex justify-between items-center text-sm text-gray-600">
          <div>
            Showing {rowVirtualizer.getVirtualItems().length} of {data.length} rows
          </div>
          <div className="flex items-center gap-4">
            <span>Hold Shift + Click for multi-sort</span>
            <button
              onClick={() => setSorting([])}
              className="text-blue-600 hover:text-blue-800"
            >
              Clear sorting
            </button>
          </div>
        </div>
      </div>

      {/* Click outside to close column visibility */}
      {columnVisibilityOpen && (
        <div 
          className="fixed inset-0 z-5" 
          onClick={() => setColumnVisibilityOpen(false)}
        />
      )}
    </div>
  )
}
