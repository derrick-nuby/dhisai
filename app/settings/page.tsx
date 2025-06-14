'use client';

import { useState } from 'react';
import { InstanceList } from '@/components/instance-list';
import { AddInstanceModal } from '@/components/add-instance-modal';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function SettingsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <main className="py-6 mx-4 md:py-16 md:mx-20">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="size-4 mr-2" />
          Add Instance
        </Button>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">DHIS2 Instances</h2>
        <InstanceList />
      </div>

      <AddInstanceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </main>
  );
}
