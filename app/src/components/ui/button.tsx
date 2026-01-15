
import * as React from "react"
import { cn } from "@/utils/cn"

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'outline' | 'ghost' | 'destructive' | 'secondary'
    size?: 'default' | 'sm' | 'lg' | 'icon'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "default", size = "default", ...props }, ref) => {
        return (
            <button
                className={cn(
                    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
                    {
                        "bg-primary text-primary-foreground shadow hover:bg-primary/90 bg-indigo-600 text-white hover:bg-indigo-700": variant === "default",
                        "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground": variant === "outline",
                        "hover:bg-accent hover:text-accent-foreground": variant === "ghost",
                        "bg-red-500 text-white hover:bg-red-600 shadow-sm": variant === "destructive",
                        "bg-gray-200 text-gray-900 shadow-sm hover:bg-gray-300": variant === "secondary",
                        "h-9 px-4 py-2": size === "default",
                        "h-8 rounded-md px-3 text-xs": size === "sm",
                        "h-10 rounded-md px-8": size === "lg",
                        "h-9 w-9": size === "icon",
                    },
                    className
                )}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button }
