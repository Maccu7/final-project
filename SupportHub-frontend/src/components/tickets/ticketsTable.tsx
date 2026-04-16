import { ReactNode } from 'react';
import { TicketActions } from '@/components/tickets/TicketActions';
import type { Ticket } from '@/types/interfaces/interface';

type TicketHandlers = {
  onEdit: (ticket: Ticket) => void;
  onDelete: (ticket: Ticket) => void;
  isAdmin?: boolean;
  currentUserId?: string;
};

export const createTicketTableColumns = ({ onEdit, onDelete }: TicketHandlers) => [
  {
    header: 'ID ↑↓',
    accessor: (ticket: Ticket): ReactNode => (
      <span className="block truncate">{ticket.ticketCode || ticket.id}</span>
    ),
    className: 'w-24',
  },
  {
    header: 'Title',
    accessor: (ticket: Ticket): ReactNode => (
      <span className="truncate block" title={ticket.title}>{ticket.title}</span>
    ),
    className: 'w-[180px] min-w-[180px]',
  },
  {
    header: 'Client',
    accessor: (ticket: Ticket): ReactNode => {
      if (typeof ticket.client === 'string') {
        return <span className="text-sm text-gray-600 truncate block" title={ticket.client}>{ticket.client}</span>;
      }

      if (typeof ticket.client === 'object' && ticket.client?.companyName) {
        return <span className="text-sm text-gray-600 truncate block" title={ticket.client.companyName}>{ticket.client.companyName}</span>;
      }

      return <span className="text-sm text-gray-400">N/A</span>;
    },
    className: 'w-36',
  },
  {
    header: 'Product',
    accessor: (ticket: Ticket): ReactNode => {
      if (ticket.product && typeof ticket.product === 'string') {
        return <span className="text-sm text-gray-600">{ticket.product}</span>;
      }

      if (ticket.product && typeof ticket.product === 'object' && ticket.product.name) {
        return (
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-gray-700">
              {ticket.product.name}
            </span>
          </div>
        );
      }

      return <span className="text-sm text-gray-400">No product assigned</span>;
    },
    className: 'w-32',
  },
  {
    header: 'Priority',
    accessor: (ticket: Ticket): ReactNode => {
      const priority = ticket.priority?.toLowerCase() || 'low';
      const displayPriority = priority.charAt(0).toUpperCase() + priority.slice(1);
      return (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${priority === 'critical'
          ? 'bg-red-100 text-red-700'
          : priority === 'high'
            ? 'bg-orange-100 text-orange-700'
            : priority === 'medium'
              ? 'bg-yellow-100 text-yellow-700'
              : 'bg-green-100 text-green-700'
          }`}>
          {displayPriority}
        </span>
      );
    },
    className: 'w-24',
  },
  
  {
    header: 'Due Date',
    accessor: (ticket: Ticket): ReactNode => (
      <span className="text-sm text-gray-600">
        {ticket.dueDate ? new Date(ticket.dueDate).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }) : '-'}
      </span>
    ),
    className: 'w-24',
  },
  {
    header: 'Actions',
    accessor: (ticket: Ticket): ReactNode => (
      <div className="flex justify-end px-2">
        <TicketActions
          ticket={ticket}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>
    ),
    className: 'w-[80px]',
  },
];