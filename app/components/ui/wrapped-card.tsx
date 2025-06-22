// components/ui/wrapped-card.tsx
import {
    Card as BaseCard,
    CardHeader as BaseCardHeader,
    CardContent as BaseCardContent,
    CardTitle as BaseCardTitle,
  } from "@/components/ui/card"
  import { cn } from "@/lib/utils"
  import { HTMLAttributes } from "react"
  
  // Create new interfaces that include className
  interface CardProps extends HTMLAttributes<HTMLDivElement> {}
  interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {}
  interface CardContentProps extends HTMLAttributes<HTMLDivElement> {}
  
  export const Card = ({ className, ...props }: CardProps) => (
    <div {...props} className={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)} />
  )
  
  export const CardHeader = ({ className, ...props }: CardHeaderProps) => (
    <div {...props} className={cn("flex flex-col space-y-1.5 p-6", className)} />
  )
  
  export const CardContent = ({ className, ...props }: CardContentProps) => (
    <div {...props} className={cn("p-6 pt-0", className)} />
  )
  
  // For CardTitle, we'll use an h3 element with proper styling
  export const CardTitle = ({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) => (
    <h3 {...props} className={cn("text-2xl font-semibold leading-none tracking-tight", className)} />
  )