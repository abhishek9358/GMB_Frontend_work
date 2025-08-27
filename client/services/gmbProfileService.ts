// GMB Business Profile API Service

export interface BusinessProfile {
  name: string;
  title: string;
  category: string;
  description: string;
  openingDate: string;
  phoneNumbers: {
    primary: string;
    secondary?: string;
  };
  chatEnabled: boolean;
  websiteUri: string;
  storefrontAddress: {
    addressLines: string[];
    locality: string;
    administrativeArea: string;
    postalCode: string;
    regionCode: string;
  };
  serviceArea: {
    businessType: string;
    regionCode: string;
    places: string[];
  };
  regularHours: {
    periods: Array<{
      openDay: string;
      openTime: string;
      closeDay: string;
      closeTime: string;
    }>;
  };
  specialHours: Array<{
    startDate: string;
    endDate: string;
    closed: boolean;
    openTime?: string;
    closeTime?: string;
  }>;
  moreHours: Array<{
    hoursTypeId: string;
    periods: Array<{
      openDay: string;
      openTime: string;
      closeDay: string;
      closeTime: string;
    }>;
  }>;
  accessibility: {
    wheelchairAccessible: boolean;
    wheelchairAccessibleParking: boolean;
    wheelchairAccessibleRestroom: boolean;
    wheelchairAccessibleSeating: boolean;
  };
  amenities: {
    wifi: boolean;
    parking: boolean;
    delivery: boolean;
    takeout: boolean;
    dineIn: boolean;
    curbsidePickup: boolean;
    outdoorSeating: boolean;
    liveMusic: boolean;
    acceptsCreditCards: boolean;
    acceptsCash: boolean;
    acceptsNfc: boolean;
  };
  crowd: {
    family: boolean;
    groups: boolean;
    lgbtqFriendly: boolean;
    safespace: boolean;
    touristFriendly: boolean;
  };
  parking: {
    freeParking: boolean;
    paidParking: boolean;
    streetParking: boolean;
    valetParking: boolean;
    garageParking: boolean;
  };
  pets: {
    petsAllowed: boolean;
    dogFriendly: boolean;
  };
  serviceOptions: {
    onlineEstimates: boolean;
    onSiteServices: boolean;
    languageSpoken: string[];
  };
}

export interface GMBApiResponse {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}

class GMBProfileService {
  private baseUrl = '/api/business';

