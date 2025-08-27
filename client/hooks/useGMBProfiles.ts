import { useState, useEffect } from 'react';
import { gmbApi, BusinessProfile } from '../services/gmbApi';

export function useGMBProfiles() {
  const [profiles, setProfiles] = useState<BusinessProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load profiles
  const loadProfiles = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await gmbApi.getBusinessProfiles();
      if (response.success && response.data) {
        setProfiles(response.data);
      } else {
        setError(response.error || 'Failed to load profiles');
      }
    } catch (err) {
      setError('Failed to load profiles');
    } finally {
      setLoading(false);
    }
  };

  // Create profile
  const createProfile = async (profileData: Partial<BusinessProfile>) => {
    try {
      const response = await gmbApi.createBusinessProfile(profileData);
      if (response.success && response.data) {
        setProfiles(prev => [...prev, response.data!]);
        return { success: true };
      } else {
        setError(response.error || 'Failed to create profile');
        return { success: false, error: response.error };
      }
    } catch (err) {
      const errorMessage = 'Failed to create profile';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Update profile
  const updateProfile = async (locationName: string, profileData: Partial<BusinessProfile>) => {
    try {
      const response = await gmbApi.updateBusinessProfile(locationName, profileData);
      if (response.success && response.data) {
        setProfiles(prev => 
          prev.map(p => 
            p.basicInfo.name === locationName ? response.data! : p
          )
        );
        return { success: true };
      } else {
        setError(response.error || 'Failed to update profile');
        return { success: false, error: response.error };
      }
    } catch (err) {
      const errorMessage = 'Failed to update profile';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Delete profile
  const deleteProfile = async (locationName: string) => {
    try {
      const response = await gmbApi.deleteBusinessProfile(locationName);
      if (response.success) {
        setProfiles(prev => prev.filter(p => p.basicInfo.name !== locationName));
        return { success: true };
      } else {
        setError(response.error || 'Failed to delete profile');
        return { success: false, error: response.error };
      }
    } catch (err) {
      const errorMessage = 'Failed to delete profile';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Get profile details
  const getProfileDetails = async (locationName: string) => {
    try {
      const response = await gmbApi.getBusinessDetails(locationName);
      if (response.success && response.data) {
        return { success: true, data: response.data };
      } else {
        setError(response.error || 'Failed to get profile details');
        return { success: false, error: response.error };
      }
    } catch (err) {
      const errorMessage = 'Failed to get profile details';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Get profile performance
  const getProfilePerformance = async (locationName: string, startDate?: string, endDate?: string) => {
    try {
      const response = await gmbApi.getBusinessPerformance(locationName, startDate, endDate);
      if (response.success && response.data) {
        return { success: true, data: response.data };
      } else {
        setError(response.error || 'Failed to get profile performance');
        return { success: false, error: response.error };
      }
    } catch (err) {
      const errorMessage = 'Failed to get profile performance';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Clear error
  const clearError = () => setError(null);

  // Load profiles on mount
  useEffect(() => {
    loadProfiles();
  }, []);

  return {
    profiles,
    loading,
    error,
    loadProfiles,
    createProfile,
    updateProfile,
    deleteProfile,
    getProfileDetails,
    getProfilePerformance,
    clearError,
  };
}
