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
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import gmbProfileService, { BusinessProfile as ServiceBusinessProfile } from "@/services/gmbProfileService";

interface BusinessProfile {
  name: string;
  title: string;
  category: string;
  description: string;
  openingDate: string;
  phoneNumbers: {
    primary: string;
    secondary?: string;
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
  specialHours: Array<{
    startDate: string;
    endDate: string;
    closed: boolean;
    openTime?: string;
    closeTime?: string;
  }>;
  moreHours: Array<{
    hoursTypeId: string;
    periods: Array<{
      openDay: string;
      openTime: string;
      closeDay: string;
      closeTime: string;
    }>;
  }>;
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
  "Other"
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
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Load business profile data
  useEffect(() => {
    const loadProfile = async () => {
      if (!locationName) return;
      
      setLoading(true);
      try {
        // TODO: Replace with actual API call
        const response = await fetch(`/api/business/${locationName}/details`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setProfile(data);
        } else {
          // Fallback: Load from localStorage or show empty form
          console.log('Failed to load from API, using empty form');
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [locationName]);

  // Handle form changes
  const handleChange = (section: string, field: string, value: any) => {
    setProfile(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof BusinessProfile],
        [field]: value,
      },
    }));
    setIsDirty(true);
    setSaveStatus('idle');
  };

  const handleNestedChange = (section: string, subsection: string, field: string, value: any) => {
    setProfile(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof BusinessProfile],
        [subsection]: {
          ...(prev[section as keyof BusinessProfile] as any)[subsection],
          [field]: value,
        },
      },
    }));
    setIsDirty(true);
    setSaveStatus('idle');
  };

  const handleArrayChange = (section: string, index: number, field: string, value: any) => {
    setProfile(prev => {
      const sectionData = prev[section as keyof BusinessProfile] as any;
      const newArray = [...sectionData];
      newArray[index] = { ...newArray[index], [field]: value };
      return {
        ...prev,
        [section]: newArray,
      };
    });
    setIsDirty(true);
    setSaveStatus('idle');
  };

  // Save profile
  const handleSave = async () => {
    setSaving(true);
    setSaveStatus('idle');
    
    try {
      // TODO: Replace with actual API call
      const response = await fetch(`/api/business/${locationName}/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify(profile),
      });
      
      if (response.ok) {
        setSaveStatus('success');
        setIsDirty(false);
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        setSaveStatus('error');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  };

  // Refresh data
  const handleRefresh = async () => {
    setLoading(true);
    try {
      // Re-fetch data from API
      const response = await fetch(`/api/business/${locationName}/details`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setIsDirty(false);
        setSaveStatus('idle');
      }
    } catch (error) {
      console.error('Error refreshing profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const addHoursPeriod = () => {
    setProfile(prev => ({
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
    setProfile(prev => ({
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
            onClick={() => navigate('/businesses')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Businesses</span>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Manage Business Profile
            </h1>
            <p className="text-gray-600 mt-1">
              {profile.name || 'Business Profile Management'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Save Status */}
          {saveStatus === 'success' && (
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">Saved</span>
            </div>
          )}
          {saveStatus === 'error' && (
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
            className="flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </Button>
          
          <Button
            onClick={handleSave}
            disabled={saving || !isDirty}
            className="flex items-center space-x-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Changes</span>
          </Button>
        </div>
      </div>

      {/* Dirty State Indicator */}
      {isDirty && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-yellow-600" />
            <span className="text-sm text-yellow-800">
              You have unsaved changes. Don't forget to save!
            </span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="bg-white rounded-lg border border-gray-200">
        <Tabs defaultValue="business-info" className="w-full">
          <TabsList className="grid w-full grid-cols-5 rounded-t-lg">
            <TabsTrigger value="business-info" className="flex items-center space-x-2">
              <Building2 className="w-4 h-4" />
              <span>Business Info</span>
            </TabsTrigger>
            <TabsTrigger value="contact" className="flex items-center space-x-2">
              <Phone className="w-4 h-4" />
              <span>Contact</span>
            </TabsTrigger>
            <TabsTrigger value="location" className="flex items-center space-x-2">
              <MapPin className="w-4 h-4" />
              <span>Location</span>
            </TabsTrigger>
            <TabsTrigger value="hours" className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>Hours</span>
            </TabsTrigger>
            <TabsTrigger value="more" className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>More</span>
            </TabsTrigger>
          </TabsList>

          {/* Business Information Tab */}
          <TabsContent value="business-info" className="p-6">
            <Card>
              <CardHeader>
                <CardTitle>Business Information</CardTitle>
                <CardDescription>
                  Basic information about your business
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="business-name">Business Name</Label>
                    <Input
                      id="business-name"
                      value={profile.name}
                      onChange={(e) => handleChange('', 'name', e.target.value)}
                      placeholder="Enter business name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="business-title">Business Title</Label>
                    <Input
                      id="business-title"
                      value={profile.title}
                      onChange={(e) => handleChange('', 'title', e.target.value)}
                      placeholder="Enter business title"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="category">Business Category</Label>
                    <Select
                      value={profile.category}
                      onValueChange={(value) => handleChange('', 'category', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {businessCategories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="opening-date">Opening Date</Label>
                    <Input
                      id="opening-date"
                      type="date"
                      value={profile.openingDate}
                      onChange={(e) => handleChange('', 'openingDate', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    rows={4}
                    value={profile.description}
                    onChange={(e) => handleChange('', 'description', e.target.value)}
                    placeholder="Describe your business..."
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contact Information Tab */}
          <TabsContent value="contact" className="p-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                  <CardDescription>
                    How customers can reach your business
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="primary-phone">Primary Phone Number</Label>
                      <Input
                        id="primary-phone"
                        type="tel"
                        value={profile.phoneNumbers.primary}
                        onChange={(e) => handleNestedChange('phoneNumbers', '', 'primary', e.target.value)}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="secondary-phone">Secondary Phone Number</Label>
                      <Input
                        id="secondary-phone"
                        type="tel"
                        value={profile.phoneNumbers.secondary}
                        onChange={(e) => handleNestedChange('phoneNumbers', '', 'secondary', e.target.value)}
                        placeholder="+1 (555) 123-4568"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      type="url"
                      value={profile.websiteUri}
                      onChange={(e) => handleChange('', 'websiteUri', e.target.value)}
                      placeholder="https://www.example.com"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="chat-enabled"
                      checked={profile.chatEnabled}
                      onCheckedChange={(checked) => handleChange('', 'chatEnabled', checked)}
                    />
                    <Label htmlFor="chat-enabled">Enable Chat</Label>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Location Tab */}
          <TabsContent value="location" className="p-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Business Location</CardTitle>
                  <CardDescription>
                    Physical address and service areas
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="address-line">Address Line</Label>
                    <Input
                      id="address-line"
                      value={profile.storefrontAddress.addressLines[0] || ''}
                      onChange={(e) => {
                        const newAddressLines = [...profile.storefrontAddress.addressLines];
                        newAddressLines[0] = e.target.value;
                        handleNestedChange('storefrontAddress', '', 'addressLines', newAddressLines);
                      }}
                      placeholder="123 Main Street"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={profile.storefrontAddress.locality}
                        onChange={(e) => handleNestedChange('storefrontAddress', '', 'locality', e.target.value)}
                        placeholder="New York"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="state">State/Province</Label>
                      <Input
                        id="state"
                        value={profile.storefrontAddress.administrativeArea}
                        onChange={(e) => handleNestedChange('storefrontAddress', '', 'administrativeArea', e.target.value)}
                        placeholder="NY"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="postal-code">Postal Code</Label>
                      <Input
                        id="postal-code"
                        value={profile.storefrontAddress.postalCode}
                        onChange={(e) => handleNestedChange('storefrontAddress', '', 'postalCode', e.target.value)}
                        placeholder="10001"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="service-area">Service Area</Label>
                    <Select
                      value={profile.serviceArea.businessType}
                      onValueChange={(value) => handleNestedChange('serviceArea', '', 'businessType', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CUSTOMER_LOCATION_ONLY">Customer Location Only</SelectItem>
                        <SelectItem value="CUSTOMER_AND_BUSINESS_LOCATION">Customer & Business Location</SelectItem>
                        <SelectItem value="BUSINESS_LOCATION_ONLY">Business Location Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Hours Tab */}
          <TabsContent value="hours" className="p-6">
            <Card>
              <CardHeader>
                <CardTitle>Opening Hours</CardTitle>
                <CardDescription>
                  Set your regular business hours
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {profile.regularHours.periods.map((period, index) => (
                    <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                      <Select
                        value={period.openDay}
                        onValueChange={(value) => handleArrayChange('regularHours.periods', index, 'openDay', value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {daysOfWeek.map((day) => (
                            <SelectItem key={day.value} value={day.value}>
                              {day.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <Input
                        type="time"
                        value={period.openTime}
                        onChange={(e) => handleArrayChange('regularHours.periods', index, 'openTime', e.target.value)}
                        className="w-32"
                      />
                      
                      <span className="text-gray-500">to</span>
                      
                      <Input
                        type="time"
                        value={period.closeTime}
                        onChange={(e) => handleArrayChange('regularHours.periods', index, 'closeTime', e.target.value)}
                        className="w-32"
                      />
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeHoursPeriod(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  
                  <Button
                    variant="outline"
                    onClick={addHoursPeriod}
                    className="w-full"
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
              <Card>
                <CardHeader>
                  <CardTitle>Accessibility</CardTitle>
                  <CardDescription>
                    Accessibility features available at your business
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(profile.accessibility).map(([key, value]) => (
                      <div key={key} className="flex items-center space-x-2">
                        <Checkbox
                          id={`accessibility-${key}`}
                          checked={value}
                          onCheckedChange={(checked) => handleNestedChange('accessibility', '', key, checked)}
                        />
                        <Label htmlFor={`accessibility-${key}`} className="text-sm">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </Label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Amenities */}
              <Card>
                <CardHeader>
                  <CardTitle>Amenities</CardTitle>
                  <CardDescription>
                    Services and amenities offered at your business
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(profile.amenities).map(([key, value]) => (
                      <div key={key} className="flex items-center space-x-2">
                        <Checkbox
                          id={`amenities-${key}`}
                          checked={value}
                          onCheckedChange={(checked) => handleNestedChange('amenities', '', key, checked)}
                        />
                        <Label htmlFor={`amenities-${key}`} className="text-sm">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </Label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Crowd */}
              <Card>
                <CardHeader>
                  <CardTitle>Crowd</CardTitle>
                  <CardDescription>
                    Types of customers your business welcomes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(profile.crowd).map(([key, value]) => (
                      <div key={key} className="flex items-center space-x-2">
                        <Checkbox
                          id={`crowd-${key}`}
                          checked={value}
                          onCheckedChange={(checked) => handleNestedChange('crowd', '', key, checked)}
                        />
                        <Label htmlFor={`crowd-${key}`} className="text-sm">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </Label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Parking */}
              <Card>
                <CardHeader>
                  <CardTitle>Parking</CardTitle>
                  <CardDescription>
                    Parking options available at your business
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(profile.parking).map(([key, value]) => (
                      <div key={key} className="flex items-center space-x-2">
                        <Checkbox
                          id={`parking-${key}`}
                          checked={value}
                          onCheckedChange={(checked) => handleNestedChange('parking', '', key, checked)}
                        />
                        <Label htmlFor={`parking-${key}`} className="text-sm">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </Label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Pets */}
              <Card>
                <CardHeader>
                  <CardTitle>Pets</CardTitle>
                  <CardDescription>
                    Pet policies at your business
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(profile.pets).map(([key, value]) => (
                      <div key={key} className="flex items-center space-x-2">
                        <Checkbox
                          id={`pets-${key}`}
                          checked={value}
                          onCheckedChange={(checked) => handleNestedChange('pets', '', key, checked)}
                        />
                        <Label htmlFor={`pets-${key}`} className="text-sm">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </Label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Service Options */}
              <Card>
                <CardHeader>
                  <CardTitle>Service Options</CardTitle>
                  <CardDescription>
                    Additional service options and languages
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="online-estimates"
                          checked={profile.serviceOptions.onlineEstimates}
                          onCheckedChange={(checked) => handleNestedChange('serviceOptions', '', 'onlineEstimates', checked)}
                        />
                        <Label htmlFor="online-estimates" className="text-sm">
                          Online Estimates
                        </Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="onsite-services"
                          checked={profile.serviceOptions.onSiteServices}
                          onCheckedChange={(checked) => handleNestedChange('serviceOptions', '', 'onSiteServices', checked)}
                        />
                        <Label htmlFor="onsite-services" className="text-sm">
                          On-site Services
                        </Label>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="languages">Languages Spoken</Label>
                      <Input
                        id="languages"
                        value={profile.serviceOptions.languageSpoken.join(', ')}
                        onChange={(e) => handleNestedChange('serviceOptions', '', 'languageSpoken', e.target.value.split(', ').filter(Boolean))}
                        placeholder="English, Spanish, French"
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
