import { useState, useEffect } from 'react';
import { useSvg } from '@/lib/svg-context';
import type { SvgIcon } from '@/types/svg';
import { Button } from '@/components/ui/button';
import { createSvgString } from '@/lib/svg-utils';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
  ContextMenuLabel,
  ContextMenuCheckboxItem,
} from "@/components/ui/context-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function IconList() {
  const { state, dispatch, addIconToCollection, removeIconFromCollection } = useSvg();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIcons, setSelectedIcons] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortOrder, setSortOrder] = useState<'name' | 'collection'>('name');
  const [copiedIconId, setCopiedIconId] = useState<string | null>(null);
  const [isBatchDeleteDialogOpen, setIsBatchDeleteDialogOpen] = useState(false);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [iconToRename, setIconToRename] = useState<SvgIcon | null>(null);
  const [newIconName, setNewIconName] = useState('');
  
  // Sync selectedIcons with context state
  useEffect(() => {
    if (state.batchSelectionMode) {
      setSelectedIcons(state.selectedBatchIcons);
    } else {
      setSelectedIcons([]);
    }
  }, [state.batchSelectionMode, state.selectedBatchIcons]);
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    dispatch({ type: 'SET_SEARCH_QUERY', payload: e.target.value });
  };
  
  const getFilteredIcons = (): SvgIcon[] => {
    if (!state.searchQuery) {
      return state.selectedCollection 
        ? state.icons.filter(icon => 
            state.collections
              .find(c => c.id === state.selectedCollection)
              ?.icons.includes(icon.id)
          ) 
        : state.icons;
    }
    
    const query = state.searchQuery.toLowerCase();
    const icons = state.selectedCollection
      ? state.icons.filter(icon => 
          state.collections
            .find(c => c.id === state.selectedCollection)
            ?.icons.includes(icon.id)
        ) 
      : state.icons;
    
    return icons.filter(icon => 
      icon.name.toLowerCase().includes(query) || 
      icon.originalName.toLowerCase().includes(query)
    );
  };
  
  const sortIcons = (icons: SvgIcon[]): SvgIcon[] => {
    return [...icons].sort((a, b) => {
      if (sortOrder === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortOrder === 'collection') {
        const aCollectionName = state.collections.find(c => 
          c.icons.includes(a.id))?.name || '';
        const bCollectionName = state.collections.find(c => 
          c.icons.includes(b.id))?.name || '';
        return aCollectionName.localeCompare(bCollectionName);
      }
      return 0;
    });
  };
  
  const handleIconClick = (icon: SvgIcon) => {
    if (state.batchSelectionMode) {
      toggleIconSelection(icon.id);
    } else {
      dispatch({ type: 'SELECT_ICON', payload: icon.id });
    }
  };
  
  const toggleIconSelection = (iconId: string) => {
    const newSelection = selectedIcons.includes(iconId)
      ? selectedIcons.filter(id => id !== iconId)
      : [...selectedIcons, iconId];
      
    setSelectedIcons(newSelection);
    
    // Update batch selection in context
    if (state.batchSelectionMode) {
      dispatch({ 
        type: 'UPDATE_BATCH_SELECTION', 
        payload: newSelection 
      });
    }
  };
  
  const toggleSelectAll = () => {
    const allIconIds = filteredIcons.map(icon => icon.id);
    
    if (selectedIcons.length === allIconIds.length) {
      setSelectedIcons([]);
      dispatch({ 
        type: 'UPDATE_BATCH_SELECTION', 
        payload: [] 
      });
    } else {
      setSelectedIcons(allIconIds);
      dispatch({ 
        type: 'UPDATE_BATCH_SELECTION', 
        payload: allIconIds 
      });
    }
  };
  
  const getIconCollectionNames = (iconId: string): string[] => {
    return state.collections
      .filter(collection => collection.icons.includes(iconId))
      .map(collection => collection.name);
  };
  
  const copyIconToClipboard = (icon: SvgIcon) => {
    const svgString = createSvgString(icon.content, icon.viewBox || "0 0 24 24");
    navigator.clipboard.writeText(svgString);
    setCopiedIconId(icon.id);
    
    setTimeout(() => {
      setCopiedIconId(null);
    }, 2000);
  };
  
  const removeIcon = (icon: SvgIcon) => {
    if (window.confirm(`Are you sure you want to remove "${icon.name}"?`)) {
      dispatch({ type: 'REMOVE_ICON', payload: icon.id });
    }
  };
  
  const openRenameDialog = (icon: SvgIcon) => {
    setIconToRename(icon);
    setNewIconName(icon.name);
    setIsRenameDialogOpen(true);
  };
  
  const handleRenameIcon = () => {
    if (!iconToRename || !newIconName.trim() || newIconName === iconToRename.name) {
      setIsRenameDialogOpen(false);
      return;
    }
    
    dispatch({
      type: 'UPDATE_ICON',
      payload: {
        ...iconToRename,
        name: newIconName.trim()
      }
    });
    
    setIsRenameDialogOpen(false);
    setIconToRename(null);
  };
  
  const toggleIconInCollection = (iconId: string, collectionId: string, isInCollection: boolean) => {
    if (isInCollection) {
      removeIconFromCollection(iconId, collectionId);
    } else {
      addIconToCollection(iconId, collectionId);
    }
  };
  
  const filteredIcons = sortIcons(getFilteredIcons());
  const allSelected = filteredIcons.length > 0 && 
    selectedIcons.length === filteredIcons.length;
  
  // Add a new batch delete function
  const handleBatchDelete = () => {
    if (selectedIcons.length === 0) return;
    
    setIsBatchDeleteDialogOpen(true);
  };
  
  const confirmBatchDelete = () => {
    selectedIcons.forEach(iconId => {
      dispatch({ type: 'REMOVE_ICON', payload: iconId });
    });
    
    // Reset the batch selection
    dispatch({ type: 'UPDATE_BATCH_SELECTION', payload: [] });
    setIsBatchDeleteDialogOpen(false);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search icons..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full px-4 py-2 pl-10 border rounded-md"
            aria-label="Search icons"
          />
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.3-4.3"></path>
          </svg>
        </div>
        
        <div className="flex items-center gap-2">
          {state.batchSelectionMode && (
            <>
              <Button
                variant={allSelected ? "default" : "outline"}
                size="sm"
                onClick={toggleSelectAll}
                className="whitespace-nowrap"
              >
                {allSelected ? "Deselect All" : "Select All"}
              </Button>
              
              {selectedIcons.length > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBatchDelete}
                  className="whitespace-nowrap"
                >
                  Delete Selected
                </Button>
              )}
            </>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            title={viewMode === 'grid' ? 'Switch to list view' : 'Switch to grid view'}
          >
            {viewMode === 'grid' ? 'List' : 'Grid'}
          </Button>
          
          <Button
            variant="outline"
            onClick={() => setSearchTerm('')}
            disabled={!searchTerm}
            size="sm"
          >
            Clear
          </Button>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {filteredIcons.length} icon{filteredIcons.length !== 1 ? 's' : ''} 
          {state.selectedCollection && (
            <>in collection <strong>{state.collections.find(c => c.id === state.selectedCollection)?.name}</strong></>
          )}
        </div>
        
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Sort:</span>
          <button 
            className={`${sortOrder === 'name' ? 'text-primary font-medium' : 'text-muted-foreground'}`}
            onClick={() => setSortOrder('name')}
          >
            Name
          </button>
          <span className="text-muted-foreground">|</span>
          <button 
            className={`${sortOrder === 'collection' ? 'text-primary font-medium' : 'text-muted-foreground'}`}
            onClick={() => setSortOrder('collection')}
          >
            Collection
          </button>
        </div>
      </div>
      
      {filteredIcons.length === 0 ? (
        <div className="text-center py-12 border border-dashed rounded-md">
          <p className="text-muted-foreground">No icons found</p>
        </div>
      ) : viewMode === 'grid' ? (
        // Grid view
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredIcons.map(icon => (
            <ContextMenu key={icon.id}>
              <ContextMenuTrigger>
                <div 
                  className={`
                    border rounded-md p-4 flex flex-col items-center cursor-pointer transition-all relative
                    ${(state.selectedIcon === icon.id || selectedIcons.includes(icon.id)) 
                      ? 'ring-2 ring-primary' 
                      : 'hover:border-primary'}
                  `}
                  onClick={() => handleIconClick(icon)}
                  draggable={true}
                  onDragStart={(e) => {
                    // Set data for the drag operation
                    e.dataTransfer.setData('text/plain', icon.id);
                    // If not in batch mode, select this icon
                    if (!state.batchSelectionMode) {
                      dispatch({ type: 'SELECT_ICON', payload: icon.id });
                    }
                  }}
                >
                  <div 
                    className="mb-2 h-12 w-12 flex items-center justify-center text-primary"
                    dangerouslySetInnerHTML={{ 
                      __html: `<svg viewBox="0 0 24 24">${icon.content}</svg>` 
                    }}
                  />
                  <div className="text-xs text-center truncate w-full" title={icon.name}>
                    {icon.name}
                  </div>
                  
                  {state.batchSelectionMode && (
                    <div className="absolute top-2 right-2">
                      <div className={`size-4 border rounded-sm flex items-center justify-center
                        ${selectedIcons.includes(icon.id) 
                          ? 'bg-primary border-primary' 
                          : 'border-muted-foreground'}`}
                      >
                        {selectedIcons.includes(icon.id) && (
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            width="14" 
                            height="14" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            className="text-primary-foreground"
                          >
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        )}
                      </div>
                    </div>
                  )}

                  {copiedIconId === icon.id && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/80 rounded-md text-white text-sm">
                      Copied!
                    </div>
                  )}
                </div>
              </ContextMenuTrigger>
              
              <ContextMenuContent className="w-64">
                <ContextMenuLabel>{icon.name}</ContextMenuLabel>
                <ContextMenuSeparator />
                
                <ContextMenuItem onClick={() => dispatch({ type: 'SELECT_ICON', payload: icon.id })}>
                  <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                  View Details
                </ContextMenuItem>
                
                <ContextMenuItem onClick={() => copyIconToClipboard(icon)}>
                  <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                  </svg>
                  Copy SVG
                </ContextMenuItem>
                
                <ContextMenuItem onClick={(e) => {
                  // Get the parent context menu element
                  const contextMenuEl = (e.target as HTMLElement).closest('[role="menu"]');
                  const closeEvent = new Event('click', { bubbles: true });
                  
                  // Trigger a click outside to close the context menu
                  if (contextMenuEl) {
                    // Small delay to ensure event processing order
                    setTimeout(() => {
                      document.dispatchEvent(closeEvent);
                      
                      // Open the rename dialog after context menu is closed
                      setTimeout(() => {
                        openRenameDialog(icon);
                      }, 10);
                    }, 10);
                  } else {
                    openRenameDialog(icon);
                  }
                }}>
                  <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                  </svg>
                  Rename
                </ContextMenuItem>
                
                {state.collections.length > 0 && (
                  <>
                    <ContextMenuSeparator />
                    <ContextMenuSub>
                      <ContextMenuSubTrigger>
                        <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 6v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2Z"/>
                          <path d="M8 2v4"/>
                          <path d="M16 2v4"/>
                          <path d="M2 10h20"/>
                        </svg>
                        Collections
                      </ContextMenuSubTrigger>
                      <ContextMenuSubContent className="w-48">
                        {state.collections.map(collection => {
                          const isInCollection = collection.icons.includes(icon.id);
                          return (
                            <ContextMenuCheckboxItem
                              key={collection.id}
                              checked={isInCollection}
                              onCheckedChange={() => toggleIconInCollection(icon.id, collection.id, isInCollection)}
                            >
                              {collection.name}
                            </ContextMenuCheckboxItem>
                          );
                        })}
                      </ContextMenuSubContent>
                    </ContextMenuSub>
                  </>
                )}
                
                <ContextMenuSeparator />
                <ContextMenuItem 
                  onClick={() => removeIcon(icon)}
                  className="text-destructive focus:text-destructive"
                >
                  <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18"/>
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                    <line x1="10" x2="10" y1="11" y2="17"/>
                    <line x1="14" x2="14" y1="11" y2="17"/>
                  </svg>
                  Delete
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          ))}
        </div>
      ) : (
        // List view with context menu
        <div className="border rounded-md overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                {state.batchSelectionMode && (
                  <th className="w-10 px-3 py-2">
                    <div className="flex items-center justify-center">
                      <div 
                        className={`size-4 border rounded-sm flex items-center justify-center cursor-pointer
                          ${allSelected ? 'bg-primary border-primary' : 'border-muted-foreground'}`}
                        onClick={toggleSelectAll}
                      >
                        {allSelected && (
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            width="14" 
                            height="14" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            className="text-primary-foreground"
                          >
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        )}
                      </div>
                    </div>
                  </th>
                )}
                <th className="w-10 px-3 py-2"></th>
                <th className="px-3 py-2 text-left">Name</th>
                <th className="px-3 py-2 text-left">Collections</th>
                <th className="w-10 px-3 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredIcons.map(icon => (
                <ContextMenu key={icon.id}>
                  <ContextMenuTrigger>
                    <tr 
                      className={`hover:bg-muted/30 cursor-pointer relative
                        ${(state.selectedIcon === icon.id || selectedIcons.includes(icon.id)) 
                          ? 'bg-primary/10' 
                          : ''}`}
                      onClick={() => handleIconClick(icon)}
                      draggable={true}
                      onDragStart={(e) => {
                        // Set data for the drag operation
                        e.dataTransfer.setData('text/plain', icon.id);
                        // If not in batch mode, select this icon
                        if (!state.batchSelectionMode) {
                          dispatch({ type: 'SELECT_ICON', payload: icon.id });
                        }
                      }}
                    >
                      {state.batchSelectionMode && (
                        <td className="w-10 px-3 py-2">
                          <div className="flex items-center justify-center">
                            <div 
                              className={`size-4 border rounded-sm flex items-center justify-center
                                ${selectedIcons.includes(icon.id) 
                                  ? 'bg-primary border-primary' 
                                  : 'border-muted-foreground'}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleIconSelection(icon.id);
                              }}
                            >
                              {selectedIcons.includes(icon.id) && (
                                <svg 
                                  xmlns="http://www.w3.org/2000/svg" 
                                  width="14" 
                                  height="14" 
                                  viewBox="0 0 24 24" 
                                  fill="none" 
                                  stroke="currentColor" 
                                  strokeWidth="2" 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round" 
                                  className="text-primary-foreground"
                                >
                                  <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                              )}
                            </div>
                          </div>
                        </td>
                      )}
                      <td className="w-10 px-3 py-2">
                        <div 
                          className="size-6 flex items-center justify-center text-primary"
                          dangerouslySetInnerHTML={{ 
                            __html: `<svg viewBox="0 0 24 24">${icon.content}</svg>` 
                          }}
                        />
                      </td>
                      <td className="px-3 py-2">
                        {icon.name}
                        {copiedIconId === icon.id && (
                          <span className="ml-2 text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded">
                            Copied!
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex flex-wrap gap-1">
                          {getIconCollectionNames(icon.id).map((name, index) => (
                            <span 
                              key={index} 
                              className="bg-muted px-2 py-0.5 rounded-full text-xs"
                            >
                              {name}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="w-10 px-3 py-2 text-right">
                        <button 
                          className="hover:text-primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyIconToClipboard(icon);
                          }}
                          title="Copy SVG"
                        >
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
                          >
                            <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                          </svg>
                        </button>
                      </td>
                    </tr>
                  </ContextMenuTrigger>
                  
                  <ContextMenuContent className="w-64">
                    <ContextMenuLabel>{icon.name}</ContextMenuLabel>
                    <ContextMenuSeparator />
                    
                    <ContextMenuItem onClick={() => dispatch({ type: 'SELECT_ICON', payload: icon.id })}>
                      <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                      View Details
                    </ContextMenuItem>
                    
                    <ContextMenuItem onClick={() => copyIconToClipboard(icon)}>
                      <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                      </svg>
                      Copy SVG
                    </ContextMenuItem>
                    
                    <ContextMenuItem onClick={(e) => {
                      // Get the parent context menu element
                      const contextMenuEl = (e.target as HTMLElement).closest('[role="menu"]');
                      const closeEvent = new Event('click', { bubbles: true });
                      
                      // Trigger a click outside to close the context menu
                      if (contextMenuEl) {
                        // Small delay to ensure event processing order
                        setTimeout(() => {
                          document.dispatchEvent(closeEvent);
                          
                          // Open the rename dialog after context menu is closed
                          setTimeout(() => {
                            openRenameDialog(icon);
                          }, 10);
                        }, 10);
                      } else {
                        openRenameDialog(icon);
                      }
                    }}>
                      <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                      </svg>
                      Rename
                    </ContextMenuItem>
                    
                    {state.collections.length > 0 && (
                      <>
                        <ContextMenuSeparator />
                        <ContextMenuSub>
                          <ContextMenuSubTrigger>
                            <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20 6v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2Z"/>
                              <path d="M8 2v4"/>
                              <path d="M16 2v4"/>
                              <path d="M2 10h20"/>
                            </svg>
                            Collections
                          </ContextMenuSubTrigger>
                          <ContextMenuSubContent className="w-48">
                            {state.collections.map(collection => {
                              const isInCollection = collection.icons.includes(icon.id);
                              return (
                                <ContextMenuCheckboxItem
                                  key={collection.id}
                                  checked={isInCollection}
                                  onCheckedChange={() => toggleIconInCollection(icon.id, collection.id, isInCollection)}
                                >
                                  {collection.name}
                                </ContextMenuCheckboxItem>
                              );
                            })}
                          </ContextMenuSubContent>
                        </ContextMenuSub>
                      </>
                    )}
                    
                    <ContextMenuSeparator />
                    <ContextMenuItem 
                      onClick={() => removeIcon(icon)}
                      className="text-destructive focus:text-destructive"
                    >
                      <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18"/>
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                        <line x1="10" x2="10" y1="11" y2="17"/>
                        <line x1="14" x2="14" y1="11" y2="17"/>
                      </svg>
                      Delete
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Rename Dialog */}
      <Dialog 
        open={isRenameDialogOpen} 
        onOpenChange={(open: boolean) => {
          setIsRenameDialogOpen(open);
          if (!open) {
            // Clear the icon to rename when dialog is closed
            setIconToRename(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Rename Icon</DialogTitle>
            <DialogDescription>
              Change the display name of this icon.
            </DialogDescription>
          </DialogHeader>
          {iconToRename && (
            <div className="grid gap-4 py-4">
              <div className="flex items-center justify-center mb-2">
                <div 
                  className="h-16 w-16 text-primary"
                  dangerouslySetInnerHTML={{ 
                    __html: `<svg viewBox="${iconToRename.viewBox || "0 0 24 24"}">${iconToRename.content}</svg>` 
                  }}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="iconName" className="text-sm font-medium">
                  New Icon Name
                </label>
                <input
                  id="iconName"
                  type="text"
                  value={newIconName}
                  onChange={(e) => setNewIconName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  autoFocus
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button 
              variant="outline"
              onClick={() => {
                setIsRenameDialogOpen(false);
                setIconToRename(null);
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleRenameIcon} 
              disabled={!newIconName.trim() || (iconToRename?.name === newIconName)}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Batch Delete Confirmation Dialog */}
      <Dialog 
        open={isBatchDeleteDialogOpen} 
        onOpenChange={(open: boolean) => {
          setIsBatchDeleteDialogOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Selected Icons</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedIcons.length} selected icon{selectedIcons.length !== 1 ? 's' : ''}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline"
              onClick={() => setIsBatchDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={confirmBatchDelete}
            >
              Delete Icons
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 