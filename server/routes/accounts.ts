import { RequestHandler } from "express";
import { LocationsResponse, Location, Summary } from "@shared/api";

// Mock data based on the provided format
const mockLocations: Location[] = [
  {
    "_id": "68ac1f780eee4c3c3e99645a",
    "account": "accounts/101431614663470574251",
    "name": "locations/394546615875663016",
    "storefrontAddress": {
      "addressLines": [],
      "administrativeArea": "",
      "languageCode": "en",
      "locality": "",
      "postalCode": "",
      "regionCode": ""
    },
    "title": "Power By Knowledge",
    "status": [
      "INCOMPLETE",
      "UNVERIFIED"
    ],
    "categories": [],
    "verificationState": "UNKNOWN",
    "accessLevels": [],
    "isSubscribed": false,
    "whitelabel": {},
    "slug": "power-by-knowledge"
  },
  {
    "_id": "68ac1f78416caf513e9e315b",
    "account": "accounts/101431614663470574251",
    "name": "locations/3433336045380264319",
    "storefrontAddress": {
      "regionCode": "US",
      "languageCode": "en",
      "postalCode": "83709",
      "administrativeArea": "ID",
      "locality": "Boise",
      "addressLines": [
        "6399 West Diamond Street"
      ]
    },
    "title": "Diamond S Towing & Recovery, LLC",
    "status": [
      "UNVERIFIED"
    ],
    "categories": [],
    "verificationState": "UNKNOWN",
    "accessLevels": [],
    "isSubscribed": false,
    "whitelabel": {},
    "slug": "diamond-s-towing-recovery-llc"
  },
  {
    "_id": "68ac1f789b1e677541bfc70a",
    "account": "accounts/101431614663470574251",
    "name": "locations/7574173905549120648",
    "storefrontAddress": {
      "regionCode": "US",
      "languageCode": "en",
      "postalCode": "91411-3338",
      "administrativeArea": "California",
      "locality": "Van Nuys",
      "addressLines": [
        "14830 Burbank Boulevard"
      ]
    },
    "title": "Garage Doors & Gates 4 Less",
    "status": [
      "UNVERIFIED"
    ],
    "categories": [],
    "verificationState": "UNKNOWN",
    "accessLevels": [],
    "isSubscribed": false,
    "whitelabel": {},
    "slug": "garage-doors-gates-4-less"
  },
  {
    "_id": "68ac1f78d3b1d4afc8080fc2",
    "account": "accounts/101431614663470574251",
    "name": "locations/450461490875013815",
    "storefrontAddress": {
      "regionCode": "US",
      "languageCode": "en",
      "postalCode": "91739",
      "administrativeArea": "CA",
      "locality": "Rancho Cucamonga",
      "addressLines": [
        "12365 Foothill Boulevard"
      ]
    },
    "title": "Gonzales Law Offices",
    "status": [
      "UNVERIFIED"
    ],
    "categories": [],
    "verificationState": "UNKNOWN",
    "accessLevels": [],
    "isSubscribed": false,
    "whitelabel": {},
    "slug": "gonzales-law-offices"
  },
  {
    "_id": "68ac1f787c0cd71e8c445273",
    "account": "accounts/101431614663470574251",
    "name": "locations/13926642790072338803",
    "storefrontAddress": {
      "addressLines": [],
      "administrativeArea": "",
      "languageCode": "en",
      "locality": "",
      "postalCode": "",
      "regionCode": ""
    },
    "title": "1 King Renovations",
    "status": [
      "INCOMPLETE",
      "UNVERIFIED"
    ],
    "categories": [],
    "verificationState": "UNKNOWN",
    "accessLevels": [],
    "isSubscribed": false,
    "whitelabel": {},
    "slug": "1-king-renovations"
  }
];

const mockSummary: Summary = {
  "totalLocations": 142,
  "statusBreakdown": {
    "verified": 12,
    "unverified": 79,
    "suspended": 16,
    "disabled": 2,
    "googleUpdates": 11,
    "duplicate": 1,
    "missingStoreCodes": 13,
    "incomplete": 46,
    "verificationPending": 0,
    "verificationExpired": 0,
    "unknown": 0
  },
  "categoryBreakdown": {
    "totalCategories": 0,
    "uniqueCategories": 0,
    "primaryCategories": 0,
    "additionalCategories": 0,
    "businessesWithMultipleCategories": 0,
    "topCategories": [],
    "allCategories": {}
  }
};

export const handleAccounts: RequestHandler = (req, res) => {
  const response: LocationsResponse = {
    locations: mockLocations,
    summary: mockSummary
  };
  
  res.status(200).json(response);
};
