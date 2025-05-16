import { useState, useRef } from 'react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useSvg } from "@/lib/svg-context";

interface ToolbarProps {
  className?: string;
}

export function Toolbar({ className }: ToolbarProps) {
  const { addIcons, exportIconPackToFile, state } = useSvg();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    
    setIsImporting(true);
    try {
      const svgFiles = Array.from(e.target.files).filter(file => 
        file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg')
      );
      
      if (svgFiles.length) {
        await addIcons(svgFiles);
      }
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <nav className={cn("flex-1 flex items-center justify-between w-full", className)}>
      <div className="hidden md:flex items-center gap-2 lg:gap-4">
        <Button variant="ghost" size="sm">
          Dashboard
        </Button>
        <Button variant="ghost" size="sm">
          Icons ({state.icons.length})
        </Button>
        <Button variant="ghost" size="sm">
          Collections ({state.collections.length})
        </Button>
      </div>
      
      {/* Mobile navigation - visible on small screens */}
      <div className="flex md:hidden flex-1">
        <Button variant="ghost" size="sm">
          Menu
        </Button>
      </div>
      
      <div className="flex items-center gap-2">
        <input 
          ref={fileInputRef}
          type="file" 
          accept=".svg,image/svg+xml" 
          multiple 
          onChange={handleFileChange}
          className="hidden"
          aria-label="Import SVG files"
        />
        <Button 
          size="sm" 
          variant="outline" 
          className="hidden sm:flex"
          onClick={() => fileInputRef.current?.click()}
          disabled={isImporting}
        >
          {isImporting ? 'Importing...' : 'Import SVG'}
        </Button>
        <Button 
          size="sm"
          onClick={() => exportIconPackToFile()}
          disabled={state.icons.length === 0}
        >
          Export All
        </Button>
      </div>
    </nav>
  );
} 