'use client'

import React from 'react'
import SupportHubLogin from './ClientLogin'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const LoginClientWrapper = () => {
  return (
    <>
      <SupportHubLogin />
      <ToastContainer />
    </>
  )
}

export default LoginClientWrapper
