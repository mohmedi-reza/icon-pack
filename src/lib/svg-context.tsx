import { createContext, useContext, useReducer } from 'react';
import type { ReactNode } from 'react';
import type { SvgState, SvgAction, SvgIcon, IconCollection } from '@/types/svg';
import { nanoid } from 'nanoid';
import { processSvg, createSvgString } from './svg-utils';

const initialState: SvgState = {
  icons: [],
  collections: [],
  selectedCollection: null,
  selectedIcon: null,
  searchQuery: '',
  batchSelectionMode: false,
  selectedBatchIcons: []
};

function svgReducer(state: SvgState, action: SvgAction): SvgState {
  switch (action.type) {
    case 'ADD_ICON':
      return {
        ...state,
        icons: [...state.icons, action.payload],
      };
    
    case 'ADD_ICONS':
      return {
        ...state,
        icons: [...state.icons, ...action.payload],
      };
    
    case 'REMOVE_ICON':
      return {
        ...state,
        icons: state.icons.filter(icon => icon.id !== action.payload),
        collections: state.collections.map(collection => ({
          ...collection,
          icons: collection.icons.filter(id => id !== action.payload),
        })),
        selectedIcon: state.selectedIcon === action.payload ? null : state.selectedIcon,
      };
    
    case 'UPDATE_ICON':
      return {
        ...state,
        icons: state.icons.map(icon => 
          icon.id === action.payload.id ? action.payload : icon
        ),
      };
    
    case 'SELECT_ICON':
      return {
        ...state,
        selectedIcon: action.payload,
      };
    
    case 'ADD_COLLECTION':
      return {
        ...state,
        collections: [...state.collections, action.payload],
      };
    
    case 'UPDATE_COLLECTION':
      return {
        ...state,
        collections: state.collections.map(collection => 
          collection.id === action.payload.id ? action.payload : collection
        ),
      };
    
    case 'REMOVE_COLLECTION':
      return {
        ...state,
        collections: state.collections.filter(collection => collection.id !== action.payload),
        selectedCollection: state.selectedCollection === action.payload ? null : state.selectedCollection,
      };
    
    case 'SELECT_COLLECTION':
      return {
        ...state,
        selectedCollection: action.payload,
      };
    
    case 'SET_SEARCH_QUERY':
      return {
        ...state,
        searchQuery: action.payload,
      };
    
    case 'ADD_ICON_TO_COLLECTION': {
      const { iconId, collectionId } = action.payload;
      return {
        ...state,
        collections: state.collections.map(collection =>
          collection.id === collectionId
            ? { ...collection, icons: [...collection.icons, iconId] }
            : collection
        ),
      };
    }
    
    case 'REMOVE_ICON_FROM_COLLECTION': {
      const { iconId, collectionId } = action.payload;
      return {
        ...state,
        collections: state.collections.map(collection =>
          collection.id === collectionId
            ? { ...collection, icons: collection.icons.filter(id => id !== iconId) }
            : collection
        ),
      };
    }
    
    case 'SET_BATCH_SELECTION_MODE':
      return {
        ...state,
        batchSelectionMode: action.payload,
        selectedBatchIcons: action.payload ? state.selectedBatchIcons : []
      };
    
    case 'UPDATE_BATCH_SELECTION':
      return {
        ...state,
        selectedBatchIcons: action.payload
      };
    
    default:
      return state;
  }
}

type SvgContextType = {
  state: SvgState;
  dispatch: React.Dispatch<SvgAction>;
  addIcons: (files: File[]) => Promise<void>;
  createCollection: (name: string, description?: string) => void;
  addIconToCollection: (iconId: string, collectionId: string) => void;
  removeIconFromCollection: (iconId: string, collectionId: string) => void;
  exportIconPackToFile: (collectionId?: string) => Promise<void>;
  toggleBatchMode: (enabled?: boolean) => void;
};

const SvgContext = createContext<SvgContextType | undefined>(undefined);

