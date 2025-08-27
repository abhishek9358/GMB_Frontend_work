import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  RefreshCw,
  Building2,
  Phone,
  MapPin,
  Clock,
  Settings,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import gmbProfileService, {
  BusinessProfile as ServiceBusinessProfile,
} from "@/services/gmbProfileService";

// Use imported BusinessProfile type from service
type BusinessProfile = ServiceBusinessProfile;

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

export default function BusinessProfileManagement() {
  const { locationName } = useParams<{ locationName: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<BusinessProfile>({
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
      regionCode: "US",
    },
    serviceArea: {
      businessType: "CUSTOMER_LOCATION_ONLY",
      regionCode: "US",
      places: [],
    },
    regularHours: {
      periods: [],
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
  });

  const [isDirty, setIsDirty] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">(
    "idle",
  );

  // Load business profile data
  useEffect(() => {
    const loadProfile = async () => {
      if (!locationName) return;

      setLoading(true);
      try {
        const result = await gmbProfileService.getBusinessProfile(locationName);

        if (result.success && result.data) {
          const transformedProfile =
            gmbProfileService.transformApiDataToProfile(result.data);
          setProfile(transformedProfile);
        } else {
          console.error("Failed to load profile:", result.error);
          // Keep the empty form for manual entry
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [locationName]);

  // Handle form changes
  const handleChange = (section: string, field: string, value: any) => {
    setProfile((prev) => ({
      ...prev,
      [section]: {
        //@ts-ignore
        ...prev[section as keyof BusinessProfile],
        [field]: value,
      },
    }));
    setIsDirty(true);
    setSaveStatus("idle");
  };

  const handleNestedChange = (
    section: string,
    subsection: string,
    field: string,
    value: any,
  ) => {
    setProfile((prev) => ({
      ...prev,
      [section]: {
        //@ts-ignore
        ...prev[section as keyof BusinessProfile],
        [subsection]: {
          ...(prev[section as keyof BusinessProfile] as any)[subsection],
          [field]: value,
        },
      },
    }));
    setIsDirty(true);
    setSaveStatus("idle");
  };

  const handleArrayChange = (
    section: string,
    index: number,
    field: string,
    value: any,
  ) => {
    setProfile((prev) => {
      const sectionData = prev[section as keyof BusinessProfile] as any;
      const newArray = [...sectionData];
      newArray[index] = { ...newArray[index], [field]: value };
      return {
        ...prev,
        [section]: newArray,
      };
    });
    setIsDirty(true);
    setSaveStatus("idle");
  };

  // Save profile
  const handleSave = async () => {
    if (!locationName) return;

    setSaving(true);
    setSaveStatus("idle");

    try {
      // Validate profile data before saving
      const validation = gmbProfileService.validateProfile(profile);
      if (!validation.isValid) {
        console.error("Validation errors:", validation.errors);
        setSaveStatus("error");
        return;
      }

      const result = await gmbProfileService.updateBusinessProfile(
        locationName,
        profile,
      );

      if (result.success) {
        setSaveStatus("success");
        setIsDirty(false);
        setTimeout(() => setSaveStatus("idle"), 3000);
      } else {
        console.error("Failed to save profile:", result.error);
        setSaveStatus("error");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      setSaveStatus("error");
    } finally {
      setSaving(false);
    }
  };

  // Refresh data
  const handleRefresh = async () => {
    if (!locationName) return;

    setLoading(true);
    try {
      const result = await gmbProfileService.getBusinessProfile(locationName);

      if (result.success && result.data) {
        const transformedProfile = gmbProfileService.transformApiDataToProfile(
          result.data,
        );
        setProfile(transformedProfile);
        setIsDirty(false);
        setSaveStatus("idle");
      } else {
        console.error("Failed to refresh profile:", result.error);
      }
    } catch (error) {
      console.error("Error refreshing profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const addHoursPeriod = () => {
    setProfile((prev) => ({
      ...prev,
      regularHours: {
        periods: [
          ...prev.regularHours.periods,
          {
            openDay: "MONDAY",
            openTime: "09:00",
            closeDay: "MONDAY",
            closeTime: "17:00",
          },
        ],
      },
    }));
    setIsDirty(true);
  };

  const removeHoursPeriod = (index: number) => {
    setProfile((prev) => ({
      ...prev,
      regularHours: {
        periods: prev.regularHours.periods.filter((_, i) => i !== index),
      },
    }));
    setIsDirty(true);
  };

  if (loading) {
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
              {profile.name || "Business Profile Management"}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Save Status */}
          {saveStatus === "success" && (
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">Saved</span>
            </div>
          )}
          {saveStatus === "error" && (
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
            disabled={loading}
            className="flex items-center space-x-2 bg-gbp-blue-500 hover:bg-gbp-blue-600 border-gbp-blue-500 text-white hover:text-white disabled:bg-gbp-blue-300 disabled:border-gbp-blue-300"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            <span>Refresh</span>
          </Button>

          <Button
            onClick={handleSave}
            className="flex items-center space-x-2 bg-gbp-blue-500 hover:bg-gbp-blue-600 border-gbp-blue-500 text-white hover:text-white"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>Save Changes</span>
          </Button>
        </div>
      </div>

      {/* Dirty State Indicator */}
      {isDirty && (
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
                <CardTitle className="text-black">Business Information</CardTitle>
                <CardDescription className="text-gray-600">
                  Basic information about your business
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="business-name" className="text-black font-medium">Business Name</Label>
                    <Input
                      id="business-name"
                      value={profile?.name || ""}
                      onChange={(e) => handleChange("", "name", e.target.value)}
                      placeholder="Enter business name"
                      className="border-gbp-blue-200 focus:border-gbp-blue-500 focus:ring-gbp-blue-500 bg-white text-black placeholder:text-gray-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="business-title" className="text-black font-medium">Business Title</Label>
                    <Input
                      id="business-title"
                      value={profile?.title || ""}
                      onChange={(e) => handleChange("", "title", e.target.value)}
                      placeholder="Enter business title"
                      className="border-gbp-blue-200 focus:border-gbp-blue-500 focus:ring-gbp-blue-500 bg-white text-black placeholder:text-gray-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-black font-medium">Business Category</Label>
                    <Select
                      value={profile?.category || ""}
                      onValueChange={(value) => handleChange("", "category", value)}
                    >
                      <SelectTrigger className="border-gbp-blue-200 focus:border-gbp-blue-500 focus:ring-gbp-blue-500 bg-white text-black">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent className="border-gbp-blue-200 bg-white max-h-[200px] overflow-y-auto">
                        {businessCategories?.map((category) => (
                          <SelectItem
                            key={category}
                            value={category}
                            className="hover:bg-gbp-blue-50 focus:bg-gbp-blue-50 text-black cursor-pointer"
                          >
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="opening-date" className="text-black font-medium">Opening Date</Label>
                    <Input
                      id="opening-date"
                      type="date"
                      value={profile?.openingDate || ""}
                      onChange={(e) => handleChange("", "openingDate", e.target.value)}
                      className="border-gbp-blue-200 focus:border-gbp-blue-500 focus:ring-gbp-blue-500 bg-white text-black"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-black font-medium">Description</Label>
                  <Textarea
                    id="description"
                    rows={4}
                    value={profile?.description || ""}
                    onChange={(e) => handleChange("", "description", e.target.value)}
                    placeholder="Describe your business..."
                    className="border-gbp-blue-200 focus:border-gbp-blue-500 focus:ring-gbp-blue-500 bg-white text-black placeholder:text-gray-400 resize-none"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contact Information Tab */}
          <TabsContent value="contact" className="p-6">
            <div className="space-y-6">
              <Card className="bg-[#eff6ff] border-gbp-blue-200">
                <CardHeader>
                  <CardTitle className="text-black">Contact Information</CardTitle>
                  <CardDescription className="text-gray-600">
                    How customers can reach your business
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="primary-phone" className="text-black font-medium">
                        Primary Phone Number
                      </Label>
                      <Input
                        id="primary-phone"
                        type="tel"
                        value={profile?.phoneNumbers?.primary || ""}
                        onChange={(e) => handleNestedChange("phoneNumbers", "", "primary", e.target.value)}
                        placeholder="+1 (555) 123-4567"
                        className="border-gbp-blue-200 focus:border-gbp-blue-500 focus:ring-gbp-blue-500 bg-white text-black placeholder:text-gray-400"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="secondary-phone" className="text-black font-medium">
                        Secondary Phone Number
                      </Label>
                      <Input
                        id="secondary-phone"
                        type="tel"
                        value={profile?.phoneNumbers?.secondary || ""}
                        onChange={(e) => handleNestedChange("phoneNumbers", "", "secondary", e.target.value)}
                        placeholder="+1 (555) 123-4568"
                        className="border-gbp-blue-200 focus:border-gbp-blue-500 focus:ring-gbp-blue-500 bg-white text-black placeholder:text-gray-400"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website" className="text-black font-medium">Website</Label>
                    <Input
                      id="website"
                      type="url"
                      value={profile?.websiteUri || ""}
                      onChange={(e) => handleChange("", "websiteUri", e.target.value)}
                      placeholder="https://www.example.com"
                      className="border-gbp-blue-200 focus:border-gbp-blue-500 focus:ring-gbp-blue-500 bg-white text-black placeholder:text-gray-400"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="chat-enabled"
                      checked={profile?.chatEnabled || false}
                      onCheckedChange={(checked) => handleChange("", "chatEnabled", checked)}
                      className="data-[state=checked]:bg-gbp-blue-500"
                    />
                    <Label htmlFor="chat-enabled" className="text-black font-medium">Enable Chat</Label>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Location Tab */}
          <TabsContent value="location" className="p-6">
            <div className="space-y-6">
              <Card className="bg-[#eff6ff] border-gbp-blue-200">
                <CardHeader>
                  <CardTitle className="text-black">Business Location</CardTitle>
                  <CardDescription className="text-gray-600">
                    Physical address and service areas
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="address-line" className="text-black font-medium">Address Line</Label>
                    <Input
                      id="address-line"
                      value={profile?.storefrontAddress?.addressLines?.[0] || ""}
                      onChange={(e) => {
                        const newAddressLines = [...(profile?.storefrontAddress?.addressLines || [])];
                        newAddressLines[0] = e.target.value;
                        handleNestedChange("storefrontAddress", "", "addressLines", newAddressLines);
                      }}
                      placeholder="123 Main Street"
                      className="border-gbp-blue-200 focus:border-gbp-blue-500 focus:ring-gbp-blue-500 bg-white text-black placeholder:text-gray-400"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="city" className="text-black font-medium">City</Label>
                      <Input 
                      
                        id="city"
                        value={profile?.storefrontAddress?.locality || ""}
                        onChange={(e) => handleNestedChange("storefrontAddress", "", "locality", e.target.value)}
                        placeholder="New York"
                        className="border-gbp-blue-200 focus:border-gbp-blue-500 focus:ring-gbp-blue-500 bg-white text-black placeholder:text-gray-400"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="state" className="text-black font-medium">State/Province</Label>
                      <Input
                        id="state"
                        value={profile?.storefrontAddress?.administrativeArea || ""}
                        onChange={(e) => handleNestedChange("storefrontAddress", "", "administrativeArea", e.target.value)}
                        placeholder="NY"
                        className="border-gbp-blue-200 focus:border-gbp-blue-500 focus:ring-gbp-blue-500 bg-white text-black placeholder:text-gray-400"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="postal-code" className="text-black font-medium">Postal Code</Label>
                      <Input 
                        id="postal-code"
                        value={profile?.storefrontAddress?.postalCode || ""}
                        onChange={(e) => handleNestedChange("storefrontAddress", "", "postalCode", e.target.value)}
                        placeholder="10001"
                        className="border-gbp-blue-200 focus:border-gbp-blue-500 focus:ring-gbp-blue-500 bg-white text-black placeholder:text-gray-400"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="service-area" className="text-black font-medium">Service Area</Label>
                    <Select
                      value={profile?.serviceArea?.businessType || ""}
                      onValueChange={(value) => handleNestedChange("serviceArea", "", "businessType", value)}
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
                </CardContent>
              </Card>
            </div>
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
                  {profile?.regularHours?.periods?.map((period, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-4 p-4 border border-gbp-blue-200 rounded-lg bg-white"
                    >
                      <Select
                        value={period?.openDay || ""}
                        onValueChange={(value) => handleArrayChange("regularHours.periods", index, "openDay", value)}
                      >
                        <SelectTrigger className="w-32 border-gbp-blue-200 focus:border-gbp-blue-500 focus:ring-gbp-blue-500 bg-white text-black">
                          <SelectValue placeholder="Day" />
                        </SelectTrigger>
                        <SelectContent className="border-gbp-blue-200 bg-white">
                          {daysOfWeek?.map((day) => (
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
                        value={period?.openTime || ""}
                        onChange={(e) => handleArrayChange("regularHours.periods", index, "openTime", e.target.value)}
                        className="w-32 border-gbp-blue-200 focus:border-gbp-blue-500 focus:ring-gbp-blue-500 bg-white text-black"
                      />

                      <span className="text-black font-medium">to</span>

                      <Input
                        type="time"
                        value={period?.closeTime || ""}
                        onChange={(e) => handleArrayChange("regularHours.periods", index, "closeTime", e.target.value)}
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
                    {Object.entries(profile?.accessibility || {}).map(([key, value]) => (
                      <div key={key} className="flex items-center space-x-2">
                        <Checkbox
                          id={`accessibility-${key}`}
                          checked={Boolean(value)}
                          onCheckedChange={(checked) => handleNestedChange("accessibility", "", key, Boolean(checked))}
                          className="border-gbp-blue-300 data-[state=checked]:bg-gbp-blue-500 data-[state=checked]:border-gbp-blue-500 cursor-pointer"
                        />
                        <Label
                          htmlFor={`accessibility-${key}`}
                          className="text-sm text-black cursor-pointer select-none"
                        >
                          {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                        </Label>
                      </div>
                    ))}
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
                    {Object.entries(profile?.amenities || {}).map(([key, value]) => (
                      <div key={key} className="flex items-center space-x-2">
                        <Checkbox
                          id={`amenities-${key}`}
                          checked={Boolean(value)}
                          onCheckedChange={(checked) => handleNestedChange("amenities", "", key, Boolean(checked))}
                          className="border-gbp-blue-300 data-[state=checked]:bg-gbp-blue-500 data-[state=checked]:border-gbp-blue-500 cursor-pointer"
                        />
                        <Label
                          htmlFor={`amenities-${key}`}
                          className="text-sm text-black cursor-pointer select-none"
                        >
                          {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
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
                    {Object.entries(profile?.crowd || {}).map(([key, value]) => (
                      <div key={key} className="flex items-center space-x-2">
                        <Checkbox
                          id={`crowd-${key}`}
                          checked={Boolean(value)}
                          onCheckedChange={(checked) => handleNestedChange("crowd", "", key, Boolean(checked))}
                          className="border-gbp-blue-300 data-[state=checked]:bg-gbp-blue-500 data-[state=checked]:border-gbp-blue-500 cursor-pointer"
                        />
                        <Label
                          htmlFor={`crowd-${key}`}
                          className="text-sm text-black cursor-pointer select-none"
                        >
                          {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
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
                    {Object.entries(profile?.parking || {}).map(([key, value]) => (
                      <div key={key} className="flex items-center space-x-2">
                        <Checkbox
                          id={`parking-${key}`}
                          checked={Boolean(value)}
                          onCheckedChange={(checked) => handleNestedChange("parking", "", key, Boolean(checked))}
                          className="border-gbp-blue-300 data-[state=checked]:bg-gbp-blue-500 data-[state=checked]:border-gbp-blue-500 cursor-pointer"
                        />
                        <Label
                          htmlFor={`parking-${key}`}
                          className="text-sm text-black cursor-pointer select-none"
                        >
                          {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
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
                    {Object.entries(profile?.pets || {}).map(([key, value]) => (
                      <div key={key} className="flex items-center space-x-2">
                        <Checkbox
                          id={`pets-${key}`}
                          checked={Boolean(value)}
                          onCheckedChange={(checked) => handleNestedChange("pets", "", key, Boolean(checked))}
                          className="border-gbp-blue-300 data-[state=checked]:bg-gbp-blue-500 data-[state=checked]:border-gbp-blue-500 cursor-pointer"
                        />
                        <Label
                          htmlFor={`pets-${key}`}
                          className="text-sm text-black cursor-pointer select-none"
                        >
                          {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
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
                          id="online-estimates"
                          checked={Boolean(profile?.serviceOptions?.onlineEstimates)}
                          onCheckedChange={(checked) => handleNestedChange("serviceOptions", "", "onlineEstimates", Boolean(checked))}
                          className="border-gbp-blue-300 data-[state=checked]:bg-gbp-blue-500 data-[state=checked]:border-gbp-blue-500 cursor-pointer"
                        />
                        <Label htmlFor="online-estimates" className="text-sm text-black cursor-pointer select-none">
                          Online Estimates
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="onsite-services"
                          checked={Boolean(profile?.serviceOptions?.onSiteServices)}
                          onCheckedChange={(checked) => handleNestedChange("serviceOptions", "", "onSiteServices", Boolean(checked))}
                          className="border-gbp-blue-300 data-[state=checked]:bg-gbp-blue-500 data-[state=checked]:border-gbp-blue-500 cursor-pointer"
                        />
                        <Label htmlFor="onsite-services" className="text-sm text-black cursor-pointer select-none">
                          On-site Services
                        </Label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="languages" className="text-black font-medium">Languages Spoken</Label>
                      <Input
                        id="languages"
                        value={profile?.serviceOptions?.languageSpoken?.join(", ") || ""}
                        onChange={(e) => handleNestedChange("serviceOptions", "", "languageSpoken", e.target.value.split(", ").filter(Boolean))}
                        placeholder="English, Spanish, French"
                        className="border-gbp-blue-200 focus:border-gbp-blue-500 focus:ring-gbp-blue-500 bg-white text-black placeholder:text-gray-400"
                      />
                    </div>
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
