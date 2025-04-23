import { InstanceCard } from '@/components/instance-card';

interface InstanceListProps {
  instances: any[];
}

export function InstanceList({ instances }: InstanceListProps) {
  if (instances.length === 0) {
    return (
      <div className="text-center p-8 border rounded-lg bg-muted/20">
        <p className="text-muted-foreground">
          No instances found. Add your first instance to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {instances.map((instance, index) => (
        <InstanceCard key={index} instance={instance} />
      ))}
    </div>
  );
}
