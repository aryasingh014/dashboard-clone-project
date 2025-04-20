
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Overview } from "@/components/Overview"
import { DashboardNav } from "@/components/DashboardNav"

export default function Index() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <DashboardNav />
        <main className="flex-1 p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground">
                Welcome back to your dashboard overview.
              </p>
            </div>
            <SidebarTrigger />
          </div>
          <Overview />
        </main>
      </div>
    </SidebarProvider>
  )
}
