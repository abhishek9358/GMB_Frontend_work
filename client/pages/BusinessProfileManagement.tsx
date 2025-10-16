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
  Plus,
  X,
  Cloud,
  ChevronDown,
} from "lucide-react";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import * as Yup from "yup";

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

interface ILocation {
  _id: string;
  title: string;
  phone?: string;
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  description?: string;
  websiteUri?: string;
  primaryCategoryName?: string;
  stats?: any;
  rawGoogleData?: any;
  [key: string]: any;
}

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

const apiService = {
  getBusinessProfile: async (locationId: string, accountId: string) => {
    console.log(
      `Fetching business profile for locationId: ${locationId}, accountId: ${accountId}`,
    );
    const response = await axios.get(
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

// Fixed transform function
const transformApiDataToProfile = (data: ILocation | null): BusinessProfile => {
  if (!data) {
    return {
      name: "",
      title: "",
      category: "",
      description: "",
      openingDate: "",
      phoneNumbers: {
        primary: "",
        secondary: "",
      },
      chatEnabled: false,
      websiteUri: "",
      storefrontAddress: {
        addressLines: [""],
        locality: "",
        administrativeArea: "",
        postalCode: "",
        regionCode: "IN",
      },
      serviceArea: {
        businessType: "BUSINESS_LOCATION_ONLY",
        regionCode: "IN",
        places: [],
      },
      regularHours: {
        periods: [
          {
            openDay: "MONDAY",
            openTime: "09:00",
            closeDay: "MONDAY",
            closeTime: "17:00",
          },
        ],
      },
      specialHours: [],
      moreHours: [],
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
  }

  // Helper function to format time
  const formatTime = (timeObj: any): string => {
    if (!timeObj) return "09:00";
    if (typeof timeObj === "string") return timeObj;
    const hours = String(timeObj.hours || 9).padStart(2, "0");
    const minutes = String(timeObj.minutes || 0).padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  // Helper function to format opening date
  const formatOpeningDate = (dateObj: any): string => {
    if (!dateObj) return "";
    if (typeof dateObj === "string") return dateObj;
    const { year, month, day } = dateObj;
    if (!year || !month || !day) return "";
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(
      2,
      "0",
    )}`;
  };

  // Get raw Google data safely
  const rawData = data?.rawGoogleData || {};
  console.log("Raw data for hours:", rawData?.regularHours);

  // Transform regular hours - FIXED
  let regularHours: Array<{
    openDay: string;
    openTime: string;
    closeDay: string;
    closeTime: string;
  }> = [];

  if (rawData?.regularHours) {
    // Check if it's already an array
    if (Array.isArray(rawData.regularHours)) {
      regularHours = rawData.regularHours.map((period: any) => ({
        openDay: period.openDay || "MONDAY",
        openTime: formatTime(period.openTime),
        closeDay: period.closeDay || "MONDAY",
        closeTime: formatTime(period.closeTime),
      }));
    } else if (typeof rawData.regularHours === "object") {
      // If it's an object with periods property
      const periods = rawData.regularHours.periods;
      if (Array.isArray(periods)) {
        regularHours = periods.map((period: any) => ({
          openDay: period.openDay || "MONDAY",
          openTime: formatTime(period.openTime),
          closeDay: period.closeDay || "MONDAY",
          closeTime: formatTime(period.closeTime),
        }));
      }
    }
  }

  // Default hours if none found
  if (regularHours.length === 0) {
    regularHours = [
      {
        openDay: "MONDAY",
        openTime: "09:00",
        closeDay: "MONDAY",
        closeTime: "17:00",
      },
    ];
  }

  return {
    name: data?.title || "",
    title: data?.title || "",
    category: data?.primaryCategoryName || "",
    description: data?.description || "",
    openingDate: formatOpeningDate(rawData?.openInfo?.openingDate),
    phoneNumbers: {
      primary: data?.phone || rawData?.phoneNumbers?.primaryPhone || "",
      secondary: rawData?.phoneNumbers?.secondaryPhone || "",
    },
    chatEnabled: false,
    websiteUri: data?.websiteUri || "",
    storefrontAddress: {
      addressLines: rawData?.storefrontAddress?.addressLines || [
        data?.street || "",
      ],
      locality: data?.city || rawData?.storefrontAddress?.locality || "",
      administrativeArea:
        data?.state || rawData?.storefrontAddress?.administrativeArea || "",
      postalCode:
        data?.postalCode || rawData?.storefrontAddress?.postalCode || "",
      regionCode: rawData?.storefrontAddress?.regionCode || "IN",
    },
    serviceArea: {
      businessType: "BUSINESS_LOCATION_ONLY",
      regionCode: rawData?.storefrontAddress?.regionCode || "IN",
      places: [],
    },
    regularHours: {
      periods: regularHours,
    },
    specialHours: rawData?.specialHours || [],
    moreHours: rawData?.moreHours || [],
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aiSuggestionsLoading, setAiSuggestionsLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [aiSuggestionsError, setAiSuggestionsError] = useState(null);

  const { user } = useSelector((state: RootState) => state.user);
  const params = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch location details
  async function fetchLocationDetails(id: string) {
    try {
      setIsLoading(true);
      setError(null);
      const res = await axios.get(
        `${SERVER}/api/v1/locations/${id}?account_id=${user?.accountId}`,
        {
          withCredentials: true,
        },
      );
      console.log("LocationDetails", res.data);
      if (res.data?.location) {
        setLocation(res.data.location);
      } else {
        setError("Failed to load location data");
      }
    } catch (err: any) {
      console.error("Failed to fetch location details", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to load business profile";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (params?.locationId && user) {
      fetchLocationDetails(params.locationId);
    }
  }, [params?.locationId, user]);

  const initialValues: BusinessProfile = transformApiDataToProfile(null);

  const formik = useFormik<BusinessProfile>({
    initialValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setStatus }) => {
      const { changed, paths } = getChangedFields(formik.initialValues, values);
      console.log("Changed data:", changed);
      console.log("Changed paths:", paths);

      if (Object.keys(changed).length === 0) {
        console.log("No changes detected");
        return;
      }

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

  // Update initial values when location loads
  useEffect(() => {
    if (location) {
      const transformed = transformApiDataToProfile(location);
      formik.setValues(transformed);
    }
  }, [location]);

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
        queryKey: ["businessProfile", params?.locationId],
      });
      formik.setStatus("success");
      setTimeout(() => formik.setStatus("idle"), 3000);
    },
    onError: (err: any) => {
      console.error("Error patching profile:", err);
      formik.setStatus("error");
    },
  });

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

  const removeHoursPeriod = (index: number) => {
    formik.setFieldValue(
      "regularHours.periods",
      formik.values.regularHours.periods.filter((_, i) => i !== index),
    );
  };

  const handleGenerateAISuggestions = async () => {
    setAiSuggestionsLoading(true);
    setAiSuggestionsError(null);

    try {
      const locationId = params?.locationId;
      const accountId = user?.accountId;

      if (!locationId || !accountId) {
        setAiSuggestionsError(
          "Missing location ID or account ID. Please try refreshing the page.",
        );
        return;
      }

      const response = await axios.post(
        `${SERVER}/api/v1/locations/${locationId}/description-suggestions?account_id=${accountId}&tone_preference=all`,
        {},
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (
        response.data.success &&
        response.data.data &&
        response.data.data.suggestions
      ) {
        setAiSuggestions({
          professional: response.data.data.suggestions.professional,
          modern: response.data.data.suggestions.modern,
          friendly: response.data.data.suggestions.friendly,
        });
      } else {
        console.error("AI suggestions not found in response:", response.data);
        setAiSuggestionsError(
          "Failed to generate AI suggestions. Please try again.",
        );
      }
    } catch (error: any) {
      console.error("Error generating AI suggestions:", error);
      if (error.response) {
        const errorMessage =
          error.response.data?.detail?.error ||
          error.response.data?.message ||
          `Server error: ${error.response.status}`;
        setAiSuggestionsError(errorMessage);
      } else if (error.request) {
        setAiSuggestionsError(
          "Network error. Please check your connection and try again.",
        );
      } else {
        setAiSuggestionsError(
          "An unexpected error occurred. Please try again.",
        );
      }
    } finally {
      setAiSuggestionsLoading(false);
    }
  };

  const handleApproveDescription = (type: string) => {
    const selectedDescription =
      aiSuggestions[type as keyof typeof aiSuggestions];
    formik.setFieldValue("description", selectedDescription);
    setAiSuggestions((prev) => ({
      ...prev,
      selectedType: type,
    }));
  };

  const handleGenerateNewSuggestions = () => {
    setAiSuggestionsError(null);
    handleGenerateAISuggestions();
  };

  const handleDiscardSuggestions = () => {
    setAiSuggestions(null);
    setAiSuggestionsError(null);
  };

  const handleRefresh = () => {
    console.log("Refreshing business profile...");
    if (params?.locationId) {
      fetchLocationDetails(params.locationId);
    }
  };

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

  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-full">
        <div className="flex items-center justify-center py-12">
          <Card className="w-full max-w-md border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-600 flex items-center space-x-2">
                <AlertCircle className="w-5 h-5" />
                <span>Error Loading Profile</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-red-700">{error}</p>
              <Button
                onClick={handleRefresh}
                className="w-full bg-red-600 hover:bg-red-700 text-white"
              >
                Try Again
              </Button>
              <Button
                onClick={() => navigate("/businesses")}
                variant="outline"
                className="w-full"
              >
                Back to Businesses
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-full">
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

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center space-x-2 bg-gbp-blue-500 hover:bg-gbp-blue-600 border-gbp-blue-500 text-white hover:text-white disabled:bg-gbp-blue-300"
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
            className="flex items-center space-x-2 bg-gbp-blue-500 hover:bg-gbp-blue-600 text-white hover:text-white"
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

      <div className="bg-white rounded-lg border border-gray-200">
        <Tabs defaultValue="business-info" className="w-full">
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
                  <CategorySelect
                    value={formik.values.category}
                    onChange={(value) =>
                      formik.setFieldValue("category", value)
                    }
                    error={formik.errors.category}
                    touched={formik.touched.category}
                  />

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
                <div className="space-y-4 border-t border-gbp-blue-200 pt-6">
                  {/* AI Loading State */}
                  {aiSuggestionsLoading && (
                    <div className="flex items-center justify-center py-8">
                      <div className="flex items-center space-x-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gbp-blue-500"></div>
                        <span className="text-gbp-blue-600 font-medium">
                          Generating AI suggestions...
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Error State */}
                  {aiSuggestionsError && !aiSuggestionsLoading && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <AlertCircle className="w-5 h-5 text-red-500" />
                        <span className="text-red-700 font-medium">Error</span>
                      </div>
                      <p className="text-red-600 text-sm mb-3">
                        {aiSuggestionsError}
                      </p>
                      <button
                        onClick={() => {
                          setAiSuggestionsError(null);
                          handleGenerateAISuggestions();
                        }}
                        className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors text-sm font-medium"
                      >
                        Try Again
                      </button>
                    </div>
                  )}

                  {/* AI Suggestions Display */}
                  {!aiSuggestionsLoading && aiSuggestions && (
                    <>
                      <h3 className="text-lg font-semibold text-black mb-4">
                        AI Generated Descriptions
                      </h3>

                      <div className="space-y-3">
                        {/* Professional */}
                        <div className="bg-white border border-gbp-blue-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="font-medium text-black flex items-center">
                              <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                              Professional
                            </h4>
                            <button
                              onClick={() =>
                                handleApproveDescription("professional")
                              }
                              className="px-3 py-1 text-xs bg-gbp-blue-50 text-gbp-blue-600 rounded-md hover:bg-gbp-blue-100 transition-colors"
                            >
                              Use This
                            </button>
                          </div>
                          <p className="text-gray-700 text-sm leading-relaxed">
                            {aiSuggestions.professional}
                          </p>
                        </div>

                        {/* Modern */}
                        <div className="bg-white border border-gbp-blue-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="font-medium text-black flex items-center">
                              <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                              Modern
                            </h4>
                            <button
                              onClick={() => handleApproveDescription("modern")}
                              className="px-3 py-1 text-xs bg-gbp-blue-50 text-gbp-blue-600 rounded-md hover:bg-gbp-blue-100 transition-colors"
                            >
                              Use This
                            </button>
                          </div>
                          <p className="text-gray-700 text-sm leading-relaxed">
                            {aiSuggestions.modern}
                          </p>
                        </div>

                        {/* Friendly */}
                        <div className="bg-white border border-gbp-blue-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="font-medium text-black flex items-center">
                              <span className="inline-block w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                              Friendly
                            </h4>
                            <button
                              onClick={() =>
                                handleApproveDescription("friendly")
                              }
                              className="px-3 py-1 text-xs bg-gbp-blue-50 text-gbp-blue-600 rounded-md hover:bg-gbp-blue-100 transition-colors"
                            >
                              Use This
                            </button>
                          </div>
                          <p className="text-gray-700 text-sm leading-relaxed">
                            {aiSuggestions.friendly}
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex justify-center gap-3 pt-4 border-t border-gbp-blue-200">
                        <button
                          onClick={handleGenerateNewSuggestions}
                          className="px-6 py-2 bg-white border border-gbp-blue-200 text-gbp-blue-600 rounded-lg hover:bg-gbp-blue-50 transition-colors font-medium text-sm"
                        >
                          Generate New
                        </button>
                        <button
                          onClick={handleDiscardSuggestions}
                          className="px-6 py-2 bg-red-50 border border-red-200 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium text-sm"
                        >
                          Discard
                        </button>
                      </div>
                    </>
                  )}

                  {/* Generate Button */}
                  {!aiSuggestionsLoading && !aiSuggestions && (
                    <div className="text-center py-6 bg-gbp-blue-50 rounded-lg border border-gbp-blue-200">
                      <p className="text-gray-600 mb-4">
                        Get AI-powered description suggestions for your business
                      </p>
                      <button
                        onClick={handleGenerateAISuggestions}
                        className="px-6 py-2 bg-gbp-blue-500 text-white rounded-lg hover:bg-gbp-blue-600 transition-colors font-medium inline-flex items-center space-x-2"
                      >
                        <Cloud className="w-4 h-4" />
                        <span>Generate AI Descriptions</span>
                      </button>
                    </div>
                  )}
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
                      Primary Phone
                    </Label>
                    <Input
                      id="phoneNumbers.primary"
                      type="tel"
                      {...formik.getFieldProps("phoneNumbers.primary")}
                      placeholder="+91 XXXXX XXXXX"
                      className="border-gbp-blue-200 focus:border-gbp-blue-500 focus:ring-gbp-blue-500 bg-white text-black placeholder:text-gray-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="phoneNumbers.secondary"
                      className="text-black font-medium"
                    >
                      Secondary Phone
                    </Label>
                    <Input
                      id="phoneNumbers.secondary"
                      type="tel"
                      {...formik.getFieldProps("phoneNumbers.secondary")}
                      placeholder="+91 XXXXX XXXXX"
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
                        {
                          formik.errors.storefrontAddress
                            .addressLines[0] as string
                        }
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
                      placeholder="Jaipur"
                      className="border-gbp-blue-200 focus:border-gbp-blue-500 focus:ring-gbp-blue-500 bg-white text-black placeholder:text-gray-400"
                    />
                    {formik.touched.storefrontAddress?.locality &&
                      formik.errors.storefrontAddress?.locality && (
                        <span className="text-red-600 text-sm">
                          {formik.errors.storefrontAddress.locality as string}
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
                      placeholder="Rajasthan"
                      className="border-gbp-blue-200 focus:border-gbp-blue-500 focus:ring-gbp-blue-500 bg-white text-black placeholder:text-gray-400"
                    />
                    {formik.touched.storefrontAddress?.administrativeArea &&
                      formik.errors.storefrontAddress?.administrativeArea && (
                        <span className="text-red-600 text-sm">
                          {
                            formik.errors.storefrontAddress
                              .administrativeArea as string
                          }
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
                      placeholder="302021"
                      className="border-gbp-blue-200 focus:border-gbp-blue-500 focus:ring-gbp-blue-500 bg-white text-black placeholder:text-gray-400"
                    />
                    {formik.touched.storefrontAddress?.postalCode &&
                      formik.errors.storefrontAddress?.postalCode && (
                        <span className="text-red-600 text-sm">
                          {formik.errors.storefrontAddress.postalCode as string}
                        </span>
                      )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="serviceArea.businessType"
                    className="text-black font-medium"
                  >
                    Service Area Type
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
                        value="BUSINESS_LOCATION_ONLY"
                        className="hover:bg-gbp-blue-50 focus:bg-gbp-blue-50 text-black cursor-pointer"
                      >
                        Business Location Only
                      </SelectItem>
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
                        Both Locations
                      </SelectItem>
                    </SelectContent>
                  </Select>
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
                      className="flex items-end gap-3 p-4 border border-gbp-blue-200 rounded-lg bg-white"
                    >
                      <div className="flex-1">
                        <Label className="text-xs text-gray-600 mb-1 block">
                          Day
                        </Label>
                        <Select
                          value={period.openDay}
                          onValueChange={(value) =>
                            formik.setFieldValue(
                              `regularHours.periods[${index}].openDay`,
                              value,
                            )
                          }
                        >
                          <SelectTrigger className="border-gbp-blue-200 focus:border-gbp-blue-500 focus:ring-gbp-blue-500 bg-white text-black text-sm">
                            <SelectValue />
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
                      </div>

                      <div className="flex-1">
                        <Label className="text-xs text-gray-600 mb-1 block">
                          Opens
                        </Label>
                        <Input
                          type="time"
                          {...formik.getFieldProps(
                            `regularHours.periods[${index}].openTime`,
                          )}
                          className="border-gbp-blue-200 focus:border-gbp-blue-500 focus:ring-gbp-blue-500 bg-white text-black text-sm"
                        />
                      </div>

                      <div className="flex-1">
                        <Label className="text-xs text-gray-600 mb-1 block">
                          Closes
                        </Label>
                        <Input
                          type="time"
                          {...formik.getFieldProps(
                            `regularHours.periods[${index}].closeTime`,
                          )}
                          className="border-gbp-blue-200 focus:border-gbp-blue-500 focus:ring-gbp-blue-500 bg-white text-black text-sm"
                        />
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeHoursPeriod(index)}
                        className="text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50 bg-white h-10 px-2"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    onClick={addHoursPeriod}
                    className="w-full border-gbp-blue-200 text-gbp-blue-600 hover:bg-gbp-blue-50 hover:border-gbp-blue-300 bg-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Hours Period
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
                    Services and amenities offered
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

              {/* Parking */}
              <Card className="bg-[#eff6ff] border-gbp-blue-200">
                <CardHeader>
                  <CardTitle className="text-black">Parking</CardTitle>
                  <CardDescription className="text-gray-600">
                    Parking options available
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
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function CategorySelect({ value, onChange, error, touched }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="space-y-2 relative">
      <Label className="text-black font-medium">Business Category</Label>

      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-4 py-2 border border-gbp-blue-200 rounded-lg bg-white text-black hover:border-gbp-blue-300 focus:outline-none focus:ring-2 focus:ring-gbp-blue-500 focus:border-transparent"
        >
          <span className={value ? "text-black" : "text-gray-400"}>
            {value || "Select a category"}
          </span>
          <ChevronDown
            className={`w-4 h-4 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gbp-blue-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
            {businessCategories.map((category) => (
              <button
                key={category}
                onClick={() => {
                  onChange(category);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-3 hover:bg-gbp-blue-50 transition-colors text-sm ${
                  value === category
                    ? "bg-gbp-blue-100 text-gbp-blue-700 font-medium"
                    : "text-black"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        )}
      </div>

      {touched && error && (
        <span className="text-red-600 text-sm">{error}</span>
      )}
    </div>
  );
}