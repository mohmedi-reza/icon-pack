import { useState, useEffect } from 'react';
import { useSvg } from '@/lib/svg-context';
import { Button } from '@/components/ui/button';
import { createSvgString } from '@/lib/svg-utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function IconDetails() {
  const { state, dispatch, addIconToCollection, removeIconFromCollection } = useSvg();
  const [iconName, setIconName] = useState('');
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  
  const selectedIcon = state.selectedIcon
    ? state.icons.find(icon => icon.id === state.selectedIcon)
    : null;
    
  useEffect(() => {
    if (selectedIcon) {
      setIconName(selectedIcon.name);
      setIsRenameDialogOpen(false);
    }
  }, [selectedIcon]);
  
  if (!selectedIcon) {
    return (
      <div className="border rounded-md p-6 flex items-center justify-center min-h-[300px]">
        <p className="text-muted-foreground">Select an icon to view details</p>
      </div>
    );
  }
  
  const handleUpdateName = () => {
    if (!iconName.trim()) return;
    
    dispatch({ 
      type: 'UPDATE_ICON', 
      payload: { 
        ...selectedIcon, 
        name: iconName.trim() 
      } 
    });
    
    setIsRenameDialogOpen(false);
  };
  
  const handleRemoveIcon = () => {
    dispatch({ type: 'REMOVE_ICON', payload: selectedIcon.id });
    setIsDeleteDialogOpen(false);
  };
  
  const toggleInCollection = (collectionId: string) => {
    const collection = state.collections.find(c => c.id === collectionId);
    if (!collection) return;
    
    const isInCollection = collection.icons.includes(selectedIcon.id);
    
    if (isInCollection) {
      removeIconFromCollection(selectedIcon.id, collectionId);
    } else {
      addIconToCollection(selectedIcon.id, collectionId);
    }
  };
  
  const handleCopyToClipboard = () => {
    const svgString = createSvgString(selectedIcon.content, selectedIcon.viewBox);
    navigator.clipboard.writeText(svgString);
    setIsCopied(true);
    
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };
  
  const svgOutput = createSvgString(selectedIcon.content, selectedIcon.viewBox || "0 0 24 24");
  
  return (
    <>
      <div className="border rounded-md p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Icon Details</h3>
          <Button 
            variant="ghost" 
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            Remove
          </Button>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-start gap-6">
          <div className="flex-shrink-0 h-32 w-32 p-4 border rounded-md flex items-center justify-center mx-auto sm:mx-0">
            <div dangerouslySetInnerHTML={{ 
              __html: `<svg viewBox="${selectedIcon.viewBox || "0 0 24 24"}" class="h-full w-full text-primary">${selectedIcon.content}</svg>` 
            }} />
          </div>
          
          <div className="flex-1 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Icon Name</span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setIsRenameDialogOpen(true)}
                >
                  Edit
                </Button>
              </div>
              <p className="px-3 py-2 border rounded-md bg-muted/30">{selectedIcon.name}</p>
            </div>
            
            <div className="space-y-2">
              <span className="text-sm font-medium">Original Filename</span>
              <p className="px-3 py-2 border rounded-md bg-muted/30 truncate" title={selectedIcon.originalName}>
                {selectedIcon.originalName}
              </p>
            </div>
            
            {selectedIcon.viewBox && (
              <div className="space-y-2">
                <span className="text-sm font-medium">ViewBox</span>
                <p className="px-3 py-2 border rounded-md bg-muted/30">
                  {selectedIcon.viewBox}
                </p>
              </div>
            )}
          </div>
        </div>
        
        <div className="space-y-2 pt-2">
          <h4 className="text-sm font-medium">Add to Collections</h4>
          {state.collections.length === 0 ? (
            <p className="text-sm text-muted-foreground">No collections available</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {state.collections.map(collection => {
                const isInCollection = collection.icons.includes(selectedIcon.id);
                return (
                  <Button
                    key={collection.id}
                    size="sm"
                    variant={isInCollection ? 'default' : 'outline'}
                    onClick={() => toggleInCollection(collection.id)}
                  >
                    {collection.name}
                    {isInCollection ? ' ✓' : ''}
                  </Button>
                );
              })}
            </div>
          )}
        </div>
        
        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium">Icon SVG Code (Minified)</h4>
            <Button 
              size="sm"
              variant="outline"
              onClick={handleCopyToClipboard}
            >
              {isCopied ? 'Copied!' : 'Copy SVG'}
            </Button>
          </div>
          <div className="bg-muted/30 p-3 rounded-md">
            <pre className="text-xs overflow-x-auto whitespace-pre-wrap break-all">
              {svgOutput}
            </pre>
          </div>
        </div>
      </div>
      
      {/* Rename Dialog */}
      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Rename Icon</DialogTitle>
            <DialogDescription>
              Change the display name of this icon.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label htmlFor="iconName" className="text-sm font-medium">
                Icon Name
              </label>
              <input
                id="iconName"
                type="text"
                value={iconName}
                onChange={(e) => setIconName(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline"
              onClick={() => {
                setIconName(selectedIcon.name);
                setIsRenameDialogOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateName} disabled={!iconName.trim()}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Icon</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedIcon.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleRemoveIcon}
            >
              Delete Icon
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 