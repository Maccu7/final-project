'use client'
import React from 'react'
import { Table } from '@/components/ui/Table'
import { ActionMenu } from '@/components/ui/ActionMenu'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'

import { userService } from '@/services/user.service'
import { User } from '@/types/interfaces'

const UsersSettings = () => {
  const queryClient = useQueryClient()

  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: userService.getAll,
  })

  const deleteUserMutation = useMutation({
    mutationFn: (user: User) => userService.softDelete(user.id),
    onSuccess: () => {
      toast.success('User (client) deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['clients'] })
    },
    onError: (error: unknown) => {
      const err = error as { message?: string }
      toast.error(err?.message || 'Error deleting user')
    },
  })

  const columns = [
    {
      header: 'First Name',
      accessor: (user: User) => user.firstName,
    },
    {
      header: 'Last Name',
      accessor: (user: User) => user.lastName,
    },
    {
      header: 'Email',
      accessor: (user: User) => user.email,
    },
    {
      header: 'Role',
      accessor: (user: User) =>
        user.roles
          .map((role) => {
            const formatted = role.replace(/_/g, ' ').toLowerCase()
            return formatted.charAt(0).toUpperCase() + formatted.slice(1)
          })
          .join(', '),
    },
    { header: 'Email', accessor: 'email' as const },
    {
      header: 'Role',
      accessor: (user: User) =>
        user.roles
          .map((role) => {
            const formatted = role.replace(/_/g, ' ').toLowerCase()
            return formatted.charAt(0).toUpperCase() + formatted.slice(1)
          })
          .join(', '),
    },
    {
      header: 'Actions',
      accessor: (user: User) => (
        <ActionMenu
          items={[
            {
              label: 'View Details',
              onClick: () =>
                toast.info('View details of user action triggered'),
            },
            {
              label: 'Edit',
              onClick: () => toast.info('Edit user action triggered'),
            },
            {
              label: 'Delete',
              variant: 'danger',
              onClick: () => deleteUserMutation.mutate(user),
            },
          ]}
        />
      ),
    },
  ]

  if (isLoading) {
    return <div className="p-6">Loading users...</div>
  }

  return (
    <div className="bg-white">
      <div className="p-6 overflow-x-auto">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-semibold text-gray-900">
            User Management
          </h2>
        </div>
        <p className="text-gray-600 mb-4">
          Manage user accounts and permissions
        </p>
        <Table
          data={users}
          columns={columns}
          emptyState={<p>No users found.</p>}
        />
      </div>
    </div>
  )
}

export default UsersSettings