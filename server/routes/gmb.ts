import express from 'express';

const router = express.Router();

// Proxy routes to the actual GMB backend API
// This integrates with the backend API endpoints provided by the user

/**
 * Get detailed business profile information
 * Proxies to the backend GMB API
 */
router.get('/business/:locationName/details', async (req, res) => {
  try {
    const { locationName } = req.params;
    const accessToken = req.headers.authorization?.replace('Bearer ', '');

    if (!accessToken) {
      return res.status(401).json({ 
        success: false,
        error: 'Access token required' 
      });
    }

    // In a real implementation, this would proxy to your backend GMB API
    // For now, we'll return mock data based on the structure you provided
    const mockBusinessProfile = {
      basicInfo: {
        name: locationName,
        title: "Sample Business Profile",
        categories: [
          {
            displayName: "Restaurant",
            categoryId: "gcid:restaurant"
          }
        ],
        description: "A sample business for testing GMB profile management",
        phoneNumbers: [
          {
            label: "PRIMARY",
            phoneNumber: "+1-555-0123"
          }
        ],
        websiteUri: "https://example.com",
        storefrontAddress: {
          regionCode: "US",
          languageCode: "en",
          postalCode: "12345",
          administrativeArea: "CA",
          locality: "San Francisco",
          addressLines: ["123 Main Street"]
        },
        serviceArea: null
      },
      hours: {
        regularHours: {
          periods: [
            {
              openDay: "MONDAY",
              openTime: "09:00",
              closeDay: "MONDAY",
              closeTime: "17:00"
            }
          ]
        },
        specialHours: [],
        moreHours: []
      },
      location: {
        address: {
          regionCode: "US",
          languageCode: "en",
          postalCode: "12345",
          administrativeArea: "CA",
          locality: "San Francisco",
          addressLines: ["123 Main Street"]
        },
        coordinates: {
          latitude: 37.7749,
          longitude: -122.4194
        }
      },
      businessAttributes: {
        accessibility: [],
        amenities: [],
        parking: [],
        serviceOptions: []
      },
      reviews: {
        summary: {
          averageRating: 4.5,
          totalReviewCount: 25
        },
        reviews: []
      },
      media: {
        photos: [],
        coverPhoto: null,
        logo: null
      },
      posts: [],
      performance: null,
      metadata: {
        openInfo: null,
        verificationState: "VERIFIED",
        lastUpdated: new Date().toISOString()
      }
    };

    res.json({
      success: true,
      data: mockBusinessProfile
    });

  } catch (error) {
    console.error('Error fetching business details:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch business details',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get business performance data
 */
router.get('/business/:locationName/performance', async (req, res) => {
  try {
    const { locationName } = req.params;
    const { startDate, endDate } = req.query;

    // Mock performance data based on the structure you provided
    const performanceData = {
      timeRange: {
        startDate: startDate || '2025-03-01',
        endDate: endDate || '2025-08-31'
      },
      metrics: {
        views: 316,
        interactions: {
          march: 54,
          april: 51,
          may: 49,
          june: 46,
          july: 72,
          august: 44
        },
        callsClicks: 0,
        directionsRequests: 0,
        websiteClicks: 0
      },
      discoveryBreakdown: {
        "Google Maps – mobile": 133,
        "Google Search – mobile": 121,
        "Google Search – desktop": 90,
        "Google Maps – desktop": 73
      },
      searchTerms: [
        { term: "sample business", count: "< 15" },
        { term: "test location", count: "< 15" }
      ]
    };

    res.json({
      success: true,
      data: performanceData
    });

  } catch (error) {
    console.error('Error fetching performance data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch performance data',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Bulk fetch details for multiple businesses
 */
router.post('/business/bulk-details', async (req, res) => {
  try {
    const { locationNames } = req.body;
    const accessToken = req.headers.authorization?.replace('Bearer ', '');

    if (!Array.isArray(locationNames) || locationNames.length === 0) {
      return res.status(400).json({ 
        success: false,
        error: 'locationNames array is required' 
      });
    }

    if (!accessToken) {
      return res.status(401).json({ 
        success: false,
        error: 'Access token required' 
      });
    }

    // Mock bulk response
    const results = locationNames.map((locationName: string) => ({
      locationName,
      data: {
        name: locationName,
        title: `Business ${locationName}`,
        categories: [{ displayName: "Business", categoryId: "gcid:business" }],
        storefrontAddress: {
          regionCode: "US",
          languageCode: "en",
          postalCode: "12345",
          administrativeArea: "CA",
          locality: "Sample City",
          addressLines: ["123 Sample St"]
        }
      },
      success: true
    }));

    res.json({
      success: true,
      data: results,
      summary: {
        total: locationNames.length,
        successful: locationNames.length,
        failed: 0
      }
    });

  } catch (error) {
    console.error('Error in bulk fetch:', error);
    res.status(500).json({
      success: false,
      data: [],
      summary: { total: 0, successful: 0, failed: 0 }
    });
  }
});

/**
 * Create a new business profile
 * This would integrate with your backend API
 */
router.post('/business/create', async (req, res) => {
  try {
    const profileData = req.body;
    const accessToken = req.headers.authorization?.replace('Bearer ', '');

    if (!accessToken) {
      return res.status(401).json({ 
        success: false,
        error: 'Access token required' 
      });
    }

    // In a real implementation, this would create the profile via your backend API
    console.log('Creating business profile:', profileData);

    res.json({
      success: true,
      data: {
        ...profileData,
        metadata: {
          ...profileData.metadata,
          lastUpdated: new Date().toISOString()
        }
      }
    });

  } catch (error) {
    console.error('Error creating business profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create business profile',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Update business profile
 */
router.put('/business/:locationName', async (req, res) => {
  try {
    const { locationName } = req.params;
    const profileData = req.body;
    const accessToken = req.headers.authorization?.replace('Bearer ', '');

    if (!accessToken) {
      return res.status(401).json({ 
        success: false,
        error: 'Access token required' 
      });
    }

    // In a real implementation, this would update the profile via your backend API
    console.log('Updating business profile:', locationName, profileData);

    res.json({
      success: true,
      data: {
        ...profileData,
        metadata: {
          ...profileData.metadata,
          lastUpdated: new Date().toISOString()
        }
      }
    });

  } catch (error) {
    console.error('Error updating business profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update business profile',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Delete business profile
 */
router.delete('/business/:locationName', async (req, res) => {
  try {
    const { locationName } = req.params;
    const accessToken = req.headers.authorization?.replace('Bearer ', '');

    if (!accessToken) {
      return res.status(401).json({ 
        success: false,
        error: 'Access token required' 
      });
    }

    // In a real implementation, this would delete the profile via your backend API
    console.log('Deleting business profile:', locationName);

    res.json({
      success: true,
      message: 'Profile deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting business profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete business profile',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export { router as gmbRouter };
