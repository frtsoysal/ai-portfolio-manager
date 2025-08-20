'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
// import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DCFInputs } from '@/types/dcf'

interface InputsPanelProps {
  inputs: DCFInputs | null | undefined
  onChange: (newInputs: Partial<DCFInputs>) => void
}

export default function InputsPanel({ inputs, onChange }: InputsPanelProps) {
  if (!inputs) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>DCF Inputs</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading inputs...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>DCF Inputs</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* WACC Components */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold">WACC Components</h4>
          
          <div className="space-y-2">
            <label htmlFor="risk-free-rate" className="text-sm font-medium">Risk-Free Rate (%)</label>
            <Input
              id="risk-free-rate"
              type="number"
              step="0.01"
              value={(inputs.riskFreeRate * 100).toFixed(2)}
              onChange={(e) => onChange({ riskFreeRate: parseFloat(e.target.value) / 100 })}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="equity-risk-premium" className="text-sm font-medium">Equity Risk Premium (%)</label>
            <Input
              id="equity-risk-premium"
              type="number"
              step="0.01"
              value={(inputs.equityRiskPremium * 100).toFixed(2)}
              onChange={(e) => onChange({ equityRiskPremium: parseFloat(e.target.value) / 100 })}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="beta" className="text-sm font-medium">Beta</label>
            <Input
              id="beta"
              type="number"
              step="0.01"
              value={inputs.beta.toFixed(2)}
              onChange={(e) => onChange({ beta: parseFloat(e.target.value) })}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="cost-of-debt" className="text-sm font-medium">Cost of Debt (%)</label>
            <Input
              id="cost-of-debt"
              type="number"
              step="0.01"
              value={(inputs.costOfDebt * 100).toFixed(2)}
              onChange={(e) => onChange({ costOfDebt: parseFloat(e.target.value) / 100 })}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="tax-rate" className="text-sm font-medium">Tax Rate (%)</label>
            <Input
              id="tax-rate"
              type="number"
              step="0.01"
              value={(inputs.taxRate * 100).toFixed(2)}
              onChange={(e) => onChange({ taxRate: parseFloat(e.target.value) / 100 })}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="debt-to-capital" className="text-sm font-medium">Target Debt/Capital (%)</label>
            <Input
              id="debt-to-capital"
              type="number"
              step="0.01"
              value={(inputs.targetDebtToCapital * 100).toFixed(2)}
              onChange={(e) => onChange({ targetDebtToCapital: parseFloat(e.target.value) / 100 })}
            />
          </div>
        </div>

        {/* Terminal Value */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold">Terminal Value</h4>
          
          <div className="space-y-2">
            <label htmlFor="terminal-method" className="text-sm font-medium">Method</label>
            <Select 
              value={inputs.terminalMethod} 
              onValueChange={(value: 'gordon' | 'exitMultiple') => onChange({ terminalMethod: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gordon">Gordon Growth</SelectItem>
                <SelectItem value="exitMultiple">Exit Multiple</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {inputs.terminalMethod === 'gordon' && (
            <div className="space-y-2">
              <label htmlFor="terminal-growth" className="text-sm font-medium">Terminal Growth Rate (%)</label>
              <Input
                id="terminal-growth"
                type="number"
                step="0.01"
                value={(inputs.terminalGrowthRate * 100).toFixed(2)}
                onChange={(e) => onChange({ terminalGrowthRate: parseFloat(e.target.value) / 100 })}
              />
            </div>
          )}

          {inputs.terminalMethod === 'exitMultiple' && (
            <div className="space-y-2">
              <label htmlFor="exit-multiple" className="text-sm font-medium">Exit Multiple (x EBIT)</label>
              <Input
                id="exit-multiple"
                type="number"
                step="0.1"
                value={inputs.exitMultiple.toFixed(1)}
                onChange={(e) => onChange({ exitMultiple: parseFloat(e.target.value) })}
              />
            </div>
          )}
        </div>

        {/* Forecast Period */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold">Forecast</h4>
          
          <div className="space-y-2">
            <label htmlFor="forecast-period" className="text-sm font-medium">Forecast Period (Years)</label>
            <Select 
              value={inputs.forecastPeriod.toString()} 
              onValueChange={(value) => onChange({ forecastPeriod: parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 Years</SelectItem>
                <SelectItem value="5">5 Years</SelectItem>
                <SelectItem value="10">10 Years</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}