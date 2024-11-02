import type { SearchHistory } from '../models/searchHistory';

export interface HistorySidebarProps {
    searchHistory: SearchHistory[];
    onSelectHistory: (search: SearchHistory) => void;
    onDeleteHistory: (timestamp: number) => void;
    currentTimestamp?: number;
}
