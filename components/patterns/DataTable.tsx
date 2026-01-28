import React from 'react'
import { cn } from '../../lib/utils'

export interface Column<T> {
  key: string
  header: string
  render: (item: T) => React.ReactNode
  className?: string
  headerClassName?: string
}

export interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  onRowClick?: (item: T) => void
  gridCols: string
  gridColsSm?: string
  rowClassName?: (item: T) => string | undefined
  emptyMessage?: string
}

export function DataTable<T>({
  columns,
  data,
  onRowClick,
  gridCols,
  gridColsSm,
  rowClassName,
  emptyMessage,
}: DataTableProps<T>) {
  return (
    <div className="border border-border rounded overflow-hidden">
      <div className={cn(
        'bg-muted border-b border-border px-sm py-xs grid gap-sm items-center',
        gridCols, gridColsSm
      )}>
        {columns.map((col) => (
          <div
            key={col.key}
            className={cn('text-caption font-semibold text-muted-foreground', col.headerClassName)}
          >
            {col.header}
          </div>
        ))}
      </div>

      <div className="divide-y divide-border">
        {data.length === 0 && emptyMessage ? (
          <div className="px-sm py-md text-caption text-muted-foreground text-center">
            {emptyMessage}
          </div>
        ) : (
          data.map((item, index) => {
            const Row = onRowClick ? 'button' : 'div'
            return (
              <Row
                key={index}
                onClick={onRowClick ? () => onRowClick(item) : undefined}
                className={cn(
                  'w-full px-sm py-xs grid gap-sm items-center',
                  gridCols,
                  gridColsSm,
                  onRowClick && 'hover:bg-accent/50 transition-colors text-left cursor-pointer',
                  rowClassName?.(item)
                )}
              >
                {columns.map((col) => (
                  <div key={col.key} className={col.className}>
                    {col.render(item)}
                  </div>
                ))}
              </Row>
            )
          })
        )}
      </div>
    </div>
  )
}
