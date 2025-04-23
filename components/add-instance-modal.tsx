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
import { ChevronDown, ChevronUp } from 'lucide-react';

interface AddInstanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (instance: any) => void;
}

interface FormErrors {
  url?: string;
  token?: string;
}

export function AddInstanceModal({
  isOpen,
  onClose,
  onAdd,
}: AddInstanceModalProps) {
  const [url, setUrl] = useState('');
  const [token, setToken] = useState('');
  const [description, setDescription] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isCredentialsOpen, setIsCredentialsOpen] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validate URL
    if (!url) {
      newErrors.url = 'URL is required';
    } else if (!/^https?:\/\/.+/.test(url)) {
      newErrors.url = 'URL must start with http:// or https://';
    }

    // Validate token
    if (!token) {
      newErrors.token = 'API token is required';
    } else if (token.length < 6) {
      newErrors.token = 'API token must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Create a new instance object with the form data
    const newInstance = {
      contextPath: url,
      systemName: description || 'New Instance',
      version: 'N/A',
      systemId: crypto.randomUUID(),
      databaseInfo: {
        user: username || 'N/A',
      },
      // Add other required fields with default values
      serverDate: new Date().toISOString(),
      serverTimeZoneId: 'Etc/UTC',
      serverTimeZoneDisplayName: 'Coordinated Universal Time',
      calendar: 'iso8601',
      dateFormat: 'yyyy-mm-dd',
    };

    onAdd(newInstance);

    // Reset form
    setUrl('');
    setToken('');
    setDescription('');
    setUsername('');
    setPassword('');
    setIsCredentialsOpen(false);
    setErrors({});
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Instance</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label
                htmlFor="url"
                className={errors.url ? 'text-destructive' : ''}
              >
                Instance URL
              </Label>
              <Input
                id="url"
                placeholder="https://example.com/instance"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  if (errors.url) {
                    setErrors({ ...errors, url: undefined });
                  }
                }}
                className={errors.url ? 'border-destructive' : ''}
              />
              {errors.url && (
                <p className="text-xs text-destructive">{errors.url}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label
                htmlFor="token"
                className={errors.token ? 'text-destructive' : ''}
              >
                API Token
              </Label>
              <Input
                id="token"
                type="password"
                placeholder="Enter API token"
                value={token}
                onChange={(e) => {
                  setToken(e.target.value);
                  if (errors.token) {
                    setErrors({ ...errors, token: undefined });
                  }
                }}
                className={errors.token ? 'border-destructive' : ''}
              />
              {errors.token && (
                <p className="text-xs text-destructive">{errors.token}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter instance description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
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
                  <Button variant="ghost" size="sm" className="p-0 h-8 w-8">
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
                    />
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">Add Instance</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
