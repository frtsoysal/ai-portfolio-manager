'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface NotesPanelProps {
  symbol: string
}

export default function NotesPanel({ symbol }: NotesPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Research Notes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h5 className="text-sm font-medium">Key Assumptions</h5>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>• Revenue growth based on historical trends and industry outlook</p>
            <p>• Operating margins assumed to stabilize at current levels</p>
            <p>• WACC reflects current market conditions and company risk profile</p>
            <p>• Terminal growth rate aligned with long-term GDP growth</p>
          </div>
        </div>

        <div className="space-y-2">
          <h5 className="text-sm font-medium">Data Sources</h5>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">Financial Modeling Prep</Badge>
            <Badge variant="outline">Company Filings</Badge>
            <Badge variant="outline">Market Data</Badge>
          </div>
        </div>

        <div className="space-y-2">
          <h5 className="text-sm font-medium">Quick Links</h5>
          <div className="space-y-1">
            <Button variant="ghost" size="sm" className="w-full justify-start h-8">
              📊 {symbol} Financial Statements
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start h-8">
              📈 {symbol} Stock Chart
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start h-8">
              📰 {symbol} Recent News
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start h-8">
              🏢 Company Website
            </Button>
          </div>
        </div>

        <div className="border-t pt-3">
          <div className="text-xs text-muted-foreground">
            <p className="mb-2">
              <strong>Disclaimer:</strong> This DCF analysis is for research purposes only and should not be considered as investment advice.
            </p>
            <p>
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}