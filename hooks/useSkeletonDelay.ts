import { useState, useEffect, useRef } from 'react'

/**
 * Controls skeleton visibility with delay and minimum display time.
 *
 * - Waits `delay` ms before showing skeleton (avoids flash on fast loads)
 * - Once skeleton appears, shows it for at least `minDisplay` ms
 * - Returns `showContent` for fade-in transition (150ms CSS transition)
 *
 * Usage:
 *   const { showSkeleton, showContent } = useSkeletonDelay(isLoaded)
 *   if (showSkeleton) return <PageSkeleton />
 *   return <div className={showContent ? 'animate-in fade-in duration-150' : 'opacity-0'}>...</div>
 */
export function useSkeletonDelay(isLoaded: boolean, delay = 200, minDisplay = 300) {
  const [showSkeleton, setShowSkeleton] = useState(false)
  const [showContent, setShowContent] = useState(false)
  const skeletonShownAt = useRef<number | null>(null)

  useEffect(() => {
    if (isLoaded) {
      // Data is loaded
      if (skeletonShownAt.current) {
        // Skeleton was visible — ensure minimum display time
        const elapsed = Date.now() - skeletonShownAt.current
        const remaining = Math.max(0, minDisplay - elapsed)
        const timer = setTimeout(() => {
          setShowSkeleton(false)
          setShowContent(true)
        }, remaining)
        return () => clearTimeout(timer)
      } else {
        // Data loaded before delay — skip skeleton entirely
        setShowSkeleton(false)
        setShowContent(true)
      }
    } else {
      // Data not loaded — start delay timer
      setShowContent(false)
      const timer = setTimeout(() => {
        setShowSkeleton(true)
        skeletonShownAt.current = Date.now()
      }, delay)
      return () => clearTimeout(timer)
    }
  }, [isLoaded, delay, minDisplay])

  return { showSkeleton, showContent }
}
