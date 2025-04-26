'use client';

import { useState, useEffect } from 'react';
import { InstanceCard } from '@/components/instance-card';
import { Skeleton } from '@/components/ui/skeleton';

export function InstanceList() {
  const [instances, setInstances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInstances = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/instances');
        
        if (!response.ok) {
          throw new Error('Failed to fetch instances');
        }
        
        const data = await response.json();
        setInstances(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching instances:', err);
        setError('Failed to load instances. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchInstances();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="w-full h-32 rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 border rounded-lg bg-destructive/10 text-destructive">
        <p>{error}</p>
      </div>
    );
  }

  if (instances.length === 0) {
    return (
      <div className="text-center p-8 border rounded-lg bg-muted/20">
        <p className="text-muted-foreground">
          No instances found. Add your first DHIS2 instance to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {instances.map((instance) => (
        <InstanceCard key={instance.id} instance={instance} />
      ))}
    </div>
  );
}
