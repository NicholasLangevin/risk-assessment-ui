
'use client';

import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
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
      // Limit to, for example, 5 opened cases
      const MAX_OPENED_CASES = 5;
      const updatedCases = [caseInfo, ...prevCases];
      return updatedCases.slice(0, MAX_OPENED_CASES);
    });
  }, []);

  const closeCase = useCallback((caseId: string, currentPathname?: string) => {
    setOpenedCases(prevCases => {
      const newCases = prevCases.filter(c => c.id !== caseId);
      // If the closed case was the one currently being viewed, navigate away
      if (currentPathname && currentPathname.includes(`/case/${caseId}`)) {
        if (newCases.length > 0) {
          router.push(`/case/${newCases[0].id}`); // Navigate to the first remaining open case
        } else {
          router.push('/'); // Navigate to home if no cases are left open
        }
      }
      return newCases;
    });
  }, [router]);

  const isCaseOpen = useCallback((caseId: string) => {
    return openedCases.some(c => c.id === caseId);
  }, [openedCases]);

  const clearAllCases = useCallback(() => {
    setOpenedCases([]);
    router.push('/'); // Navigate home after clearing all cases
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
