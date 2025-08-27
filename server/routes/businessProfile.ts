import { Request, Response } from "express";
import { google } from "googleapis";

// Initialize Google Business Profile API
const mybusinessbusinessinformation =
  google.mybusinessbusinessinformation("v1");

/**
 * Get detailed business profile information
 * @route GET /api/business/:locationName/details
 * @param {string} locationName - The location name from your listing (e.g., "locations/4304046710796618722")
 */
export async function getBusinessDetails(req: Request, res: Response) {
  try {
    const { locationName } = req.params;
    const accessToken = req.headers.authorization?.replace("Bearer ", "");

    if (!accessToken) {
      return res.status(401).json({
        error: "Access token required",
        message: "Authorization header with Bearer token is required",
      });
    }

    if (!locationName) {
      return res.status(400).json({
        error: "Location name required",
        message: "locationName parameter is required",
      });
    }

    // Set up OAuth2 client
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });

    // Fetch comprehensive business details
    const locationDetails = await mybusinessbusinessinformation.locations.get({
      auth: auth,
      name: locationName,
      readMask:
        "name,title,phoneNumbers,categories,storefrontAddress,websiteUri,regularHours,specialHours,serviceArea,labels,adWordsLocationExtensions,latlng,openInfo,metadata,profile,relationshipData,moreHours",
    });

    // Fetch additional business information (reviews, posts, etc.)
    const [reviewsData, photosData, postsData] = await Promise.allSettled([
      getBusinessReviews(auth, locationName),
      getBusinessPhotos(auth, locationName),
      getBusinessPosts(auth, locationName),
    ]);

    // Combine all data
    const businessData = {
      ...locationDetails.data,
      reviews: reviewsData.status === "fulfilled" ? reviewsData.value : null,
      photos: photosData.status === "fulfilled" ? photosData.value : null,
      posts: postsData.status === "fulfilled" ? postsData.value : null,
    };

    res.json({
      success: true,
      data: businessData,
      message: "Business details retrieved successfully",
    });
  } catch (error: any) {
    console.error("Error fetching business details:", error);

    if (error.code === 401) {
      return res.status(401).json({
        error: "Authentication failed",
        message: "Invalid or expired access token",
      });
    }

    if (error.code === 403) {
      return res.status(403).json({
        error: "Access forbidden",
        message: "You do not have permission to access this business",
      });
    }

    if (error.code === 404) {
      return res.status(404).json({
        error: "Business not found",
        message: "The specified business location was not found",
      });
    }

    res.status(500).json({
      error: "Internal server error",
      message: error.message || "Failed to fetch business details",
    });
  }
}

/**
 * Update business profile information
 * @route PUT /api/business/:locationName/update
 */
export async function updateBusinessProfile(req: Request, res: Response) {
  try {
    const { locationName } = req.params;
    const profileData = req.body;
    const accessToken = req.headers.authorization?.replace("Bearer ", "");

    if (!accessToken) {
      return res.status(401).json({
        error: "Access token required",
        message: "Authorization header with Bearer token is required",
      });
    }

    if (!locationName) {
      return res.status(400).json({
        error: "Location name required",
        message: "locationName parameter is required",
      });
    }

    if (!profileData) {
      return res.status(400).json({
        error: "Profile data required",
        message: "Request body with profile data is required",
      });
    }

    // Set up OAuth2 client
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });

    // Transform the profile data to GMB API format
    const updateData = transformProfileToGMBFormat(profileData);

    // Update the business location
    const updateResult = await mybusinessbusinessinformation.locations.patch({
      auth: auth,
      name: locationName,
      updateMask: generateUpdateMask(updateData),
      requestBody: updateData,
    });

    res.json({
      success: true,
      data: updateResult.data,
      message: "Business profile updated successfully",
    });
  } catch (error: any) {
    console.error("Error updating business profile:", error);

    if (error.code === 401) {
      return res.status(401).json({
        error: "Authentication failed",
        message: "Invalid or expired access token",
      });
    }

    if (error.code === 403) {
      return res.status(403).json({
        error: "Access forbidden",
        message: "You do not have permission to update this business",
      });
    }

    if (error.code === 404) {
      return res.status(404).json({
        error: "Business not found",
        message: "The specified business location was not found",
      });
    }

    res.status(500).json({
      error: "Internal server error",
      message: error.message || "Failed to update business profile",
    });
  }
}

