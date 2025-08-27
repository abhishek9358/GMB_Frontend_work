// GMB Profile API Client Functions

export interface BusinessProfile {
  basicInfo: {
    name: string;
    title: string;
    categories: Array<{
      displayName: string;
      categoryId: string;
    }>;
    description?: string;
    phoneNumbers: Array<{
      label: string;
      phoneNumber: string;
    }>;
    websiteUri?: string;
    storefrontAddress: {
      regionCode: string;
      languageCode: string;
      postalCode: string;
      administrativeArea: string;
      locality: string;
      addressLines: string[];
    };
    serviceArea?: any;
  };
  hours: {
    regularHours?: {
      periods: Array<{
        openDay: string;
        openTime: string;
        closeDay: string;
        closeTime: string;
      }>;
    };
    specialHours?: any[];
    moreHours?: any[];
  };
  location: {
    address: any;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  businessAttributes: {
    accessibility?: any[];
    amenities?: any[];
    parking?: any[];
    serviceOptions?: any[];
  };
  reviews: {
    summary: {
      averageRating: number;
      totalReviewCount: number;
    } | null;
    reviews: any[];
  };
  media: {
    photos: any[];
    coverPhoto?: any;
    logo?: any;
  };
  posts: any[];
  performance: any;
  metadata: {
    openInfo?: any;
    verificationState?: string;
    lastUpdated: string;
  };
}

export interface PerformanceData {
  timeRange: {
    startDate: string;
    endDate: string;
  };
  metrics: {
    views: number;
    interactions: Record<string, number>;
    callsClicks: number;
    directionsRequests: number;
    websiteClicks: number;
  };
  discoveryBreakdown: Record<string, number>;
  searchTerms: Array<{
    term: string;
    count: string;
  }>;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface BulkResponse {
  success: boolean;
  data: Array<{
    locationName: string;
    data?: any;
    error?: string;
    success: boolean;
  }>;
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
}

class GMBApiClient {
  private baseUrl: string;
  private accessToken: string | null = null;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
  }

  // Set access token for authenticated requests
  setAccessToken(token: string) {
    this.accessToken = token;
  }

  // Get headers with authorization
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    return headers;
  }

  // Get detailed business profile information
  async getBusinessDetails(locationName: string): Promise<ApiResponse<BusinessProfile>> {
    try {
      const response = await fetch(`${this.baseUrl}/business/${encodeURIComponent(locationName)}/details`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching business details:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch business details',
      };
    }
  }

  // Get business performance data
  async getBusinessPerformance(
    locationName: string,
    startDate?: string,
    endDate?: string
  ): Promise<ApiResponse<PerformanceData>> {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const url = `${this.baseUrl}/business/${encodeURIComponent(locationName)}/performance${
        params.toString() ? `?${params.toString()}` : ''
      }`;

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching business performance:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch business performance',
      };
    }
  }

  // Bulk fetch details for multiple businesses
  async getBulkBusinessDetails(locationNames: string[]): Promise<BulkResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/business/bulk-details`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ locationNames }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error in bulk fetch:', error);
      return {
        success: false,
        data: [],
        summary: { total: 0, successful: 0, failed: 0 },
      };
    }
  }

  // Create a new business profile (placeholder - would need actual create endpoint)
  async createBusinessProfile(profileData: Partial<BusinessProfile>): Promise<ApiResponse<BusinessProfile>> {
    try {
      // This would be implemented when you have a create endpoint
      // For now, we'll simulate with localStorage or return a placeholder
      console.log('Create business profile:', profileData);
      
      return {
        success: true,
        data: profileData as BusinessProfile,
      };
    } catch (error) {
      console.error('Error creating business profile:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create business profile',
      };
    }
  }

  // Update business profile (placeholder - would need actual update endpoint)
  async updateBusinessProfile(
    locationName: string,
    profileData: Partial<BusinessProfile>
  ): Promise<ApiResponse<BusinessProfile>> {
    try {
      // This would be implemented when you have an update endpoint
      console.log('Update business profile:', locationName, profileData);
      
      return {
        success: true,
        data: profileData as BusinessProfile,
      };
    } catch (error) {
      console.error('Error updating business profile:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update business profile',
      };
    }
  }

  // Delete business profile (placeholder - would need actual delete endpoint)
  async deleteBusinessProfile(locationName: string): Promise<ApiResponse<void>> {
    try {
      // This would be implemented when you have a delete endpoint
      console.log('Delete business profile:', locationName);
      
      return {
        success: true,
      };
    } catch (error) {
      console.error('Error deleting business profile:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete business profile',
      };
    }
  }

  // Get list of all business profiles (placeholder - aggregates from localStorage and API)
  async getBusinessProfiles(): Promise<ApiResponse<BusinessProfile[]>> {
    try {
      // For now, we'll get from localStorage businesses and fetch details for each
      const localBusinesses = JSON.parse(localStorage.getItem('userBusinesses') || '[]');
      
      if (localBusinesses.length === 0) {
        return {
          success: true,
          data: [],
        };
      }

      // If we have location names, we could fetch details for each
      // For now, return the localStorage data in the expected format
      const profiles: BusinessProfile[] = localBusinesses.map((business: any) => ({
        basicInfo: {
          name: business.location?.name || business.id,
          title: business.name,
          categories: business.location?.categories || [],
          description: business.location?.profile?.description,
          phoneNumbers: business.location?.phoneNumbers || [],
          websiteUri: business.location?.websiteUri,
          storefrontAddress: business.location?.storefrontAddress || {
            regionCode: '',
            languageCode: '',
            postalCode: '',
            administrativeArea: '',
            locality: '',
            addressLines: [business.address || ''],
          },
          serviceArea: business.location?.serviceArea,
        },
        hours: {
          regularHours: business.location?.regularHours,
          specialHours: business.location?.specialHours,
          moreHours: business.location?.moreHours,
        },
        location: {
          address: business.location?.storefrontAddress,
          coordinates: business.location?.latlng,
        },
        businessAttributes: {
          accessibility: [],
          amenities: [],
          parking: [],
          serviceOptions: [],
        },
        reviews: {
          summary: {
            averageRating: business.rating || 0,
            totalReviewCount: business.reviewCount || 0,
          },
          reviews: [],
        },
        media: {
          photos: [],
          coverPhoto: business.location?.profile?.coverPhoto,
          logo: business.location?.profile?.logo,
        },
        posts: [],
        performance: null,
        metadata: {
          openInfo: business.location?.openInfo,
          verificationState: business.location?.metadata?.verificationState,
          lastUpdated: new Date().toISOString(),
        },
      }));

      return {
        success: true,
        data: profiles,
      };
    } catch (error) {
      console.error('Error fetching business profiles:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch business profiles',
      };
    }
  }
}

// Export singleton instance
export const gmbApi = new GMBApiClient();

// Export types and client class
export { GMBApiClient };
