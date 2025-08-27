import { useState } from 'react';
import { Settings, Plus, X, Check } from 'lucide-react';
import { BusinessProfile, BusinessAttribute } from '../../services/gmbApi';

interface AttributesFormProps {
  profile: BusinessProfile;
  onUpdate: (data: Partial<BusinessProfile>) => void;
  isEditing: boolean;
}

// Common business attributes with their possible values
const ATTRIBUTE_OPTIONS = {
  accessibility: [
    { id: 'has_wheelchair_accessible_entrance', name: 'Wheelchair accessible entrance', type: 'boolean' },
    { id: 'has_wheelchair_accessible_restroom', name: 'Wheelchair accessible restroom', type: 'boolean' },
    { id: 'has_wheelchair_accessible_seating', name: 'Wheelchair accessible seating', type: 'boolean' },
    { id: 'has_braille_menu', name: 'Braille menu', type: 'boolean' },
    { id: 'has_assistive_hearing_loop', name: 'Assistive hearing loop', type: 'boolean' },
  ],
  amenities: [
    { id: 'has_wifi', name: 'Free Wi-Fi', type: 'boolean' },
    { id: 'has_parking', name: 'Parking available', type: 'boolean' },
    { id: 'accepts_credit_cards', name: 'Accepts credit cards', type: 'boolean' },
    { id: 'accepts_debit_cards', name: 'Accepts debit cards', type: 'boolean' },
    { id: 'accepts_cash_only', name: 'Cash only', type: 'boolean' },
    { id: 'accepts_nfc', name: 'Contactless payments', type: 'boolean' },
    { id: 'has_restroom', name: 'Restroom', type: 'boolean' },
    { id: 'has_outdoor_seating', name: 'Outdoor seating', type: 'boolean' },
    { id: 'has_air_conditioning', name: 'Air conditioning', type: 'boolean' },
    { id: 'has_heating', name: 'Heating', type: 'boolean' },
  ],
  crowd: [
    { id: 'popular_with_tourists', name: 'Popular with tourists', type: 'boolean' },
    { id: 'popular_with_locals', name: 'Popular with locals', type: 'boolean' },
    { id: 'family_friendly', name: 'Family friendly', type: 'boolean' },
    { id: 'good_for_groups', name: 'Good for groups', type: 'boolean' },
    { id: 'lgbtq_friendly', name: 'LGBTQ+ friendly', type: 'boolean' },
    { id: 'transgender_safe_space', name: 'Transgender safe space', type: 'boolean' },
  ],
  parking: [
    { id: 'parking_free', name: 'Free parking', type: 'boolean' },
    { id: 'parking_paid', name: 'Paid parking', type: 'boolean' },
    { id: 'parking_street', name: 'Street parking', type: 'boolean' },
    { id: 'parking_garage', name: 'Parking garage', type: 'boolean' },
    { id: 'parking_lot', name: 'Parking lot', type: 'boolean' },
    { id: 'parking_valet', name: 'Valet parking', type: 'boolean' },
  ],
  pets: [
    { id: 'allows_dogs', name: 'Dogs allowed', type: 'boolean' },
    { id: 'allows_pets', name: 'Pets allowed', type: 'boolean' },
    { id: 'dog_friendly', name: 'Dog friendly', type: 'boolean' },
    { id: 'has_dog_park', name: 'Dog park', type: 'boolean' },
  ],
  serviceOptions: [
    { id: 'offers_takeout', name: 'Takeout', type: 'boolean' },
    { id: 'offers_delivery', name: 'Delivery', type: 'boolean' },
    { id: 'offers_pickup', name: 'Pickup', type: 'boolean' },
    { id: 'dine_in', name: 'Dine-in', type: 'boolean' },
    { id: 'drive_through', name: 'Drive-through', type: 'boolean' },
    { id: 'curbside_pickup', name: 'Curbside pickup', type: 'boolean' },
    { id: 'no_contact_delivery', name: 'No-contact delivery', type: 'boolean' },
    { id: 'online_estimates', name: 'Online estimates', type: 'boolean' },
    { id: 'onsite_services', name: 'Onsite services', type: 'boolean' },
    { id: 'language_assistance', name: 'Language assistance', type: 'boolean' },
  ],
  fromTheBusiness: [
    { id: 'women_owned', name: 'Women-owned', type: 'boolean' },
    { id: 'black_owned', name: 'Black-owned', type: 'boolean' },
    { id: 'veteran_owned', name: 'Veteran-owned', type: 'boolean' },
    { id: 'family_owned', name: 'Family-owned', type: 'boolean' },
    { id: 'locally_owned', name: 'Locally owned', type: 'boolean' },
    { id: 'small_business', name: 'Small business', type: 'boolean' },
    { id: 'sustainable_practices', name: 'Sustainable practices', type: 'boolean' },
    { id: 'organic_products', name: 'Organic products', type: 'boolean' },
  ],
};

