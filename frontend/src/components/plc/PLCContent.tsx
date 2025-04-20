
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { NodeSelector } from "./NodeSelector"
import { RealTimeChart } from "./RealTimeChart"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

const nodeIds = [
  "ns=3;i=1001",
  "ns=3;i=1002",
  "ns=3;i=1003",
  "ns=3;i=1004",
  "ns=3;i=1005",
  "ns=3;i=1006",
  "ns=3;i=1007",
]

export function PLCContent() {
  const [realTimeMode, setRealTimeMode] = useState(false)
  const [selectedNodeId, setSelectedNodeId] = useState(nodeIds[0])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Monitor Controls</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex items-center space-x-4">
            <Switch
              id="real-time"
              checked={realTimeMode}
              onCheckedChange={setRealTimeMode}
            />
            <Label htmlFor="real-time">Real-Time Mode</Label>
          </div>
          {realTimeMode && (
            <NodeSelector
              nodeIds={nodeIds}
              selectedNodeId={selectedNodeId}
              onNodeSelect={setSelectedNodeId}
            />
          )}
        </CardContent>
      </Card>

      {realTimeMode && (
        <RealTimeChart selectedNodeId={selectedNodeId} />
      )}
    </div>
  )
}
