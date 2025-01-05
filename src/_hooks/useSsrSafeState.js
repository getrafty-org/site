import { useState } from "https://esm.sh/react@18";

export function useSsrSafeState(initialValue) {
    const isBrowser = typeof window !== "undefined";
    return isBrowser
        ? useState(initialValue) // Browser: normal useState
        : [initialValue, () => {}]; // SSR: static fallback
}
