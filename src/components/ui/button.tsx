"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Lime is a FILL with ink text (7.67:1). Hover darkens the fill —
        // fading it with /90 would lighten it against bone and read as disabled.
        default: "bg-primary text-primary-foreground hover:bg-lime-deep",
        // The riso CTA: ink border + hard offset that presses in on hover.
        riso:
          "bg-primary text-primary-foreground border-2 border-ink shadow-[3px_3px_0_0_var(--ink)] hover:bg-lime-deep hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_0_var(--ink)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
        // Ink-filled, for the secondary CTA next to a lime one.
        ink: "bg-ink text-bone hover:bg-ink/90",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-paper-warm-2",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        // NOT text-primary: lime as text is 1.73:1. --link is 5.17:1.
        link: "text-link underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
