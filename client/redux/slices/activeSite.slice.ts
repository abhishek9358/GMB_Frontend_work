// slices/activeSite.slice.ts

import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

// Define the Site interface (from Google Search Console API)
export interface Site {
  siteUrl: string; // e.g., "https://example.com/" or "sc-domain:example.com"
  permissionLevel: string; // e.g., "siteOwner", "siteFullUser", "siteRestrictedUser"
}

// Initial state
export interface SiteInitialState {
  activeSite: Site | null;
  allSites: Site[];
  activeSiteLoading: boolean;
  sitesLoading: boolean;
}

const initialState: SiteInitialState = {
  activeSite: null,
  allSites: [],
  activeSiteLoading: false,
  sitesLoading: false,
};

// Slice
const activeSiteSlice = createSlice({
  name: "activeSite",
  initialState,
  reducers: {
    // Set the active site
    setActiveSite: (state, action: PayloadAction<Site>) => {
      state.activeSite = action.payload;
      state.activeSiteLoading = false;
    },

    // Set all available sites
    setAllSites: (state, action: PayloadAction<Site[]>) => {
      state.allSites = action.payload;
      state.sitesLoading = false;

      // If no active site is set and sites exist, set the first one as active
      if (!state.activeSite && action.payload.length > 0) {
        state.activeSite = action.payload[0];
      }
    },

    // Set loading state for active site
    setActiveSiteLoading: (state, action: PayloadAction<boolean>) => {
      state.activeSiteLoading = action.payload;
    },

    // Set loading state for all sites
    setSitesLoading: (state, action: PayloadAction<boolean>) => {
      state.sitesLoading = action.payload;
    },

    // Clear active site
    clearActiveSite: (state) => {
      state.activeSite = null;
      state.activeSiteLoading = false;
    },

    // Clear all sites (useful on logout)
    clearAllSites: (state) => {
      state.activeSite = null;
      state.allSites = [];
      state.activeSiteLoading = false;
      state.sitesLoading = false;
    },

    // Switch to a different site by URL
    switchActiveSite: (state, action: PayloadAction<string>) => {
      const siteUrl = action.payload;
      const site = state.allSites.find((s) => s.siteUrl === siteUrl);
      if (site) {
        state.activeSite = site;
      }
    },
  },
});

// Export actions
export const {
  setActiveSite,
  setAllSites,
  setActiveSiteLoading,
  setSitesLoading,
  clearActiveSite,
  clearAllSites,
  switchActiveSite,
} = activeSiteSlice.actions;

// Export reducer
export default activeSiteSlice.reducer;
