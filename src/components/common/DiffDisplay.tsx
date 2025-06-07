
'use client';

import React from 'react';
import { diffWords } from 'diff';

interface DiffDisplayProps {
  originalText: string;
  currentText: string;
  className?: string;
}

export function DiffDisplay({ originalText, currentText, className }: DiffDisplayProps) {
  const diffResult = diffWords(originalText, currentText);

  return (
    <div className={className}>
      {diffResult.map((part, index) => {
        if (part.added) {
          return (
            <span key={index} className="text-green-600 dark:text-green-500 font-semibold bg-green-50 dark:bg-green-900/20 px-0.5 rounded-sm">
              {part.value}
            </span>
          );
        } else if (part.removed) {
          // Optionally, show removed text with strikethrough and red color
          // return <del key={index} className="text-red-500 bg-red-50 dark:bg-red-900/20 px-0.5 rounded-sm">{part.value}</del>;
          return null; // For email preview, typically we don't show what was removed from original
        } else {
          return <span key={index}>{part.value}</span>;
        }
      })}
    </div>
  );
}
