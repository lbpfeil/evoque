import React from 'react'
import { cn } from '../../lib/utils'

export interface PageHeaderProps {
  title: string
  description?: string
  actions?: React.ReactNode
  size?: 'default' | 'compact'
  className?: string
}

export function PageHeader({
  title,
  description,
  actions,
  size = 'default',
  className,
}: PageHeaderProps) {
  return (
    <header className={cn('mb-lg', size === 'compact' && 'mb-md', className)}>
      <div className="flex items-start justify-between gap-md">
        <div>
          <h1
            className={cn(
              'font-bold text-foreground tracking-tight',
              size === 'default' ? 'text-title' : 'text-heading'
            )}
          >
            {title}
          </h1>
          {description && (
            <p
              className={cn(
                'text-muted-foreground mt-xs',
                size === 'default' ? 'text-body' : 'text-caption'
              )}
            >
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex-shrink-0">{actions}</div>}
      </div>
    </header>
  )
}
