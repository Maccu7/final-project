'use client'
import React, { useEffect } from 'react'
import { notificationEvents } from '@/constants/integrationEvents'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import settingsService from '@/services/settings.service'
import type { SlackSettings, ApiResponse } from '../../types/settings'
import { SUCCESS_MESSAGES } from '@/constants/successMessages'
import { useForm, Controller } from 'react-hook-form'

const IntegrationsSettings = () => {
  const { user } = useCurrentUser()
  const queryClient = useQueryClient()
  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    formState: {  },
  } = useForm<SlackSettings>({
    defaultValues: {
      slackWebhookUrl: '',
      newTickets: false,
      ticketAssignments: false,
      statusChanges: false,
    },
  })

  const {
    data,
    isLoading: queryLoading,
    isError,
  } = useQuery<ApiResponse<SlackSettings>>({
    queryKey: ['slackSettings'],
    queryFn: () => settingsService.getSlackSettings(),
    retry: false,
  })

  const mutation = useMutation({
    mutationFn: settingsService.updateSlackSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['slackSettings'] })
      toast.success(SUCCESS_MESSAGES.WEBHOOK_SAVED_SUCCESSFULLY)
    },
    onError: (error: unknown) => {
      toast.error(
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ?? 'Failed to save Slack settings.'
      )
    },
  })

  useEffect(() => {
    if (data?.data) {
      reset(data.data)
    }
  }, [data, reset])

  const onSubmit = (formData: SlackSettings) => {
    mutation.mutate(formData)
  }

  const watchedValues = watch()

  const handleToggleSave = async (field: keyof SlackSettings, value: boolean) => {
    if (field === 'newTickets' && user?.role !== 'super_admin') return

    const updatedData = {
      ...watchedValues,
      [field]: value,
    }

    mutation.mutate(updatedData)

    if (field === 'newTickets') {
      if (value) {
        toast.success(SUCCESS_MESSAGES.NEW_TICKET_SLACK_NOTIFICATION_ENABLED)
      } else {
        toast.success(SUCCESS_MESSAGES.NEW_TICKET_SLACK_NOTIFICATION_DISABLED)
      }
    } else if (field === 'statusChanges') {
      if (value) {
        toast.success(SUCCESS_MESSAGES.SLACK_NOTIFICATION_ENABLED)
      } else {
        toast.success(SUCCESS_MESSAGES.SLACK_NOTIFICATION_DISABLED)
      }
    }
  }

  if (queryLoading) {
    return <div>Loading Slack settings...</div>
  }

  if (isError) {
    return <div>Failed to load Slack settings.</div>
  }

  return (
    <div className="space-y-6">
      <ToastContainer />
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-6 rounded-md shadow-md"
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Slack Integration
        </h2>
        <p className="text-gray-600 mb-6">
          Configure Slack notifications for ticket events
        </p>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Slack Webhook URL
          </label>
          <input
            type="text"
            {...register('slackWebhookUrl')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={mutation.status === 'pending'}
            className="bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
          >
            {mutation.status === 'pending' ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>

      <div className="bg-white p-6 rounded-md shadow-md border border-gray-300">
        <p className="text-sm font-medium text-gray-700 mb-2">
          Notification Events
        </p>
        <div className="space-y-3">
          {notificationEvents.map(({ label, field }) => (
            <Controller
              key={field}
              name={field as keyof SlackSettings}
              control={control}
              render={({ field: controllerField }) => (
                <label
                  className="flex items-center space-x-3 cursor-pointer"
                  onClick={async () => {
                    if (field === 'newTickets' && user?.role !== 'super_admin')
                      return
                    if (field === 'newTickets' || field === 'statusChanges') {
                      const newValue = !controllerField.value
                      await handleToggleSave(field as keyof SlackSettings, newValue)
                      controllerField.onChange(newValue)
                    } else {
                      controllerField.onChange(!controllerField.value)
                    }
                  }}
                >
                  <div
                    className={`w-16 h-8 flex items-center rounded-full p-1 duration-300 ease-in-out border border-gray-400 relative select-none cursor-pointer ${
                      controllerField.value ? 'bg-white' : 'bg-black'
                    }`}
                    style={{
                      backgroundColor: controllerField.value ? '#fff' : '#000',
                    }}
                  >
                    <div
                      className={`w-7 h-7 rounded-full shadow-md transform duration-300 ease-in-out absolute top-0.5 ${
                        controllerField.value
                          ? 'translate-x-8 bg-black text-white'
                          : 'bg-black left-0.5 text-white'
                      } flex items-center justify-center text-xs font-semibold select-none`}
                    >
                      {controllerField.value ? 'ON' : 'OFF'}
                    </div>
                  </div>
                  <span className="select-none">{label}</span>
                </label>
              )}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default IntegrationsSettings
