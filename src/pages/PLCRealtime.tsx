
import React, { useState, useEffect } from "react"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { DashboardNav } from "@/components/DashboardNav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { NodeMonitor } from "@/components/plc/NodeMonitor"

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

export default function PLCRealtime() {
  const [selectedNodes, setSelectedNodes] = useState<string[]>([])

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <DashboardNav />
        <main className="flex-1 p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Real-Time PLC Monitor</h1>
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
              <div className="flex gap-4 items-end">
                {nodeIds.map(nodeId => (
                  <button
                    key={nodeId}
                    onClick={() => setSelectedNodes(prev => [...prev, nodeId])}
                    className={cn(
                      "px-4 py-2 rounded-md border",
                      selectedNodes.includes(nodeId) 
                        ? "bg-muted cursor-not-allowed" 
                        : "hover:bg-accent"
                    )}
                    disabled={selectedNodes.includes(nodeId)}
                  >
                    {nodeId}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            {selectedNodes.map(nodeId => (
              <NodeMonitor
                key={nodeId}
                nodeId={nodeId}
                onRemove={() => setSelectedNodes(prev => prev.filter(id => id !== nodeId))}
              />
            ))}
          </div>
          
          {selectedNodes.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p>No nodes selected for monitoring.</p>
              <p>Click on a node ID above to start monitoring.</p>
            </div>
          )}
        </main>
      </div>
    </SidebarProvider>
  )
}
