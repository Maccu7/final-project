'use client'

import React from 'react'
import SupportHubLogin from './ClientLogin'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'

const LoginClientWrapper = () => {
  const { status } = useSession()
  if (status === 'authenticated') {
    return redirect(`/dashboard`)
  }
  return (
    <>
      <SupportHubLogin />
      <ToastContainer />
    </>
  )
}

export default LoginClientWrapper
