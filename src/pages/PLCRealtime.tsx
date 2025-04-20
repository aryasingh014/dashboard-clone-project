
import React, { useState, useEffect } from "react"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { DashboardNav } from "@/components/DashboardNav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { NodeSelector } from "@/components/plc/NodeSelector"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  Bar,
  BarChart,
  Area,
  AreaChart,
} from "recharts"

// Node IDs available for monitoring
const nodeIds = [
  "ns=3;i=1001",
  "ns=3;i=1002",
  "ns=3;i=1003",
  "ns=3;i=1004",
  "ns=3;i=1005",
  "ns=3;i=1006",
  "ns=3;i=1007",
]

// Graph types
const graphTypes = [
  { id: "line", label: "Line Graph" },
  { id: "bar", label: "Bar Chart" },
  { id: "area", label: "Area Chart" },
]

// Color options
const colorOptions = [
  { id: "blue", label: "Blue", value: "#3b82f6" },
  { id: "green", label: "Green", value: "#22c55e" },
  { id: "red", label: "Red", value: "#ef4444" },
  { id: "purple", label: "Purple", value: "#9b87f5" },
  { id: "orange", label: "Orange", value: "#f97316" },
]

interface NodeConfig {
  id: string
  minRange: number
  maxRange: number
  alarmMin: number
  alarmMax: number
  graphType: string
  color: string
  active: boolean
}

