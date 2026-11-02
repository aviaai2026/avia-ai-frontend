import type { Metadata } from 'next'
import { AnalyticsContent } from '@/components/analytics/analytics-content'
import { PageContainer } from '@/components/layout/page'

export const metadata: Metadata = {
  title: 'Analytics',
}

export default function Page() {
  return (
    <PageContainer>
      <AnalyticsContent />
    </PageContainer>
  )
}