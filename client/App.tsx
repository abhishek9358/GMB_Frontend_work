import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Dashboard from "./pages/Dashboard";
import Businesses from "./pages/Businesses";
import BusinessOnboarding from "./pages/BusinessOnboarding";
import Automation from "./pages/Automation";
import Reviews from "./pages/Reviews";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="businesses" element={<Businesses />} />
          <Route path="businesses/add" element={<BusinessOnboarding />} />
          <Route path="automation" element={<Automation />} />
          <Route path="reviews" element={<Reviews />} />
          <Route path="reports" element={<Reports />} />
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
  );
}

export default App;
