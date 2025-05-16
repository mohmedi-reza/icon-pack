import { cn } from "@/lib/utils";

interface FooterProps {
  className?: string;
}

export function Footer({ className }: FooterProps) {
  return (
    <div className={cn("flex flex-col sm:flex-row items-center justify-between w-full gap-4", className)}>
      <div className="text-sm text-muted-foreground">
        © {new Date().getFullYear()} Icon Pack. All rights reserved.
      </div>
      
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
        <a href="#" className="text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap">
          Help
        </a>
        <a href="#" className="text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap">
          Privacy
        </a>
        <a href="#" className="text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap">
          Terms
        </a>
      </div>
    </div>
  );
} 