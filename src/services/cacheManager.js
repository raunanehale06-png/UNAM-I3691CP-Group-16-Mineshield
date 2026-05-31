import AsyncStorage from '@react-native-async-storage/async-storage';

export const getCachedJson = async (key, fallback = null) => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    console.error('Unable to read cached JSON:', error);
    return fallback;
  }
};

export const setCachedJson = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error('Unable to write cached JSON:', error);
    return false;
  }
};

export const removeCachedItem = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Unable to remove cached item:', error);
    return false;
  }
};

export const clearCacheByPrefix = async (prefix) => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const matchingKeys = keys.filter((key) => key.startsWith(prefix));

    if (matchingKeys.length > 0) {
      await AsyncStorage.multiRemove(matchingKeys);
    }

    return matchingKeys.length;
  } catch (error) {
    console.error('Unable to clear cached items by prefix:', error);
    return 0;
  }
};

export default {
  clearCacheByPrefix,
  getCachedJson,
  removeCachedItem,
  setCachedJson,
};
