'use client'

import { Provider } from '@/providers/QueryProvider'
import { SessionProvider } from 'next-auth/react'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export default function ClientProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SessionProvider>
      <Provider>
        {children}
        <ToastContainer />
      </Provider>
    </SessionProvider>
  )
}
