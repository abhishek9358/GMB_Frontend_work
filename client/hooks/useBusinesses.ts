import { useState, useEffect } from "react";

export interface Business {
  id: string;
  name: string;
  rating: number;
  reviewCount: number;
  address: string;
  phone?: string;
  website?: string;
  category: string;
  image?: string;
}

const defaultBusinesses: Business[] = [
  {
    id: "1",
    name: "A R Techno Solutions",
    rating: 5.0,
    reviewCount: 5,
    address:
      "Shop No 1, 2nd Floor, Bidla Sons Complex, Teachers Colony, Ajmer Road, DCM-302021",
    category: "Welding Equipment Dealers",
    phone: "+91 98765 43210",
    website: "https://artechnosolutions.com",
  },
];

export function useBusinesses() {
  const [businesses, setBusinesses] = useState<Business[]>(defaultBusinesses);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(
    null,
  );

  // Load businesses from localStorage
  const loadBusinesses = () => {
    const savedBusinesses = localStorage.getItem("userBusinesses");
    let allBusinesses = [...defaultBusinesses];

    if (savedBusinesses) {
      const parsedBusinesses = JSON.parse(savedBusinesses);
      parsedBusinesses.forEach((savedBusiness: Business) => {
        if (!allBusinesses.find((b) => b.id === savedBusiness.id)) {
          allBusinesses.push(savedBusiness);
        }
      });
    }

    setBusinesses(allBusinesses);
    return allBusinesses;
  };

  // Load selected business from localStorage
  const loadSelectedBusiness = (availableBusinesses: Business[]) => {
    const savedSelectedBusiness = localStorage.getItem("selectedBusiness");
    if (savedSelectedBusiness) {
      const parsedBusiness = JSON.parse(savedSelectedBusiness);
      // Verify the selected business still exists in available businesses
      const businessExists = availableBusinesses.find(
        (b) => b.id === parsedBusiness.id,
      );
      if (businessExists) {
        setSelectedBusiness(businessExists);
      } else if (availableBusinesses.length > 0) {
        // Fallback to first available business
        setSelectedBusiness(availableBusinesses[0]);
        localStorage.setItem(
          "selectedBusiness",
          JSON.stringify(availableBusinesses[0]),
        );
      }
    } else if (availableBusinesses.length > 0) {
      // Set first business as default
      setSelectedBusiness(availableBusinesses[0]);
      localStorage.setItem(
        "selectedBusiness",
        JSON.stringify(availableBusinesses[0]),
      );
    }
  };

  useEffect(() => {
    const availableBusinesses = loadBusinesses();
    loadSelectedBusiness(availableBusinesses);

    // Listen for storage changes
    const handleStorageChange = () => {
      const updatedBusinesses = loadBusinesses();
      loadSelectedBusiness(updatedBusinesses);
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("focus", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("focus", handleStorageChange);
    };
  }, []);

  const selectBusiness = (business: Business) => {
    setSelectedBusiness(business);
    localStorage.setItem("selectedBusiness", JSON.stringify(business));
  };

  const addBusinesses = (newBusinesses: Business[]) => {
    const savedBusinesses = JSON.parse(
      localStorage.getItem("userBusinesses") || "[]",
    );
    const updatedBusinesses = [...savedBusinesses, ...newBusinesses];
    localStorage.setItem("userBusinesses", JSON.stringify(updatedBusinesses));

    // Reload businesses
    const allBusinesses = loadBusinesses();

    // Set first added business as selected if none is currently selected
    if (newBusinesses.length > 0 && !selectedBusiness) {
      selectBusiness(newBusinesses[0]);
    }

    return allBusinesses;
  };

  return {
    businesses,
    selectedBusiness,
    selectBusiness,
    addBusinesses,
    loadBusinesses,
  };
}
