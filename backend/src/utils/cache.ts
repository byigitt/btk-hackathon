import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 100, checkperiod: 120 });

export const getCache = <T>(key: string): T | undefined => {
  return cache.get(key);
};

export const setCache = <T>(key: string, value: T, ttl = 100): boolean => {
  return cache.set(key, value, ttl);
};
