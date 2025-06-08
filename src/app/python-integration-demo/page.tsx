
import { PythonIntegrationDemoClient } from '@/components/demo/PythonIntegrationDemoClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function PythonIntegrationDemoPage() {
  return (
    <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Python/FastAPI Integration Demo</CardTitle>
          <CardDescription>
            This page demonstrates how a Next.js UI can fetch data from an external API.
            Imagine the data below is coming from your Python/FastAPI backend running separately.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PythonIntegrationDemoClient />
        </CardContent>
      </Card>
    </div>
  );
}
