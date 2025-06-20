
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
        // If already open, move it to the front (most recently accessed)
        return [caseInfo, ...prevCases.filter(c => c.id !== caseInfo.id)];
      }
      const MAX_OPENED_CASES = 5; // Example limit
      const updatedCases = [caseInfo, ...prevCases];
      return updatedCases.slice(0, MAX_OPENED_CASES);
    });
  }, []);

  const closeCase = useCallback((caseId: string, currentPathname?: string) => {
    let newCasesListAfterRemoval: OpenedCaseInfo[] = [];
    
    setOpenedCases(prevCases => {
      newCasesListAfterRemoval = prevCases.filter(c => c.id !== caseId);
      return newCasesListAfterRemoval;
    });
    
    // Perform navigation after state update
    Promise.resolve().then(() => {
      if (currentPathname && (currentPathname === `/case/${caseId}` || currentPathname.startsWith(`/case/${caseId}/`))) {
        if (newCasesListAfterRemoval.length > 0) {
          router.push(`/case/${newCasesListAfterRemoval[0].id}`);
        } else {
          router.push('/working-list'); // Navigate to Working List if no cases are left open
        }
      }
    });
  }, [router]);

  const isCaseOpen = useCallback((caseId: string) => {
    return openedCases.some(c => c.id === caseId);
  }, [openedCases]);

  const clearAllCases = useCallback(() => {
    setOpenedCases([]);
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

