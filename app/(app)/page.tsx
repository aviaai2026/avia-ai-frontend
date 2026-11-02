import type { Metadata } from 'next'
import { PageContainer } from '@/components/layout/page'
import { LeadAnalytics } from '@/components/overview/lead-analytics'
import { OverviewKpiCards } from '@/components/overview/overview-kpi-cards'
import { OverviewWelcomeHeader } from '@/components/overview/overview-welcome-header'
import { RecentLeads } from '@/components/overview/recent-leads'
import { getOverviewWelcome } from '@/lib/mock/overview'
import { UpcomingAppointments } from '@/components/overview/upcoming-appointments'
import { LeadPipeline } from '@/components/overview/lead-pipeline'
import { AiEmployees } from '@/components/overview/ai-employees'
export const metadata: Metadata = { title: 'Overview' }

export default async function Page() {
  const welcome = await getOverviewWelcome()

  return (
    <PageContainer>
      <OverviewWelcomeHeader welcome={welcome} />
      <LeadPipeline />
      <OverviewKpiCards />

      <div className="grid gap-4 xl:grid-cols-2">
        <RecentLeads />
        <UpcomingAppointments />
      </div>



      <div className="grid gap-4 xl:grid-cols-[2fr_0.7fr]">
  <AiEmployees />
  <LeadAnalytics />
</div>
    </PageContainer>
  )
}