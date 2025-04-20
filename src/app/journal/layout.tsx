import { JournalLayout } from '@/components/layouts/JournalLayout'

export default function JournalPageLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <JournalLayout>{children}</JournalLayout>
} 