/**
 * Partially update business profile
 * @route PATCH /api/business/:locationName/patch
 */
export async function patchBusinessProfile(req: Request, res: Response) {
  try {
    const { locationName } = req.params;
    const updates = req.body;
    const accessToken = req.headers.authorization?.replace("Bearer ", "");

    if (!accessToken) {
      return res.status(401).json({
        error: "Access token required",
        message: "Authorization header with Bearer token is required",
      });
    }

    // Set up OAuth2 client
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });

    // Transform the updates to GMB API format
    const updateData = transformProfileToGMBFormat(updates);

    // Update only the specified fields
    const updateResult = await mybusinessbusinessinformation.locations.patch({
      auth: auth,
      name: locationName,
      updateMask: generateUpdateMask(updateData),
      requestBody: updateData,
    });

    res.json({
      success: true,
      data: updateResult.data,
      message: "Business profile updated successfully",
    });
  } catch (error: any) {
    console.error("Error patching business profile:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error.message || "Failed to patch business profile",
    });
  }
}

/**
 * Get business reviews
 * @route GET /api/business/:locationName/reviews
 */
export async function getBusinessReviewsRoute(req: Request, res: Response) {
  try {
    const { locationName } = req.params;
    const accessToken = req.headers.authorization?.replace("Bearer ", "");

    if (!accessToken) {
      return res.status(401).json({
        error: "Access token required",
      });
    }

    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });

    const reviews = await getBusinessReviews(auth, locationName);

    res.json({
      success: true,
      data: reviews,
      message: "Business reviews retrieved successfully",
    });
  } catch (error: any) {
    console.error("Error fetching business reviews:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error.message || "Failed to fetch business reviews",
    });
  }
}

/**
 * Get business photos
 * @route GET /api/business/:locationName/photos
 */
export async function getBusinessPhotosRoute(req: Request, res: Response) {
  try {
    const { locationName } = req.params;
    const accessToken = req.headers.authorization?.replace("Bearer ", "");

    if (!accessToken) {
      return res.status(401).json({
        error: "Access token required",
      });
    }

    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });

    const photos = await getBusinessPhotos(auth, locationName);

    res.json({
      success: true,
      data: photos,
      message: "Business photos retrieved successfully",
    });
  } catch (error: any) {
    console.error("Error fetching business photos:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error.message || "Failed to fetch business photos",
    });
  }
}

/**
 * Get business posts
 * @route GET /api/business/:locationName/posts
 */
export async function getBusinessPostsRoute(req: Request, res: Response) {
  try {
    const { locationName } = req.params;
    const accessToken = req.headers.authorization?.replace("Bearer ", "");

    if (!accessToken) {
      return res.status(401).json({
        error: "Access token required",
      });
    }

    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });

    const posts = await getBusinessPosts(auth, locationName);

    res.json({
      success: true,
      data: posts,
      message: "Business posts retrieved successfully",
    });
  } catch (error: any) {
    console.error("Error fetching business posts:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error.message || "Failed to fetch business posts",
    });
  }
}

// Helper functions
async function getBusinessReviews(auth: any, locationName: string) {
  try {
    const mybusinessaccountmanagement =
      google.mybusinessaccountmanagement("v1");
    const reviews = await mybusinessaccountmanagement.locations.reviews.list({
      auth: auth,
      parent: locationName,
    });
    return reviews.data;
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return null;
  }
}

