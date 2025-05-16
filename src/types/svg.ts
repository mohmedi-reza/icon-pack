export interface SvgIcon {
  id: string;
  name: string;
  originalName: string;
  content: string;
  viewBox?: string;
  collection?: string;
}

export interface IconCollection {
  id: string;
  name: string;
  description?: string;
  icons: string[]; // Array of icon IDs in this collection
}

export interface SvgState {
  icons: SvgIcon[];
  collections: IconCollection[];
  selectedCollection: string | null;
  selectedIcon: string | null;
  searchQuery: string;
  batchSelectionMode: boolean;
  selectedBatchIcons: string[];
}

export type SvgAction = 
  | { type: 'ADD_ICON'; payload: SvgIcon }
  | { type: 'ADD_ICONS'; payload: SvgIcon[] }
  | { type: 'REMOVE_ICON'; payload: string }
  | { type: 'UPDATE_ICON'; payload: SvgIcon }
  | { type: 'SELECT_ICON'; payload: string | null }
  | { type: 'ADD_COLLECTION'; payload: IconCollection }
  | { type: 'UPDATE_COLLECTION'; payload: IconCollection }
  | { type: 'REMOVE_COLLECTION'; payload: string }
  | { type: 'SELECT_COLLECTION'; payload: string | null }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'ADD_ICON_TO_COLLECTION'; payload: { iconId: string, collectionId: string } }
  | { type: 'REMOVE_ICON_FROM_COLLECTION'; payload: { iconId: string, collectionId: string } }
  | { type: 'SET_BATCH_SELECTION_MODE'; payload: boolean }
  | { type: 'UPDATE_BATCH_SELECTION'; payload: string[] }; 