'use client'
import type { Ticket } from '@/types/interfaces/interface'
import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { ticketService } from '@/services/tickets.service'
import {
  TICKET_STATUS_OPTIONS,
  TICKET_PRIORITY_OPTIONS,
} from '@/constants/ticketconfig'
import CreateTicketModal from '@/components/tickets/CreateTicketModal'
import EditTicketModal from '@/components/tickets/EditTicketModal'
import { Table } from '@/components/ui/Table'
import { createTicketTableColumns } from '../../../components/tickets/ticketsTable'
import SearchAndFilters from '@/components/shared/SearchAndFilters'
import { FilterModal } from '@/components/shared/FilterModal'
import { mapTickets } from '@/utils/mapTickets'
import { mapTicketsSimple } from '@/utils/mapTicketsSimple'

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [filterValues, setFilterValues] = useState({
    status: '',
    priority: '',
  })
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | undefined>(
    undefined
  )
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  const handleDelete = async () => {
    if (!selectedTicket) return
    try {
      await ticketService.deleteTicket(selectedTicket.id)
      setIsDeleteModalOpen(false)
      setSelectedTicket(null)

      const data = await ticketService.getUserTickets()
      const mappedTickets: Ticket[] = mapTicketsSimple(data)
      setTickets(mappedTickets)
    } catch {}
  }
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const data = await ticketService.getUserTickets()
        const userRole =
          localStorage.getItem('userRole') || sessionStorage.getItem('userRole')
        const userId =
          localStorage.getItem('userId') || sessionStorage.getItem('userId')

        setIsAdmin(
          userRole?.includes('admin') ||
            userRole?.includes('super_admin') ||
            false
        )
        setCurrentUserId(userId || undefined)

        const tickets = Array.isArray(data) ? data : []
        const mappedTickets = mapTickets(tickets)
        setTickets(mappedTickets)
      } catch {
        setTickets([])
      }
    }
    fetchTickets()
  }, [])

  const handleEditTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket)
    setIsEditModalOpen(true)
  }

  const handleDeleteTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket)
    setIsDeleteModalOpen(true)
  }

  const handleFilterChange = (name: string, value: string) => {
    setFilterValues((prev) => ({ ...prev, [name]: value }))
  }

  const filteredTickets = tickets.filter((ticket) => {
    const clientName =
      typeof ticket.client === 'string'
        ? ticket.client
        : ticket.client?.companyName || ''
    const productName =
      typeof ticket.product === 'string'
        ? ticket.product
        : ticket.product?.name || ''

    const matchesSearch =
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      productName.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus =
      !filterValues.status ||
      ticket.status.toLowerCase() === filterValues.status.toLowerCase()

    const matchesPriority =
      !filterValues.priority ||
      ticket.priority.toLowerCase() === filterValues.priority.toLowerCase()

    return matchesSearch && matchesStatus && matchesPriority
  })

  const handleRowClick = (item: Ticket): void => {
    setSelectedTicket(item)
    setIsEditModalOpen(true)
  }

  const handleTicketCreated = async () => {
    try {
      const data = await ticketService.getUserTickets()
      const mappedTickets: Ticket[] = mapTickets(data)
      setTickets(mappedTickets)
    } catch {
      setTickets([])
    }
  }

  const enhancedColumns = createTicketTableColumns({
    onEdit: handleEditTicket,
    onDelete: handleDeleteTicket,
    currentUserId,
    isAdmin,
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Tickets</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage and track all support tickets
          </p>
        </div>
        <div className="flex gap-4 w-full sm:w-auto">
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-black text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-800"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            New Ticket
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="relative">
          <SearchAndFilters
            searchQuery={searchTerm}
            onSearchChange={setSearchTerm}
            placeholder="Search tickets..."
            onFilterClick={() => setIsFilterModalOpen(true)}
          />
          {isFilterModalOpen && (
            <FilterModal
              isOpen={isFilterModalOpen}
              onClose={() => setIsFilterModalOpen(false)}
              title="Filter Tickets"
              fields={[
                {
                  name: 'status',
                  label: 'Status',
                  type: 'select',
                  options: TICKET_STATUS_OPTIONS,
                },
                {
                  name: 'priority',
                  label: 'Priority',
                  type: 'select',
                  options: TICKET_PRIORITY_OPTIONS,
                },
              ]}
              values={filterValues}
              onChange={handleFilterChange}
              onApply={() => setIsFilterModalOpen(false)}
            />
          )}
        </div>

        <div className="p-4 overflow-hidden">
          <div className="overflow-x-auto">
            <Table
              data={filteredTickets}
              columns={enhancedColumns}
              onRowClick={handleRowClick}
              className="w-full min-w-[800px]"
              emptyState={
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg mb-2">No tickets found</p>
                  <p className="text-gray-400 text-sm">
                    Try adjusting your search or filter criteria
                  </p>
                </div>
              }
            />
          </div>
        </div>
      </div>

      <CreateTicketModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onTicketCreated={handleTicketCreated}
      />

      {isEditModalOpen && selectedTicket && (
        <EditTicketModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false)
            setSelectedTicket(null)
          }}
          ticket={selectedTicket}
        />
      )}

      {isDeleteModalOpen && selectedTicket && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.40)' }}
        >
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-semibold mb-4">Delete Ticket</h2>
            <p>
              Are you sure you want to delete ticket: {selectedTicket.title}?
            </p>

            <div className="mt-4 flex justify-end gap-2">
              <Button
                onClick={() => setIsDeleteModalOpen(false)}
                variant="outline"
              >
                Cancel
              </Button>
              <Button onClick={handleDelete}>Delete</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
