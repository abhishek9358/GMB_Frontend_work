/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

/**
 * Location and business data types
 */
export interface StorefrontAddress {
  addressLines: string[];
  administrativeArea: string;
  languageCode: string;
  locality: string;
  postalCode: string;
  regionCode: string;
}

export interface Location {
  _id: string;
  account: string;
  name: string;
  storefrontAddress: StorefrontAddress;
  title: string;
  status: string[];
  categories: string[];
  verificationState: string;
  accessLevels: string[];
  isSubscribed: boolean;
  whitelabel: Record<string, any>;
  slug: string;
}

export interface StatusBreakdown {
  verified: number;
  unverified: number;
  suspended: number;
  disabled: number;
  googleUpdates: number;
  duplicate: number;
  missingStoreCodes: number;
  incomplete: number;
  verificationPending: number;
  verificationExpired: number;
  unknown: number;
}

export interface CategoryBreakdown {
  totalCategories: number;
  uniqueCategories: number;
  primaryCategories: number;
  additionalCategories: number;
  businessesWithMultipleCategories: number;
  topCategories: string[];
  allCategories: Record<string, number>;
}

export interface Summary {
  totalLocations: number;
  statusBreakdown: StatusBreakdown;
  categoryBreakdown: CategoryBreakdown;
}

export interface LocationsResponse {
  locations: Location[];
  summary: Summary;
}
