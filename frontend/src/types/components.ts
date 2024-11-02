import type { GoogleResult } from './models';

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

export interface CustomButtonProps {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'contained' | 'outlined' | 'text';
  color?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
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