export function SvgProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(svgReducer, initialState);
  
  const addIcons = async (files: File[]) => {
    const promises = files.map(file => {
      return new Promise<SvgIcon | null>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            const svgContent = e.target.result as string;
            
            // Extract potential viewBox from the SVG
            const viewBoxMatch = svgContent.match(/viewBox=["']([^"']*)["']/);
            const viewBox = viewBoxMatch ? viewBoxMatch[1] : undefined;
            
            // Process the SVG to minify it
            const processedContent = processSvg(svgContent);
            
            const icon: SvgIcon = {
              id: nanoid(),
              name: normalizeName(file.name),
              originalName: file.name,
              content: processedContent,
              viewBox: viewBox
            };
            resolve(icon);
          } else {
            resolve(null);
          }
        };
        reader.onerror = () => resolve(null);
        reader.readAsText(file);
      });
    });
    
    const icons = (await Promise.all(promises)).filter(Boolean) as SvgIcon[];
    if (icons.length) {
      dispatch({ type: 'ADD_ICONS', payload: icons });
    }
  };
  
  const normalizeName = (filename: string): string => {
    return filename
      .replace(/\.svg$/, '') // Remove .svg extension
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/[\s-]+/g, '-') // Replace spaces and multiple hyphens with a single hyphen
      .replace(/^-+|-+$/g, '') // Remove leading and trailing hyphens
      .toLowerCase(); // Convert to lowercase
  };
  
  const createCollection = (name: string, description?: string) => {
    const collection: IconCollection = {
      id: nanoid(),
      name,
      description,
      icons: [],
    };
    dispatch({ type: 'ADD_COLLECTION', payload: collection });
  };
  
  const addIconToCollection = (iconId: string, collectionId: string) => {
    dispatch({ 
      type: 'ADD_ICON_TO_COLLECTION', 
      payload: { iconId, collectionId } 
    });
  };
  
  const removeIconFromCollection = (iconId: string, collectionId: string) => {
    dispatch({ 
      type: 'REMOVE_ICON_FROM_COLLECTION', 
      payload: { iconId, collectionId } 
    });
  };
  
  const toggleBatchMode = (enabled?: boolean) => {
    const newValue = enabled !== undefined ? enabled : !state.batchSelectionMode;
    dispatch({ 
      type: 'SET_BATCH_SELECTION_MODE', 
      payload: newValue 
    });
  };
  
  const exportIconPackToFile = async (collectionId?: string) => {
    let exportIcons: SvgIcon[] = [];
    
    if (collectionId) {
      const collection = state.collections.find(c => c.id === collectionId);
      if (collection) {
        exportIcons = state.icons.filter(icon => collection.icons.includes(icon.id));
      }
    } else {
      exportIcons = state.icons;
    }
    
    if (exportIcons.length === 0) return;
    
    const iconMap: { [key: string]: string } = {};
    exportIcons.forEach(icon => {
      iconMap[icon.name] = icon.content;
    });
    
    const iconPackCode = `export const iconPack = {\n${
      Object.entries(iconMap)
        .map(([name, content]) => {
          const viewBox = state.icons.find(icon => icon.name === name)?.viewBox || "0 0 24 24";
          return `  ${name}: \`${createSvgString(content, viewBox)}\``;
        })
        .join(',\n')
    }\n};\n\nexport type IconName = keyof typeof iconPack;\n`;
    
    const blob = new Blob([iconPackCode], { type: 'text/typescript' });
    
    // Create a download link and trigger the download
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = collectionId 
      ? `icon-pack-${state.collections.find(c => c.id === collectionId)?.name.toLowerCase() || 'collection'}.ts`
      : 'icon-pack.ts';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  return (
    <SvgContext.Provider value={{
      state,
      dispatch,
      addIcons,
      createCollection,
      addIconToCollection,
      removeIconFromCollection,
      exportIconPackToFile,
      toggleBatchMode,
    }}>
      {children}
    </SvgContext.Provider>
  );
}

export function useSvg() {
  const context = useContext(SvgContext);
  if (context === undefined) {
    throw new Error('useSvg must be used within a SvgProvider');
  }
  return context;
} 