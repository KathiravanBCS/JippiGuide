"use client"

import Image, { type ImageProps } from "next/image"
import { ImageIcon } from "lucide-react"
import { useState } from "react"

type Props = Omit<ImageProps, "src"> & { src: string }

export default function ImageWithFallback({ src, alt, className, ...rest }: Props) {
  const [error, setError] = useState(false)

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-muted text-muted-foreground ${className ?? ""}`}>
        <div className="flex items-center gap-2 text-xs">
          <ImageIcon className="h-4 w-4" />
          <span>{"Image unavailable"}</span>
        </div>
      </div>
    )
  }

  return (
    <Image src={src || "/placeholder.svg"} alt={alt} onError={() => setError(true)} className={className} {...rest} />
  )
}
