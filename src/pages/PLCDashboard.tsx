
import React, { useState, useEffect } from "react"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { DashboardNav } from "@/components/DashboardNav"
import { PLCContent } from "@/components/plc/PLCContent"

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
                Monitor your PLC data in real-time
              </p>
            </div>
            <SidebarTrigger />
          </div>
          <PLCContent />
        </main>
      </div>
    </SidebarProvider>
  )
}
