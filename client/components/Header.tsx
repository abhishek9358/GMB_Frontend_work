import { Search, Bell, ChevronDown, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "../contexts/AuthContext";
import { SERVER } from "@/constants";
import axios from "axios";
import { formatAddress } from "@/utils";
import { UserBusiness } from "@/pages/Businesses";

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

interface Business {
  id: string;
  name: string;
  rating: number;
  reviewCount: number;
  address: string;
  phone?: string;
  website?: string;
  category: string;
  image?: string;
  locationId?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  const { logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showBusinessSelector, setShowBusinessSelector] = useState(false);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [activeSelectedBusiness, setActiveSelectedBusiness] = useState<Business | null>(
    null,
  );

  async function fetchMyBusinesses() {
    try {
      const res = await axios.get(`${SERVER}/api/v1/account/mybusinesses`, {
        withCredentials: true,
      });
      console.log("My Businesses Response", res.data);

      if (res.data.success && res.data.businesses) {
        const transformedBusinesses: UserBusiness[] = res.data.businesses.map(
          (business: any) => ({
            id: business.id,
            name: business.title,
            rating: business?.rating || 0, // default if missing
            reviewCount: business?.reviewCount || 0, // default if missing
            address: formatAddress(business.address),
            category:
              business.category?.primaryCategory?.displayName ||
              "Uncategorized",
            phone: business.phone || "",
            website: business.websiteUri || "",
            locationId: business.locationId || "",
          }),
        );

        // Save to state + localStorage
        setBusinesses(transformedBusinesses);
        localStorage.setItem(
          "userBusinesses",
          JSON.stringify(transformedBusinesses),
        );

        return transformedBusinesses; // ✅ return businesses
      }

      return [];
    } catch (error) {
      console.log("Error:", error);
      return [];
    }
  }

  // Load businesses from API or localStorage
  useEffect(() => {
    const loadBusinesses = async () => {
      const defaultBusinesses: UserBusiness[] = [];

      // Try localStorage first
      const storedSelected = localStorage.getItem("selectedBusiness");
      let allBusinesses = [...defaultBusinesses];

      if (storedSelected) {
        try {
          const parsed: Business = JSON.parse(storedSelected);
          const found = allBusinesses.find((b) => b.id === parsed.id);
          if (found) {
            setActiveSelectedBusiness(found);
          }
        } catch (err) {
          console.error("Failed to parse selectedBusiness:", err);
        }
      }

      // Always fetch fresh from API
      const fetchedBusinesses = await fetchMyBusinesses();
      if (fetchedBusinesses.length > 0) {
        // merge without duplicates
        fetchedBusinesses.forEach((b) => {
          if (!allBusinesses.find((x) => x.id === b.id)) {
            allBusinesses.push(b);
          }
        });
      }

      setBusinesses(allBusinesses);

      // Select default business
      if (allBusinesses.length > 0 && !activeSelectedBusiness) {
        setActiveSelectedBusiness(allBusinesses[0]);
      }
    };

    loadBusinesses();

    // Listen for storage/focus changes
    const handleStorageChange = () => loadBusinesses();

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("focus", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("focus", handleStorageChange);
    };
  }, [activeSelectedBusiness]);

  const handleBusinessSelect = (business: Business) => {
    setActiveSelectedBusiness(business);
    setShowBusinessSelector(false);

    // Store full business + locationId separately
    localStorage.setItem("selectedBusiness", JSON.stringify(business));
    localStorage.setItem(
      "selectedBusinessLocationId",
      business.locationId || "",
    );
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest(".business-selector")) {
        setShowBusinessSelector(false);
      }
      if (!target.closest(".profile-dropdown")) {
        setShowProfile(false);
      }
      if (!target.closest(".notifications-dropdown")) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left section - Title and breadcrumbs */}
        <div className="flex items-center space-x-4">
          {title && (
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              {subtitle && (
                <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
              )}
            </div>
          )}
        </div>

        {/* Right section - Search, notifications, profile */}
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gbp-blue-500 focus:border-transparent w-64"
            />
          </div>

          {/* Business Selector */}
          <div className="relative business-selector">
            <button
              onClick={() => setShowBusinessSelector(!showBusinessSelector)}
              className="flex items-center space-x-2 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div className="w-6 h-6 bg-gbp-blue-100 rounded flex items-center justify-center">
                <span className="text-gbp-blue-600 text-xs font-medium">
                  {activeSelectedBusiness ? activeSelectedBusiness?.name?.charAt(0) : "B"}
                </span>
              </div>
              <span className="text-sm font-medium text-gray-700 max-w-40 truncate">
                {activeSelectedBusiness ? activeSelectedBusiness.name : "Select Business"}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>

            {/* Business Selector Dropdown */}
            {showBusinessSelector && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 max-h-96 overflow-y-auto">
                <div className="px-4 py-2 border-b border-gray-100">
                  <h3 className="text-sm font-medium text-gray-900">
                    Select Business
                  </h3>
                </div>
                {businesses.map((business) => (
                  <button
                    key={business.id}
                    onClick={() => handleBusinessSelect(business)}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                      activeSelectedBusiness?.id === business.id
                        ? "bg-gbp-blue-50 border-r-2 border-gbp-blue-500"
                        : ""
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gbp-blue-100 rounded flex items-center justify-center">
                        <span className="text-gbp-blue-600 text-sm font-medium">
                          {business?.name?.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {business.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {business.category}
                        </p>
                      </div>
                      {activeSelectedBusiness?.id === business.id && (
                        <div className="w-2 h-2 bg-gbp-blue-500 rounded-full"></div>
                      )}
                    </div>
                  </button>
                ))}
                {businesses.length === 0 && (
                  <div className="px-4 py-6 text-center text-gray-500">
                    <p className="text-sm">No businesses found</p>
                    <p className="text-xs mt-1">
                      Add a business to get started
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Notifications */}
          <div className="relative notifications-dropdown">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-gbp-orange-500 rounded-full"></span>
            </button>
          </div>

          {/* Profile dropdown */}
          <div className="relative profile-dropdown">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-lg"
            >
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-gray-600 text-sm font-medium">AB</span>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>

            {/* Profile dropdown menu */}
            {showProfile && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <a
                  href="#"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Manage Events
                </a>
                <a
                  href="#"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Add another account
                </a>
                <a
                  href="#"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Images
                </a>
                <a
                  href="#"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Agency Referral Program
                </a>
                <div className="border-t border-gray-100 mt-1 pt-1">
                  <a
                    href="#"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Language: English
                  </a>
                  <button
                    onClick={logout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
