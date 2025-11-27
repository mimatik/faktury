import { useState, useEffect } from 'react';

/**
 * Custom hook for state that persists in sessionStorage
 * @param key - SessionStorage key
 * @param initialValue - Default value if nothing in storage
 */
export function useSessionState<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
    // Initialize state from sessionStorage or use initialValue
    const [state, setState] = useState<T>(() => {
        try {
            const item = sessionStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch {
            return initialValue;
        }
    });

    // Save to sessionStorage whenever state changes
    useEffect(() => {
        try {
            sessionStorage.setItem(key, JSON.stringify(state));
        } catch (error) {
            console.error('Error saving to sessionStorage:', error);
        }
    }, [key, state]);

    return [state, setState];
}
