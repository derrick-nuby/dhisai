'use client';

import type React from 'react';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/toast';


interface AddInstanceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormErrors {
  name?: string;
  url?: string;
  apiToken?: string;
}

export function AddInstanceModal({
  isOpen,
  onClose,
}: AddInstanceModalProps) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [apiToken, setApiToken] = useState('');
  const [description, setDescription] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isCredentialsOpen, setIsCredentialsOpen] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validate name
    if (!name) {
      newErrors.name = 'Name is required';
    }

    // Validate URL
    if (!url) {
      newErrors.url = 'URL is required';
    } else if (!/^https?:\/\/.+/.test(url)) {
      newErrors.url = 'URL must start with http:// or https://';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/instances', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          url,
          apiToken: apiToken || undefined,
          description: description || undefined,
          username: username || undefined,
          password: password || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add instance');
      }

      const newInstance = await response.json();
      
      toast({
        type: 'success',
        description: `Instance ${name} was added successfully${newInstance.verified ? ' and verified' : ''}`,
      });

      

      // Reset form
      resetForm();
      
      // Close modal
      onClose();
      
      // Refresh the instances list
      router.refresh();
    } catch (error) {
      toast({
        type: 'error',
        description: error instanceof Error ? error.message : 'Failed to add instance',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setName('');
    setUrl('');
    setApiToken('');
    setDescription('');
    setUsername('');
    setPassword('');
    setIsCredentialsOpen(false);
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New DHIS2 Instance</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label
                htmlFor="name"
                className={errors.name ? 'text-destructive' : ''}
              >
                Instance Name
              </Label>
              <Input
                id="name"
                placeholder="My DHIS2 Instance"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) {
                    setErrors({ ...errors, name: undefined });
                  }
                }}
                className={errors.name ? 'border-destructive' : ''}
                disabled={isSubmitting}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label
                htmlFor="url"
                className={errors.url ? 'text-destructive' : ''}
              >
                Instance URL
              </Label>
              <Input
                id="url"
                placeholder="https://play.dhis2.org/demo"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  if (errors.url) {
                    setErrors({ ...errors, url: undefined });
                  }
                }}
                className={errors.url ? 'border-destructive' : ''}
                disabled={isSubmitting}
              />
              {errors.url && (
                <p className="text-xs text-destructive">{errors.url}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label
                htmlFor="apiToken"
                className={errors.apiToken ? 'text-destructive' : ''}
              >
                API Token (PAT)
              </Label>
              <Input
                id="apiToken"
                type="password"
                placeholder="d2pat_XXXXXXXXXXXX"
                value={apiToken}
                onChange={(e) => {
                  setApiToken(e.target.value);
                  if (errors.apiToken) {
                    setErrors({ ...errors, apiToken: undefined });
                  }
                }}
                className={errors.apiToken ? 'border-destructive' : ''}
                disabled={isSubmitting}
              />
              {errors.apiToken && (
                <p className="text-xs text-destructive">{errors.apiToken}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Personal Access Token for API authentication. If provided, we'll verify the instance.
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter instance description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                disabled={isSubmitting}
              />
            </div>

            <Collapsible
              open={isCredentialsOpen}
              onOpenChange={setIsCredentialsOpen}
              className="border rounded-md mt-2"
            >
              <div className="flex items-center justify-between px-4 py-2 border-b">
                <h3 className="text-sm font-medium">Credentials (Optional)</h3>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-0 h-8 w-8" disabled={isSubmitting}>
                    {isCredentialsOpen ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent className="px-4 pb-4 pt-0">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      placeholder="Enter username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Instance'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
