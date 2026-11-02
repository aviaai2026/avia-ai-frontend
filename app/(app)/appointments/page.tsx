import type { Metadata } from 'next'
import { AppointmentsContent } from '@/components/appointments/appointments-content'
import { PageContainer } from '@/components/layout/page'
import { getAppointments } from '@/lib/api/appointments-client'

export const metadata: Metadata = {
  title: 'Appointments',
}

// Loads saved appointments from the backend whenever the page renders.
export default async function Page() {
  const appointments = await getAppointments()

  return (
    <PageContainer>
      <AppointmentsContent appointments={appointments} />
    </PageContainer>
  )
}