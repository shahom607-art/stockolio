"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"

import { cn } from "@/lib/utils"

/**
 * Renders a circular avatar root element with base styling and optional custom classes.
 *
 * @returns The rendered Avatar root element.
 */
function Avatar({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root>) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(
        "relative flex size-8 shrink-0 overflow-hidden rounded-full",
        className
      )}
      {...props}
    />
  )
}

/**
 * Renders an avatar image element with a square aspect ratio and full size.
 *
 * Merges the provided `className` with the component's default "aspect-square size-full" styles, sets `data-slot="avatar-image"`, and forwards all other props to the underlying avatar image primitive.
 *
 * @param className - Additional CSS class names merged with the component's default styles
 * @returns A React element for the avatar image
 */
function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("aspect-square size-full", className)}
      {...props}
    />
  )
}

/**
 * Renders the avatar fallback element shown when an avatar image is unavailable.
 *
 * @param className - Additional CSS classes appended to the fallback's base classes
 * @returns The configured AvatarPrimitive.Fallback element with base styling and `data-slot="avatar-fallback"`
 */
function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "bg-muted flex size-full items-center justify-center rounded-full",
        className
      )}
      {...props}
    />
  )
}

export { Avatar, AvatarImage, AvatarFallback }