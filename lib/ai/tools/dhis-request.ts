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
      console.log(`[dhisRequest] Starting execution with parameters:`, { instanceIdentifier, path, method });
      
      // Check user authentication
      if (!session?.user?.id) {
        console.error('[dhisRequest] User not authenticated');
        throw new Error('User not authenticated');
      }

      const userId = session.user.id;

      // Get all instances for the current user if not already cached
      if (!instanceCache[userId]) {
        console.log(`[dhisRequest] Instances not in cache, fetching for user ${userId}`);
        const userInstances = await getInstancesByUserId(userId);
        
        if (!userInstances || userInstances.length === 0) {
          console.error('[dhisRequest] No DHIS2 instances available for this user');
          throw new Error('No DHIS2 instances available. Please add an instance in Settings.');
        }
        
        console.log(`[dhisRequest] Found ${userInstances.length} instances, building cache`);
        
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
        console.log(`[dhisRequest] Looking for instance: "${instanceIdentifier}"`);
        
        // Try to find by ID first
        instance = cache.byId[instanceIdentifier];
        
        // If not found by ID, try by name (case insensitive)
        if (!instance) {
          instance = cache.byName[instanceIdentifier.toLowerCase()];
        }
        
        if (!instance) {
          const availableInstances = cache.all.map((i: { name: any; }) => i.name).join(', ');
          console.error(`[dhisRequest] Instance "${instanceIdentifier}" not found. Available: ${availableInstances}`);
          throw new Error(`Instance "${instanceIdentifier}" not found. Available instances: ${availableInstances}`);
        }
      } else {
        // Use the first available instance if no identifier provided
        instance = cache.all[0];
        console.log(`[dhisRequest] No instance specified, using default: ${instance.name}`);
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

      console.log(`[dhisRequest] Constructed API URL: ${apiUrl.toString()}`);

      // Build headers
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

      // Add authentication
      if (instance.apiToken) {
        console.log(`[dhisRequest] Using API token authentication`);
        headers['Authorization'] = `ApiToken ${instance.apiToken}`;
      } else if (instance.username && instance.password) {
        console.log(`[dhisRequest] Using Basic authentication with username: ${instance.username}`);
        const auth = Buffer.from(`${instance.username}:${instance.password}`).toString('base64');
        headers['Authorization'] = `Basic ${auth}`;
      } else {
        console.error(`[dhisRequest] No authentication credentials available for instance "${instance.name}"`);
        throw new Error(`No authentication credentials available for instance "${instance.name}"`);
      }

      try {
        // Log the request for debugging
        console.log(`[dhisRequest] Making ${method} request to ${apiUrl.toString()}`);
        
        // Make the request
        const response = await fetch(apiUrl.toString(), {
          method,
          headers,
          body: (method === 'POST' || method === 'PUT') && body ? JSON.stringify(body) : undefined,
        });

        console.log(`[dhisRequest] Received response with status: ${response.status}`);

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`[dhisRequest] API error: ${response.status} ${response.statusText} - ${errorText}`);
          throw new Error(`DHIS2 API error: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const data = await response.json();
        console.log(`[dhisRequest] Successfully parsed response data`);

        // Format the data nicely for a code block
        const formattedResponse = JSON.stringify(data, null, 2);
        
        // Create a formatted message that includes the code block with the response data
        const responseMessage = `
## DHIS2 API Response
**Instance:** ${instance.name}
**Endpoint:** ${apiPath}
**Status:** ${response.status} OK

\`\`\`json
${formattedResponse}
\`\`\`
`;

        // Send the datastream for client-side handling (not displayed directly in chat)
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
          message: responseMessage, // This will be displayed in the chat as formatted markdown
          data: data, // Still include the raw data for potential programmatic use
        };
      } catch (error: any) {
        console.error('[dhisRequest] API request failed:', error);
        
        // Create an error message in a code block for better visualization
        const errorMessage = `
## DHIS2 API Error
**Instance:** ${instance.name}
**Endpoint:** ${apiPath}

\`\`\`
${error.message || 'An error occurred when calling the DHIS2 API'}
\`\`\`
`;

        return {
          success: false,
          instanceName: instance.name,
          instanceUrl: instance.url,
          endpoint: apiPath,
          message: errorMessage, // Formatted error for display
          error: error.message || 'An error occurred when calling the DHIS2 API',
        };
      }
    },
  });