import * as React from "react"
import { cn } from "@/lib/utils"

// Create a global context to track which menu is open
const ContextMenuContext = React.createContext<{
  openMenuId: string | null;
  setOpenMenuId: (id: string | null) => void;
}>({
  openMenuId: null,
  setOpenMenuId: () => {},
});

// Provider component to be used at the app level
export function ContextMenuProvider({ children }: { children: React.ReactNode }) {
  const [openMenuId, setOpenMenuId] = React.useState<string | null>(null);
  
  return (
    <ContextMenuContext.Provider value={{ openMenuId, setOpenMenuId }}>
      {children}
    </ContextMenuContext.Provider>
  );
}

interface ContextMenuProps {
  children: React.ReactNode;
}

const ContextMenu = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & ContextMenuProps
>(({ children, className, ...props }, ref) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  const contextMenuRef = React.useRef<HTMLDivElement>(null);
  const menuId = React.useRef(`menu-${Math.random().toString(36).substring(2, 9)}`).current;
  
  // Use the context to track open menus
  const { openMenuId, setOpenMenuId } = React.useContext(ContextMenuContext);

  const handleContextMenu = (e: React.MouseEvent) => {
    // Check if any dialog is currently open
    const openDialog = document.querySelector('[role="dialog"]');
    if (openDialog) {
      // If a dialog is open, don't show the context menu
      return;
    }
    
    e.preventDefault();
    setIsOpen(true);
    setPosition({ x: e.clientX, y: e.clientY });
    setOpenMenuId(menuId); // Set this menu as the open one
  };

  const handleClickOutside = (e: MouseEvent) => {
    if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
      setIsOpen(false);
      setOpenMenuId(null);
    }
  };

  // Close this menu if another one opens
  React.useEffect(() => {
    if (openMenuId !== menuId && isOpen) {
      setIsOpen(false);
    }
  }, [openMenuId, menuId, isOpen]);

  React.useEffect(() => {
    if (isOpen) {
      document.addEventListener("click", handleClickOutside);
    } else {
      document.removeEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isOpen]);

  const childrenArray = React.Children.toArray(children);
  const triggerChild = childrenArray.find(
    (child) => React.isValidElement(child) && child.type === ContextMenuTrigger
  );
  const contentChild = childrenArray.find(
    (child) => React.isValidElement(child) && child.type === ContextMenuContent
  );

  return (
    <div
      ref={ref}
      className={cn("relative", className)}
      onContextMenu={handleContextMenu}
      {...props}
    >
      {triggerChild}
      {isOpen && React.isValidElement(contentChild) && (
        <div
          ref={contextMenuRef}
          style={{
            position: "fixed",
            top: `${position.y}px`,
            left: `${position.x}px`,
            zIndex: 1000,
          }}
        >
          {contentChild}
        </div>
      )}
    </div>
  );
});
ContextMenu.displayName = "ContextMenu";

const ContextMenuTrigger = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div ref={ref} className={className} {...props}>
    {children}
  </div>
));
ContextMenuTrigger.displayName = "ContextMenuTrigger";

const ContextMenuContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "min-w-[8rem] overflow-hidden rounded-md border bg-white p-1 shadow-md animate-in fade-in-80",
      className
    )}
    {...props}
  />
));
ContextMenuContent.displayName = "ContextMenuContent";

const ContextMenuItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { inset?: boolean }
>(({ className, inset, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100",
      inset && "pl-8",
      className
    )}
    {...props}
  />
));
ContextMenuItem.displayName = "ContextMenuItem";

const ContextMenuLabel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { inset?: boolean }
>(({ className, inset, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "px-2 py-1.5 text-sm font-semibold",
      inset && "pl-8",
      className
    )}
    {...props}
  />
));
ContextMenuLabel.displayName = "ContextMenuLabel";

const ContextMenuSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-gray-200", className)}
    {...props}
  />
));
ContextMenuSeparator.displayName = "ContextMenuSeparator";

const ContextMenuCheckboxItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { 
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
  }
>(({ className, children, checked, onCheckedChange, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative flex cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100",
      className
    )}
    onClick={() => onCheckedChange?.(!checked)}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      {checked && (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="size-4"
        >
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      )}
    </span>
    {children}
  </div>
));
ContextMenuCheckboxItem.displayName = "ContextMenuCheckboxItem";

// Simple implementation for sub menu
const ContextMenuSub = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

const ContextMenuSubTrigger = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { inset?: boolean }
>(({ className, inset, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100",
      inset && "pl-8",
      className
    )}
    {...props}
  >
    {children}
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="16" 
      height="16" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className="ml-auto h-4 w-4"
    >
      <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
  </div>
));
ContextMenuSubTrigger.displayName = "ContextMenuSubTrigger";

const ContextMenuSubContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "min-w-[8rem] overflow-hidden rounded-md border bg-white p-1 shadow-md animate-in",
      className
    )}
    {...props}
  />
));
ContextMenuSubContent.displayName = "ContextMenuSubContent";

// These are just to make the API match what we were using before
const ContextMenuGroup = ({ children }: { children: React.ReactNode }) => <>{children}</>;
const ContextMenuRadioGroup = ({ children }: { children: React.ReactNode }) => <>{children}</>;
const ContextMenuRadioItem = ContextMenuCheckboxItem;
const ContextMenuShortcut = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn(
        "ml-auto text-xs text-gray-500",
        className
      )}
      {...props}
    />
  );
};
ContextMenuShortcut.displayName = "ContextMenuShortcut";

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
}; 