async function getBusinessPhotos(auth: any, locationName: string) {
  try {
    const mybusinessbusinessinformation =
      google.mybusinessbusinessinformation("v1");
    const photos = await mybusinessbusinessinformation.locations.getMedia({
      auth: auth,
      name: locationName,
    });
    return photos.data;
  } catch (error) {
    console.error("Error fetching photos:", error);
    return null;
  }
}

async function getBusinessPosts(auth: any, locationName: string) {
  try {
    const mybusinessbusinessinformation =
      google.mybusinessbusinessinformation("v1");
    const posts = await mybusinessbusinessinformation.locations.localPosts.list(
      {
        auth: auth,
        parent: locationName,
      },
    );
    return posts.data;
  } catch (error) {
    console.error("Error fetching posts:", error);
    return null;
  }
}

function transformProfileToGMBFormat(profile: any) {
  return {
    title: profile.title,
    primaryCategory: profile.category
      ? {
          displayName: profile.category,
        }
      : undefined,
    phoneNumbers: profile.phoneNumbers
      ? {
          primary: profile.phoneNumbers.primary,
          secondary: profile.phoneNumbers.secondary,
        }
      : undefined,
    websiteUri: profile.websiteUri,
    storefrontAddress: profile.storefrontAddress,
    serviceArea: profile.serviceArea,
    regularHours: profile.regularHours,
    specialHours: profile.specialHours,
    moreHours: profile.moreHours,
    // Transform attributes
    attributes: {
      // Accessibility
      wheelchairAccessible: profile.accessibility?.wheelchairAccessible,
      wheelchairAccessibleParking:
        profile.accessibility?.wheelchairAccessibleParking,
      wheelchairAccessibleRestroom:
        profile.accessibility?.wheelchairAccessibleRestroom,
      wheelchairAccessibleSeating:
        profile.accessibility?.wheelchairAccessibleSeating,

      // Amenities
      wifi: profile.amenities?.wifi,
      parking: profile.amenities?.parking,
      delivery: profile.amenities?.delivery,
      takeout: profile.amenities?.takeout,
      dineIn: profile.amenities?.dineIn,
      curbsidePickup: profile.amenities?.curbsidePickup,
      outdoorSeating: profile.amenities?.outdoorSeating,
      liveMusic: profile.amenities?.liveMusic,
      acceptsCreditCards: profile.amenities?.acceptsCreditCards,
      acceptsCash: profile.amenities?.acceptsCash,
      acceptsNfc: profile.amenities?.acceptsNfc,

      // Crowd
      familyFriendly: profile.crowd?.family,
      goodForGroups: profile.crowd?.groups,
      lgbtqFriendly: profile.crowd?.lgbtqFriendly,
      safeSpace: profile.crowd?.safespace,
      touristFriendly: profile.crowd?.touristFriendly,

      // Parking
      freeParking: profile.parking?.freeParking,
      paidParking: profile.parking?.paidParking,
      streetParking: profile.parking?.streetParking,
      valetParking: profile.parking?.valetParking,
      garageParking: profile.parking?.garageParking,

      // Pets
      petsAllowed: profile.pets?.petsAllowed,
      dogFriendly: profile.pets?.dogFriendly,

      // Service Options
      onlineEstimates: profile.serviceOptions?.onlineEstimates,
      onSiteServices: profile.serviceOptions?.onSiteServices,
      languageSpoken: profile.serviceOptions?.languageSpoken,
    },
  };
}

function generateUpdateMask(updateData: any): string {
  const fields: string[] = [];

  if (updateData.title) fields.push("title");
  if (updateData.primaryCategory) fields.push("primaryCategory");
  if (updateData.phoneNumbers) fields.push("phoneNumbers");
  if (updateData.websiteUri) fields.push("websiteUri");
  if (updateData.storefrontAddress) fields.push("storefrontAddress");
  if (updateData.serviceArea) fields.push("serviceArea");
  if (updateData.regularHours) fields.push("regularHours");
  if (updateData.specialHours) fields.push("specialHours");
  if (updateData.moreHours) fields.push("moreHours");
  if (updateData.attributes) fields.push("attributes");

  return fields.join(",");
}
