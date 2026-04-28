import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  rating: number
  totalReviews?: number
  size?: 'sm' | 'md' | 'lg'
  showNumber?: boolean
  className?: string
}

export default function StarRating({
  rating,
  totalReviews,
  size = 'md',
  showNumber = true,
  className,
}: StarRatingProps) {
  const starSize = size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'
  const textSize = size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm'

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(starSize, star <= Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200')}
          />
        ))}
      </div>
      {showNumber && (
        <span className={cn('font-semibold text-gray-800', textSize)}>
          {rating.toFixed(1)}
        </span>
      )}
      {totalReviews !== undefined && (
        <span className={cn('text-gray-500', textSize)}>
          ({totalReviews.toLocaleString('es-ES')})
        </span>
      )}
    </div>
  )
}
