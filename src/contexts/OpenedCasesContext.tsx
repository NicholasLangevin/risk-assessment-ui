
'use client';

import React, { createContext, useContext, useState, useCallback, type ReactNode, useEffect } from 'react';
import type { OpenedCaseInfo } from '@/types';
import { useRouter } from 'next/navigation';

interface OpenedCasesContextType {
  openedCases: OpenedCaseInfo[];
  openCase: (caseInfo: OpenedCaseInfo) => void;
  closeCase: (caseId: string, currentPathname?: string) => void;
  isCaseOpen: (caseId: string) => boolean;
  clearAllCases: () => void;
}

const OpenedCasesContext = createContext<OpenedCasesContextType | undefined>(undefined);

export function OpenedCasesProvider({ children }: { children: ReactNode }) {
  const [openedCases, setOpenedCases] = useState<OpenedCaseInfo[]>([]);
  const router = useRouter();

  const openCase = useCallback((caseInfo: OpenedCaseInfo) => {
    setOpenedCases(prevCases => {
      if (prevCases.find(c => c.id === caseInfo.id)) {
        return prevCases; // Already open, no change
      }
      const MAX_OPENED_CASES = 5;
      const updatedCases = [caseInfo, ...prevCases];
      return updatedCases.slice(0, MAX_OPENED_CASES);
    });
  }, []);

  const closeCase = useCallback((caseId: string, currentPathname?: string) => {
    let newCasesList: OpenedCaseInfo[] = [];
    
    setOpenedCases(prevCases => {
      newCasesList = prevCases.filter(c => c.id !== caseId);
      return newCasesList;
    });

    // Perform navigation as a side effect after the state update
    // We use a microtask (Promise.resolve().then()) or useEffect to ensure navigation happens after render.
    // For simplicity with router, direct call after setOpenedCases might often work,
    // but useEffect is safer for such side effects tied to state changes.
    // However, since closeCase can be called from various places,
    // managing this with a useEffect listening to openedCases might be complex.
    // A direct call after the state update, outside the updater, is a common pattern.
    
    // Defer navigation to ensure it's not part of the current render cycle.
    // This is a common way to handle side effects that depend on state updates.
    Promise.resolve().then(() => {
        if (currentPathname && currentPathname.includes(`/case/${caseId}`)) {
            if (newCasesList.length > 0) {
            router.push(`/case/${newCasesList[0].id}`);
            } else {
            router.push('/');
            }
        }
    });

  }, [router]);

  const isCaseOpen = useCallback((caseId: string) => {
    return openedCases.some(c => c.id === caseId);
  }, [openedCases]);

  const clearAllCases = useCallback(() => {
    setOpenedCases([]);
    // Defer navigation similarly
    Promise.resolve().then(() => {
        router.push('/'); 
    });
  }, [router]);

  return (
    <OpenedCasesContext.Provider value={{ openedCases, openCase, closeCase, isCaseOpen, clearAllCases }}>
      {children}
    </OpenedCasesContext.Provider>
  );
}

export function useOpenedCases(): OpenedCasesContextType {
  const context = useContext(OpenedCasesContext);
  if (context === undefined) {
    throw new Error('useOpenedCases must be used within an OpenedCasesProvider');
  }
  return context;
}