export default function AttributesForm({ profile, onUpdate, isEditing }: AttributesFormProps) {
  const [attributes, setAttributes] = useState(profile.attributes);

  const updateAttributes = (category: keyof typeof attributes, newAttributes: BusinessAttribute[]) => {
    const updated = {
      ...attributes,
      [category]: newAttributes
    };
    setAttributes(updated);
    
    if (isEditing) {
      onUpdate({
        attributes: updated
      });
    }
  };

  const toggleAttribute = (category: keyof typeof attributes, attributeId: string, displayName: string) => {
    const categoryAttributes = attributes[category];
    const existingIndex = categoryAttributes.findIndex(attr => attr.attributeId === attributeId);
    
    let newAttributes: BusinessAttribute[];
    if (existingIndex >= 0) {
      // Remove attribute
      newAttributes = categoryAttributes.filter((_, index) => index !== existingIndex);
    } else {
      // Add attribute
      const newAttribute: BusinessAttribute = {
        attributeId,
        displayName,
        values: ['true'],
        groupDisplayName: category
      };
      newAttributes = [...categoryAttributes, newAttribute];
    }
    
    updateAttributes(category, newAttributes);
  };

  const isAttributeSelected = (category: keyof typeof attributes, attributeId: string) => {
    return attributes[category].some(attr => attr.attributeId === attributeId);
  };

  const renderAttributeSection = (
    category: keyof typeof attributes,
    title: string,
    icon: React.ReactNode,
    options: Array<{ id: string; name: string; type: string }>
  ) => (
    <div className="mb-8">
      <div className="flex items-center space-x-2 mb-4">
        {icon}
        <h4 className="text-md font-medium text-gray-900">{title}</h4>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {options.map((option) => {
          const isSelected = isAttributeSelected(category, option.id);
          
          return (
            <div key={option.id} className="flex items-center space-x-3">
              {isEditing ? (
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleAttribute(category, option.id, option.name)}
                    className="w-4 h-4 text-gbp-blue-600 border-gray-300 rounded focus:ring-gbp-blue-500"
                  />
                  <span className="text-sm text-gray-700">{option.name}</span>
                </label>
              ) : (
                <div className="flex items-center space-x-2">
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                    isSelected 
                      ? 'bg-gbp-blue-600 border-gbp-blue-600' 
                      : 'border-gray-300'
                  }`}>
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span className={`text-sm ${isSelected ? 'text-gray-900' : 'text-gray-500'}`}>
                    {option.name}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {attributes[category].length === 0 && !isEditing && (
        <p className="text-gray-500 text-sm italic mt-2">No {title.toLowerCase()} specified</p>
      )}
    </div>
  );

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Business Attributes</h3>
          <p className="text-sm text-gray-500 mt-1">Features and characteristics of your business</p>
        </div>
        <Settings className="w-5 h-5 text-gray-400" />
      </div>

      <div className="space-y-8">
        {/* Accessibility */}
        {renderAttributeSection(
          'accessibility',
          'Accessibility',
          <svg className="w-5 h-5 text-gbp-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>,
          ATTRIBUTE_OPTIONS.accessibility
        )}

        {/* Amenities */}
        {renderAttributeSection(
          'amenities',
          'Amenities',
          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
          </svg>,
          ATTRIBUTE_OPTIONS.amenities
        )}

        {/* Crowd */}
        {renderAttributeSection(
          'crowd',
          'Crowd',
          <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>,
          ATTRIBUTE_OPTIONS.crowd
        )}

        {/* Parking */}
        {renderAttributeSection(
          'parking',
          'Parking',
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
          </svg>,
          ATTRIBUTE_OPTIONS.parking
        )}

        {/* Pets */}
        {renderAttributeSection(
          'pets',
          'Pets',
          <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>,
          ATTRIBUTE_OPTIONS.pets
        )}

        {/* Service Options */}
        {renderAttributeSection(
          'serviceOptions',
          'Service Options',
          <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>,
          ATTRIBUTE_OPTIONS.serviceOptions
        )}

        {/* From the Business */}
        {renderAttributeSection(
          'fromTheBusiness',
          'From the Business',
          <svg className="w-5 h-5 text-gbp-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>,
          ATTRIBUTE_OPTIONS.fromTheBusiness
        )}
      </div>

      {/* Summary */}
      {!isEditing && (
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Attribute Summary</h4>
          <div className="text-sm text-gray-600">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <span className="font-medium">Accessibility:</span> {attributes.accessibility.length}
              </div>
              <div>
                <span className="font-medium">Amenities:</span> {attributes.amenities.length}
              </div>
              <div>
                <span className="font-medium">Crowd:</span> {attributes.crowd.length}
              </div>
              <div>
                <span className="font-medium">Parking:</span> {attributes.parking.length}
              </div>
              <div>
                <span className="font-medium">Pets:</span> {attributes.pets.length}
              </div>
              <div>
                <span className="font-medium">Service Options:</span> {attributes.serviceOptions.length}
              </div>
              <div>
                <span className="font-medium">From Business:</span> {attributes.fromTheBusiness.length}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
