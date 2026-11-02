import Image from 'next/image'
import { cn } from '@/lib/utils'

export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg',
        className,
      )}
    >
      <Image
        src="/avia-logo.png"
        alt=""
        width={32}
        height={32}
        className="size-8 object-contain"
      />
    </span>
  )
}