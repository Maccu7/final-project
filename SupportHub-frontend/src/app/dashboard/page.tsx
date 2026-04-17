'use client'

import { useSession } from 'next-auth/react'
import { Button } from '../../components/ui/Button'
import { PlusIcon } from '@/components/icons'
import { useState } from 'react'
import { DashboardTab, DashboardData } from '@/types/dashboard.types'
import { dashboardAPI } from '@/services/dashboard.service'
import DashboardTabs from '@/components/shared/DashboardTabs'
import CreateTicketModal from '@/components/tickets/CreateTicketModal'
import { useQuery } from '@tanstack/react-query'
import renderDashboardTabContent from '@/components/dashboard/renderDashboardTabContent'
import { queryClient } from '@/providers/QueryProvider'

export default function DashboardPage() {
  const { data: session } = useSession()
  const userName = session?.user?.name || ''
  const [activeTab, setActiveTab] = useState<DashboardTab>('Overview')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const { data, isLoading, error } = useQuery({
    queryKey: ['get-statistics'],
    queryFn: dashboardAPI.getAllDashboardData,
  })

  const handleTicketCreated = async () => {
    queryClient.invalidateQueries({ queryKey: ['get-statistics'] })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-700">Dashboard</h1>
          <p className="text-gray-600">
            Welcome back, <strong>{userName}</strong>! Here&apos;s an overview
            of your support operations.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" className="w-full sm:w-auto">
            Export Reports
          </Button>
          <Button
            className="w-full sm:w-auto flex items-center justify-center gap-2"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <PlusIcon className="w-4 h-4" />
            New Ticket
          </Button>
        </div>
      </div>

      <DashboardTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {renderDashboardTabContent(
        data as DashboardData,
        activeTab,
        isLoading,
        error as string | null
      )}

      <CreateTicketModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onTicketCreated={handleTicketCreated}
      />
    </div>
  )
}
