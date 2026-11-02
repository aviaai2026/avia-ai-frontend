import type { Metadata } from 'next'
import { PropertiesContent } from '@/components/properties/properties-content'
import { PageContainer, PageHeader } from '@/components/layout/page'
import { getProperties } from '@/lib/api/properties'

export const metadata: Metadata = {
  title: 'Properties',
}

export default async function Page() {
  const properties = await getProperties()

  return (
    <PageContainer>
      <PageHeader
        title="Properties"
        description="Manage properties, availability, pricing, and inventory."
      />

      <PropertiesContent initialProperties={properties} />
    </PageContainer>
  )
}