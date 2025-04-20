import React, { useState } from "react"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { DashboardNav } from "@/components/DashboardNav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts"

const nodeIds = [
  "ns=3;i=1001",
  "ns=3;i=1002",
  "ns=3;i=1003",
  "ns=3;i=1004",
  "ns=3;i=1005",
  "ns=3;i=1006",
  "ns=3;i=1007",
]

const generateHistoricalData = (nodes: string[], fromDate: Date, toDate: Date) => {
  const days = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
  const result = []
  
  for (let i = 0; i < days; i++) {
    const currentDate = new Date(fromDate)
    currentDate.setDate(currentDate.getDate() + i)
    
    const dataPoint: any = {
      date: format(currentDate, "MMM dd"),
    }
    
    nodes.forEach(node => {
      const seed = node.charCodeAt(node.length - 1) + currentDate.getDate()
      dataPoint[node] = Math.sin(seed * 0.1) * 50 + 50 + Math.random() * 10
    })
    
    result.push(dataPoint)
  }
  
  return result
}

const nodeColors: Record<string, string> = {
  "ns=3;i=1001": "#3b82f6",
  "ns=3;i=1002": "#22c55e",
  "ns=3;i=1003": "#ef4444",
  "ns=3;i=1004": "#9b87f5",
  "ns=3;i=1005": "#f97316",
  "ns=3;i=1006": "#06b6d4",
  "ns=3;i=1007": "#ec4899",
}

export default function PLCHistory() {
  const [fromDate, setFromDate] = useState<Date>()
  const [toDate, setToDate] = useState<Date>()
  const [selectedNodes, setSelectedNodes] = useState<string[]>([])
  const [historyData, setHistoryData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const toggleNodeSelection = (nodeId: string) => {
    if (selectedNodes.includes(nodeId)) {
      setSelectedNodes(selectedNodes.filter(id => id !== nodeId))
    } else {
      setSelectedNodes([...selectedNodes, nodeId])
    }
  }
  
  const loadHistoricalData = () => {
    if (!fromDate || !toDate || selectedNodes.length === 0) return
    
    setIsLoading(true)
    
    setTimeout(() => {
      const data = generateHistoricalData(selectedNodes, fromDate, toDate)
      setHistoryData(data)
      setIsLoading(false)
    }, 1000)
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <DashboardNav />
        <main className="flex-1 p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Historical PLC Data</h1>
              <p className="text-muted-foreground">
                View and analyze historical data from your PLC nodes
              </p>
            </div>
            <SidebarTrigger />
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Data Query Options</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label>From Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !fromDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {fromDate ? format(fromDate, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={fromDate}
                        onSelect={setFromDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <Label>To Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !toDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {toDate ? format(toDate, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={toDate}
                        onSelect={setToDate}
                        initialFocus
                        disabled={(date) => 
                          (fromDate ? date < fromDate : false) || 
                          date > new Date()
                        }
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <Label>Select Nodes</Label>
                  <div className="border rounded-md p-4 max-h-[150px] overflow-y-auto">
                    {nodeIds.map(nodeId => (
                      <div key={nodeId} className="flex items-center space-x-2 py-1">
                        <input
                          type="checkbox"
                          id={`node-${nodeId}`}
                          checked={selectedNodes.includes(nodeId)}
                          onChange={() => toggleNodeSelection(nodeId)}
                          className="rounded border-gray-300"
                        />
                        <label htmlFor={`node-${nodeId}`} className="flex-1">
                          {nodeId}
                        </label>
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: nodeColors[nodeId] }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <Button 
                className="mt-6 w-full md:w-auto"
                onClick={loadHistoricalData}
                disabled={!fromDate || !toDate || selectedNodes.length === 0 || isLoading}
              >
                {isLoading ? "Loading..." : "Load Historical Data"}
              </Button>
            </CardContent>
          </Card>
          
          {historyData.length > 0 && (
            <div className="grid gap-6">
              {selectedNodes.map(nodeId => (
                <Card key={nodeId}>
                  <CardHeader>
                    <CardTitle>Node {nodeId}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <ChartContainer config={{ [nodeId]: { theme: { light: nodeColors[nodeId], dark: nodeColors[nodeId] } } }}>
                          <LineChart data={historyData}>
                            <XAxis dataKey="date" />
                            <YAxis domain={['auto', 'auto']} />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Line
                              type="monotone"
                              dataKey={nodeId}
                              stroke={nodeColors[nodeId]}
                              strokeWidth={2}
                              dot={false}
                            />
                          </LineChart>
                        </ChartContainer>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          {historyData.length === 0 && !isLoading && (
            <div className="text-center py-12 text-muted-foreground">
              <p>No historical data to display.</p>
              <p>Select date range and nodes, then click "Load Historical Data".</p>
            </div>
          )}
        </main>
      </div>
    </SidebarProvider>
  )
}
