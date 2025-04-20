
import { useEffect, useState } from "react"
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

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:3001")

    ws.onopen = () => {
      console.log("WebSocket connected")
    }

    ws.onmessage = (event) => {
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
    }

    ws.onclose = () => {
      console.log("WebSocket disconnected")
    }

    return () => ws.close()
  }, [selectedNodeId])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Real-Time Data: {selectedNodeId}</CardTitle>
        <div className="text-2xl font-bold text-primary">
          {opcuaData !== null ? opcuaData.toFixed(2) : "Loading..."}
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