export default function PLCRealtime() {
  const [selectedNodes, setSelectedNodes] = useState<NodeConfig[]>([])
  const [opcuaData, setOpcuaData] = useState<Record<string, number>>({})
  const [history, setHistory] = useState<Record<string, Array<{ time: string, value: number }>>>({})

  // Function to add a node to monitoring list
  const addNode = (nodeId: string) => {
    if (selectedNodes.some(node => node.id === nodeId)) return
    
    setSelectedNodes([
      ...selectedNodes,
      {
        id: nodeId,
        minRange: 0,
        maxRange: 100,
        alarmMin: 20,
        alarmMax: 80,
        graphType: "line",
        color: colorOptions[0].value,
        active: true
      }
    ])
  }

  // Function to remove a node from monitoring
  const removeNode = (nodeId: string) => {
    setSelectedNodes(selectedNodes.filter(node => node.id !== nodeId))
  }

  // Function to update node configuration
  const updateNodeConfig = (nodeId: string, field: keyof NodeConfig, value: any) => {
    setSelectedNodes(
      selectedNodes.map(node => 
        node.id === nodeId ? { ...node, [field]: value } : node
      )
    )
  }

  // Check if a value is within alarm range
  const isInAlarmRange = (value: number, node: NodeConfig) => {
    return value < node.alarmMin || value > node.alarmMax
  }

  // WebSocket connection for real-time data
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:3001")

    ws.onopen = () => {
      console.log("WebSocket connected")
    }

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data?.value?.nodeId) {
        const nodeId = data.value.nodeId
        const value = data.value.value
        const timestamp = new Date().toLocaleTimeString()

        setOpcuaData(prev => ({ ...prev, [nodeId]: value }))
        setHistory(prev => ({
          ...prev,
          [nodeId]: [...(prev[nodeId] || []).slice(-9), { time: timestamp, value }]
        }))
      }
    }

    ws.onclose = () => {
      console.log("WebSocket disconnected")
    }

    return () => ws.close()
  }, [])

  // Render appropriate chart based on node configuration
  const renderChart = (node: NodeConfig) => {
    const data = history[node.id] || []
    
    const commonProps = {
      data: data,
      margin: { top: 5, right: 20, bottom: 20, left: 20 }
    }

    switch (node.graphType) {
      case "bar":
        return (
          <BarChart {...commonProps}>
            <XAxis dataKey="time" />
            <YAxis domain={[node.minRange, node.maxRange]} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="value" fill={node.color} />
          </BarChart>
        )
      case "area":
        return (
          <AreaChart {...commonProps}>
            <XAxis dataKey="time" />
            <YAxis domain={[node.minRange, node.maxRange]} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area type="monotone" dataKey="value" fill={node.color} stroke={node.color} />
          </AreaChart>
        )
      default:
        return (
          <LineChart {...commonProps}>
            <XAxis dataKey="time" />
            <YAxis domain={[node.minRange, node.maxRange]} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={node.color} 
              dot={false}
              strokeWidth={2}
            />
          </LineChart>
        )
    }
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <DashboardNav />
        <main className="flex-1 p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Real-Time PLC Monitoring</h1>
              <p className="text-muted-foreground">
                Monitor your PLC nodes in real-time with customizable graphs
              </p>
            </div>
            <SidebarTrigger />
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Add Node to Monitor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 items-end">
                <div className="space-y-2 min-w-[200px]">
                  <Label htmlFor="node-select">Select Node ID</Label>
                  <Select onValueChange={addNode}>
                    <SelectTrigger id="node-select">
                      <SelectValue placeholder="Select a node" />
                    </SelectTrigger>
                    <SelectContent>
                      {nodeIds
                        .filter(id => !selectedNodes.some(node => node.id === id))
                        .map(nodeId => (
                          <SelectItem key={nodeId} value={nodeId}>
                            {nodeId}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            {selectedNodes.map(node => (
              <Card key={node.id} className="overflow-hidden">
                <CardHeader className="space-y-0 pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {isInAlarmRange(opcuaData[node.id] || 0, node) ? (
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      ) : (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      )}
                      Node: {node.id}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Switch 
                        checked={node.active} 
                        onCheckedChange={(checked) => updateNodeConfig(node.id, 'active', checked)}
                      />
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeNode(node.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                  <div className="text-2xl font-bold mt-1">
                    {opcuaData[node.id] !== undefined ? opcuaData[node.id].toFixed(2) : "Loading..."}
                  </div>
                </CardHeader>
                <CardContent>
                  {node.active && (
                    <>
                      <div className="h-[200px] mt-2">
                        <ChartContainer config={{ line1: { theme: { light: node.color, dark: node.color } } }}>
                          <ResponsiveContainer width="100%" height="100%">
                            {renderChart(node)}
                          </ResponsiveContainer>
                        </ChartContainer>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div className="space-y-2">
                          <Label htmlFor={`graph-type-${node.id}`}>Graph Type</Label>
                          <Select 
                            value={node.graphType} 
                            onValueChange={(value) => updateNodeConfig(node.id, 'graphType', value)}
                          >
                            <SelectTrigger id={`graph-type-${node.id}`}>
                              <SelectValue placeholder="Select graph type" />
                            </SelectTrigger>
                            <SelectContent>
                              {graphTypes.map(type => (
                                <SelectItem key={type.id} value={type.id}>{type.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor={`graph-color-${node.id}`}>Graph Color</Label>
                          <Select 
                            value={node.color} 
                            onValueChange={(value) => updateNodeConfig(node.id, 'color', value)}
                          >
                            <SelectTrigger id={`graph-color-${node.id}`}>
                              <SelectValue placeholder="Select color" />
                            </SelectTrigger>
                            <SelectContent>
                              {colorOptions.map(color => (
                                <SelectItem key={color.id} value={color.value}>
                                  <div className="flex items-center gap-2">
                                    <div 
                                      className="w-4 h-4 rounded-full" 
                                      style={{ backgroundColor: color.value }}
                                    />
                                    {color.label}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="space-y-2 mt-4">
                        <div className="flex justify-between">
                          <Label>Value Range</Label>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor={`min-range-${node.id}`} className="text-xs">Min</Label>
                            <Input
                              id={`min-range-${node.id}`}
                              type="number"
                              value={node.minRange}
                              onChange={(e) => updateNodeConfig(node.id, 'minRange', Number(e.target.value))}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`max-range-${node.id}`} className="text-xs">Max</Label>
                            <Input
                              id={`max-range-${node.id}`}
                              type="number"
                              value={node.maxRange}
                              onChange={(e) => updateNodeConfig(node.id, 'maxRange', Number(e.target.value))}
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2 mt-4">
                        <div className="flex justify-between">
                          <Label>Alarm Range</Label>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor={`alarm-min-${node.id}`} className="text-xs">Min</Label>
                            <Input
                              id={`alarm-min-${node.id}`}
                              type="number"
                              value={node.alarmMin}
                              onChange={(e) => updateNodeConfig(node.id, 'alarmMin', Number(e.target.value))}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`alarm-max-${node.id}`} className="text-xs">Max</Label>
                            <Input
                              id={`alarm-max-${node.id}`}
                              type="number"
                              value={node.alarmMax}
                              onChange={(e) => updateNodeConfig(node.id, 'alarmMax', Number(e.target.value))}
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
          
          {selectedNodes.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p>No nodes selected for monitoring.</p>
              <p>Use the selector above to add nodes to monitor.</p>
            </div>
          )}
        </main>
      </div>
    </SidebarProvider>
  )
}
