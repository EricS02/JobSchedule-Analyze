"use client";

import { useState, useEffect, useCallback } from "react";
import { saveToSession, getFromSession, removeFromSession } from "@/actions/session.actions";

/**
 * Custom hook for server-side session storage
 * Provides a localStorage-like API but stores data on the server
 */
export function useSessionStorage<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(defaultValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial value from server
  useEffect(() => {
    const loadValue = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await getFromSession(key, defaultValue);
        setValue(result);
      } catch (err) {
        console.error(`Failed to load session data for key ${key}:`, err);
        setError(err instanceof Error ? err.message : "Failed to load data");
        setValue(defaultValue);
      } finally {
        setLoading(false);
      }
    };

    loadValue();
  }, [key, defaultValue]);

  // Save value to server
  const saveValue = useCallback(async (newValue: T) => {
    try {
      setError(null);
      const result = await saveToSession(key, newValue);
      if (result?.success) {
        setValue(newValue);
      } else {
        throw new Error("Failed to save data");
      }
    } catch (err) {
      console.error(`Failed to save session data for key ${key}:`, err);
      setError(err instanceof Error ? err.message : "Failed to save data");
    }
  }, [key]);

  // Remove value from server
  const removeValue = useCallback(async () => {
    try {
      setError(null);
      const result = await removeFromSession(key);
      if (result?.success) {
        setValue(defaultValue);
      } else {
        throw new Error("Failed to remove data");
      }
    } catch (err) {
      console.error(`Failed to remove session data for key ${key}:`, err);
      setError(err instanceof Error ? err.message : "Failed to remove data");
    }
  }, [key, defaultValue]);

  return {
    value,
    setValue: saveValue,
    removeValue,
    loading,
    error,
  };
}

/**
 * Hook for simple session storage operations
 */
export function useSessionStorageSimple<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(defaultValue);
  const [loading, setLoading] = useState(true);

  // Load initial value
  useEffect(() => {
    const loadValue = async () => {
      try {
        const result = await getFromSession(key, defaultValue);
        setValue(result);
      } catch (err) {
        console.error(`Failed to load session data for key ${key}:`, err);
        setValue(defaultValue);
      } finally {
        setLoading(false);
      }
    };

    loadValue();
  }, [key, defaultValue]);

  // Save value
  const saveValue = useCallback(async (newValue: T) => {
    try {
      await saveToSession(key, newValue);
      setValue(newValue);
    } catch (err) {
      console.error(`Failed to save session data for key ${key}:`, err);
    }
  }, [key]);

  return [value, saveValue, loading] as const;
} 