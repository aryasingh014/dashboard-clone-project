
import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { toast } from "@/components/ui/use-toast"

interface DataPoint {
  time: string
  value: number
}

interface RealTimeChartProps {
  selectedNodeId: string
}

export function RealTimeChart({ selectedNodeId }: RealTimeChartProps) {
  const [opcuaData, setOpcuaData] = useState<number | null>(null)
  const [history, setHistory] = useState<DataPoint[]>([])
  const [wsStatus, setWsStatus] = useState<"connecting" | "connected" | "disconnected">("connecting")

  const connectWebSocket = useCallback(() => {
    console.log("Attempting to connect WebSocket...")
    const ws = new WebSocket("ws://localhost:3001")

    ws.onopen = () => {
      console.log("WebSocket connected")
      setWsStatus("connected")
      toast({
        title: "Connected to PLC Server",
        description: "Real-time data stream established",
      })
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data?.value?.nodeId === selectedNodeId) {
          const value = data.value.value
          const timestamp = new Date().toLocaleTimeString()

          setOpcuaData(value)
          setHistory((prev) => {
            const newHistory = [...prev, { time: timestamp, value }]
            return newHistory.slice(-10) // Keep last 10 points
          })
        }
      } catch (error) {
        console.error("Error processing message:", error)
      }
    }

    ws.onclose = () => {
      console.log("WebSocket disconnected")
      setWsStatus("disconnected")
      
      // Attempt to reconnect after 3 seconds
      setTimeout(() => {
        if (document.visibilityState !== "hidden") {
          connectWebSocket()
        }
      }, 3000)
    }

    ws.onerror = (error) => {
      console.error("WebSocket error:", error)
      setWsStatus("disconnected")
      
      // Show error toast
      toast({
        title: "Connection Error",
        description: "Failed to connect to PLC server. Retrying...",
        variant: "destructive",
      })
    }

    return ws
  }, [selectedNodeId])

  useEffect(() => {
    const ws = connectWebSocket()

    // Handle page visibility changes to reconnect when tab becomes active
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && wsStatus === "disconnected") {
        connectWebSocket()
      }
    }
    
    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      ws.close()
    }
  }, [connectWebSocket, wsStatus])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Real-Time Data: {selectedNodeId}</CardTitle>
        <div className="flex items-center gap-2">
          <div className="text-2xl font-bold text-primary">
            {opcuaData !== null ? opcuaData.toFixed(2) : "Loading..."}
          </div>
          <div 
            className={`h-2.5 w-2.5 rounded-full ml-2 ${
              wsStatus === "connected" ? "bg-green-500" : 
              wsStatus === "connecting" ? "bg-amber-500" : "bg-red-500"
            }`}
          />
          <div className="text-xs text-muted-foreground">
            {wsStatus === "connected" ? "Connected" : 
             wsStatus === "connecting" ? "Connecting..." : "Disconnected"}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ChartContainer
            config={{
              line1: {
                theme: {
                  light: "#9b87f5",
                  dark: "#9b87f5",
                },
              },
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history}>
                <XAxis
                  dataKey="time"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <ChartTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <ChartTooltipContent
                          payload={payload}
                          label={payload[0].payload.time}
                        />
                      )
                    }
                    return null
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="var(--color-line1)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  )
}
