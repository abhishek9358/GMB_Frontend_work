import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Globe, Loader2 } from "lucide-react";

interface UserBusiness {
  id: string;
  name: string;
  rating: number;
  reviewCount: number;
  address: string;
  category: string;
  phone?: string;
  website?: string;
  location?: any; // Full location data from API
}

interface StatusBreakdown {
  verified: number;
  unverified: number;
  suspended: number;
  disabled: number;
  incomplete: number;
  duplicate: number;
  googleUpdates: number;
  missingStoreCodes: number;
}

export default function Businesses() {
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState<UserBusiness[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  // Load businesses from localStorage
  useEffect(() => {
    const loadBusinesses = () => {
      try {
        setLoading(true);
        const savedBusinesses = localStorage.getItem("userBusinesses");
        if (savedBusinesses) {
          const parsedBusinesses = JSON.parse(savedBusinesses);
          setBusinesses(parsedBusinesses);
        } else {
          setBusinesses([]);
        }
      } catch (error) {
        console.error('Error loading businesses from localStorage:', error);
        setBusinesses([]);
      } finally {
        setLoading(false);
      }
    };

    loadBusinesses();

    // Listen for storage changes (when businesses are added from other tabs/components)
    const handleStorageChange = () => {
      loadBusinesses();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("focus", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("focus", handleStorageChange);
    };
  }, []);

  // Filter businesses based on selected filter and search term
  const filteredBusinesses = businesses.filter((business) => {
    // Apply search filter
    const matchesSearch = 
      business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      business.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      business.address.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    // Apply status filter (simplified for localStorage businesses)
    if (selectedFilter === "all") return true;
    
    // For localStorage businesses, we can only filter by basic criteria
    // since we don't have the full status information
    if (selectedFilter === "verified") {
      return business.location?.status?.some((status: string) => status.includes('VERIFIED')) || false;
    }
    
    return true; // For other filters, show all for now
  });

  // Calculate status breakdown from current businesses
  const statusBreakdown: StatusBreakdown = {
    verified: businesses.filter(b => b.location?.status?.some((s: string) => s.includes('VERIFIED'))).length,
    unverified: businesses.filter(b => b.location?.status?.some((s: string) => s.includes('UNVERIFIED'))).length,
    suspended: businesses.filter(b => b.location?.status?.some((s: string) => s.includes('SUSPENDED'))).length,
    disabled: 0,
    incomplete: 0,
    duplicate: 0,
    googleUpdates: 0,
    missingStoreCodes: 0,
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-full">
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-2">
            <Loader2 className="w-6 h-6 animate-spin text-gbp-blue-500" />
            <span className="text-gray-600">Loading businesses...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Businesses</h1>
          <p className="text-gray-600 mt-1">
            Manage your selected businesses ({businesses.length} total)
          </p>
        </div>
        <button
          onClick={() => navigate("/businesses/add")}
          className="bg-gbp-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-gbp-blue-600 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add a business</span>
        </button>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Filters */}
        <div className="w-64 flex-shrink-0">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="font-medium text-gray-900 mb-4">Filter by status</h3>
            <div className="space-y-2">
              <button
                onClick={() => setSelectedFilter("all")}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  selectedFilter === "all"
                    ? "bg-gbp-blue-50 text-gbp-blue-700 border border-gbp-blue-200"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>All businesses</span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                    {businesses.length}
                  </span>
                </div>
              </button>
              
              <button
                onClick={() => setSelectedFilter("verified")}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  selectedFilter === "verified"
                    ? "bg-gbp-blue-50 text-gbp-blue-700 border border-gbp-blue-200"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>Verified</span>
                  <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
                    {statusBreakdown.verified}
                  </span>
                </div>
              </button>
              
              <button
                onClick={() => setSelectedFilter("unverified")}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  selectedFilter === "unverified"
                    ? "bg-gbp-blue-50 text-gbp-blue-700 border border-gbp-blue-200"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>Unverified</span>
                  <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full">
                    {statusBreakdown.unverified}
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
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

          {/* Results Count */}
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Showing {filteredBusinesses.length} of {businesses.length} businesses
            </p>
          </div>

          {/* Business List */}
          <div className="space-y-4">
            {filteredBusinesses.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {businesses.length === 0 ? "No businesses added yet" : "No businesses found"}
                </h3>
                <p className="text-gray-500">
                  {businesses.length === 0 
                    ? "Get started by adding your first business" 
                    : searchTerm || selectedFilter !== "all" 
                      ? "Try adjusting your search criteria or filters" 
                      : "No businesses match your criteria"}
                </p>
                <button 
                  onClick={() => navigate("/businesses/add")}
                  className="mt-4 bg-gbp-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-gbp-blue-600 transition-colors"
                >
                  {businesses.length === 0 ? "Add Your First Business" : "Add More Businesses"}
                </button>
              </div>
            ) : (
              filteredBusinesses.map((business) => (
                <div key={business.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:border-gray-300 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start space-x-4">
                        {/* Business Icon */}
                        <div className="w-12 h-12 bg-gradient-to-br from-gbp-blue-100 to-gbp-blue-200 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-gbp-blue-700 font-bold text-lg">
                            {business.name.charAt(0)}
                          </span>
                        </div>

                        {/* Business Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="text-lg font-semibold text-gray-900 truncate">
                              {business.name}
                            </h3>
                            {business.location?.status?.some((s: string) => s.includes('VERIFIED')) && (
                              <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                                Verified
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                            <span className="flex items-center">
                              <span className="text-yellow-400 mr-1">★</span>
                              {business.rating} ({business.reviewCount} reviews)
                            </span>
                            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                              {business.category}
                            </span>
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-3">{business.address}</p>
                          
                          <div className="flex items-center space-x-4 text-sm">
                            {business.phone && (
                              <span className="text-gray-600">{business.phone}</span>
                            )}
                            {business.website && (
                              <a 
                                href={business.website} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-gbp-blue-600 hover:text-gbp-blue-700"
                              >
                                Visit website
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex-shrink-0 ml-4">
                      <button
                        onClick={() => navigate(`/businesses/${encodeURIComponent(business.id)}/manage`)}
                        className="bg-gray-50 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
                      >
                        Manage
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
