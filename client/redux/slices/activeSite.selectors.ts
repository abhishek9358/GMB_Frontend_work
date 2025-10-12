// slices/activeSite.selectors.ts

import type { RootState } from "../store";

// Selector to get active site
export const selectActiveSite = (state: RootState) =>
  state.activeSite.activeSite;

// Selector to get all sites
export const selectAllSites = (state: RootState) => state.activeSite.allSites;

// Selector to get active site loading state
export const selectActiveSiteLoading = (state: RootState) =>
  state.activeSite.activeSiteLoading;

// Selector to get sites loading state
export const selectSitesLoading = (state: RootState) =>
  state.activeSite.sitesLoading;

// Selector to get active site URL (null-safe)
export const selectActiveSiteUrl = (state: RootState) =>
  state.activeSite.activeSite?.siteUrl || null;

// Selector to check if any site is active
export const selectHasActiveSite = (state: RootState) =>
  state.activeSite.activeSite !== null;

// Selector to get sites count
export const selectSitesCount = (state: RootState) =>
  state.activeSite.allSites.length;
