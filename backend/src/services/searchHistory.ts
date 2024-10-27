import { Socket } from 'socket.io';

const searchHistory: Map<string, string[]> = new Map();

export const addToSearchHistory = (socketId: string, query: string) => {
  const history = searchHistory.get(socketId) || [];
  history.unshift(query);
  searchHistory.set(socketId, history.slice(0, 10)); // Keep last 10 searches
};

export const getSearchHistory = (socketId: string): string[] => {
  return searchHistory.get(socketId) || [];
};

export const clearSearchHistory = (socketId: string) => {
  searchHistory.delete(socketId);
};
