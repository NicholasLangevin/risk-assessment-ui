
'use client';

import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

interface TodoItem {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
}

// This is the URL of your Python/FastAPI backend endpoint.
// For this demo, we're using a public placeholder API.
// Replace this with your actual backend URL when you build it, e.g., 'http://localhost:8000/api/my-data'
const PYTHON_BACKEND_URL = 'https://jsonplaceholder.typicode.com/todos/1';

export function PythonIntegrationDemoClient() {
  const [data, setData] = useState<TodoItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDataFromPythonBackend = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(PYTHON_BACKEND_URL);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        setData(result);
      } catch (e: any) {
        setError(e.message || 'Failed to fetch data');
        console.error("Error fetching data:", e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDataFromPythonBackend();
  }, []); // Empty dependency array means this effect runs once on mount

  if (isLoading) {
    return (
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Fetching data from backend...</h3>
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-6 w-1/2" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <Terminal className="h-4 w-4" />
        <AlertTitle>Error Fetching Data</AlertTitle>
        <AlertDescription>
          Could not fetch data from the backend: {error}.
          <p className="mt-2 text-xs">
            Make sure your Python/FastAPI server is running and accessible at: <br />
            <code className="bg-muted px-1 py-0.5 rounded">{PYTHON_BACKEND_URL}</code>
            <br />
            Also, ensure CORS is configured correctly on your backend if it's on a different origin.
          </p>
        </AlertDescription>
      </Alert>
    );
  }

  if (!data) {
    return <p>No data received from the backend.</p>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Data from Simulated Python/FastAPI Backend:</h3>
      <div className="p-4 border rounded-md bg-muted/50">
        <p><strong>Title:</strong> {data.title}</p>
        <p><strong>Status:</strong> {data.completed ? 'Completed' : 'Pending'}</p>
        <p className="text-xs text-muted-foreground mt-2">ID: {data.id}, User ID: {data.userId}</p>
      </div>
      <p className="text-sm text-muted-foreground">
        In a real scenario, this data would come from your Python application exposing an API endpoint at: <br />
        <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded">{PYTHON_BACKEND_URL}</code> (or your actual backend URL).
      </p>
    </div>
  );
}