  /**
   * Get access token from localStorage
   */
  private getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  /**
   * Create request headers with authorization
   */
  private getHeaders(): HeadersInit {
    const token = this.getAccessToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  /**
   * Handle API responses and errors
   */
  private async handleResponse(response: Response): Promise<GMBApiResponse> {
    try {
      const data = await response.json();
      
      if (response.ok) {
        return {
          success: true,
          data,
        };
      } else {
        return {
          success: false,
          error: data.error || 'API request failed',
          message: data.message || `Request failed with status ${response.status}`,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: 'Failed to parse response',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Fetch detailed business profile information
   * @param locationName - The location name from GMB listing (e.g., "locations/4304046710796618722")
   */
  async getBusinessProfile(locationName: string): Promise<GMBApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/${encodeURIComponent(locationName)}/details`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      return await this.handleResponse(response);
    } catch (error) {
      return {
        success: false,
        error: 'Network error',
        message: error instanceof Error ? error.message : 'Failed to fetch business profile',
      };
    }
  }

  /**
   * Update business profile information
   * @param locationName - The location name from GMB listing
   * @param profile - The updated business profile data
   */
  async updateBusinessProfile(locationName: string, profile: BusinessProfile): Promise<GMBApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/${encodeURIComponent(locationName)}/update`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(profile),
      });

      return await this.handleResponse(response);
    } catch (error) {
      return {
        success: false,
        error: 'Network error',
        message: error instanceof Error ? error.message : 'Failed to update business profile',
      };
    }
  }

  /**
   * Patch specific fields of business profile
   * @param locationName - The location name from GMB listing
   * @param updates - Partial business profile data to update
   */
  async patchBusinessProfile(locationName: string, updates: Partial<BusinessProfile>): Promise<GMBApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/${encodeURIComponent(locationName)}/patch`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(updates),
      });

      return await this.handleResponse(response);
    } catch (error) {
      return {
        success: false,
        error: 'Network error',
        message: error instanceof Error ? error.message : 'Failed to patch business profile',
      };
    }
  }

  /**
   * Get business reviews
   * @param locationName - The location name from GMB listing
   */
  async getBusinessReviews(locationName: string): Promise<GMBApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/${encodeURIComponent(locationName)}/reviews`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      return await this.handleResponse(response);
    } catch (error) {
      return {
        success: false,
        error: 'Network error',
        message: error instanceof Error ? error.message : 'Failed to fetch business reviews',
      };
    }
  }

  /**
   * Get business photos
   * @param locationName - The location name from GMB listing
   */
  async getBusinessPhotos(locationName: string): Promise<GMBApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/${encodeURIComponent(locationName)}/photos`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      return await this.handleResponse(response);
    } catch (error) {
      return {
        success: false,
        error: 'Network error',
        message: error instanceof Error ? error.message : 'Failed to fetch business photos',
      };
    }
  }

  /**
   * Get business posts
   * @param locationName - The location name from GMB listing
   */
  async getBusinessPosts(locationName: string): Promise<GMBApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/${encodeURIComponent(locationName)}/posts`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      return await this.handleResponse(response);
    } catch (error) {
      return {
        success: false,
        error: 'Network error',
        message: error instanceof Error ? error.message : 'Failed to fetch business posts',
      };
    }
  }

  /**
   * Validate business profile data before sending
   * @param profile - Business profile data to validate
   */
  validateProfile(profile: BusinessProfile): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Required fields validation
    if (!profile.name?.trim()) {
      errors.push('Business name is required');
    }

    if (!profile.title?.trim()) {
      errors.push('Business title is required');
    }

    if (!profile.category?.trim()) {
      errors.push('Business category is required');
    }

    // Phone number validation
    if (profile.phoneNumbers.primary && !/^\+?[\d\s\-\(\)]+$/.test(profile.phoneNumbers.primary)) {
      errors.push('Invalid primary phone number format');
    }

    // Website URL validation
    if (profile.websiteUri && !/^https?:\/\/.+/.test(profile.websiteUri)) {
      errors.push('Website URL must start with http:// or https://');
    }

    // Address validation
    if (!profile.storefrontAddress.addressLines[0]?.trim()) {
      errors.push('Address line is required');
    }

    if (!profile.storefrontAddress.locality?.trim()) {
      errors.push('City is required');
    }

    if (!profile.storefrontAddress.administrativeArea?.trim()) {
      errors.push('State/Province is required');
    }

    if (!profile.storefrontAddress.postalCode?.trim()) {
      errors.push('Postal code is required');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Transform API response data to BusinessProfile format
   * @param apiData - Raw data from GMB API
   */
  transformApiDataToProfile(apiData: any): BusinessProfile {
    return {
      name: apiData.name || '',
      title: apiData.title || '',
      category: apiData.primaryCategory?.displayName || '',
      description: apiData.description || '',
      openingDate: apiData.openInfo?.openingDate || '',
      phoneNumbers: {
        primary: apiData.phoneNumbers?.primary || '',
        secondary: apiData.phoneNumbers?.secondary || '',
      },
      chatEnabled: apiData.chatEnabled || false,
      websiteUri: apiData.websiteUri || '',
      storefrontAddress: {
        addressLines: apiData.storefrontAddress?.addressLines || [''],
        locality: apiData.storefrontAddress?.locality || '',
        administrativeArea: apiData.storefrontAddress?.administrativeArea || '',
        postalCode: apiData.storefrontAddress?.postalCode || '',
        regionCode: apiData.storefrontAddress?.regionCode || 'US',
      },
      serviceArea: {
        businessType: apiData.serviceArea?.businessType || 'CUSTOMER_LOCATION_ONLY',
        regionCode: apiData.serviceArea?.regionCode || 'US',
        places: apiData.serviceArea?.places || [],
      },
      regularHours: {
        periods: apiData.regularHours?.periods || [],
      },
      specialHours: apiData.specialHours || [],
      moreHours: apiData.moreHours || [],
      accessibility: {
        wheelchairAccessible: apiData.attributes?.wheelchairAccessible || false,
        wheelchairAccessibleParking: apiData.attributes?.wheelchairAccessibleParking || false,
        wheelchairAccessibleRestroom: apiData.attributes?.wheelchairAccessibleRestroom || false,
        wheelchairAccessibleSeating: apiData.attributes?.wheelchairAccessibleSeating || false,
      },
      amenities: {
        wifi: apiData.attributes?.wifi || false,
        parking: apiData.attributes?.parking || false,
        delivery: apiData.attributes?.delivery || false,
        takeout: apiData.attributes?.takeout || false,
        dineIn: apiData.attributes?.dineIn || false,
        curbsidePickup: apiData.attributes?.curbsidePickup || false,
        outdoorSeating: apiData.attributes?.outdoorSeating || false,
        liveMusic: apiData.attributes?.liveMusic || false,
        acceptsCreditCards: apiData.attributes?.acceptsCreditCards || false,
        acceptsCash: apiData.attributes?.acceptsCash || false,
        acceptsNfc: apiData.attributes?.acceptsNfc || false,
      },
      crowd: {
        family: apiData.attributes?.familyFriendly || false,
        groups: apiData.attributes?.goodForGroups || false,
        lgbtqFriendly: apiData.attributes?.lgbtqFriendly || false,
        safespace: apiData.attributes?.safeSpace || false,
        touristFriendly: apiData.attributes?.touristFriendly || false,
      },
      parking: {
        freeParking: apiData.attributes?.freeParking || false,
        paidParking: apiData.attributes?.paidParking || false,
        streetParking: apiData.attributes?.streetParking || false,
        valetParking: apiData.attributes?.valetParking || false,
        garageParking: apiData.attributes?.garageParking || false,
      },
      pets: {
        petsAllowed: apiData.attributes?.petsAllowed || false,
        dogFriendly: apiData.attributes?.dogFriendly || false,
      },
      serviceOptions: {
        onlineEstimates: apiData.attributes?.onlineEstimates || false,
        onSiteServices: apiData.attributes?.onSiteServices || false,
        languageSpoken: apiData.attributes?.languageSpoken || [],
      },
    };
  }

  /**
   * Transform BusinessProfile to GMB API format
   * @param profile - BusinessProfile data
   */
  transformProfileToApiData(profile: BusinessProfile): any {
    return {
      title: profile.title,
      primaryCategory: {
        displayName: profile.category,
      },
      description: profile.description,
      phoneNumbers: {
        primary: profile.phoneNumbers.primary,
        secondary: profile.phoneNumbers.secondary,
      },
      websiteUri: profile.websiteUri,
      storefrontAddress: profile.storefrontAddress,
      serviceArea: profile.serviceArea,
      regularHours: profile.regularHours,
      specialHours: profile.specialHours,
      moreHours: profile.moreHours,
      attributes: {
        ...profile.accessibility,
        ...profile.amenities,
        ...profile.crowd,
        ...profile.parking,
        ...profile.pets,
        ...profile.serviceOptions,
      },
    };
  }
}

// Export singleton instance
export const gmbProfileService = new GMBProfileService();
export default gmbProfileService;
