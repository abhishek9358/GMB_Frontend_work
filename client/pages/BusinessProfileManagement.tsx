import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { SERVER } from "@/constants";
import { RootState } from "@/redux/store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useFormik } from "formik";
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  CheckCircle,
  Clock,
  Loader2,
  MapPin,
  Phone,
  RefreshCw,
  Save,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import * as Yup from "yup";

// Define TypeScript interfaces (unchanged)
interface BusinessProfile {
  name: string;
  title: string;
  category: string;
  description: string;
  openingDate: string;
  phoneNumbers: {
    primary: string;
    secondary: string;
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
  specialHours: any[];
  moreHours: any[];
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

interface ApiResponse {
  location: {
    _id: string;
    name: string;
    account: string;
    title: string;
    category?: string;
    description?: string;
    phoneNumbers?: {
      primary: string;
      secondary?: string;
    };
    websiteUri?: string;
    storefrontAddress: {
      regionCode: string;
      languageCode: string;
      postalCode: string;
      administrativeArea: string;
      locality: string;
      addressLines: string[];
    };
    rawGoogleData: {
      regularHours: Array<{
        openDay: string;
        openTime: { hours: number; minutes?: number };
        closeDay: string;
        closeTime: { hours: number; minutes?: number };
      }>;
      specialHours: any;
      moreHours: any[];
      profile: any;
      serviceArea: any;
    };
    stats: {
      hasWebsite: boolean;
      hasPhoneNumber: boolean;
      hasRegularHours: boolean;
      isVerified?: boolean;
    };
  };
}

interface ILocation {
  _id: string;
  name: string;
  __v: number;
  info: {
    accountHandoverEmail: boolean;
    businessCategory: string | null;
    businessCategoryId: string | null;
    businessLocation: string;
    cities: string[];
    seoKeywords: string[];
    reviewIdea: string;
    copyGBPImagesLastRun: string;
    profileCompleteness: number;
    serviceItemsCount: number;
    attributesCount: number;
    daysOpenPerWeek: number;
    isAlwaysOpen: boolean;
  };
  latlng: {
    latitude: number;
    longitude: number;
  };
  metadata: {
    canModifyServiceList: boolean;
    mapsUri: string;
    newReviewUri: string;
    placeId: string;
    hasGoogleUpdated: boolean;
    canDelete: boolean;
    hasVoiceOfMerchant: boolean;
    photoCount: number;
  };
  placeInfo: {
    placeIds: string[];
  };
  responseLanguage: string;
  storefrontAddress: {
    regionCode: string;
    languageCode: string;
    postalCode: string;
    administrativeArea: string;
    locality: string;
    addressLines: string[];
  };
  title: string;
  slug: string;
  stats: {
    averageRating: number;
    reviewCount: number;
    photoCount: number;
    automationScore: number;
    optimisationScore: number;
    engagementScore: number;
    profileCompletenessScore: number;
    serviceItemsCount: number;
    attributesCount: number;
    daysOpenPerWeek: number;
    hasWebsite: boolean;
    hasPhoneNumber: boolean;
    lastUpdated: string;
    dataFetchedAt: string;
    insights: Record<string, any>;
    completenessFactors: {
      has_website: boolean;
      has_phone: boolean;
      has_regular_hours: boolean;
      has_address: boolean;
      has_categories: boolean;
      has_services: boolean;
    };
    businessStatus: string;
    canReopen: boolean;
    isVerified: boolean;
    hasRegularHours: boolean;
    hasSpecialHours: boolean;
    hasMoreHours: boolean;
  };
  accessLevels: {
    accessLevel: string;
    isOverdue: boolean;
  }[];
  isSubscribed: boolean;
  rawGoogleData: {
    serviceItems: any[];
    labels: any[];
    regularHours: {
      openDay: string;
      openTime: {
        hours: number;
      };
      closeDay: string;
      closeTime: {
        hours: number;
      };
    }[];
    specialHours: Record<string, any>;
    moreHours: any[];
    openInfo: {
      status: string;
      canReopen: boolean;
    };
    categories: Record<string, any>;
    profile: Record<string, any>;
    relationshipData: Record<string, any>;
    serviceArea: Record<string, any>;
    adWordsLocationExtensions: Record<string, any>;
    storeCode: string;
  };
}

// Validation schema using Yup (unchanged)
const validationSchema = Yup.object({
  name: Yup.string().required("Business name is required"),
  title: Yup.string().required("Business title is required"),
  category: Yup.string().required("Business category is required"),
  storefrontAddress: Yup.object({
    addressLines: Yup.array().of(
      Yup.string().required("Address line is required"),
    ),
    locality: Yup.string().required("City is required"),
    administrativeArea: Yup.string().required("State/Province is required"),
    postalCode: Yup.string().required("Postal code is required"),
  }),
});

// Days of the week and business categories (unchanged)
const daysOfWeek = [
  { value: "MONDAY", label: "Monday" },
  { value: "TUESDAY", label: "Tuesday" },
  { value: "WEDNESDAY", label: "Wednesday" },
  { value: "THURSDAY", label: "Thursday" },
  { value: "FRIDAY", label: "Friday" },
  { value: "SATURDAY", label: "Saturday" },
  { value: "SUNDAY", label: "Sunday" },
];

const businessCategories = [
  "Apartment building",
  "Restaurant",
  "Retail store",
  "Service business",
  "Medical practice",
  "Legal services",
  "Automotive",
  "Beauty salon",
  "Gym/Fitness center",
  "Hotel/Lodging",
  "Other",
];

// Utility function to get changed fields and their paths
const getChangedFields = (
  initialValues: any,
  currentValues: any,
  prefix: string = "",
): { changed: any; paths: string[] } => {
  const changed: any = {};
  const paths: string[] = [];

  function build(initial: any, current: any, currentPrefix: string): any {
    if (current === undefined) {
      return undefined;
    }

    if (initial === current) {
      return undefined;
    }

    if (typeof current !== "object" || current === null) {
      paths.push(currentPrefix);
      return current;
    }

    if (Array.isArray(current)) {
      const initialArr = Array.isArray(initial) ? initial : [];
      if (JSON.stringify(initialArr) !== JSON.stringify(current)) {
        paths.push(currentPrefix);
        return current;
      }
      return undefined;
    }

    // object
    const subChanged: any = {};
    let hasChange = false;
    Object.keys(current).forEach((key) => {
      const subInitial = initial ? initial[key] : undefined;
      const subCurrent = current[key];
      const newPrefix = currentPrefix ? `${currentPrefix}.${key}` : key;
      const sub = build(subInitial, subCurrent, newPrefix);
      if (sub !== undefined) {
        subChanged[key] = sub;
        hasChange = true;
      }
    });

    if (hasChange) {
      return subChanged;
    }
    return undefined;
  }

  const nested = build(initialValues, currentValues, prefix);
  return { changed: nested || {}, paths };
};

// API service to fetch and update business profile
const apiService = {
  getBusinessProfile: async (locationId: string, accountId: string) => {
    console.log(
      `Fetching business profile for locationId: ${locationId}, accountId: ${accountId}`,
    );
    const response = await axios.get<ApiResponse>(
      `${SERVER}/api/v1/locations/${locationId}?account_id=${accountId}`,
      { withCredentials: true },
    );
    console.log("API Response:", response.data);
    return response.data;
  },
  patchBusinessProfile: async (
    accountId: string,
    locationId: string,
    payload: { location: Partial<BusinessProfile>; updateMask: string },
  ) => {
    console.log(
      `Patching business profile for accountId: ${accountId}, locationId: ${locationId} with payload:`,
      payload,
    );
    const response = await axios.patch(
      `${SERVER}/api/v1/accounts/${accountId}/locations/${locationId}`,

      payload,
      {
        withCredentials: true,
      },
    );
    console.log("Patch API Response:", response.data);
    return response.data;
  },
};

const transformApiDataToProfile = (data: any): BusinessProfile => {
  // Helper function to format time with minutes
  const formatTime = (
    timeObj: { hours: number; minutes?: number } | undefined,
  ) => {
    if (!timeObj) return "09:00";
    const hours = String(timeObj.hours).padStart(2, "0");
    const minutes = String(timeObj.minutes || 0).padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  // Helper function to format opening date
  const formatOpeningDate = (openingDateObj: any) => {
    if (!openingDateObj) return "";
    const { year, month, day } = openingDateObj;
    if (!year || !month || !day) return "";
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  };

  return {
    name: data?.title || "",
    title: data?.title || "",
    category: data?.primaryCategoryName || "",
    description: data?.description || "",
    openingDate: formatOpeningDate(data?.rawGoogleData?.openInfo?.openingDate),
    phoneNumbers: {
      primary:
        data?.phone || data?.rawGoogleData?.phoneNumbers?.primaryPhone || "",
      secondary: "",
    },
    chatEnabled: false,
    websiteUri: data?.websiteUri || "",
    storefrontAddress: {
      addressLines: data?.rawGoogleData?.storefrontAddress?.addressLines || [
        data?.street || "",
      ],
      locality:
        data?.city || data?.rawGoogleData?.storefrontAddress?.locality || "",
      administrativeArea:
        data?.state ||
        data?.rawGoogleData?.storefrontAddress?.administrativeArea ||
        "",
      postalCode:
        data?.postalCode ||
        data?.rawGoogleData?.storefrontAddress?.postalCode ||
        "",
      regionCode:
        data?.regionCode ||
        data?.rawGoogleData?.storefrontAddress?.regionCode ||
        "IN",
    },
    serviceArea: {
      businessType: "BUSINESS_LOCATION_ONLY",
      regionCode:
        data?.regionCode ||
        data?.rawGoogleData?.storefrontAddress?.regionCode ||
        "IN",
      places: [],
    },
    regularHours: {
      periods:
        data?.regularHours?.periods?.map((period: any) => ({
          openDay: period.openDay || "MONDAY",
          openTime: formatTime(period.openTime),
          closeDay: period.closeDay || "MONDAY",
          closeTime: formatTime(period.closeTime),
        })) || [],
    },
    specialHours: data?.specialHours || data?.rawGoogleData?.specialHours || [],
    moreHours: data?.moreHours || data?.rawGoogleData?.moreHours || [],
    accessibility: {
      wheelchairAccessible: false,
      wheelchairAccessibleParking: false,
      wheelchairAccessibleRestroom: false,
      wheelchairAccessibleSeating: false,
    },
    amenities: {
      wifi: false,
      parking: false,
      delivery: false,
      takeout: false,
      dineIn: false,
      curbsidePickup: false,
      outdoorSeating: false,
      liveMusic: false,
      acceptsCreditCards: false,
      acceptsCash: false,
      acceptsNfc: false,
    },
    crowd: {
      family: false,
      groups: false,
      lgbtqFriendly: false,
      safespace: false,
      touristFriendly: false,
    },
    parking: {
      freeParking: false,
      paidParking: false,
      streetParking: false,
      valetParking: false,
      garageParking: false,
    },
    pets: {
      petsAllowed: false,
      dogFriendly: false,
    },
    serviceOptions: {
      onlineEstimates: false,
      onSiteServices: false,
      languageSpoken: [],
    },
  };
};

export default function BusinessProfileManagement() {
  const [location, setLocation] = useState<ILocation | null>(null);
  const { locationName, accountId } = useParams<{
    locationName: string;
    accountId: string;
  }>();
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useSelector((state: RootState) => state.user);
  const params = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("business-info");

  // Define tab order for navigation
  const tabsOrder = ["business-info", "contact", "location", "hours", "more"];

  // Fetch location details
  async function fetchLocationDetails({ id }: { id: string }) {
    setIsLoading(true);
    try {
      const res = await axios.get(`${SERVER}/api/v1/locations/${id}?account_id=${user?.accountId}`, {
        withCredentials: true,
      });
      console.log("LocationDetails", res.data);
      if (res.data?.location) {
        setLocation(res.data.location);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Failed to fetch location details", error);
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (params?.locationId && user) {
      fetchLocationDetails({ id: params?.locationId });
    }
  }, [params?.locationId, user]);

  const initialValues: BusinessProfile = transformApiDataToProfile(null);

  const formik = useFormik<BusinessProfile>({
    initialValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setStatus }) => {
      // Get changed fields and their paths
      const { changed, paths } = getChangedFields(formik.initialValues, values);
      console.log("Changed data:", changed);
      console.log("Changed paths:", paths);

      if (Object.keys(changed).length === 0) {
        console.log("No changes detected");
        return;
      }

      // Prepare payload with location and updateMask
      const payload = {
        location: changed,
        updateMask: paths.join(","),
      };

      console.log("Submitting form with payload:", payload);

      updateProfileMutation.mutate({
        accountId: user?.accountId || "",
        locationId: params?.locationId || "",
        payload,
      });
    },
  });

  console.log("Formik errors:", formik.errors);

  useEffect(() => {
    if (location) {
      formik.setValues(transformApiDataToProfile(location));
    }
  }, [location]);

  // Mutation for updating profile with PATCH
  const updateProfileMutation = useMutation({
    mutationFn: ({
      accountId,
      locationId,
      payload,
    }: {
      accountId: string;
      locationId: string;
      payload: { location: Partial<BusinessProfile>; updateMask: string };
    }) => apiService.patchBusinessProfile(accountId, locationId, payload),
    onSuccess: (response) => {
      console.log("Profile patch successful:", response);
      queryClient.invalidateQueries({
        queryKey: ["businessProfile", locationName, accountId],
      });
      formik.setStatus("success");
      setTimeout(() => formik.setStatus("idle"), 3000);
    },
    onError: (err) => {
      console.error("Error patching profile:", err);
      formik.setStatus("error");
    },
  });

  // Add hours period
  const addHoursPeriod = () => {
    formik.setFieldValue("regularHours.periods", [
      ...formik.values.regularHours.periods,
      {
        openDay: "MONDAY",
        openTime: "09:00",
        closeDay: "MONDAY",
        closeTime: "17:00",
      },
    ]);
  };

  // Remove hours period
  const removeHoursPeriod = (index: number) => {
    formik.setFieldValue(
      "regularHours.periods",
      formik.values.regularHours.periods.filter((_, i) => i !== index),
    );
  };

  // Add these state variables at the top of your component (after other useState declarations)
  const [aiSuggestionsLoading, setAiSuggestionsLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [aiSuggestionsError, setAiSuggestionsError] = useState(null);

  // Add these functions after your other function declarations
  // Function to generate AI suggestions
  const handleGenerateAISuggestions = async () => {
    setAiSuggestionsLoading(true);
    setAiSuggestionsError(null);

    try {
      // Get locationId and accountId from the component's state/params
      const locationId = params?.locationId;
      const accountId = user?.accountId;

      if (!locationId || !accountId) {
        setAiSuggestionsError('Missing location ID or account ID. Please try refreshing the page.');
        return;
      }

      const response = await axios.post(
        `${SERVER}/api/v1/locations/${locationId}/description-suggestions?account_id=${accountId}&tone_preference=all`,
        {}, // Empty body since it's a POST request
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      if (response.data.success && response.data.data && response.data.data.suggestions) {
        setAiSuggestions({
          professional: response.data.data.suggestions.professional,
          modern: response.data.data.suggestions.modern,
          friendly: response.data.data.suggestions.friendly
        });
      } else {
        console.error('AI suggestions not found in response:', response.data);
        setAiSuggestionsError('Failed to generate AI suggestions. Please try again.');
      }
    } catch (error) {
      console.error('Error generating AI suggestions:', error);
      if (error.response) {
        // Server responded with error status
        const errorMessage = error.response.data?.detail?.error ||
          error.response.data?.message ||
          `Server error: ${error.response.status}`;
        setAiSuggestionsError(errorMessage);
      } else if (error.request) {
        // Network error
        setAiSuggestionsError('Network error. Please check your connection and try again.');
      } else {
        // Other error
        setAiSuggestionsError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setAiSuggestionsLoading(false);
    }
  };

  // Function to approve a specific description
  const handleApproveDescription = (type) => {
    const selectedDescription = aiSuggestions[type];
    formik.setFieldValue('description', selectedDescription);

    // Mark this suggestion as selected instead of hiding all suggestions
    setAiSuggestions(prev => ({
      ...prev,
      selectedType: type
    }));
  };

  // Function to generate new suggestions
  const handleGenerateNewSuggestions = () => {
    setAiSuggestionsError(null); // Clear any existing errors
    handleGenerateAISuggestions();
  };

  // Function to discard all suggestions
  const handleDiscardSuggestions = () => {
    setAiSuggestions(null);
    setAiSuggestionsError(null);
  };

  // Handle refresh
  const handleRefresh = () => {
    console.log("Refreshing business profile...");
    queryClient.invalidateQueries({
      queryKey: ["businessProfile", locationName, accountId],
    });
  };

  // Handle tab navigation
  const handleNextTab = () => {
    const currentIndex = tabsOrder.indexOf(activeTab);
    if (currentIndex < tabsOrder.length - 1) {
      setActiveTab(tabsOrder[currentIndex + 1]);
    }
  };

  const handlePreviousTab = () => {
    const currentIndex = tabsOrder.indexOf(activeTab);
    if (currentIndex > 0) {
      setActiveTab(tabsOrder[currentIndex - 1]);
    }
  };

  // Handle invalid parameters
  if (!params?.locationId) {
    return (
      <div className="p-6 bg-gray-50 min-h-full">
        <div className="flex items-center justify-center py-12 text-red-600">
          <AlertCircle className="w-6 h-6 mr-2" />
          <span>Invalid location or account ID</span>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6 bg-gray-50 min-h-full">
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-2">
            <Loader2 className="w-6 h-6 animate-spin text-gbp-blue-500" />
            <span className="text-gray-600">Loading business profile...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/businesses")}
            className="flex items-center space-x-2 bg-gbp-blue-500 hover:bg-gbp-blue-600 text-white hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Businesses</span>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Manage Business Profile
            </h1>
            <p className="text-gray-600 mt-1">
              {formik.values.name || "Business Profile Management"}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Save Status */}
          {formik.status === "success" && (
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">Saved</span>
            </div>
          )}
          {formik.status === "error" && (
            <div className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">Save failed</span>
            </div>
          )}

          {/* Action Buttons */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center space-x-2 bg-gbp-blue-500 hover:bg-gbp-blue-600 border-gbp-blue-500 text-white hover:text-white disabled:bg-gbp-blue-300 disabled:border-gbp-blue-300"
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            <span>Refresh</span>
          </Button>

          <Button
            //@ts-ignore
            onClick={formik.handleSubmit}
            disabled={updateProfileMutation.isPending || !formik.dirty}
            className="flex items-center space-x-2 bg-gbp-blue-500 hover:bg-gbp-blue-600 border-gbp-blue-500 text-white hover:text-white"
          >
            {updateProfileMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>Save Changes</span>
          </Button>
        </div>
      </div>

      {/* Dirty State Indicator */}
      {formik.dirty && (
        <div className="mb-4 p-3 bg-gbp-blue-50 border border-gbp-blue-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-gbp-blue-600" />
            <span className="text-sm text-gbp-blue-800">
              You have unsaved changes. Don't forget to save!
            </span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="bg-white rounded-lg border border-gray-200">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 rounded-t-lg bg-[#eff6ff] border-b border-gbp-blue-200">
            <TabsTrigger
              value="business-info"
              className="flex items-center space-x-2 text-black data-[state=active]:bg-gbp-blue-500 data-[state=active]:text-white hover:bg-gbp-blue-100"
            >
              <Building2 className="w-4 h-4" />
              <span>Business Info</span>
            </TabsTrigger>
            <TabsTrigger
              value="contact"
              className="flex items-center space-x-2 text-black data-[state=active]:bg-gbp-blue-500 data-[state=active]:text-white hover:bg-gbp-blue-100"
            >
              <Phone className="w-4 h-4" />
              <span>Contact</span>
            </TabsTrigger>
            <TabsTrigger
              value="location"
              className="flex items-center space-x-2 text-black data-[state=active]:bg-gbp-blue-500 data-[state=active]:text-white hover:bg-gbp-blue-100"
            >
              <MapPin className="w-4 h-4" />
              <span>Location</span>
            </TabsTrigger>
            <TabsTrigger
              value="hours"
              className="flex items-center space-x-2 text-black data-[state=active]:bg-gbp-blue-500 data-[state=active]:text-white hover:bg-gbp-blue-100"
            >
              <Clock className="w-4 h-4" />
              <span>Hours</span>
            </TabsTrigger>
            <TabsTrigger
              value="more"
              className="flex items-center space-x-2 text-black data-[state=active]:bg-gbp-blue-500 data-[state=active]:text-white hover:bg-gbp-blue-100"
            >
              <Settings className="w-4 h-4" />
              <span>More</span>
            </TabsTrigger>
          </TabsList>

          {/* Business Information Tab */}
          <TabsContent value="business-info" className="">
            <Card className="bg-[#eff6ff] border-gbp-blue-200">
              <CardHeader>
                <CardTitle className="text-black">
                  Business Information
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Basic information about your business
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-black font-medium">
                      Business Name
                    </Label>
                    <Input
                      id="name"
                      {...formik.getFieldProps("name")}
                      placeholder="Enter business name"
                      className="border-gbp-blue-200 focus:border-gbp-blue-500 focus:ring-gbp-blue-500 bg-white text-black placeholder:text-gray-400"
                    />
                    {formik.touched.name && formik.errors.name && (
                      <span className="text-red-600 text-sm">
                        {formik.errors.name}
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-black font-medium">
                      Business Title
                    </Label>
                    <Input
                      id="title"
                      {...formik.getFieldProps("title")}
                      placeholder="Enter business title"
                      className="border-gbp-blue-200 focus:border-gbp-blue-500 focus:ring-gbp-blue-500 bg-white text-black placeholder:text-gray-400"
                    />
                    {formik.touched.title && formik.errors.title && (
                      <span className="text-red-600 text-sm">
                        {formik.errors.title}
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="category"
                      className="text-black font-medium"
                    >
                      Business Category
                    </Label>
                    <Select
                      value={formik.values.category}
                      onValueChange={(value) =>
                        formik.setFieldValue("category", value)
                      }
                    >
                      <SelectTrigger className="border-gbp-blue-200 focus:border-gbp-blue-500 focus:ring-gbp-blue-500 bg-white text-black">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent className="border-gbp-blue-200 bg-white max-h-[200px] overflow-y-auto">
                        {businessCategories.map((category) => (
                          <SelectItem
                            key={category}
                            value={category}
                            className="hover:bg-gbp-blue-500 focus:bg-gbp-blue-500 text-black cursor-pointer"
                          >
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formik.touched.category && formik.errors.category && (
                      <span className="text-red-600 text-sm">
                        {formik.errors.category}
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="openingDate"
                      className="text-black font-medium"
                    >
                      Opening Date
                    </Label>
                    <Input
                      id="openingDate"
                      type="date"
                      {...formik.getFieldProps("openingDate")}
                      className="border-gbp-blue-200 focus:border-gbp-blue-500 focus:ring-gbp-blue-500 bg-white text-black"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="description"
                    className="text-black font-medium"
                  >
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    rows={4}
                    {...formik.getFieldProps("description")}
                    placeholder="Describe your business..."
                    className="border-gbp-blue-200 focus:border-gbp-blue-500 focus:ring-gbp-blue-500 bg-white text-black placeholder:text-gray-400 resize-none"
                  />
                </div>

                {/* AI Suggestions Section */}
                <div className="space-y-4">
                  {/* AI Loading State */}
                  {aiSuggestionsLoading && (
                    <div className="flex items-center justify-center py-8">
                      <div className="flex items-center space-x-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gbp-blue-500"></div>
                        <span className="text-gbp-blue-600 font-medium">
                          Loading your AI suggestions...
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Error State */}
                  {aiSuggestionsError && !aiSuggestionsLoading && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2">
                        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-red-700 font-medium">Error</span>
                      </div>
                      <p className="text-red-600 text-sm mt-2">{aiSuggestionsError}</p>
                      <button
                        onClick={() => {
                          setAiSuggestionsError(null);
                          handleGenerateAISuggestions();
                        }}
                        className="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors text-sm font-medium"
                      >
                        Try Again
                      </button>
                    </div>
                  )}

                  {/* AI Suggestions Containers */}
                  {!aiSuggestionsLoading && aiSuggestions && (
                    <>
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-black mb-4">
                          AI Generated Descriptions
                        </h3>

                        {/* Professional Description */}
                        <div className="bg-white border border-gbp-blue-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-black flex items-center">
                              <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                              Professional Description
                            </h4>
                            <button
                              onClick={() => handleApproveDescription('professional')}
                              className="px-3 py-1 text-xs bg-gbp-blue-50 text-gbp-blue-600 rounded-md hover:bg-gbp-blue-100 transition-colors"
                            >
                              Use This
                            </button>
                          </div>
                          <p className="text-gray-700 text-sm leading-relaxed">
                            {aiSuggestions.professional || "Loading professional description..."}
                          </p>
                        </div>

                        {/* Modern Description */}
                        <div className="bg-white border border-gbp-blue-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-black flex items-center">
                              <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                              Modern Description
                            </h4>
                            <button
                              onClick={() => handleApproveDescription('modern')}
                              className="px-3 py-1 text-xs bg-gbp-blue-50 text-gbp-blue-600 rounded-md hover:bg-gbp-blue-100 transition-colors"
                            >
                              Use This
                            </button>
                          </div>
                          <p className="text-gray-700 text-sm leading-relaxed">
                            {aiSuggestions.modern || "Loading modern description..."}
                          </p>
                        </div>

                        {/* Friendly Description */}
                        <div className="bg-white border border-gbp-blue-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-black flex items-center">
                              <span className="inline-block w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                              Friendly Description
                            </h4>
                            <button
                              onClick={() => handleApproveDescription('friendly')}
                              className="px-3 py-1 text-xs bg-gbp-blue-50 text-gbp-blue-600 rounded-md hover:bg-gbp-blue-100 transition-colors"
                            >
                              Use This
                            </button>
                          </div>
                          <p className="text-gray-700 text-sm leading-relaxed">
                            {aiSuggestions.friendly || "Loading friendly description..."}
                          </p>
                        </div>
                      </div>

                      {/* Approve/Discard Buttons */}
                      <div className="flex justify-center space-x-4 pt-4 border-t border-gbp-blue-200">
                        <button
                          onClick={handleGenerateNewSuggestions}
                          className="px-6 py-2 bg-white border border-gbp-blue-200 text-gbp-blue-600 rounded-lg hover:bg-gbp-blue-50 transition-colors font-medium"
                        >
                          Generate New Suggestions
                        </button>
                        <button
                          onClick={handleDiscardSuggestions}
                          className="px-6 py-2 bg-red-50 border border-red-200 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium"
                        >
                          Discard All
                        </button>
                      </div>
                    </>
                  )}

                  {/* Generate AI Suggestions Button (when no suggestions are loaded) */}
                  {!aiSuggestionsLoading && !aiSuggestions && (
                    <div className="text-center py-4">
                      <button
                        onClick={handleGenerateAISuggestions}
                        className="px-6 py-3 bg-gbp-blue-500 text-white rounded-lg hover:bg-gbp-blue-600 transition-colors font-medium inline-flex items-center space-x-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span>Generate AI Descriptions</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-6">
                  <Button
                    variant="outline"
                    onClick={handlePreviousTab}
                    disabled={activeTab === tabsOrder[0]}
                    className="flex items-center space-x-2 border-gbp-blue-200 text-gbp-blue-600 hover:bg-gbp-blue-50 hover:border-gbp-blue-300 bg-white"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleNextTab}
                    disabled={activeTab === tabsOrder[tabsOrder.length - 1]}
                    className="flex items-center space-x-2 border-gbp-blue-200 text-gbp-blue-600 hover:bg-gbp-blue-50 hover:border-gbp-blue-300 bg-white"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contact Information Tab */}
          <TabsContent value="contact" className="p-6">
            <Card className="bg-[#eff6ff] border-gbp-blue-200">
              <CardHeader>
                <CardTitle className="text-black">
                  Contact Information
                </CardTitle>
                <CardDescription className="text-gray-600">
                  How customers can reach your business
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="phoneNumbers.primary"
                      className="text-black font-medium"
                    >
                      Primary Phone Number
                    </Label>
                    <Input
                      id="phoneNumbers.primary"
                      type="tel"
                      {...formik.getFieldProps("phoneNumbers.primary")}
                      placeholder="+1 (555) 123-4567"
                      className="border-gbp-blue-200 focus:border-gbp-blue-500 focus:ring-gbp-blue-500 bg-white text-black placeholder:text-gray-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="phoneNumbers.secondary"
                      className="text-black font-medium"
                    >
                      Secondary Phone Number
                    </Label>
                    <Input
                      id="phoneNumbers.secondary"
                      type="tel"
                      {...formik.getFieldProps("phoneNumbers.secondary")}
                      placeholder="+1 (555) 123-4568"
                      className="border-gbp-blue-200 focus:border-gbp-blue-500 focus:ring-gbp-blue-500 bg-white text-black placeholder:text-gray-400"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="websiteUri"
                    className="text-black font-medium"
                  >
                    Website
                  </Label>
                  <Input
                    id="websiteUri"
                    type="url"
                    {...formik.getFieldProps("websiteUri")}
                    placeholder="https://www.example.com"
                    className="border-gbp-blue-200 focus:border-gbp-blue-500 focus:ring-gbp-blue-500 bg-white text-black placeholder:text-gray-400"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="chatEnabled"
                    checked={formik.values.chatEnabled}
                    onCheckedChange={(checked) =>
                      formik.setFieldValue("chatEnabled", checked)
                    }
                    className="data-[state=checked]:bg-gbp-blue-500"
                  />
                  <Label
                    htmlFor="chatEnabled"
                    className="text-black font-medium"
                  >
                    Enable Chat
                  </Label>
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-6">
                  <Button
                    variant="outline"
                    onClick={handlePreviousTab}
                    disabled={activeTab === tabsOrder[0]}
                    className="flex items-center space-x-2 border-gbp-blue-200 text-gbp-blue-600 hover:bg-gbp-blue-50 hover:border-gbp-blue-300 bg-white"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleNextTab}
                    disabled={activeTab === tabsOrder[tabsOrder.length - 1]}
                    className="flex items-center space-x-2 border-gbp-blue-200 text-gbp-blue-600 hover:bg-gbp-blue-50 hover:border-gbp-blue-300 bg-white"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Location Tab */}
          <TabsContent value="location" className="p-6">
            <Card className="bg-[#eff6ff] border-gbp-blue-200">
              <CardHeader>
                <CardTitle className="text-black">Business Location</CardTitle>
                <CardDescription className="text-gray-600">
                  Physical address and service areas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="storefrontAddress.addressLines[0]"
                    className="text-black font-medium"
                  >
                    Address Line
                  </Label>
                  <Input
                    id="storefrontAddress.addressLines[0]"
                    {...formik.getFieldProps(
                      "storefrontAddress.addressLines[0]",
                    )}
                    placeholder="123 Main Street"
                    className="border-gbp-blue-200 focus:border-gbp-blue-500 focus:ring-gbp-blue-500 bg-white text-black placeholder:text-gray-400"
                  />
                  {formik.touched.storefrontAddress?.addressLines?.[0] &&
                    formik.errors.storefrontAddress?.addressLines?.[0] && (
                      <span className="text-red-600 text-sm">
                        {formik.errors.storefrontAddress.addressLines[0]}
                      </span>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="storefrontAddress.locality"
                      className="text-black font-medium"
                    >
                      City
                    </Label>
                    <Input
                      id="storefrontAddress.locality"
                      {...formik.getFieldProps("storefrontAddress.locality")}
                      placeholder="New York"
                      className="border-gbp-blue-200 focus:border-gbp-blue-500 focus:ring-gbp-blue-500 bg-white text-black placeholder:text-gray-400"
                    />
                    {formik.touched.storefrontAddress?.locality &&
                      formik.errors.storefrontAddress?.locality && (
                        <span className="text-red-600 text-sm">
                          {formik.errors.storefrontAddress.locality}
                        </span>
                      )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="storefrontAddress.administrativeArea"
                      className="text-black font-medium"
                    >
                      State/Province
                    </Label>
                    <Input
                      id="storefrontAddress.administrativeArea"
                      {...formik.getFieldProps(
                        "storefrontAddress.administrativeArea",
                      )}
                      placeholder="NY"
                      className="border-gbp-blue-200 focus:border-gbp-blue-500 focus:ring-gbp-blue-500 bg-white text-black placeholder:text-gray-400"
                    />
                    {formik.touched.storefrontAddress?.administrativeArea &&
                      formik.errors.storefrontAddress?.administrativeArea && (
                        <span className="text-red-600 text-sm">
                          {formik.errors.storefrontAddress.administrativeArea}
                        </span>
                      )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="storefrontAddress.postalCode"
                      className="text-black font-medium"
                    >
                      Postal Code
                    </Label>
                    <Input
                      id="storefrontAddress.postalCode"
                      {...formik.getFieldProps("storefrontAddress.postalCode")}
                      placeholder="10001"
                      className="border-gbp-blue-200 focus:border-gbp-blue-500 focus:ring-gbp-blue-500 bg-white text-black placeholder:text-gray-400"
                    />
                    {formik.touched.storefrontAddress?.postalCode &&
                      formik.errors.storefrontAddress?.postalCode && (
                        <span className="text-red-600 text-sm">
                          {formik.errors.storefrontAddress.postalCode}
                        </span>
                      )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="serviceArea.businessType"
                    className="text-black font-medium"
                  >
                    Service Area
                  </Label>
                  <Select
                    value={formik.values.serviceArea.businessType}
                    onValueChange={(value) =>
                      formik.setFieldValue("serviceArea.businessType", value)
                    }
                  >
                    <SelectTrigger className="border-gbp-blue-200 focus:border-gbp-blue-500 focus:ring-gbp-blue-500 bg-white text-black">
                      <SelectValue placeholder="Select service area" />
                    </SelectTrigger>
                    <SelectContent className="border-gbp-blue-200 bg-white">
                      <SelectItem
                        value="CUSTOMER_LOCATION_ONLY"
                        className="hover:bg-gbp-blue-50 focus:bg-gbp-blue-50 text-black cursor-pointer"
                      >
                        Customer Location Only
                      </SelectItem>
                      <SelectItem
                        value="CUSTOMER_AND_BUSINESS_LOCATION"
                        className="hover:bg-gbp-blue-50 focus:bg-gbp-blue-50 text-black cursor-pointer"
                      >
                        Customer & Business Location
                      </SelectItem>
                      <SelectItem
                        value="BUSINESS_LOCATION_ONLY"
                        className="hover:bg-gbp-blue-50 focus:bg-gbp-blue-50 text-black cursor-pointer"
                      >
                        Business Location Only
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-6">
                  <Button
                    variant="outline"
                    onClick={handlePreviousTab}
                    disabled={activeTab === tabsOrder[0]}
                    className="flex items-center space-x-2 border-gbp-blue-200 text-gbp-blue-600 hover:bg-gbp-blue-50 hover:border-gbp-blue-300 bg-white"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleNextTab}
                    disabled={activeTab === tabsOrder[tabsOrder.length - 1]}
                    className="flex items-center space-x-2 border-gbp-blue-200 text-gbp-blue-600 hover:bg-gbp-blue-50 hover:border-gbp-blue-300 bg-white"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Hours Tab */}
          <TabsContent value="hours" className="p-6">
            <Card className="bg-[#eff6ff] border-gbp-blue-200">
              <CardHeader>
                <CardTitle className="text-black">Opening Hours</CardTitle>
                <CardDescription className="text-gray-600">
                  Set your regular business hours
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {formik.values.regularHours.periods.map((period, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-4 p-4 border border-gbp-blue-200 rounded-lg bg-white"
                    >
                      <Select
                        value={period.openDay}
                        onValueChange={(value) =>
                          formik.setFieldValue(
                            `regularHours.periods[${index}].openDay`,
                            value,
                          )
                        }
                      >
                        <SelectTrigger className="w-32 border-gbp-blue-200 focus:border-gbp-blue-500 focus:ring-gbp-blue-500 bg-white text-black">
                          <SelectValue placeholder="Day" />
                        </SelectTrigger>
                        <SelectContent className="border-gbp-blue-200 bg-white">
                          {daysOfWeek.map((day) => (
                            <SelectItem
                              key={day.value}
                              value={day.value}
                              className="hover:bg-gbp-blue-50 focus:bg-gbp-blue-50 text-black cursor-pointer"
                            >
                              {day.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Input
                        type="time"
                        {...formik.getFieldProps(
                          `regularHours.periods[${index}].openTime`,
                        )}
                        className="w-32 border-gbp-blue-200 focus:border-gbp-blue-500 focus:ring-gbp-blue-500 bg-white text-black"
                      />

                      <span className="text-black font-medium">to</span>

                      <Input
                        type="time"
                        {...formik.getFieldProps(
                          `regularHours.periods[${index}].closeTime`,
                        )}
                        className="w-32 border-gbp-blue-200 focus:border-gbp-blue-500 focus:ring-gbp-blue-500 bg-white text-black"
                      />

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeHoursPeriod(index)}
                        className="text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50 bg-white"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}

                  <Button
                    variant="outline"
                    onClick={addHoursPeriod}
                    className="w-full border-gbp-blue-200 text-gbp-blue-600 hover:bg-gbp-blue-50 hover:border-gbp-blue-300 bg-white"
                  >
                    Add Hours Period
                  </Button>
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-6">
                  <Button
                    variant="outline"
                    onClick={handlePreviousTab}
                    disabled={activeTab === tabsOrder[0]}
                    className="flex items-center space-x-2 border-gbp-blue-200 text-gbp-blue-600 hover:bg-gbp-blue-50 hover:border-gbp-blue-300 bg-white"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleNextTab}
                    disabled={activeTab === tabsOrder[tabsOrder.length - 1]}
                    className="flex items-center space-x-2 border-gbp-blue-200 text-gbp-blue-600 hover:bg-gbp-blue-50 hover:border-gbp-blue-300 bg-white"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* More Details Tab */}
          <TabsContent value="more" className="p-6">
            <div className="space-y-6">
              {/* Accessibility */}
              <Card className="bg-[#eff6ff] border-gbp-blue-200">
                <CardHeader>
                  <CardTitle className="text-black">Accessibility</CardTitle>
                  <CardDescription className="text-gray-600">
                    Accessibility features available at your business
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(formik.values.accessibility).map(
                      ([key]) => (
                        <div key={key} className="flex items-center space-x-2">
                          <Checkbox
                            id={`accessibility-${key}`}
                            checked={
                              formik.values.accessibility[
                              key as keyof BusinessProfile["accessibility"]
                              ]
                            }
                            onCheckedChange={(checked) =>
                              formik.setFieldValue(
                                `accessibility.${key}`,
                                checked,
                              )
                            }
                            className="border-gbp-blue-300 data-[state=checked]:bg-gbp-blue-500 data-[state=checked]:border-gbp-blue-500 cursor-pointer"
                          />
                          <Label
                            htmlFor={`accessibility-${key}`}
                            className="text-sm text-black cursor-pointer select-none"
                          >
                            {key
                              .replace(/([A-Z])/g, " $1")
                              .replace(/^./, (str) => str.toUpperCase())}
                          </Label>
                        </div>
                      ),
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Amenities */}
              <Card className="bg-[#eff6ff] border-gbp-blue-200">
                <CardHeader>
                  <CardTitle className="text-black">Amenities</CardTitle>
                  <CardDescription className="text-gray-600">
                    Services and amenities offered at your business
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(formik.values.amenities).map(([key]) => (
                      <div key={key} className="flex items-center space-x-2">
                        <Checkbox
                          id={`amenities-${key}`}
                          checked={
                            formik.values.amenities[
                            key as keyof BusinessProfile["amenities"]
                            ]
                          }
                          onCheckedChange={(checked) =>
                            formik.setFieldValue(`amenities.${key}`, checked)
                          }
                          className="border-gbp-blue-300 data-[state=checked]:bg-gbp-blue-500 data-[state=checked]:border-gbp-blue-500 cursor-pointer"
                        />
                        <Label
                          htmlFor={`amenities-${key}`}
                          className="text-sm text-black cursor-pointer select-none"
                        >
                          {key
                            .replace(/([A-Z])/g, " $1")
                            .replace(/^./, (str) => str.toUpperCase())}
                        </Label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Crowd */}
              <Card className="bg-[#eff6ff] border-gbp-blue-200">
                <CardHeader>
                  <CardTitle className="text-black">Crowd</CardTitle>
                  <CardDescription className="text-gray-600">
                    Types of customers your business welcomes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(formik.values.crowd).map(([key]) => (
                      <div key={key} className="flex items-center space-x-2">
                        <Checkbox
                          id={`crowd-${key}`}
                          checked={
                            formik.values.crowd[
                            key as keyof BusinessProfile["crowd"]
                            ]
                          }
                          onCheckedChange={(checked) =>
                            formik.setFieldValue(`crowd.${key}`, checked)
                          }
                          className="border-gbp-blue-300 data-[state=checked]:bg-gbp-blue-500 data-[state=checked]:border-gbp-blue-500 cursor-pointer"
                        />
                        <Label
                          htmlFor={`crowd-${key}`}
                          className="text-sm text-black cursor-pointer select-none"
                        >
                          {key
                            .replace(/([A-Z])/g, " $1")
                            .replace(/^./, (str) => str.toUpperCase())}
                        </Label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Parking */}
              <Card className="bg-[#eff6ff] border-gbp-blue-200">
                <CardHeader>
                  <CardTitle className="text-black">Parking</CardTitle>
                  <CardDescription className="text-gray-600">
                    Parking options available at your business
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(formik.values.parking).map(([key]) => (
                      <div key={key} className="flex items-center space-x-2">
                        <Checkbox
                          id={`parking-${key}`}
                          checked={
                            formik.values.parking[
                            key as keyof BusinessProfile["parking"]
                            ]
                          }
                          onCheckedChange={(checked) =>
                            formik.setFieldValue(`parking.${key}`, checked)
                          }
                          className="border-gbp-blue-300 data-[state=checked]:bg-gbp-blue-500 data-[state=checked]:border-gbp-blue-500 cursor-pointer"
                        />
                        <Label
                          htmlFor={`parking-${key}`}
                          className="text-sm text-black cursor-pointer select-none"
                        >
                          {key
                            .replace(/([A-Z])/g, " $1")
                            .replace(/^./, (str) => str.toUpperCase())}
                        </Label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Pets */}
              <Card className="bg-[#eff6ff] border-gbp-blue-200">
                <CardHeader>
                  <CardTitle className="text-black">Pets</CardTitle>
                  <CardDescription className="text-gray-600">
                    Pet policies at your business
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(formik.values.pets).map(([key]) => (
                      <div key={key} className="flex items-center space-x-2">
                        <Checkbox
                          id={`pets-${key}`}
                          checked={
                            formik.values.pets[
                            key as keyof BusinessProfile["pets"]
                            ]
                          }
                          onCheckedChange={(checked) =>
                            formik.setFieldValue(`pets.${key}`, checked)
                          }
                          className="border-gbp-blue-300 data-[state=checked]:bg-gbp-blue-500 data-[state=checked]:border-gbp-blue-500 cursor-pointer"
                        />
                        <Label
                          htmlFor={`pets-${key}`}
                          className="text-sm text-black cursor-pointer select-none"
                        >
                          {key
                            .replace(/([A-Z])/g, " $1")
                            .replace(/^./, (str) => str.toUpperCase())}
                        </Label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Service Options */}
              <Card className="bg-[#eff6ff] border-gbp-blue-200">
                <CardHeader>
                  <CardTitle className="text-black">Service Options</CardTitle>
                  <CardDescription className="text-gray-600">
                    Additional service options and languages
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="serviceOptions.onlineEstimates"
                          checked={formik.values.serviceOptions.onlineEstimates}
                          onCheckedChange={(checked) =>
                            formik.setFieldValue(
                              "serviceOptions.onlineEstimates",
                              checked,
                            )
                          }
                          className="border-gbp-blue-300 data-[state=checked]:bg-gbp-blue-500 data-[state=checked]:border-gbp-blue-500 cursor-pointer"
                        />
                        <Label
                          htmlFor="serviceOptions.onlineEstimates"
                          className="text-sm text-black cursor-pointer select-none"
                        >
                          Online Estimates
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="serviceOptions.onSiteServices"
                          checked={formik.values.serviceOptions.onSiteServices}
                          onCheckedChange={(checked) =>
                            formik.setFieldValue(
                              "serviceOptions.onSiteServices",
                              checked,
                            )
                          }
                          className="border-gbp-blue-300 data-[state=checked]:bg-gbp-blue-500 data-[state=checked]:border-gbp-blue-500 cursor-pointer"
                        />
                        <Label
                          htmlFor="serviceOptions.onSiteServices"
                          className="text-sm text-black cursor-pointer select-none"
                        >
                          On-site Services
                        </Label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="serviceOptions.languageSpoken"
                        className="text-black font-medium"
                      >
                        Languages Spoken
                      </Label>
                      <Input
                        id="serviceOptions.languageSpoken"
                        value={formik.values.serviceOptions.languageSpoken.join(
                          ", ",
                        )}
                        onChange={(e) =>
                          formik.setFieldValue(
                            "serviceOptions.languageSpoken",
                            e.target.value.split(", ").filter(Boolean),
                          )
                        }
                        placeholder="English, Spanish, French"
                        className="border-gbp-blue-200 focus:border-gbp-blue-500 focus:ring-gbp-blue-500 bg-white text-black placeholder:text-gray-400"
                      />
                    </div>
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex justify-between mt-6">
                    <Button
                      variant="outline"
                      onClick={handlePreviousTab}
                      disabled={activeTab === tabsOrder[0]}
                      className="flex items-center space-x-2 border-gbp-blue-200 text-gbp-blue-600 hover:bg-gbp-blue-50 hover:border-gbp-blue-300 bg-white"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Previous</span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleNextTab}
                      disabled={activeTab === tabsOrder[tabsOrder.length - 1]}
                      className="flex items-center space-x-2 border-gbp-blue-200 text-gbp-blue-600 hover:bg-gbp-blue-50 hover:border-gbp-blue-300 bg-white"
                    >
                      <span>Next</span>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}