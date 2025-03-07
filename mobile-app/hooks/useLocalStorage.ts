import { useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isLoading, setIsLoading] = useState(true);
  
  // Use a ref to track if this is the first render
  const isFirstRender = useRef(true);

  // Load from AsyncStorage on mount
  useEffect(() => {
    const getStoredValue = async () => {
      try {
        const item = await AsyncStorage.getItem(key);
        if (item !== null) {
          setStoredValue(JSON.parse(item));
        }
      } catch (error) {
        console.error(`Error reading from AsyncStorage: ${error}`);
      } finally {
        setIsLoading(false);
      }
    };

    if (isFirstRender.current) {
      isFirstRender.current = false;
      getStoredValue();
    }
  }, [key]);

  // Return a wrapped version of useState's setter function that persists the new value to AsyncStorage
  const setValue = async (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Save state
      setStoredValue(valueToStore);
      
      // Save to AsyncStorage
      await AsyncStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error writing to AsyncStorage: ${error}`);
    }
  };

  return { value: storedValue, setValue, isLoading };
} 