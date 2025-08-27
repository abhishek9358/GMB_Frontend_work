import { BusinessProfile } from '../services/gmbApi';

export const sampleGMBProfiles: BusinessProfile[] = [
  {
    basicInfo: {
      name: "locations/12345678901234567890",
      title: "A R Techno Solutions",
      categories: [
        {
          displayName: "Welding Equipment Dealers",
          categoryId: "gcid:welding_equipment_dealer"
        }
      ],
      description: "Professional welding equipment and solutions provider with expert consultation services.",
      phoneNumbers: [
        {
          label: "PRIMARY",
          phoneNumber: "+91 98765 43210"
        }
      ],
      websiteUri: "https://artechnosolutions.com",
      storefrontAddress: {
        regionCode: "IN",
        languageCode: "en",
        postalCode: "302021",
        administrativeArea: "Rajasthan",
        locality: "Jaipur",
        addressLines: ["Shop No 1, 2nd Floor, Bidla Sons Complex, Teachers Colony, Ajmer Road"]
      },
      serviceArea: null
    },
    hours: {
      regularHours: {
        periods: [
          {
            openDay: "MONDAY",
            openTime: "09:00",
            closeDay: "MONDAY",
            closeTime: "18:00"
          },
          {
            openDay: "TUESDAY",
            openTime: "09:00",
            closeDay: "TUESDAY",
            closeTime: "18:00"
          },
          {
            openDay: "WEDNESDAY",
            openTime: "09:00",
            closeDay: "WEDNESDAY",
            closeTime: "18:00"
          },
          {
            openDay: "THURSDAY",
            openTime: "09:00",
            closeDay: "THURSDAY",
            closeTime: "18:00"
          },
          {
            openDay: "FRIDAY",
            openTime: "09:00",
            closeDay: "FRIDAY",
            closeTime: "18:00"
          },
          {
            openDay: "SATURDAY",
            openTime: "09:00",
            closeDay: "SATURDAY",
            closeTime: "17:00"
          }
        ]
      },
      specialHours: [],
      moreHours: []
    },
    location: {
      address: {
        regionCode: "IN",
        languageCode: "en",
        postalCode: "302021",
        administrativeArea: "Rajasthan",
        locality: "Jaipur",
        addressLines: ["Shop No 1, 2nd Floor, Bidla Sons Complex, Teachers Colony, Ajmer Road"]
      },
      coordinates: {
        latitude: 26.9124,
        longitude: 75.7873
      }
    },
    businessAttributes: {
      accessibility: [],
      amenities: [
        { attributeId: "has_wheelchair_accessible_entrance", values: ["true"] },
        { attributeId: "has_parking", values: ["true"] }
      ],
      parking: [
        { attributeId: "parking_free", values: ["true"] }
      ],
      serviceOptions: [
        { attributeId: "offers_delivery", values: ["true"] },
        { attributeId: "offers_pickup", values: ["true"] }
      ]
    },
    reviews: {
      summary: {
        averageRating: 5.0,
        totalReviewCount: 5
      },
      reviews: []
    },
    media: {
      photos: [],
      coverPhoto: null,
      logo: null
    },
    posts: [],
    performance: null,
    metadata: {
      openInfo: {
        status: "OPEN"
      },
      verificationState: "VERIFIED",
      lastUpdated: "2025-01-20T12:00:00Z"
    }
  },
  {
    basicInfo: {
      name: "locations/98765432109876543210",
      title: "Sample Restaurant & Cafe",
      categories: [
        {
          displayName: "Restaurant",
          categoryId: "gcid:restaurant"
        },
        {
          displayName: "Cafe",
          categoryId: "gcid:cafe"
        }
      ],
      description: "Delicious local cuisine and fresh coffee in a cozy atmosphere. Family-owned restaurant serving authentic regional dishes.",
      phoneNumbers: [
        {
          label: "PRIMARY",
          phoneNumber: "+1 (555) 123-4567"
        }
      ],
      websiteUri: "https://samplerestaurant.com",
      storefrontAddress: {
        regionCode: "US",
        languageCode: "en",
        postalCode: "94102",
        administrativeArea: "CA",
        locality: "San Francisco",
        addressLines: ["456 Market Street", "Suite 200"]
      },
      serviceArea: null
    },
    hours: {
      regularHours: {
        periods: [
          {
            openDay: "MONDAY",
            openTime: "07:00",
            closeDay: "MONDAY",
            closeTime: "22:00"
          },
          {
            openDay: "TUESDAY",
            openTime: "07:00",
            closeDay: "TUESDAY",
            closeTime: "22:00"
          },
          {
            openDay: "WEDNESDAY",
            openTime: "07:00",
            closeDay: "WEDNESDAY",
            closeTime: "22:00"
          },
          {
            openDay: "THURSDAY",
            openTime: "07:00",
            closeDay: "THURSDAY",
            closeTime: "22:00"
          },
          {
            openDay: "FRIDAY",
            openTime: "07:00",
            closeDay: "FRIDAY",
            closeTime: "23:00"
          },
          {
            openDay: "SATURDAY",
            openTime: "08:00",
            closeDay: "SATURDAY",
            closeTime: "23:00"
          },
          {
            openDay: "SUNDAY",
            openTime: "08:00",
            closeDay: "SUNDAY",
            closeTime: "21:00"
          }
        ]
      },
      specialHours: [],
      moreHours: []
    },
    location: {
      address: {
        regionCode: "US",
        languageCode: "en",
        postalCode: "94102",
        administrativeArea: "CA",
        locality: "San Francisco",
        addressLines: ["456 Market Street", "Suite 200"]
      },
      coordinates: {
        latitude: 37.7879,
        longitude: -122.4075
      }
    },
    businessAttributes: {
      accessibility: [
        { attributeId: "has_wheelchair_accessible_entrance", values: ["true"] },
        { attributeId: "has_wheelchair_accessible_restroom", values: ["true"] }
      ],
      amenities: [
        { attributeId: "has_wifi", values: ["true"] },
        { attributeId: "has_outdoor_seating", values: ["true"] },
        { attributeId: "accepts_credit_cards", values: ["true"] }
      ],
      parking: [
        { attributeId: "parking_street", values: ["true"] }
      ],
      serviceOptions: [
        { attributeId: "offers_takeout", values: ["true"] },
        { attributeId: "offers_delivery", values: ["true"] },
        { attributeId: "serves_breakfast", values: ["true"] },
        { attributeId: "serves_lunch", values: ["true"] },
        { attributeId: "serves_dinner", values: ["true"] }
      ]
    },
    reviews: {
      summary: {
        averageRating: 4.3,
        totalReviewCount: 127
      },
      reviews: []
    },
    media: {
      photos: [],
      coverPhoto: null,
      logo: null
    },
    posts: [],
    performance: null,
    metadata: {
      openInfo: {
        status: "OPEN"
      },
      verificationState: "VERIFIED",
      lastUpdated: "2025-01-19T15:30:00Z"
    }
  },
  {
    basicInfo: {
      name: "locations/11111111111111111111",
      title: "Downtown Fitness Center",
      categories: [
        {
          displayName: "Gym",
          categoryId: "gcid:gym"
        },
        {
          displayName: "Fitness Center",
          categoryId: "gcid:fitness_center"
        }
      ],
      description: "Modern fitness facility with state-of-the-art equipment, personal training, and group classes.",
      phoneNumbers: [
        {
          label: "PRIMARY",
          phoneNumber: "+1 (555) 987-6543"
        }
      ],
      websiteUri: "https://downtownfitness.com",
      storefrontAddress: {
        regionCode: "US",
        languageCode: "en",
        postalCode: "10001",
        administrativeArea: "NY",
        locality: "New York",
        addressLines: ["789 Broadway", "2nd Floor"]
      },
      serviceArea: null
    },
    hours: {
      regularHours: {
        periods: [
          {
            openDay: "MONDAY",
            openTime: "05:00",
            closeDay: "MONDAY",
            closeTime: "23:00"
          },
          {
            openDay: "TUESDAY",
            openTime: "05:00",
            closeDay: "TUESDAY",
            closeTime: "23:00"
          },
          {
            openDay: "WEDNESDAY",
            openTime: "05:00",
            closeDay: "WEDNESDAY",
            closeTime: "23:00"
          },
          {
            openDay: "THURSDAY",
            openTime: "05:00",
            closeDay: "THURSDAY",
            closeTime: "23:00"
          },
          {
            openDay: "FRIDAY",
            openTime: "05:00",
            closeDay: "FRIDAY",
            closeTime: "22:00"
          },
          {
            openDay: "SATURDAY",
            openTime: "06:00",
            closeDay: "SATURDAY",
            closeTime: "22:00"
          },
          {
            openDay: "SUNDAY",
            openTime: "06:00",
            closeDay: "SUNDAY",
            closeTime: "21:00"
          }
        ]
      },
      specialHours: [],
      moreHours: []
    },
    location: {
      address: {
        regionCode: "US",
        languageCode: "en",
        postalCode: "10001",
        administrativeArea: "NY",
        locality: "New York",
        addressLines: ["789 Broadway", "2nd Floor"]
      },
      coordinates: {
        latitude: 40.7505,
        longitude: -73.9934
      }
    },
    businessAttributes: {
      accessibility: [
        { attributeId: "has_wheelchair_accessible_entrance", values: ["true"] }
      ],
      amenities: [
        { attributeId: "has_wifi", values: ["true"] },
        { attributeId: "has_parking", values: ["true"] },
        { attributeId: "accepts_credit_cards", values: ["true"] }
      ],
      parking: [
        { attributeId: "parking_garage", values: ["true"] }
      ],
      serviceOptions: [
        { attributeId: "offers_personal_training", values: ["true"] },
        { attributeId: "offers_group_classes", values: ["true"] }
      ]
    },
    reviews: {
      summary: {
        averageRating: 4.7,
        totalReviewCount: 89
      },
      reviews: []
    },
    media: {
      photos: [],
      coverPhoto: null,
      logo: null
    },
    posts: [],
    performance: null,
    metadata: {
      openInfo: {
        status: "OPEN"
      },
      verificationState: "VERIFIED",
      lastUpdated: "2025-01-18T09:15:00Z"
    }
  }
];

// Function to populate localStorage with sample data for testing
export function populateSampleData() {
  const existingBusinesses = JSON.parse(localStorage.getItem('userBusinesses') || '[]');
  
  if (existingBusinesses.length === 0) {
    const businessData = sampleGMBProfiles.map((profile, index) => ({
      id: profile.basicInfo.name,
      name: profile.basicInfo.title,
      rating: profile.reviews.summary?.averageRating || 0,
      reviewCount: profile.reviews.summary?.totalReviewCount || 0,
      address: profile.basicInfo.storefrontAddress?.addressLines?.[0] || '',
      category: profile.basicInfo.categories[0]?.displayName || 'Business',
      phone: profile.basicInfo.phoneNumbers[0]?.phoneNumber || '',
      website: profile.basicInfo.websiteUri || '',
      location: profile
    }));

    localStorage.setItem('userBusinesses', JSON.stringify(businessData));
    console.log('Sample GMB profile data populated to localStorage');
  }
}
