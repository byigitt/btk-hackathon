import type { GoogleResult, SearchHistory } from "../models";

export interface CustomButtonProps {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'contained' | 'outlined' | 'text';
  color?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
}

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

export interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export interface TextResultProps {
  content: string;
  isLoading: boolean;
}

export interface VideoResultProps {
  videos: GoogleResult[];
  isLoading: boolean;
}

export interface ImageResultProps {
  images: GoogleResult[];
}

export interface WebResultProps {
  websites: GoogleResult[];
}

export interface HistorySidebarProps {
  searchHistory: SearchHistory[];
  onSelectHistory: (search: SearchHistory) => void;
  onDeleteHistory: (timestamp: number) => void;
  currentTimestamp?: number;
}

export interface ResultCardProps {
  response: string;
  isLoading: boolean;
  isFromStorage?: boolean;
}

export interface SourcesCardProps {
  googleResults?: GoogleResult[];
  isLoading: boolean;
  renderGoogleResults: (results: GoogleResult[]) => React.ReactNode;
  renderSourcesSkeleton: () => React.ReactNode;
}

export interface StreamingTextProps {
  text: string;
  isLoading: boolean;
}

export interface VideoCardProps {
  video: GoogleResult;
  isLoading?: boolean;
}