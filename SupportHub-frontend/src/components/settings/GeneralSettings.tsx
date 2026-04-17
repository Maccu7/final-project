import React from 'react'
import PersonnelProfileSection from './PersonnelProfileSection'
import CompanyProfileSection from './CompanyProfileSection'
import { getUserProfile } from '@/services/settings.service'
import { useSession } from 'next-auth/react'
import { useQuery } from '@tanstack/react-query'

const GeneralSettings: React.FC = () => {
  const { data: session } = useSession()
  const { data: user } = useQuery({
    queryKey: ['get-user-profile'],
    queryFn: getUserProfile,
  })
  const isAdmin = session?.user?.role === 'super_admin'

  return (
    <>
      {user && (
        <div className="bg-white p-4 sm:p-6 rounded-md shadow space-y-8 max-w-full overflow-x-auto">
          <PersonnelProfileSection data={user} />

          {!isAdmin && <CompanyProfileSection data={user?.data?.Clients[0]} />}
        </div>
      )}
    </>
  )
}

export default GeneralSettings
