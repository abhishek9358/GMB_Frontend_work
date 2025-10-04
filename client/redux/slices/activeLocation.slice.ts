// slices/locationSlice.ts

import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

// Define the normalized Location interface (what your app expects internally)
export interface Location {
  id: string; // ← from _id or locationId
  locationId: string; // ← from name or locationId
  title: string;
  address: {
    regionCode: string;
    languageCode: string;
    postalCode: string;
    administrativeArea: string;
    locality: string;
    addressLines: string[];
  };
  phone: string | null;
  websiteUri: string | null;
  category: {
    primaryCategory: {
      name: string;
      displayName: string;
    };
  };
  status: string;
  verification: string;
  metadata: {
    hasGoogleUpdated: boolean;
    hasPendingEdits: boolean;
    canDelete: boolean;
    canModifyServiceList: boolean;
    placeId: string;
    mapsUri: string;
    newReviewUri: string;
    hasVoiceOfMerchant: boolean;
  };
  stats: {
    averageRating: number;
    reviewCount: number;
    // ... other stats you care about
  };
  isActive: boolean;
  rating: number;
  reviewCount: number;
  placeId: string;
  createdAt: string;
  updatedAt: string;
}

// Initial state
export interface LocationInitialState {
  activeLocation: Location | null;
  activeLocationLoading: boolean;
}

const initialState: LocationInitialState = {
  activeLocation: null,
  activeLocationLoading: false,
};

// Normalization function: maps API response to expected Location type
export function normalizeLocation(apiLocation: any): Location {
  const loc = apiLocation;

  // Extract category info from rawGoogleData
  const primaryCategory = loc.rawGoogleData?.categories?.primaryCategory || {};
  const category = {
    primaryCategory: {
      name: primaryCategory.name || "",
      displayName: primaryCategory.displayName || "Unknown",
    },
  };

  // Extract address from storefrontAddress or info
  const address =
    loc.storefrontAddress || loc.info?.businessLocation
      ? {
          regionCode: loc.storefrontAddress?.regionCode || "IN",
          languageCode: loc.storefrontAddress?.languageCode || "en",
          postalCode: loc.storefrontAddress?.postalCode || "",
          administrativeArea: loc.storefrontAddress?.administrativeArea || "",
          locality: loc.storefrontAddress?.locality || "",
          addressLines: loc.storefrontAddress?.addressLines || [
            loc.info?.businessLocation || "",
          ],
        }
      : {
          regionCode: "IN",
          languageCode: "en",
          postalCode: "",
          administrativeArea: "",
          locality: "",
          addressLines: [""],
        };

  // Extract stats
  const stats = loc.stats || {};
  const rating = stats.averageRating || 0;
  const reviewCount = stats.reviewCount || 0;

  // Extract metadata
  const metadata = loc.metadata || {};
  const placeId = loc.placeId || loc.metadata?.placeId || "";
  const mapsUri = loc.metadata?.mapsUri || "";
  const newReviewUri = loc.metadata?.newReviewUri || "";
  const hasGoogleUpdated = metadata.hasGoogleUpdated || false;
  const hasPendingEdits = metadata.hasPendingEdits || false;
  const canDelete = metadata.canDelete || false;
  const canModifyServiceList = metadata.canModifyServiceList || false;
  const hasVoiceOfMerchant = metadata.hasVoiceOfMerchant || false;

  return {
    id: loc._id || loc.locationId || "",
    locationId: loc.name || loc.locationId?.split("/")?.[1] || "",
    title: loc.title || "",
    address,
    phone: null, // Not provided in either API — you may need to add it later
    websiteUri: null, // Not provided — optional to extract from info or rawGoogleData
    category,
    status: loc.stats?.businessStatus || "UNKNOWN",
    verification: loc.stats?.isVerified ? "verified" : "unverified",
    metadata: {
      hasGoogleUpdated,
      hasPendingEdits,
      canDelete,
      canModifyServiceList,
      placeId,
      mapsUri,
      newReviewUri,
      hasVoiceOfMerchant,
    },
    stats: {
      averageRating: rating,
      reviewCount,
      // Add other stats if needed
    },
    isActive: loc.isSubscribed || true, // assume active if subscribed
    rating,
    reviewCount,
    placeId,
    createdAt: loc.createdAt || new Date().toISOString(),
    updatedAt: loc.updatedAt || new Date().toISOString(),
  };
}

// Slice
const locationSlice = createSlice({
  name: "location",
  initialState,
  reducers: {
    setActiveLocation: (state, action: PayloadAction<Location>) => {
      state.activeLocation = action.payload;
      state.activeLocationLoading = false;
    },
    setActiveLocationLoading: (state, action: PayloadAction<boolean>) => {
      state.activeLocationLoading = action.payload;
    },
    clearActiveLocation: (state) => {
      state.activeLocation = null;
      state.activeLocationLoading = false;
    },
  },
});

export const {
  setActiveLocation,
  setActiveLocationLoading,
  clearActiveLocation,
} = locationSlice.actions;

export default locationSlice.reducer;
