import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./layouts/MainLayout";
import Login from "./pages/Login";
import AuthCallback from "./pages/AuthCallback";
import Dashboard from "./pages/Dashboard";
import Businesses from "./pages/Businesses";
import BusinessOnboarding from "./pages/BusinessOnboarding";
import BusinessProfileManagement from "./pages/BusinessProfileManagement";
import Automation from "./pages/Automation";
import Reviews from "./pages/Reviews";
import CompetitorDashboard from "./pages/Competitor";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import { lazy, Suspense, useState } from "react";
import { useEffect } from "react";
import axios from "axios";
import { SERVER } from "./constants";
import {useDispatch, useSelector} from "react-redux"
import { loadUser } from "./redux/slices/user.slice";
import { setActiveLocation } from "./redux/slices/activeLocation.slice";
import { RootState } from "./redux/store";
import type {Location as LocationType } from "./redux/slices/activeLocation.slice"
import { normalizeLocation } from "./redux/slices/activeLocation.slice";

const GSCOverview = lazy(
  () => import("./pages/analytics/SearchConsoleOverview"),
);
const GSCPerformance = lazy(
  () => import("./pages/analytics/SearchConsolePerformance"),
);
const GSCIndexing = lazy(
  () => import("./pages/analytics/SearchConsoleIndexing"),
);

function App() {
    const dispatch = useDispatch();

    const {user} = useSelector((state: RootState) => state.user)

    const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  useEffect(() => {
    async function authLogin(name: string, accountId: string) {
      try {
        const res = await axios.post(`${SERVER}/auth/login`, {name, accountId}, {withCredentials: true, headers: {"Content-Type": "Application/json"}});
        console.log("LoginResponse", res.data);
        if(res?.data?.user){
          dispatch(loadUser({user: res?.data?.user}));
        }
      } catch (error) {
        console.error("Failed to login", error)
      }
    } 
    // First fetch accounts api
    async function fetchAccounts(){
      try {
        const res = await axios.get(`${SERVER}/api/v1/accounts`, {withCredentials: true});
        console.log("Res", res.data);
        if(res.data?.accounts?.[0]?.accountName){
          const account = res?.data?.accounts?.[0];
          if(account){
            const name = account?.accountDisplayName || "";
            const accountId = account?.accountName?.split("/")?.[1] || "";
            console.log({name, accountId});
            if(name && accountId){
              await authLogin(name, accountId)
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch accounts", error)
      }
    }

    fetchAccounts();
  }, [dispatch])

  const mapLocationDetailsToReduxLocation = (loc: any): LocationType => {
    const storefront = loc.storefrontAddress ?? null;
    const primaryCategory =
      loc.rawGoogleData?.categories?.primaryCategory ??
      (loc.info
        ? {
            name: loc.info.businessCategoryId,
            displayName: loc.info.businessCategory,
          }
        : undefined);

    const placeId =
      loc.metadata?.placeId ?? loc.placeInfo?.placeIds?.[0] ?? null;

    return {
      id: loc._id ?? null,
      locationId: loc.name ?? null, // e.g. "locations/419..."
      title: loc.title ?? null,
      address: storefront
        ? {
            regionCode: storefront.regionCode,
            languageCode: storefront.languageCode,
            postalCode: storefront.postalCode,
            administrativeArea: storefront.administrativeArea,
            locality: storefront.locality,
            addressLines: storefront.addressLines,
          }
        : null,
      phone: loc.info?.phoneNumber ?? null,
      websiteUri: loc.info?.website ?? null,
      category: primaryCategory
        ? {
            primaryCategory: {
              name: primaryCategory.name,
              displayName: primaryCategory.displayName,
            },
          }
        : null,
      status: loc.stats?.businessStatus ?? null,
      verification: loc.stats?.isVerified ? "verified" : undefined,
      metadata: {
        ...(loc.metadata ?? {}),
        placeId,
        mapsUri: loc.metadata?.mapsUri ?? null,
        newReviewUri: loc.metadata?.newReviewUri ?? null,
      },
      stats: loc.stats ?? null,
      isActive:
        typeof loc.isSubscribed === "boolean"
          ? loc.isSubscribed
          : loc.stats?.businessStatus === "OPEN",
      rating: loc.stats?.averageRating ?? null,
      reviewCount: loc.stats?.reviewCount ?? null,
      placeId,
      createdAt: loc.createdAt ?? null,
      updatedAt: loc.updatedAt ?? null,
    };
  };


  useEffect(() => {
    if (!user?.accountId) return; // Don't run if no user account

    const storedLocationId = localStorage.getItem("activeLocation");

    const fetchAndSetLocation = async (locationId: string) => {
      try {
        setIsLoadingLocation(true); // Start loading

        const res = await axios.get(
          `${SERVER}/api/v1/locations/${locationId}?account_id=${user.accountId}`,
          { withCredentials: true },
        );

        const apiLocation = res.data?.location;
        if (apiLocation) {
          const normalizedLocation = normalizeLocation(apiLocation);
          if(normalizedLocation.locationId){
            dispatch(setActiveLocation(normalizedLocation));
          }
        }
      } catch (error) {
        console.error("Failed to fetch location details:", error);
      } finally {
        setIsLoadingLocation(false); // End loading
      }
    };

    const fetchMyBusinessesAndSetFirst = async () => {
      try {
        setIsLoadingLocation(true); // Start loading

        const res = await axios.get(`${SERVER}/api/v1/account/mybusinesses`, {
          withCredentials: true,
        });

        if (res.data.success && Array.isArray(res.data.businesses)) {
          const businesses = res.data.businesses;
          if (businesses.length > 0) {
            const firstBusiness = businesses[0];
            localStorage.setItem("activeLocation", firstBusiness.locationId?.split("/")?.[1] || "");

            const normalized = normalizeLocation(firstBusiness);
            if(normalized.locationId){
              dispatch(setActiveLocation(normalized));
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch businesses:", error);
      } finally {
        setIsLoadingLocation(false); // End loading
      }
    };

    if (!storedLocationId) {
      fetchMyBusinessesAndSetFirst();
    } else {
      fetchAndSetLocation(storedLocationId);
    }

    // ✅ Only depend on user.accountId — NOT isLoadingLocation
  }, [user?.accountId]);



  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* Protected routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="businesses" element={<Businesses />} />
            <Route path="businesses/add" element={<BusinessOnboarding />} />
            <Route
              path="businesses/:locationId/manage"
              element={<BusinessProfileManagement />}
            />
            <Route path="automation" element={<Automation />} />
            <Route path="reviews" element={<Reviews />} />
            <Route path="compatitor" element={<CompetitorDashboard  />} />
            <Route path="reports" element={<Reports />} />
            {/* Analytics - Google Search Console */}
            <Route
              path="analytics/search-console/overview"
              element={
                <Suspense fallback={<div className="p-6">Loading...</div>}>
                  <GSCOverview />
                </Suspense>
              }
            />
            <Route
              path="analytics/search-console/performance"
              element={
                <Suspense fallback={<div className="p-6">Loading...</div>}>
                  <GSCPerformance />
                </Suspense>
              }
            />
            <Route
              path="analytics/search-console/indexing"
              element={
                <Suspense fallback={<div className="p-6">Loading...</div>}>
                  <GSCIndexing />
                </Suspense>
              }
            />

            <Route
              path="customers"
              element={
                <div className="p-6">
                  <h1 className="text-2xl font-bold">Customers</h1>
                  <p className="text-gray-600 mt-2">
                    Customer management coming soon...
                  </p>
                </div>
              }
            />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
