import type { Metadata } from 'next'
import { SectionPlaceholder } from '@/components/layout/section-placeholder'

export const metadata: Metadata = { title: 'Maintenance' }

export default function Page() {
  return <SectionPlaceholder sectionId="maintenance" />
}
