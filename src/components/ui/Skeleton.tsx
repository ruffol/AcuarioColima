interface Props {
  className?: string
  width?: string
  height?: string
  rounded?: boolean
}

export default function Skeleton({ className = '', width, height, rounded = true }: Props) {
  return (
    <div
      className={`animate-pulse bg-border ${rounded ? 'rounded-xl' : ''} ${className}`}
      style={{ width, height }}
    />
  )
}
