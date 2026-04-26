'use client'

import { DashboardTab, DashboardData } from '@/types/dashboard.types'
import OverviewTab from '@/components/dashboard/OverviewTab'
import TicketsTab from '@/components/dashboard/TicketsTab'
import ClientsTab from '@/components/dashboard/ClientsTab'
import ProductsTab from '@/components/dashboard/ProductsTab'

export default function renderDashboardTabContent(
  data: any,
  activeTab: DashboardTab,
  isLoading: boolean,
  error: string | null,
  isAdmin: boolean = false
) {
  if (!data && !isLoading) {
    return (
      <div className="text-center py-8">
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>
    )
  }

  // Client dashboard — data shape: { totalTickets, openTickets, resolvedTickets, tickets }
  if (!isAdmin) {
    const overviewData = data
      ? {
          stats: {
            totalTickets: data.totalTickets ?? 0,
            openTickets: data.openTickets ?? 0,
          },
          statusDistribution: [],
        }
      : null

    switch (activeTab) {
      case 'Tickets':
        return <TicketsTab data={data?.tickets || null} loading={isLoading} />
      case 'Overview':
      default:
        return <OverviewTab data={overviewData} loading={isLoading} />
    }
  }

  // Admin dashboard
  switch (activeTab) {
    case 'Overview':
    default:
      return <OverviewTab data={data?.overview || null} loading={isLoading} />
    case 'Tickets':
      return <TicketsTab data={data?.tickets || null} loading={isLoading} />
    case 'Clients':
      return <ClientsTab data={data?.clients || null} loading={isLoading} />
    case 'Products':
      return <ProductsTab data={data?.products || null} loading={isLoading} />
  }
}
