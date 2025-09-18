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
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import { lazy, Suspense } from "react";
import { useEffect } from "react";
import axios from "axios";
import { SERVER } from "./constants";
import {useDispatch} from "react-redux"
import { loadUser } from "./redux/slices/user.slice";

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
