'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InstanceCardProps {
  instance: any;
}

export function InstanceCard({ instance }: InstanceCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card className="mx-4 md:mx-28">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">
          {instance.systemName || 'Instance'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Instance URL
            </p>
            <p className="text-sm truncate">{instance.contextPath}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Version</p>
            <p className="text-sm">{instance.version}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Current User
            </p>
            <p className="text-sm">{instance.databaseInfo?.user || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              System ID
            </p>
            <p className="text-sm truncate">{instance.systemId}</p>
          </div>
        </div>

        <Collapsible
          open={isOpen}
          onOpenChange={setIsOpen}
          className="border rounded-md mt-4"
        >
          <div className="flex items-center justify-between px-4 py-2 border-b">
            <h3 className="text-sm font-medium">Details</h3>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="p-0 h-8 w-8">
                {isOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent className="px-4 pb-4 pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-muted-foreground">
                  Database Info
                </p>
                <ul className="space-y-1 mt-1">
                  <li>
                    <span className="text-muted-foreground">Name:</span>{' '}
                    {instance.databaseInfo?.name}
                  </li>
                  <li>
                    <span className="text-muted-foreground">URL:</span>{' '}
                    {instance.databaseInfo?.url}
                  </li>
                  <li>
                    <span className="text-muted-foreground">Version:</span>{' '}
                    {instance.databaseInfo?.databaseVersion}
                  </li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-muted-foreground">System Info</p>
                <ul className="space-y-1 mt-1">
                  <li>
                    <span className="text-muted-foreground">Java Version:</span>{' '}
                    {instance.javaVersion}
                  </li>
                  <li>
                    <span className="text-muted-foreground">OS:</span>{' '}
                    {instance.osName} {instance.osArchitecture}
                  </li>
                  <li>
                    <span className="text-muted-foreground">CPU Cores:</span>{' '}
                    {instance.cpuCores}
                  </li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-muted-foreground">Time & Date</p>
                <ul className="space-y-1 mt-1">
                  <li>
                    <span className="text-muted-foreground">Server Date:</span>{' '}
                    {instance.serverDate}
                  </li>
                  <li>
                    <span className="text-muted-foreground">Time Zone:</span>{' '}
                    {instance.serverTimeZoneDisplayName}
                  </li>
                  <li>
                    <span className="text-muted-foreground">Calendar:</span>{' '}
                    {instance.calendar}
                  </li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-muted-foreground">
                  Configuration
                </p>
                <ul className="space-y-1 mt-1">
                  <li>
                    <span className="text-muted-foreground">File Store:</span>{' '}
                    {instance.fileStoreProvider}
                  </li>
                  <li>
                    <span className="text-muted-foreground">Read Only:</span>{' '}
                    {instance.readOnlyMode}
                  </li>
                  <li>
                    <span className="text-muted-foreground">Memory:</span>{' '}
                    {instance.memoryInfo}
                  </li>
                </ul>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}
