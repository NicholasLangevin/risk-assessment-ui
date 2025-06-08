
'use client';

import { useState, useEffect } from 'react';

interface ClientFormattedDateProps {
  isoDateString: string;
}

export function ClientFormattedDate({ isoDateString }: ClientFormattedDateProps) {
  const [formattedDate, setFormattedDate] = useState<string | null>(null);

  useEffect(() => {
    // This effect runs only on the client, after the component has mounted
    // and ensures that toLocaleDateString uses the client's locale.
    try {
      setFormattedDate(new Date(isoDateString).toLocaleDateString());
    } catch (error) {
      // Handle potential invalid date string if necessary
      console.error("Failed to parse date string:", isoDateString, error);
      setFormattedDate("Invalid Date");
    }
  }, [isoDateString]);

  if (formattedDate === null) {
    // During server-side rendering and the initial client-side render (before useEffect runs),
    // render a non-locale-specific format or a placeholder.
    // This ensures server and client initial render match.
    // Rendering the YYYY-MM-DD part of the ISO string is a safe bet.
    try {
      const date = new Date(isoDateString);
      // Check if date is valid before calling toISOString
      if (isNaN(date.getTime())) {
        return <>Invalid Date</>;
      }
      return <>{date.toISOString().split('T')[0]}</>;
    } catch (error) {
      // Fallback for an invalid isoDateString passed as prop during initial render
      return <>--/--/----</>;
    }
  }

  return <>{formattedDate}</>;
}
