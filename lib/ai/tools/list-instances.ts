import { Session } from 'next-auth';
import { DataStreamWriter, tool } from 'ai';
import { z } from 'zod';
import { getInstancesByUserId } from '@/lib/db/queries';

interface ListInstancesProps {
  session: Session;
  dataStream: DataStreamWriter;
}

export const listInstances = ({ session, dataStream }: ListInstancesProps) =>
  tool({
    description:
      'List all DHIS2 instances the user has access to and provide information about them.',
    parameters: z.object({
      filter: z
        .enum(['all', 'verified', 'unverified'])
        .optional()
        .default('all')
        .describe('Filter instances by verification status'),
    }),
    execute: async ({ filter }) => {
      // Get the instances for the current user
      if (!session.user?.id) {
        throw new Error('User not authenticated');
      }
      const instances = await getInstancesByUserId(session.user.id);

      // Apply filtering if specified
      const filteredInstances = filter === 'all'
        ? instances
        : instances.filter(instance => 
            filter === 'verified' ? instance.verified : !instance.verified
          );

      // Format instance data for display
      const formattedInstances = filteredInstances.map(instance => ({
        name: instance.name,
        url: instance.url,
        verified: instance.verified,
        description: instance.description || 'No description',
        hasCredentials: !!(instance.username && instance.password),
        hasApiToken: !!instance.apiToken,
        details: instance.details ? 'Available' : 'Not available',
      }));

      dataStream.writeData({
        type: 'instances',
        content: formattedInstances,
      });

      // Return summary
      return {
        count: formattedInstances.length,
        filterApplied: filter,
        instanceList: formattedInstances,
        message: `Found ${formattedInstances.length} ${filter} instance(s).`,
      };
    },
  });