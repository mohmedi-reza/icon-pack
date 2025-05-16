import { Button } from '@/components/ui/button';
import { useSvg } from '@/lib/svg-context';
import type { IconCollection } from '@/types/svg';
import { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// New component for collection card
function CollectionCard({ 
  collection, 
  isSelected, 
  isEditing,
  isBatchMode,
  hasSelectedIcons,
  onSelect,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  onDuplicate,
  onExport,
  onAddSelectedIcons,
  editedCollection,
  setEditedCollection,
  icons
}: { 
  collection: IconCollection;
  isSelected: boolean;
  isEditing: boolean;
  isBatchMode: boolean;
  hasSelectedIcons: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onExport: () => void;
  onAddSelectedIcons: (iconId?: string) => void;
  editedCollection: IconCollection | null;
  setEditedCollection: (collection: IconCollection) => void;
  icons: React.ReactNode[];
}) {
  // Ref for the drop target
  const dropRef = useRef<HTMLDivElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  
  // Handle drag events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };
  
  const handleDragLeave = () => {
    setIsDragOver(false);
  };
  
  // Card base styling
  const cardClasses = `
    border rounded-md p-3 transition-all
    ${isSelected ? 'ring-2 ring-primary border-primary' : ''}
    ${isDragOver ? 'bg-primary/10 border-primary' : ''}
    ${isBatchMode && hasSelectedIcons ? 'cursor-pointer hover:bg-muted/50' : ''}
  `;
  
  if (isEditing) {
    return (
      <div className={`${cardClasses} border-primary`}>
        <div className="space-y-3">
          <div>
            <label htmlFor={`edit-name-${collection.id}`} className="text-xs font-medium block mb-1">
              Collection Name
            </label>
            <input
              id={`edit-name-${collection.id}`}
              type="text"
              value={editedCollection?.name || ''}
              onChange={(e) => setEditedCollection({...collection, name: e.target.value})}
              className="w-full px-2 py-1.5 border rounded-md text-sm"
              placeholder="Collection name"
              autoFocus
            />
          </div>
          
          <div>
            <label htmlFor={`edit-desc-${collection.id}`} className="text-xs font-medium block mb-1">
              Description (optional)
            </label>
            <input
              id={`edit-desc-${collection.id}`}
              type="text"
              value={editedCollection?.description || ''}
              onChange={(e) => setEditedCollection({...collection, description: e.target.value})}
              className="w-full px-2 py-1.5 border rounded-md text-xs"
              placeholder="Brief description"
            />
          </div>
          
          <div className="flex justify-end gap-2 pt-2">
            <Button size="sm" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button size="sm" onClick={onSave} disabled={!(editedCollection?.name?.trim())}>
              Save
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  if (isBatchMode && hasSelectedIcons) {
    return (
      <div 
        className={`${cardClasses} hover:border-primary cursor-pointer`}
        onClick={(e) => {
          e.preventDefault();
          onAddSelectedIcons();
        }}
        ref={dropRef}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          
          // Check if there is dragged text data (individual icon)
          const iconId = e.dataTransfer.getData('text/plain');
          if (iconId) {
            // Add the dragged icon to the collection
            onAddSelectedIcons(iconId);
            return;
          }
          
          // Otherwise handle batch selection
          onAddSelectedIcons();
        }}
      >
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-full">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
              <path d="M12 5v14M5 12h14"></path>
            </svg>
          </div>
          <div>
            <div className="font-medium">Add to "{collection.name}"</div>
            <div className="text-xs text-muted-foreground">
              Click to add selected icons
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div 
      className={cardClasses}
      ref={dropRef}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragOver(false);
        
        // Check if there is dragged text data (individual icon)
        const iconId = e.dataTransfer.getData('text/plain');
        if (iconId) {
          // Add the dragged icon to the collection
          onAddSelectedIcons(iconId);
          return;
        }
        
        // Otherwise handle batch selection
        onAddSelectedIcons();
      }}
    >
      <div className="flex justify-between">
        <div 
          className="flex-1 cursor-pointer"
          onClick={isBatchMode ? undefined : onSelect}
        >
          <div className="font-medium mb-1">{collection.name}</div>
          {collection.description && (
            <div className="text-xs text-muted-foreground mb-1">
              {collection.description}
            </div>
          )}
          <div className="text-xs text-muted-foreground">
            {collection.icons.length} icon{collection.icons.length !== 1 ? 's' : ''}
          </div>
          
          {/* Preview icons in the collection */}
          {!isBatchMode && collection.icons.length > 0 && (
            <div className="flex gap-1 mt-2 overflow-hidden">
              {icons.slice(0, 5).map((icon, i) => (
                <div key={i} className="h-6 w-6 flex-shrink-0">
                  {icon}
                </div>
              ))}
              {collection.icons.length > 5 && (
                <div className="h-6 w-6 flex items-center justify-center rounded-full bg-muted text-xs">
                  +{collection.icons.length - 5}
                </div>
              )}
            </div>
          )}
        </div>
        
        {!isBatchMode && (
          <div className="flex flex-col gap-1 ml-3">
            <button 
              className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground" 
              onClick={onEdit}
              title="Edit collection"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
              </svg>
            </button>
            <button 
              className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground" 
              onClick={onDuplicate}
              title="Duplicate collection"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect>
                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
              </svg>
            </button>
            <button 
              className={`p-1 hover:bg-muted rounded ${collection.icons.length === 0 ? 'text-muted-foreground/40' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={onExport}
              disabled={collection.icons.length === 0}
              title="Export collection"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" x2="12" y1="15" y2="3"></line>
              </svg>
            </button>
            <button 
              className="p-1 hover:bg-red-50 rounded text-muted-foreground hover:text-red-500" 
              onClick={onDelete}
              title="Delete collection"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18"></path>
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function CollectionManager() {
  const { state, dispatch, createCollection, exportIconPackToFile, toggleBatchMode } = useSvg();
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDescription, setNewCollectionDescription] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [collectionToDelete, setCollectionToDelete] = useState<string | null>(null);
  const [editingCollection, setEditingCollection] = useState<IconCollection | null>(null);
  const [sortOrder, setSortOrder] = useState<'name' | 'newest' | 'size'>('name');
  
  const handleCreateCollection = () => {
    if (!newCollectionName.trim()) return;
    
    createCollection(
      newCollectionName.trim(), 
      newCollectionDescription.trim() || undefined
    );
    
    setNewCollectionName('');
    setNewCollectionDescription('');
    setIsCreateDialogOpen(false);
  };
  
  const handleUpdateCollection = () => {
    if (!editingCollection || !editingCollection.name.trim()) return;
    
    dispatch({
      type: 'UPDATE_COLLECTION',
      payload: {
        ...editingCollection,
        name: editingCollection.name.trim(),
        description: editingCollection.description?.trim() || undefined
      }
    });
    
    setEditingCollection(null);
    setIsEditDialogOpen(false);
  };
  
  const handleSelectCollection = (id: string | null) => {
    dispatch({ type: 'SELECT_COLLECTION', payload: id });
  };
  
  const handleDeleteCollection = () => {
    if (collectionToDelete) {
      dispatch({ type: 'REMOVE_COLLECTION', payload: collectionToDelete });
      setCollectionToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };
  
  const confirmDeleteCollection = (id: string) => {
    setCollectionToDelete(id);
    setIsDeleteDialogOpen(true);
  };
  
  const handleExportCollection = (id?: string) => {
    exportIconPackToFile(id);
  };
  
  const handleDuplicateCollection = (collection: IconCollection) => {
    createCollection(
      `${collection.name} (Copy)`,
      collection.description
    );
    
    // Get the newly created collection (last in the array)
    const newCollection = state.collections[state.collections.length - 1];
    
    // Copy all icons to the new collection
    collection.icons.forEach(iconId => {
      dispatch({
        type: 'ADD_ICON_TO_COLLECTION',
        payload: { iconId, collectionId: newCollection.id }
      });
    });
  };
  
  const startEditing = (collection: IconCollection) => {
    setEditingCollection({...collection});
    setIsEditDialogOpen(true);
  };
  
  const cancelEditing = () => {
    setEditingCollection(null);
    setIsEditDialogOpen(false);
  };
  
  const addSelectedIconsToCollection = (collectionId: string, iconId?: string) => {
    // If an individual icon ID is provided, add just that one
    if (iconId) {
      dispatch({
        type: 'ADD_ICON_TO_COLLECTION',
        payload: { iconId, collectionId }
      });
      return;
    }
    
    // Otherwise add all selected icons
    if (!state.selectedBatchIcons.length) return;
    
    state.selectedBatchIcons.forEach(id => {
      dispatch({
        type: 'ADD_ICON_TO_COLLECTION',
        payload: { iconId: id, collectionId }
      });
    });
    
    // Reset batch selection
    toggleBatchMode(false);
  };
  
  const sortCollections = (collections: IconCollection[]) => {
    return [...collections].sort((a, b) => {
      switch (sortOrder) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'size':
          return b.icons.length - a.icons.length;
        default:
          return 0;
      }
    });
  };
  
  // Generate preview icons for collections
  const getCollectionPreviews = (collection: IconCollection) => {
    return collection.icons.map(iconId => {
      const icon = state.icons.find(i => i.id === iconId);
      if (!icon) return null;
      
      return (
        <div 
          key={icon.id}
          dangerouslySetInnerHTML={{ 
            __html: `<svg viewBox="0 0 24 24">${icon.content}</svg>` 
          }}
          className="text-primary"
        />
      );
    }).filter(Boolean);
  };
  
  const sortedCollections = sortCollections(state.collections);
  const hasSelectedIcons = state.selectedBatchIcons.length > 0;
  
  return (
    <div className="space-y-4 border rounded-lg p-4 bg-card">
      {/* Header with title and buttons */}
      <div className="flex-col items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Collections</h3>
        <div className="flex items-center gap-2 mt-3">
          <Button
            size="sm"
            variant={state.batchSelectionMode ? 'default' : 'outline'}
            onClick={() => toggleBatchMode()}
            disabled={state.icons.length === 0}
            className="flex items-center gap-1"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="8" height="8" x="3" y="3" rx="1"></rect>
              <rect width="8" height="8" x="13" y="3" rx="1"></rect>
              <rect width="8" height="8" x="3" y="13" rx="1"></rect>
              <rect width="8" height="8" x="13" y="13" rx="1"></rect>
            </svg>
            {state.batchSelectionMode ? 'Cancel Batch' : 'Batch Mode'}
          </Button>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="flex items-center gap-1"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14M5 12h14"></path>
                </svg>
                New Collection
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create Collection</DialogTitle>
                <DialogDescription>
                  Create a new collection to organize your SVG icons.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-1">
                  <label htmlFor="collectionName" className="text-sm font-medium block">
                    Collection Name
                  </label>
                  <input
                    id="collectionName"
                    type="text"
                    placeholder="e.g. Essential Icons"
                    value={newCollectionName}
                    onChange={(e) => setNewCollectionName(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                    autoFocus
                  />
                </div>
                
                <div className="space-y-1">
                  <label htmlFor="collectionDescription" className="text-sm font-medium block">
                    Description (optional)
                  </label>
                  <input
                    id="collectionDescription"
                    type="text"
                    placeholder="e.g. Basic UI elements"
                    value={newCollectionDescription}
                    onChange={(e) => setNewCollectionDescription(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateCollection} 
                  disabled={!newCollectionName.trim()}
                >
                  Create Collection
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Edit Collection Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Collection</DialogTitle>
            <DialogDescription>
              Update your collection details.
            </DialogDescription>
          </DialogHeader>
          {editingCollection && (
            <div className="grid gap-4 py-4">
              <div className="space-y-1">
                <label htmlFor="edit-name" className="text-sm font-medium block">
                  Collection Name
                </label>
                <input
                  id="edit-name"
                  type="text"
                  value={editingCollection.name}
                  onChange={(e) => setEditingCollection({...editingCollection, name: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md"
                  autoFocus
                />
              </div>
              
              <div className="space-y-1">
                <label htmlFor="edit-description" className="text-sm font-medium block">
                  Description (optional)
                </label>
                <input
                  id="edit-description"
                  type="text"
                  value={editingCollection.description || ''}
                  onChange={(e) => setEditingCollection({...editingCollection, description: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={cancelEditing}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateCollection}
              disabled={!editingCollection?.name.trim()}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Collection</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this collection? This action cannot be undone.
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
              onClick={handleDeleteCollection}
            >
              Delete Collection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Batch mode notice */}
      {state.batchSelectionMode && (
        <div className="bg-primary/10 border border-primary rounded-md p-3 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M12 8v4M12 16h.01"></path>
            </svg>
            <p className="text-sm font-medium">
              Batch Mode Active
            </p>
          </div>
          <p className="text-sm mb-2">
            Select icons to add to a collection. You can also drag icons directly to collections.
          </p>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">{state.selectedBatchIcons.length} icons selected</span>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => toggleBatchMode(false)}
              className="flex items-center gap-1"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18"></path>
                <path d="m6 6 12 12"></path>
              </svg>
              Cancel
            </Button>
          </div>
        </div>
      )}
      
      {/* All Icons button */}
      <Button
        variant={state.selectedCollection === null ? 'default' : 'outline'}
        size="sm"
        className="w-full justify-start mb-2 gap-2"
        onClick={() => handleSelectCollection(null)}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
          <path d="M3 9h18"></path>
          <path d="M3 15h18"></path>
          <path d="M9 3v18"></path>
          <path d="M15 3v18"></path>
        </svg>
        All Icons ({state.icons.length})
      </Button>
      
      {/* Sort options */}
      <div className="flex items-center justify-between mb-3 text-sm">
        <span className="font-medium">Your Collections</span>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Sort by:</span>
          <button 
            className={`${sortOrder === 'name' ? 'text-primary font-medium' : 'text-muted-foreground'}`}
            onClick={() => setSortOrder('name')}
          >
            Name
          </button>
          <span className="text-muted-foreground">|</span>
          <button 
            className={`${sortOrder === 'size' ? 'text-primary font-medium' : 'text-muted-foreground'}`}
            onClick={() => setSortOrder('size')}
          >
            Size
          </button>
        </div>
      </div>
      
      {/* Collection list */}
      <div className="space-y-3">
        {sortedCollections.length === 0 ? (
          <div className="text-center py-8 border border-dashed rounded-md bg-muted/20">
            <div className="flex justify-center mb-2">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                <path d="M20 6v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2Z"></path>
                <path d="M8 2v4"></path>
                <path d="M16 2v4"></path>
                <path d="M2 10h20"></path>
              </svg>
            </div>
            <p className="text-muted-foreground">No collections created yet</p>
            <p className="text-xs text-muted-foreground mt-1">Create a collection to organize your icons</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {sortedCollections.map(collection => (
              <CollectionCard
                key={collection.id}
                collection={collection}
                isSelected={state.selectedCollection === collection.id}
                isEditing={false}
                isBatchMode={state.batchSelectionMode}
                hasSelectedIcons={hasSelectedIcons}
                onSelect={() => handleSelectCollection(collection.id)}
                onEdit={() => startEditing(collection)}
                onSave={handleUpdateCollection}
                onCancel={cancelEditing}
                onDelete={() => confirmDeleteCollection(collection.id)}
                onDuplicate={() => handleDuplicateCollection(collection)}
                onExport={() => handleExportCollection(collection.id)}
                onAddSelectedIcons={(iconId) => addSelectedIconsToCollection(collection.id, iconId)}
                editedCollection={editingCollection}
                setEditedCollection={setEditingCollection}
                icons={getCollectionPreviews(collection)}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Export all */}
      <div className="flex justify-end mt-4 pt-4 border-t">
        <Button 
          onClick={() => handleExportCollection()}
          disabled={state.icons.length === 0}
          variant="outline"
          className="flex items-center gap-2"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" x2="12" y1="15" y2="3"></line>
          </svg>
          Export All Icons
        </Button>
      </div>
    </div>
  );
} 