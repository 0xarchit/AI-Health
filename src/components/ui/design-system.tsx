import React from "react";
import { cn } from "@/lib/utils";

export const SurfacePanel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-3xl bg-card border border-border shadow-sm dark:shadow-none transition-all duration-300",
      className
    )}
    {...props}
  />
));
SurfacePanel.displayName = "SurfacePanel";

export const GlassPanel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-3xl glass-panel relative overflow-hidden transition-all duration-300",
      className
    )}
    {...props}
  />
));
GlassPanel.displayName = "GlassPanel";

export const NeonSeparator = ({ className }: { className?: string }) => (
  <div
    className={cn(
      "h-px w-full bg-gradient-to-r from-transparent via-primary/50 to-transparent my-6",
      className
    )}
  />
);

export const GlowingButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { 
    variant?: 'default' | 'accent' | 'outline',
    size?: 'default' | 'sm' | 'lg' | 'icon',
    asChild?: boolean
  }
>(({ className, variant = 'default', size = 'default', asChild = false, ...props }, ref) => {
  const Comp = asChild ? React.Fragment : "button"; 
  
  
  
  
  
  
  
  
  
  
  
  const variants = {
    default: "bg-primary text-primary-foreground shadow-[0_0_20px_-5px_hsl(var(--primary)/0.5)] hover:shadow-[0_0_25px_0px_hsl(var(--primary)/0.7)] border-primary",
    accent: "bg-accent text-accent-foreground shadow-[0_0_20px_-5px_hsl(var(--accent)/0.5)] hover:shadow-[0_0_25px_0px_hsl(var(--accent)/0.7)] border-accent",
    outline: "bg-transparent border border-primary/50 text-secondary-foreground hover:bg-primary/10 shadow-none hover:shadow-[0_0_15px_-5px_hsl(var(--primary)/0.3)]",
  };
  
  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
    icon: "h-10 w-10",
  };

  const combinedClassName = cn(
    "relative rounded-full font-semibold transition-all duration-300 border active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2",
    variants[variant],
    sizes[size],
    className
  );
  
  if (asChild) {
     const child = React.Children.only(props.children) as React.ReactElement<React.HTMLAttributes<HTMLElement>>;
     const { children, ...rest } = props as any; 
     return React.cloneElement(child, {
       className: cn(combinedClassName, child.props.className),
       ...rest
     });
  }

  return (
    <button
      ref={ref}
      className={combinedClassName}
      {...props}
    />
  );
});
GlowingButton.displayName = "GlowingButton";
