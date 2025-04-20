
import React from "react"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { DashboardNav } from "@/components/DashboardNav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MonitorIcon, HistoryIcon } from "lucide-react"
import { Link } from "react-router-dom"

export default function PLCDashboard() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <DashboardNav />
        <main className="flex-1 p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">PLC Dashboard</h1>
              <p className="text-muted-foreground">
                Monitor your PLC data in real-time or check historical data
              </p>
            </div>
            <SidebarTrigger />
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MonitorIcon className="h-5 w-5" />
                  Real-Time Monitoring
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p>Monitor PLC data in real-time with customizable graphs and alarm settings.</p>
                <p>Features include:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Multi-node selection</li>
                  <li>Customizable graph types and colors</li>
                  <li>Alarm range settings</li>
                  <li>Live status monitoring</li>
                </ul>
                <Button asChild className="mt-4 w-full">
                  <Link to="/plc/realtime">Go to Real-Time Monitor</Link>
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HistoryIcon className="h-5 w-5" />
                  Historical Data
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p>View and analyze historical PLC data with flexible date ranges.</p>
                <p>Features include:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Multi-node data comparison</li>
                  <li>Customizable date ranges</li>
                  <li>Trend analysis</li>
                  <li>Data export options</li>
                </ul>
                <Button asChild className="mt-4 w-full">
                  <Link to="/plc/history">View Historical Data</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
