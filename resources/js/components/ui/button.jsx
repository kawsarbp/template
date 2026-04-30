import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import React from 'react'

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Solid variants
        default:
          "bg-primary text-primary-foreground shadow-md hover:bg-primary/90 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 hover:shadow-md hover:-translate-y-0.5",
        accent:
          "bg-accent text-accent-foreground shadow-md hover:bg-accent/90 hover:shadow-lg hover:-translate-y-0.5",
        success:
          "bg-success text-success-foreground shadow-md hover:bg-success/90 hover:shadow-lg hover:-translate-y-0.5",
        warning:
          "bg-warning text-warning-foreground shadow-md hover:bg-warning/90 hover:shadow-lg hover:-translate-y-0.5",
        info:
          "bg-info text-info-foreground shadow-md hover:bg-info/90 hover:shadow-lg hover:-translate-y-0.5",
        destructive:
          "bg-destructive text-destructive-foreground shadow-md hover:bg-destructive/90 hover:shadow-lg hover:-translate-y-0.5",

        edit:
          "bg-primary text-primary-foreground shadow-md hover:bg-primary/90 hover:shadow-lg hover:-translate-y-0.5",
        delete:
          "bg-destructive text-destructive-foreground shadow-md hover:bg-destructive/90 hover:shadow-lg hover:-translate-y-0.5",
        view:
          "bg-primary text-primary-foreground shadow-md hover:bg-primary/90 hover:shadow-lg hover:-translate-y-0.5",

        // Outline variants
        outline:
          "border-2 border-primary bg-transparent text-primary hover:bg-primary hover:text-primary-foreground hover:-translate-y-0.5",
        "outline-secondary":
          "border-2 border-secondary-foreground/30 bg-transparent text-secondary-foreground hover:bg-secondary hover:-translate-y-0.5",
        "outline-accent":
          "border-2 border-accent bg-transparent text-accent hover:bg-accent hover:text-accent-foreground hover:-translate-y-0.5",
        "outline-success":
          "border-2 border-success bg-transparent text-success hover:bg-success hover:text-success-foreground hover:-translate-y-0.5",
        "outline-warning":
          "border-2 border-warning bg-transparent text-warning hover:bg-warning hover:text-warning-foreground hover:-translate-y-0.5",
        "outline-destructive":
          "border-2 border-destructive bg-transparent text-destructive hover:bg-destructive hover:text-destructive-foreground hover:-translate-y-0.5",

        // Ghost variants
        ghost:
          "hover:bg-accent/10 hover:text-accent",
        "ghost-primary":
          "text-primary hover:bg-primary/10",
        "ghost-success":
          "text-success hover:bg-success/10",
        "ghost-warning":
          "text-warning hover:bg-warning/10",
        "ghost-destructive":
          "text-destructive hover:bg-destructive/10",

        // Soft variants (subtle background)
        soft:
          "bg-primary/10 text-primary hover:bg-primary/20 hover:-translate-y-0.5",
        "soft-accent":
          "bg-accent/10 text-accent hover:bg-accent/20 hover:-translate-y-0.5",
        "soft-success":
          "bg-success/10 text-success hover:bg-success/20 hover:-translate-y-0.5",
        "soft-warning":
          "bg-warning/10 text-warning hover:bg-warning/20 hover:-translate-y-0.5",
        "soft-destructive":
          "bg-destructive/10 text-destructive hover:bg-destructive/20 hover:-translate-y-0.5",

        // Gradient variants
        gradient:
          "gradient-primary text-primary-foreground shadow-lg hover:shadow-xl hover:-translate-y-0.5 btn-shimmer",
        "gradient-accent":
          "gradient-accent text-accent-foreground shadow-lg hover:shadow-xl hover:-translate-y-0.5 btn-shimmer",
        "gradient-success":
          "gradient-success text-success-foreground shadow-lg hover:shadow-xl hover:-translate-y-0.5 btn-shimmer",
        "gradient-warning":
          "gradient-warning text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 btn-shimmer",
        "gradient-destructive":
          "gradient-destructive text-destructive-foreground shadow-lg hover:shadow-xl hover:-translate-y-0.5 btn-shimmer",

        // Glass variant
        glass:
          "glass-effect text-foreground shadow-lg hover:shadow-xl hover:-translate-y-0.5 backdrop-blur-md",

        // Glow variants
        glow:
          "bg-primary text-primary-foreground shadow-glow-primary hover:shadow-xl hover:-translate-y-0.5 animate-pulse-glow",
        "glow-accent":
          "bg-accent text-accent-foreground shadow-glow-accent hover:shadow-xl hover:-translate-y-0.5",
        "glow-success":
          "bg-success text-success-foreground shadow-glow-success hover:shadow-xl hover:-translate-y-0.5",

        // Link variant
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        xl: "h-14 rounded-xl px-10 text-lg font-semibold",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
        "icon-lg": "h-12 w-12",
      },
      rounded: {
        default: "rounded-lg",
        full: "rounded-full",
        none: "rounded-none",
        xl: "rounded-xl",
        "2xl": "rounded-2xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      rounded: "default",
    },
  }
);



const Button = React.forwardRef(
  ({ className, variant, size, rounded, asChild = false, loading = false, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, rounded, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Loading...</span>
          </>
        ) : (
          children
        )}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
