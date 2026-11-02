import type { Metadata } from 'next'
import { Suspense } from 'react'
import { SettingsContent } from '@/components/settings/settings-content'
import { PageContainer } from '@/components/layout/page'

export const metadata: Metadata = {
  title: 'Settings',
}

export default function Page() {
  return (
    <PageContainer>
      <Suspense fallback={null}>
        <SettingsContent />
      </Suspense>
    </PageContainer>
  )
}