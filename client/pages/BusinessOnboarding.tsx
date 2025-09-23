import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Star, ArrowLeft, Loader2, Globe } from "lucide-react";
import { AccountsResponse } from "@shared/api";
import axios from "axios";
import { SERVER } from "@/constants";

// Updated BusinessLocation interface
interface BusinessLocation {
  locationId: string; // Explicitly include locationId for API payload
  name: string;
  title: string;
  status: string; // e.g., "OPEN", "CLOSED"
  verificationStatus: string; // e.g., "VERIFIED", "UNVERIFIED"
  storefrontAddress: {
    regionCode: string;
    languageCode: string;
    postalCode: string;
    administrativeArea: string;
    locality: string;
    addressLines: string[];
  };
  phone?: string;
  websiteUri?: string;
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
  placeInfo?: {
    placeIds: string[];
  }; // Optional, in case placeIds is needed as fallback
}

export default function BusinessOnboarding() {
  const navigate = useNavigate();
  const [data, setData] = useState<AccountsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBusinesses, setSelectedBusinesses] = useState<string[]>([]);

  const fetchBusinesses = async () => {
    try {
      console.log(SERVER, "api/v1/accounts");
      setLoading(true);
      const response = await axios.get(`${SERVER}/api/v1/accounts`, {
        withCredentials: true,
      });

      if (response.status === 401) {
        throw new Error("Authentication required");
      }

      setData(response.data);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ||
            err.response?.data?.error ||
            err.message ||
            "Failed to fetch businesses"
        );
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, []);

  // Safely flatten all locations from all accounts
  const allLocations =
    data?.accounts?.flatMap((account) => account.locations) || [];

  // Filter locations based on search term
  const filteredLocations = allLocations.filter((location: BusinessLocation) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      location.title.toLowerCase().includes(term) ||
      location.name.toLowerCase().includes(term) ||
      location.verificationStatus.toLowerCase().includes(term);
    return matchesSearch;
  });

  const toggleBusinessSelection = (businessId: string) => {
    setSelectedBusinesses((prev) =>
      prev.includes(businessId)
        ? prev.filter((id) => id !== businessId)
        : [...prev, businessId]
    );
  };

  const handleAddBusinessesApi = async (locations: BusinessLocation[]) => {
    try {
      const payload = locations.map((location) => {
        const locationId =
          location.locationId || location.placeInfo?.placeIds[0];
        if (!locationId) {
          throw new Error(`Missing locationId for location: ${location.title}`);
        }
        return {
          locationId,
          title: location.title,
          address: location.storefrontAddress,
          phone: location.phone,
          websiteUri: location.websiteUri,
          metadata: location.metadata,
        };
      });

      console.log("API Payload:", payload); // Debug payload

      const res = await axios.post(
        `${SERVER}/api/v1/account/add-businesses`,
        payload,
        {
          withCredentials: true,
        }
      );

      return res.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorDetails = error.response?.data?.detail;
        if (errorDetails) {
          const errorMessages = errorDetails
            .map((err: any) => err.msg)
            .join(", ");
          throw new Error(`Failed to add businesses: ${errorMessages}`);
        }
        throw new Error(
          error.response?.data?.message ||
            error.response?.data?.error ||
            error.message ||
            "Failed to add businesses"
        );
      } else {
        throw new Error(
          error instanceof Error
            ? error.message
            : "An unexpected error occurred while adding businesses"
        );
      }
    }
  };

  console.log({selectedBusinesses, allLocations})

  // const handleAddBusinesses = async () => {
  //   if (selectedBusinesses.length === 0 || allLocations.length === 0) return;

  //   try {
  //     // Filter selected locations
  //     const businessesToAdd = allLocations
  //       .filter((location) =>
  //         selectedBusinesses.includes(location.locationId)
  //       )
  //       .map((location) => ({
  //         id: location.locationId,
  //         name: location.title,
  //         rating: 5,
  //         reviewCount: 0,
  //         address: `Status: ${location.status}`,
  //         location,
  //       }));

  //     // Call API to add businesses
  //     await handleAddBusinessesApi(
  //       allLocations.filter((location: BusinessLocation) =>
  //         selectedBusinesses.includes(location.locationId)
  //       )
  //     );

  //     // Persist in localStorage
  //     const existingBusinesses = JSON.parse(
  //       localStorage.getItem("userBusinesses") || "[]"
  //     );
  //     const updatedBusinesses = [...existingBusinesses, ...businessesToAdd];
  //     localStorage.setItem("userBusinesses", JSON.stringify(updatedBusinesses));

  //     if (businessesToAdd.length > 0) {
  //       const selectedBusiness = localStorage.getItem("selectedBusiness");
  //       if (!selectedBusiness) {
  //         localStorage.setItem(
  //           "selectedBusiness",
  //           JSON.stringify(businessesToAdd[0])
  //         );
  //       }
  //     }

  //     navigate("/businesses", { replace: true });
  //   } catch (error) {
  //     console.error("Error adding businesses:", error);
  //     setError(
  //       error instanceof Error ? error.message : "Failed to add businesses"
  //     );
  //   }
  // };


  const handleAddBusinesses = async () => {
  if (selectedBusinesses.length === 0 || allLocations.length === 0) return;

  try {
    // Prepare payload in correct format for API
    const businessesToAdd:any = allLocations
      .filter((location: any) =>
        selectedBusinesses.includes(location.locationId)
      )
      .map((location:any) => ({
        locationId: `locations/${location.locationId}`, // full format
        title: location.title,
        address: location.address || {}, // ensure it's passed
        phone: location.phone || "",
        websiteUri: location.websiteUri || "",
        metadata: location.metadata || {}
      }));

    // Call API with correct payload
    await handleAddBusinessesApi(businessesToAdd);

    // Persist in localStorage
    const existingBusinesses = JSON.parse(
      localStorage.getItem("userBusinesses") || "[]"
    );

    const updatedBusinesses = [...existingBusinesses, ...businessesToAdd];
    localStorage.setItem("userBusinesses", JSON.stringify(updatedBusinesses));

    // Set default selected business if not already set
    if (businessesToAdd.length > 0) {
      const selectedBusiness = localStorage.getItem("selectedBusiness");
      if (!selectedBusiness) {
        localStorage.setItem(
          "selectedBusiness",
          JSON.stringify(businessesToAdd[0])
        );
      }
    }

    navigate("/businesses", { replace: true });
  } catch (error) {
    console.error("Error adding businesses:", error);
    setError(
      error instanceof Error ? error.message : "Failed to add businesses"
    );
  }
};



  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-full">
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-2">
            <Loader2 className="w-6 h-6 animate-spin text-gbp-blue-500" />
            <span className="text-gray-600">
              Loading available businesses...
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-full">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Globe className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Failed to load available businesses
          </h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-gbp-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-gbp-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-4 mb-4">
          <button
            onClick={() => navigate("/businesses")}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Add Business</h1>
            <p className="text-gray-600 mt-1">
              Select businesses to add to your account (
              {data?.totalLocations ?? 0} available)
            </p>
          </div>
        </div>
        {/* Progress indicator */}
        <div className="bg-white rounded-lg p-4 border border-gray-200 mb-6">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Step 1 of 2</span>
            <span className="text-gbp-blue-600 font-medium">
              {selectedBusinesses.length} business
              {selectedBusinesses.length !== 1 ? "es" : ""} selected
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div
              className="bg-gbp-blue-500 h-2 rounded-full"
              style={{ width: "50%" }}
            ></div>
          </div>
        </div>
      </div>
      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search businesses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gbp-blue-500 focus:border-transparent w-full"
          />
        </div>
      </div>
      {/* Business List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
        {filteredLocations.map((location: BusinessLocation) => {
          const isSelected = selectedBusinesses.includes(location.locationId);
          return (
            <div
              key={location.locationId}
              className={`flex items-center justify-between p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors ${
                isSelected ? "bg-blue-50" : ""
              }`}
            >
              {/* Left side */}
              <div className="flex items-center space-x-4">
                {/* Location Pin Icon */}
                <div className="w-6 h-6 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-blue-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                {/* Details */}
                <div className="flex-1">
                  {/* Star rating */}
                  <div className="flex items-center space-x-1 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 text-yellow-400 fill-current"
                      />
                    ))}
                    <span className="text-sm font-medium text-gray-900 ml-1">
                      5
                    </span>
                  </div>
                  <h3 className="text-base font-medium text-gray-900 mb-1">
                    {location.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Status: {location.status} | Verified:{" "}
                    {location.verificationStatus}
                  </p>
                </div>
              </div>
              {/* Right side: Select button */}
              <div className="flex-shrink-0">
                <button
                  onClick={() => toggleBusinessSelection(location.locationId)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                    isSelected
                      ? "bg-blue-500 text-white border-blue-500 hover:bg-blue-600"
                      : "bg-white text-blue-500 border-blue-500 hover:bg-blue-50"
                  }`}
                >
                  {isSelected ? "Selected" : "Select Profile"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
      {/* Empty state */}
      {filteredLocations.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No businesses found
          </h3>
          <p className="text-gray-500">Try adjusting your search criteria</p>
        </div>
      )}
      {/* Bottom action bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {selectedBusinesses.length > 0
              ? `${selectedBusinesses.length} business${
                  selectedBusinesses.length !== 1 ? "es" : ""
                } selected`
              : "Select businesses to continue"}
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate("/businesses")}
              className="px-4 py-2 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddBusinesses}
              disabled={selectedBusinesses.length === 0}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                selectedBusinesses.length > 0
                  ? "bg-gbp-blue-500 text-white hover:bg-gbp-blue-600"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              Add Selected Business
              {selectedBusinesses.length !== 1 ? "es" : ""}
            </button>
          </div>
        </div>
      </div>
      {/* Padding for fixed bottom action bar */}
      <div className="h-20"></div>
    </div>
  );
}