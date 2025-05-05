import axios from 'axios';

interface VerificationResult {
  success: boolean;
  data: any | null;
  error?: string;
}

/**
 * Verify a DHIS2 instance by making an API call to the /api/me endpoint
 * using the provided API token for authentication
 */
export async function verifyDhis2Instance(
  url: string,
  apiToken: string
): Promise<VerificationResult> {
  try {
    // Normalize URL by removing trailing slash if present
    const baseUrl = url.endsWith('/') ? url.slice(0, -1) : url;
    
    // Try to access the /api/me endpoint which returns info about the authenticated user
    const response = await axios.get(`${baseUrl}/api/me`, {
      headers: {
        Authorization: `ApiToken ${apiToken}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000, // 10 second timeout
    });

    if (response.status === 200 && response.data) {
      return {
        success: true,
        data: response.data,
      };
    } else {
      return {
        success: false,
        data: null,
        error: 'Failed to verify DHIS2 instance',
      };
    }
  } catch (error) {
    // Handle different types of errors
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const errorMessage = error.response?.data?.message || error.message;
      
      if (status === 401 || status === 403) {
        return {
          success: false,
          data: null,
          error: 'Authentication failed. Please check your API token.',
        };
      } else if (status === 404) {
        return {
          success: false,
          data: null,
          error: 'DHIS2 API endpoint not found. Please check the URL.',
        };
      } else {
        return {
          success: false,
          data: null,
          error: `Connection error: ${errorMessage}`,
        };
      }
    }
    
    return {
      success: false,
      data: null,
      error: 'Unknown error occurred while verifying DHIS2 instance',
    };
  }
}

/**
 * Fetch system information from a DHIS2 instance
 */
export async function fetchDhis2SystemInfo(
  url: string,
  apiToken: string
): Promise<VerificationResult> {
  try {
    // Normalize URL by removing trailing slash if present
    const baseUrl = url.endsWith('/') ? url.slice(0, -1) : url;
    
    // Request system information
    const response = await axios.get(`${baseUrl}/api/system/info`, {
      headers: {
        Authorization: `ApiToken ${apiToken}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000, // 10 second timeout
    });

    if (response.status === 200 && response.data) {
      return {
        success: true,
        data: response.data,
      };
    } else {
      return {
        success: false,
        data: null,
        error: 'Failed to fetch DHIS2 system information',
      };
    }
  } catch (error) {
    return {
      success: false,
      data: null,
      error: axios.isAxiosError(error) 
        ? error.message 
        : 'Unknown error occurred while fetching system information',
    };
  }
}