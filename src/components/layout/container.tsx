import { cn } from "@/lib/utils"

type ContainerProps = React.ComponentProps<"div"> & {
  size?: "default" | "narrow" | "wide"
}

const sizeClasses = {
  default: "max-w-3xl",
  narrow: "max-w-xl",
  wide: "max-w-5xl",
}

export function Container({ className, size = "default", ...props }: ContainerProps) {
  return (
    <div className={cn("mx-auto w-full px-4 sm:px-6", sizeClasses[size], className)} {...props} />
  )
}
