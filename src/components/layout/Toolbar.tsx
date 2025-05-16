import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ToolbarProps {
  className?: string;
}

export function Toolbar({ className }: ToolbarProps) {
  return (
    <nav className={cn("flex-1 flex items-center justify-between w-full", className)}>
      <div className="hidden md:flex items-center gap-2 lg:gap-4">
        <Button variant="ghost" size="sm">
          Dashboard
        </Button>
        <Button variant="ghost" size="sm">
          Icons
        </Button>
        <Button variant="ghost" size="sm">
          Collections
        </Button>
      </div>
      
      {/* Mobile navigation - visible on small screens */}
      <div className="flex md:hidden flex-1">
        <Button variant="ghost" size="sm">
          Menu
        </Button>
      </div>
      
      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" className="hidden sm:flex">
          Import SVG
        </Button>
        <Button size="sm">
          Create Icon
        </Button>
      </div>
    </nav>
  );
} 