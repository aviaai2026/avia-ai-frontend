import { getNavItem } from '@/config/navigation'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { EmptyState } from './empty-state'
import { PageContainer, PageHeader } from './page'

export function SectionPlaceholder({ sectionId }: { sectionId: string }) {
  const item = getNavItem(sectionId)

  return (
    <PageContainer>
      <PageHeader
        title={item.title}
        description={item.description}
        actions={<Badge variant="accent">In development</Badge>}
      />
      <Card>
        <EmptyState
          icon={item.icon}
          title={`${item.title} is coming soon`}
          description="This section is part of the AVIA.AI roadmap and will be available in an upcoming release."
        />
      </Card>
    </PageContainer>
  )
}
