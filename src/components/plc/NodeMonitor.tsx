
import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, CheckCircle2 } from "lucide-react"
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

const graphTypes = [
  { id: "line", label: "Line Graph" },
  { id: "bar", label: "Bar Chart" },
  { id: "area", label: "Area Chart" },
]

const colorOptions = [
  { id: "blue", label: "Blue", value: "#3b82f6" },
  { id: "green", label: "Green", value: "#22c55e" },
  { id: "red", label: "Red", value: "#ef4444" },
  { id: "purple", label: "Purple", value: "#9b87f5" },
  { id: "orange", label: "Orange", value: "#f97316" },
]

interface NodeMonitorProps {
  nodeId: string
  onRemove: () => void
}

interface NodeConfig {
  minRange: number
  maxRange: number
  alarmMin: number
  alarmMax: number
  graphType: string
  color: string
  active: boolean
}

export function NodeMonitor({ nodeId, onRemove }: NodeMonitorProps) {
  const [config, setConfig] = useState<NodeConfig>({
    minRange: 0,
    maxRange: 100,
    alarmMin: 20,
    alarmMax: 80,
    graphType: "line",
    color: colorOptions[0].value,
    active: true
  })
  
  const [opcuaData, setOpcuaData] = useState<number>()
  const [history, setHistory] = useState<Array<{ time: string, value: number }>>([])

  useEffect(() => {
    if (!config.active) return

    const ws = new WebSocket("ws://localhost:3001")

    ws.onopen = () => {
      console.log("WebSocket connected")
    }

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data?.value?.nodeId === nodeId) {
        const value = data.value.value
        const timestamp = new Date().toLocaleTimeString()

        setOpcuaData(value)
        setHistory(prev => [...prev.slice(-9), { time: timestamp, value }])
      }
    }

    ws.onclose = () => {
      console.log("WebSocket disconnected")
    }

    return () => ws.close()
  }, [nodeId, config.active])

  const isInAlarmRange = (value: number) => {
    return value < config.alarmMin || value > config.alarmMax
  }

  const updateConfig = <K extends keyof NodeConfig>(key: K, value: NodeConfig[K]) => {
    setConfig(prev => ({ ...prev, [key]: value }))
  }

  const renderChart = () => {
    const commonProps = {
      data: history,
      margin: { top: 5, right: 20, bottom: 20, left: 20 }
    }

    switch (config.graphType) {
      case "bar":
        return (
          <BarChart {...commonProps}>
            <XAxis dataKey="time" />
            <YAxis domain={[config.minRange, config.maxRange]} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="value" fill={config.color} />
          </BarChart>
        )
      case "area":
        return (
          <AreaChart {...commonProps}>
            <XAxis dataKey="time" />
            <YAxis domain={[config.minRange, config.maxRange]} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area type="monotone" dataKey="value" fill={config.color} stroke={config.color} />
          </AreaChart>
        )
      default:
        return (
          <LineChart {...commonProps}>
            <XAxis dataKey="time" />
            <YAxis domain={[config.minRange, config.maxRange]} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={config.color} 
              dot={false}
              strokeWidth={2}
            />
          </LineChart>
        )
    }
  }

  return (
    <Card>
      <CardHeader className="space-y-0 pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center gap-2">
            {opcuaData !== undefined && isInAlarmRange(opcuaData) ? (
              <AlertCircle className="h-5 w-5 text-red-500" />
            ) : (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            )}
            Node: {nodeId}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Switch 
              checked={config.active} 
              onCheckedChange={checked => updateConfig('active', checked)}
            />
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onRemove}
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              Remove
            </Button>
          </div>
        </div>
        <div className="text-2xl font-bold mt-1">
          {opcuaData !== undefined ? opcuaData.toFixed(2) : "Loading..."}
        </div>
      </CardHeader>
      <CardContent>
        {config.active && (
          <>
            <div className="h-[200px] mt-2">
              <ChartContainer config={{ value: { theme: { light: config.color, dark: config.color } } }}>
                <ResponsiveContainer width="100%" height="100%">
                  {renderChart()}
                </ResponsiveContainer>
              </ChartContainer>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <Label>Graph Type</Label>
                <Select 
                  value={config.graphType} 
                  onValueChange={value => updateConfig('graphType', value)}
                >
                  <SelectTrigger>
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
                <Label>Graph Color</Label>
                <Select 
                  value={config.color} 
                  onValueChange={value => updateConfig('color', value)}
                >
                  <SelectTrigger>
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
              <Label>Value Range</Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs">Min</Label>
                  <Input
                    type="number"
                    value={config.minRange}
                    onChange={e => updateConfig('minRange', Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label className="text-xs">Max</Label>
                  <Input
                    type="number"
                    value={config.maxRange}
                    onChange={e => updateConfig('maxRange', Number(e.target.value))}
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-2 mt-4">
              <Label>Alarm Range</Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs">Min</Label>
                  <Input
                    type="number"
                    value={config.alarmMin}
                    onChange={e => updateConfig('alarmMin', Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label className="text-xs">Max</Label>
                  <Input
                    type="number"
                    value={config.alarmMax}
                    onChange={e => updateConfig('alarmMax', Number(e.target.value))}
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
