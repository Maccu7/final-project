'use client'

import { useRouter } from 'next/navigation'
import { ActionMenu } from '@/components/ui/ActionMenu'
import { TicketActionsProps } from '@/types/TicketTypes'

export function TicketActions({ ticket, onEdit, onDelete }: TicketActionsProps) {
    const router = useRouter()

    return (
        <ActionMenu
            items={[
                {
                    label: 'View Details',
                    onClick: () => router.push(`/dashboard/tickets/${ticket.id}`),
                },
                {
                    label: 'Edit Ticket',
                    onClick: () => onEdit(ticket),
                },
                {
                    label: 'Delete',
                    onClick: () => onDelete(ticket),
                },
            ]}
        />
    )
}