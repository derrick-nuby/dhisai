import { Session } from 'next-auth';
import { DataStreamWriter, tool } from 'ai';
import { z } from 'zod';
import { getInstanceById, getInstancesByUserId } from '@/lib/db/queries';

interface DhisRequestProps {
  session: Session;
  dataStream: DataStreamWriter;
}

// Cache for instances to prevent repeated database lookups
const instanceCache: Record<string, any> = {};

export const dhisRequest = ({ session, dataStream }: DhisRequestProps) =>
  tool({
    description:
      'Make a request to any DHIS2 API endpoint. This tool can access any resource on a DHIS2 instance by constructing the appropriate URL path.',
    parameters: z.object({
      instanceIdentifier: z.string().describe('The ID or name of the DHIS2 instance to connect to. If not specified, the first available instance will be used.').optional(),
      path: z.string().describe('The API path relative to the base URL (without leading slash), e.g. "organisationUnits" or "dataElements"'),
      method: z.enum(['GET', 'POST', 'PUT', 'DELETE']).default('GET').describe('HTTP method to use'),
      query: z.record(z.string()).optional().describe('Query parameters to include in the request URL'),
      body: z.record(z.any()).optional().describe('Body content for POST/PUT requests'),
    }),
    execute: async ({ instanceIdentifier, path, method, query, body }) => {
      // Check user authentication
      if (!session.user?.id) {
        throw new Error('User not authenticated');
      }

      const userId = session.user?.id;
      if (!userId) {
        throw new Error('User not authenticated');
      }

      // Get all instances for the current user if not already cached
      if (!instanceCache[userId]) {
        const userInstances = await getInstancesByUserId(userId);
        if (!userInstances || userInstances.length === 0) {
          throw new Error('No DHIS2 instances available. Please add an instance in Settings.');
        }
        
        // Cache instances by both ID and name for easy lookup
        instanceCache[userId] = {
          all: userInstances,
          byId: {},
          byName: {}
        };
        
        userInstances.forEach(inst => {
          instanceCache[userId].byId[inst.id] = inst;
          instanceCache[userId].byName[inst.name.toLowerCase()] = inst;
        });
      }

      let instance;
      const cache = instanceCache[userId];
      
      // Find instance by identifier (could be ID or name)
      if (instanceIdentifier) {
        // Try to find by ID first
        instance = cache.byId[instanceIdentifier];
        
        // If not found by ID, try by name (case insensitive)
        if (!instance) {
          instance = cache.byName[instanceIdentifier.toLowerCase()];
        }
        
        if (!instance) {
          throw new Error(`Instance "${instanceIdentifier}" not found. Available instances: ${cache.all.map((i: { name: any; }) => i.name).join(', ')}`);
        }
      } else {
        // Use the first available instance if no identifier provided
        instance = cache.all[0];
      }

      // Normalize path (remove leading slash if any)
      let apiPath = path;
      if (apiPath.startsWith('/')) {
        apiPath = apiPath.slice(1);
      }
      
      // Make sure we have proper API path
      if (!apiPath.startsWith('api/') && !apiPath.includes('/api/')) {
        apiPath = `api/${apiPath}`;
      }

      // Normalize URL (remove trailing slash if any)
      let baseUrl = instance.url;
      if (baseUrl.endsWith('/')) {
        baseUrl = baseUrl.slice(0, -1);
      }

      // Build the complete API URL
      const apiUrl = new URL(`${baseUrl}/${apiPath}`);
      
      // Add query parameters if provided
      if (query) {
        Object.entries(query).forEach(([key, value]) => {
          apiUrl.searchParams.append(key, value);
        });
      }

      // Build headers
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

      // Add authentication
      if (instance.apiToken) {
        headers['Authorization'] = `ApiToken ${instance.apiToken}`;
      } else if (instance.username && instance.password) {
        const auth = Buffer.from(`${instance.username}:${instance.password}`).toString('base64');
        headers['Authorization'] = `Basic ${auth}`;
      } else {
        throw new Error(`No authentication credentials available for instance "${instance.name}"`);
      }

      try {
        // Log the request for debugging
        console.log(`Making ${method} request to ${apiUrl.toString()}`);
        
        // Make the request
        const response = await fetch(apiUrl.toString(), {
          method,
          headers,
          body: (method === 'POST' || method === 'PUT') && body ? JSON.stringify(body) : undefined,
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`DHIS2 API error: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const data = await response.json();

        // Send the data to the stream
        dataStream.writeData({
          type: 'dhis2-response',
          content: data,
        });

        return {
          success: true,
          statusCode: response.status,
          instanceName: instance.name,
          instanceUrl: instance.url,
          endpoint: apiPath,
          data,
        };
      } catch (error: any) {
        console.error('DHIS2 API request failed:', error);
        return {
          success: false,
          instanceName: instance.name,
          instanceUrl: instance.url,
          endpoint: apiPath,
          error: error.message || 'An error occurred when calling the DHIS2 API',
        };
      }
    },
  });