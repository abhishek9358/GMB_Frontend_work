// GMB Profile API Client Functions

// Detailed attribute interfaces
export interface BusinessAttribute {
  attributeId: string;
  displayName: string;
  values: string[];
  groupDisplayName?: string;
}

export interface OpeningHours {
  periods: Array<{
    openDay: string;
    openTime: string;
    closeDay: string;
    closeTime: string;
  }>;
}

export interface SpecialHours {
  specialHourPeriods: Array<{
    startDate: string;
    endDate: string;
    isClosed: boolean;
    openTime?: string;
    closeTime?: string;
  }>;
}

export interface ContactInfo {
  phoneNumbers: Array<{
    label: string;
    phoneNumber: string;
  }>;
  websiteUri?: string;
  chatEnabled?: boolean;
  chatUrl?: string;
}

export interface LocationInfo {
  storefrontAddress: {
    regionCode: string;
    languageCode: string;
    postalCode: string;
    administrativeArea: string;
    locality: string;
    addressLines: string[];
  };
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  serviceArea?: {
    businessType: string;
    places?: Array<{
      name: string;
      placeId: string;
    }>;
    regionCode?: string;
  };
}

export interface BusinessProfile {
  basicInfo: {
    name: string;
    title: string;
    categories: Array<{
      displayName: string;
      categoryId: string;
      primary?: boolean;
    }>;
    description?: string;
    openingDate?: string;
  };

  contact: ContactInfo;

  location: LocationInfo;

  hours: {
    regularHours?: OpeningHours;
    specialHours?: SpecialHours[];
    moreHours?: Array<{
      hoursTypeId: string;
      displayName: string;
      periods: Array<{
        openDay: string;
        openTime: string;
        closeDay: string;
        closeTime: string;
      }>;
    }>;
  };

  attributes: {
    accessibility: BusinessAttribute[];
    amenities: BusinessAttribute[];
    crowd: BusinessAttribute[];
    parking: BusinessAttribute[];
    pets: BusinessAttribute[];
    serviceOptions: BusinessAttribute[];
    fromTheBusiness: BusinessAttribute[];
  };

  reviews: {
    summary: {
      averageRating: number;
      totalReviewCount: number;
    } | null;
    reviews: any[];
  };

  media: {
    photos: Array<{
      name: string;
      googleUrl: string;
      thumbnailUrl: string;
      description?: string;
      category: string;
    }>;
    coverPhoto?: {
      name: string;
      googleUrl: string;
      thumbnailUrl: string;
    };
    logo?: {
      name: string;
      googleUrl: string;
      thumbnailUrl: string;
    };
  };

  posts: Array<{
    name: string;
    postType: string;
    summary: string;
    callToAction?: {
      actionType: string;
      url: string;
    };
    media?: any[];
    createTime: string;
    updateTime: string;
  }>;

  performance: any;

  metadata: {
    openInfo?: {
      status: string;
      canReopen?: boolean;
      openingDate?: string;
    };
    verificationState?: string;
    lastUpdated: string;
    isPublished?: boolean;
    storeCode?: string;
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

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
  }

  // Get headers with authorization from localStorage
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Get access token from localStorage
    const accessToken = localStorage.getItem('access_token');
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
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

  // Create a new business profile
  async createBusinessProfile(profileData: Partial<BusinessProfile>): Promise<ApiResponse<BusinessProfile>> {
    try {
      const response = await fetch(`${this.baseUrl}/business/create`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating business profile:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create business profile',
      };
    }
  }

  // Update business profile
  async updateBusinessProfile(
    locationName: string,
    profileData: Partial<BusinessProfile>
  ): Promise<ApiResponse<BusinessProfile>> {
    try {
      const response = await fetch(`${this.baseUrl}/business/${encodeURIComponent(locationName)}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating business profile:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update business profile',
      };
    }
  }

  // Delete business profile
  async deleteBusinessProfile(locationName: string): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`${this.baseUrl}/business/${encodeURIComponent(locationName)}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting business profile:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete business profile',
      };
    }
  }

