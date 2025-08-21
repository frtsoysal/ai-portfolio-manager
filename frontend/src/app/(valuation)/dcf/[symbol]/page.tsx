'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DCFData, DCFInputs, DCFModel, ValuationResults } from '@/types/dcf'
import { initializeDCFModel, updateDCFModel } from '@/lib/dcf'

// Import DCF components (will create these)
import DCFHeader from '@/components/dcf/Header'
import InputsPanel from '@/components/dcf/InputsPanel'
import DriversPanel from '@/components/dcf/DriversPanel'
import ForecastTable from '@/components/dcf/ForecastTable'
import ForecastCharts from '@/components/dcf/ForecastCharts'
import TerminalValueCard from '@/components/dcf/TerminalValueCard'
import ValuationBridge from '@/components/dcf/ValuationBridge'
import MultiplesAnalysis from '@/components/dcf/MultiplesAnalysis'
import ValuationCard from '@/components/dcf/ValuationCard'
import ScenariosPanel from '@/components/dcf/Scenarios'
import SensitivityPanel from '@/components/dcf/Sensitivity'
import DiagnosticsPanel from '@/components/dcf/Diagnostics'
import ReverseDCF from '@/components/dcf/ReverseDCF'
import NotesPanel from '@/components/dcf/NotesPanel'
import SymbolNavigator from '@/components/dcf/SymbolNavigator'

export default function DCFAnalysisPage() {
  const params = useParams()
  const symbol = params.symbol as string

  // State management
  const [dcfData, setDCFData] = useState<DCFData | null>(null)
  const [dcfModel, setDCFModel] = useState<DCFModel | null>(null)
  const [baseDCFModel, setBaseDCFModel] = useState<DCFModel | null>(null) // Store base model
  const [activeScenario, setActiveScenario] = useState<string>('base')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  // Load data on mount
  useEffect(() => {
    if (symbol) {
      fetchDCFData(symbol.toUpperCase())
    }
  }, [symbol])

  const fetchDCFData = async (ticker: string) => {
    try {
      setLoading(true)
      setError('')

      // Fetch DCF data from our proxy endpoint
      const response = await fetch(`/api/backend/dcf/${ticker}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch data for ${ticker}`)
      }

      const data: DCFData = await response.json()
      setDCFData(data)
      
      // Initialize DCF model with default inputs
      const model = initializeDCFModel(data)
      setDCFModel(model)
      setBaseDCFModel(model) // Store base model for scenario resets
      
      console.log('DCF Data loaded:', data)
      console.log('DCF Model initialized:', model)
    } catch (err) {
      console.error('Error loading DCF data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load DCF data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading DCF analysis for {symbol?.toUpperCase()}...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => fetchDCFData(symbol.toUpperCase())}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!dcfData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>No Data</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">No DCF data available for {symbol?.toUpperCase()}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header with company info and key metrics */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <DCFHeader 
            company={dcfData.company}
            market={dcfData.market}
            valuation={dcfModel?.valuation}
          />
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left sidebar - Inputs and Drivers */}
          <div className="lg:col-span-1 space-y-6">
            {/* Symbol Navigator */}
            <SymbolNavigator />
            
            <Tabs defaultValue="inputs" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="inputs">Inputs</TabsTrigger>
                <TabsTrigger value="drivers">Drivers</TabsTrigger>
              </TabsList>
              
              <TabsContent value="inputs" className="space-y-4">
                <InputsPanel 
                  inputs={dcfModel?.inputs}
                  onChange={(newInputs) => {
                    if (dcfData && dcfModel) {
                      const updatedModel = updateDCFModel(dcfData, dcfModel, newInputs)
                      setDCFModel(updatedModel)
                    }
                  }}
                />
              </TabsContent>
              
              <TabsContent value="drivers" className="space-y-4">
                <DriversPanel 
                  inputs={dcfModel?.inputs}
                  historical={dcfData.historical}
                  onChange={(newInputs) => {
                    if (dcfData && dcfModel) {
                      const updatedModel = updateDCFModel(dcfData, dcfModel, newInputs)
                      setDCFModel(updatedModel)
                    }
                  }}
                />
              </TabsContent>
            </Tabs>

            {/* Notes Panel */}
            <NotesPanel symbol={symbol} />
          </div>

          {/* Main content area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Valuation Summary */}
            <ValuationCard 
              valuation={dcfModel?.valuation}
              currency={dcfData.market.currency}
            />

            {/* Forecast Charts */}
            <ForecastCharts 
              projections={dcfModel?.projections || []}
              currency={dcfData.market.currency}
            />

            {/* Forecast Table */}
            <ForecastTable 
              projections={dcfModel?.projections || []}
              currency={dcfData.market.currency}
            />

            {/* Terminal Value Analysis */}
            <TerminalValueCard 
              model={dcfModel}
              currency={dcfData.market.currency}
            />

            {/* Valuation Bridge */}
            <ValuationBridge 
              model={dcfModel}
              currency={dcfData.market.currency}
            />

            {/* Multiples Analysis */}
            <MultiplesAnalysis 
              model={dcfModel}
              currency={dcfData.market.currency}
            />

            {/* Analysis Tabs */}
            <Tabs defaultValue="scenarios" className="w-full">
              <TabsList>
                <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
                <TabsTrigger value="sensitivity">Sensitivity</TabsTrigger>
                <TabsTrigger value="reverse">Reverse DCF</TabsTrigger>
                <TabsTrigger value="diagnostics">Diagnostics</TabsTrigger>
              </TabsList>
              
              <TabsContent value="scenarios">
                <ScenariosPanel 
                  activeScenario={activeScenario}
                  onScenarioChange={setActiveScenario}
                  model={dcfModel}
                  dcfData={dcfData}
                  onModelChange={setDCFModel}
                  baseModel={baseDCFModel}
                />
              </TabsContent>
              
              <TabsContent value="sensitivity">
                <SensitivityPanel 
                  model={dcfModel}
                  dcfData={dcfData}
                  onModelChange={setDCFModel}
                  activeScenario={activeScenario}
                />
              </TabsContent>
              
              <TabsContent value="reverse">
                <ReverseDCF 
                  model={dcfModel}
                  dcfData={dcfData}
                />
              </TabsContent>
              
              <TabsContent value="diagnostics">
                <DiagnosticsPanel 
                  model={dcfModel}
                  dcfData={dcfData}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Footer disclaimer */}
      <div className="border-t bg-muted/50 mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-muted-foreground">
            <Badge variant="outline" className="mb-2">
              For Research Purposes Only
            </Badge>
            <p>
              This DCF analysis is hypothetical and should not be considered as investment advice. 
              Past performance does not guarantee future results.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
