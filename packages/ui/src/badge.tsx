import { cva } from "class-variance-authority";
import type { ClassValue } from "clsx";

export const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-vertice-primary text-vertice-primary-foreground",
        secondary:
          "border-transparent bg-vertice-secondary text-vertice-secondary-foreground",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps {
  variant?: "default" | "secondary" | "destructive" | "outline";
  className?: ClassValue;
  children: React.ReactNode;
  title?: string;
}

export function Badge({ variant, className, children, title }: BadgeProps) {
  return (
    <div className={badgeVariants({ variant, className })} title={title}>
      {children}
    </div>
  );
}