  // Auto-fill profile data from live GMB API
  async autoFillProfileData(locationName: string): Promise<ApiResponse<BusinessProfile>> {
    try {
      const response = await fetch(`${this.baseUrl}/business/${encodeURIComponent(locationName)}/auto-fill`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error auto-filling profile data:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to auto-fill profile data',
      };
    }
  }

  // Push updates to live GMB profile
  async pushToLiveProfile(locationName: string, profileData: Partial<BusinessProfile>): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`${this.baseUrl}/business/${encodeURIComponent(locationName)}/push-live`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error pushing to live profile:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to push updates to live profile',
      };
    }
  }

  // Sync profile with live GMB data
  async syncWithLiveProfile(locationName: string): Promise<ApiResponse<BusinessProfile>> {
    try {
      const response = await fetch(`${this.baseUrl}/business/${encodeURIComponent(locationName)}/sync`, {
        method: 'POST',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error syncing with live profile:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to sync with live profile',
      };
    }
  }

  // Get account information and available locations
  async getAccountLocations(accountId?: string): Promise<ApiResponse<{ locations: Array<{ name: string; title: string; }> }>> {
    try {
      const response = await fetch(`${this.baseUrl}/account/locations${accountId ? `?accountId=${accountId}` : ''}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching account locations:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch account locations',
      };
    }
  }

  // Get list of all business profiles (enhanced with API integration)
  async getBusinessProfiles(): Promise<ApiResponse<BusinessProfile[]>> {
    try {
      // First try to get from the API
      const response = await fetch(`${this.baseUrl}/business/profiles`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (response.ok) {
        const apiData = await response.json();
        if (apiData.success && apiData.data) {
          return apiData;
        }
      }

      // Fallback to localStorage if API is not available
      const localBusinesses = JSON.parse(localStorage.getItem('userBusinesses') || '[]');

      if (localBusinesses.length === 0) {
        return {
          success: true,
          data: [],
        };
      }

      // Convert localStorage data to BusinessProfile format
      const profiles: BusinessProfile[] = localBusinesses.map((business: any) => ({
        basicInfo: {
          name: business.location?.name || business.id,
          title: business.name,
          categories: business.location?.categories || [],
          description: business.location?.profile?.description,
          openingDate: business.location?.openingDate,
        },
        contact: {
          phoneNumbers: business.location?.phoneNumbers || [],
          websiteUri: business.location?.websiteUri,
          chatEnabled: false,
        },
        location: {
          storefrontAddress: business.location?.storefrontAddress || {
            regionCode: 'IN',
            languageCode: 'en',
            postalCode: '',
            administrativeArea: '',
            locality: '',
            addressLines: [business.address || ''],
          },
          coordinates: business.location?.latlng,
          serviceArea: business.location?.serviceArea,
        },
        hours: {
          regularHours: business.location?.regularHours,
          specialHours: business.location?.specialHours || [],
          moreHours: business.location?.moreHours || [],
        },
        attributes: {
          accessibility: business.location?.attributes?.accessibility || [],
          amenities: business.location?.attributes?.amenities || [],
          crowd: business.location?.attributes?.crowd || [],
          parking: business.location?.attributes?.parking || [],
          pets: business.location?.attributes?.pets || [],
          serviceOptions: business.location?.attributes?.serviceOptions || [],
          fromTheBusiness: business.location?.attributes?.fromTheBusiness || [],
        },
        reviews: {
          summary: {
            averageRating: business.rating || 0,
            totalReviewCount: business.reviewCount || 0,
          },
          reviews: [],
        },
        media: {
          photos: business.location?.media?.photos || [],
          coverPhoto: business.location?.profile?.coverPhoto,
          logo: business.location?.profile?.logo,
        },
        posts: business.location?.posts || [],
        performance: null,
        metadata: {
          openInfo: business.location?.openInfo,
          verificationState: business.location?.metadata?.verificationState || 'UNVERIFIED',
          lastUpdated: new Date().toISOString(),
          isPublished: business.location?.metadata?.isPublished,
          storeCode: business.location?.metadata?.storeCode,
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
