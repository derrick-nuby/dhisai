'use client';

import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { memo } from 'react';
import { UseChatHelpers } from '@ai-sdk/react';

interface SuggestedActionsProps {
  chatId: string;
  append: UseChatHelpers['append'];
}

function PureSuggestedActions({ chatId, append }: SuggestedActionsProps) {
  const suggestedActions = [
    {
      title: 'What is DHIS2 and',
      label: 'how can you, as an AI, help analyze its data?',
      action: 'What is DHIS2 and how can you, as an AI, help analyze its data?',
    },    
    {
      title: 'Write a report on',
      label: `the current immunization rates across Rwanda`,
      action: `Write a report on the current immunization rates across Rwanda`,
    },
    {
      title: 'What is the prevalence',
      label: 'of HIV in Kigali during Q2 2025?',
      action: 'What is the prevalence of HIV in Kigali during Q2 2025?',
    },
    {
      title: 'Show me the data',
      label: 'on vaccine distribution across rural health centers?',
      action: 'Show me the data on vaccine distribution across rural health centers?',
    },
];


  return (
    <div
      data-testid="suggested-actions"
      className="grid sm:grid-cols-2 gap-2 w-full"
    >
      {suggestedActions.map((suggestedAction, index) => (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ delay: 0.05 * index }}
          key={`suggested-action-${suggestedAction.title}-${index}`}
          className={index > 1 ? 'hidden sm:block' : 'block'}
        >
          <Button
            variant="ghost"
            onClick={async () => {
              window.history.replaceState({}, '', `/chat/${chatId}`);

              append({
                role: 'user',
                content: suggestedAction.action,
              });
            }}
            className="text-left border rounded-xl px-4 py-3.5 text-sm flex-1 gap-1 sm:flex-col w-full h-auto justify-start items-start"
          >
            <span className="font-medium">{suggestedAction.title}</span>
            <span className="text-muted-foreground">
              {suggestedAction.label}
            </span>
          </Button>
        </motion.div>
      ))}
    </div>
  );
}

export const SuggestedActions = memo(PureSuggestedActions, () => true);
