'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { 
  ChevronDown, 
  ChevronUp, 
  CheckCircle, 
  XCircle, 
  ExternalLink, 
  RefreshCw, 
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useRouter } from 'next/navigation';
import { toast } from './toast';

interface InstanceCardProps {
  instance: {
    id: string;
    name: string;
    url: string;
    apiToken?: string;
    description?: string;
    username?: string;
    password?: string;
    details?: any;
    verified: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

export function InstanceCard({ instance }: InstanceCardProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Format system info from instance details
  const details = instance.details || {};
  
  // Helper for rendering system info fields
  const renderDetailField = (label: string, value: any) => {
    if (value === undefined || value === null) return null;
    return (
      <li>
        <span className="text-muted-foreground">{label}:</span>{' '}
        {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}
      </li>
    );
  };

  const handleVerify = async () => {
    if (!instance.apiToken) {
      toast({
        type: 'error',
        description: "This instance does not have an API token for verification"
      });
      return;
    }

    setIsRefreshing(true);
    
    try {
      const response = await fetch(`/api/instances/${instance.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: instance.name,
          url: instance.url,
          verify: true
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to verify instance');
      }

      const updatedInstance = await response.json();
      
      toast({
        type: updatedInstance.verified ? 'success' : 'error',
        description: updatedInstance.verified 
          ? `Successfully verified connection to ${instance.name}`
          : `Could not verify connection to ${instance.name}`
      });
      
      // Refresh the instances list
      router.refresh();
    } catch (error) {
      toast({
        type: 'error',
        description: error instanceof Error ? error.message : 'Failed to verify instance'
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/instances/${instance.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete instance');
      }
      
      toast({
        type: 'success',
        description: `Instance ${instance.name} was deleted successfully`
      });
      
      // Refresh the instances list
      router.refresh();
    } catch (error) {
      toast({
        type: 'error',
        description: error instanceof Error ? error.message : 'Failed to delete instance'
      });
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <>
      <Card className="mx-4 md:mx-28 relative">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg font-medium">
                {instance.name}
              </CardTitle>
              <Badge 
                variant={instance.verified ? "default" : "outline"}
                className={instance.verified ? "bg-green-500 hover:bg-green-500" : ""}
              >
                {instance.verified ? (
                  <><CheckCircle className="h-3 w-3 mr-1" /> Verified</>
                ) : (
                  <><XCircle className="h-3 w-3 mr-1" /> Unverified</>
                )}
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleVerify}
                disabled={isRefreshing || !instance.apiToken}
                title={instance.apiToken ? "Refresh instance verification" : "No API token available for verification"}
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open(instance.url, '_blank')}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Instance URL
              </p>
              <p className="text-sm truncate">{instance.url}</p>
            </div>
            {instance.details?.version && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Version</p>
                <p className="text-sm">{instance.details.version}</p>
              </div>
            )}
            {instance.details?.username && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Current User
                </p>
                <p className="text-sm">{instance.details.username}</p>
              </div>
            )}
            {instance.description && (
              <div className="col-span-full">
                <p className="text-sm font-medium text-muted-foreground">
                  Description
                </p>
                <p className="text-sm">{instance.description}</p>
              </div>
            )}
          </div>

          {(instance.verified && instance.details) && (
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
                      User Info
                    </p>
                    <ul className="space-y-1 mt-1">
                      {renderDetailField("Username", details.username)}
                      {renderDetailField("First Name", details.firstName)}
                      {renderDetailField("Last Name", details.lastName)}
                      {renderDetailField("Email", details.email)}
                      {renderDetailField("Organization", details.organisationUnits?.length > 0 
                        ? details.organisationUnits.map((ou: any) => ou.name).join(", ")
                        : "None")}
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Authorities</p>
                    <ul className="space-y-1 mt-1">
                      {details.authorities && Array.isArray(details.authorities) && (
                        details.authorities.length > 10 
                          ? <li>{details.authorities.length} authorities granted</li>
                          : details.authorities.map((auth: string, index: number) => (
                              <li key={index}>{auth}</li>
                            ))
                      )}
                      {(!details.authorities || !Array.isArray(details.authorities)) && (
                        <li>No authorities information available</li>
                      )}
                    </ul>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the instance "{instance.name}" and all its associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
