import { useState } from 'react';
import { MapPin, Navigation, Plus, X } from 'lucide-react';
import { BusinessProfile, LocationInfo } from '../../services/gmbApi';

interface LocationFormProps {
  profile: BusinessProfile;
  onUpdate: (data: Partial<BusinessProfile>) => void;
  isEditing: boolean;
}

export default function LocationForm({ profile, onUpdate, isEditing }: LocationFormProps) {
  const [address, setAddress] = useState({
    addressLines: profile.location.storefrontAddress?.addressLines?.join('\n') || '',
    locality: profile.location.storefrontAddress?.locality || '',
    administrativeArea: profile.location.storefrontAddress?.administrativeArea || '',
    postalCode: profile.location.storefrontAddress?.postalCode || '',
    regionCode: profile.location.storefrontAddress?.regionCode || 'IN',
  });

  const [serviceArea, setServiceArea] = useState({
    businessType: profile.location.serviceArea?.businessType || '',
    places: profile.location.serviceArea?.places || [],
    regionCode: profile.location.serviceArea?.regionCode || '',
  });

  const [coordinates, setCoordinates] = useState({
    latitude: profile.location.coordinates?.latitude || 0,
    longitude: profile.location.coordinates?.longitude || 0,
  });

  const updateLocation = (locationData: Partial<LocationInfo>) => {
    if (isEditing) {
      onUpdate({
        location: {
          ...profile.location,
          ...locationData
        }
      });
    }
  };

  const handleAddressChange = (field: string, value: string) => {
    const updated = { ...address, [field]: value };
    setAddress(updated);
    
    updateLocation({
      storefrontAddress: {
        ...profile.location.storefrontAddress,
        ...updated,
        addressLines: updated.addressLines.split('\n').filter(line => line.trim())
      }
    });
  };

  const handleCoordinatesChange = (field: 'latitude' | 'longitude', value: string) => {
    const numValue = parseFloat(value) || 0;
    const updated = { ...coordinates, [field]: numValue };
    setCoordinates(updated);
    
    updateLocation({
      coordinates: updated
    });
  };

  const addServicePlace = () => {
    const newPlace = { name: '', placeId: '' };
    const updatedPlaces = [...serviceArea.places, newPlace];
    setServiceArea({ ...serviceArea, places: updatedPlaces });
    
    updateLocation({
      serviceArea: {
        ...serviceArea,
        places: updatedPlaces
      }
    });
  };

  const removeServicePlace = (index: number) => {
    const updatedPlaces = serviceArea.places.filter((_, i) => i !== index);
    setServiceArea({ ...serviceArea, places: updatedPlaces });
    
    updateLocation({
      serviceArea: {
        ...serviceArea,
        places: updatedPlaces
      }
    });
  };

  const updateServicePlace = (index: number, field: 'name' | 'placeId', value: string) => {
    const updatedPlaces = [...serviceArea.places];
    updatedPlaces[index] = { ...updatedPlaces[index], [field]: value };
    setServiceArea({ ...serviceArea, places: updatedPlaces });
    
    updateLocation({
      serviceArea: {
        ...serviceArea,
        places: updatedPlaces
      }
    });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Location and Areas</h3>
          <p className="text-sm text-gray-500 mt-1">Where your business is located and serves</p>
        </div>
        <MapPin className="w-5 h-5 text-gray-400" />
      </div>

      <div className="space-y-8">
        {/* Business Location */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-4">Business location</h4>
          <div className="space-y-4">
            {/* Address Lines */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Street address
              </label>
              {isEditing ? (
                <textarea
                  value={address.addressLines}
                  onChange={(e) => handleAddressChange('addressLines', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gbp-blue-500"
                  placeholder="Street address, building number, floor, etc."
                />
              ) : (
                <p className="text-gray-900 py-2 whitespace-pre-line">
                  {address.addressLines || 'Not specified'}
                </p>
              )}
            </div>

            {/* City, State, Postal Code */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={address.locality}
                    onChange={(e) => handleAddressChange('locality', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gbp-blue-500"
                    placeholder="City"
                  />
                ) : (
                  <p className="text-gray-900 py-2">{address.locality || 'Not specified'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State/Province
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={address.administrativeArea}
                    onChange={(e) => handleAddressChange('administrativeArea', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gbp-blue-500"
                    placeholder="State/Province"
                  />
                ) : (
                  <p className="text-gray-900 py-2">{address.administrativeArea || 'Not specified'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Postal code
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={address.postalCode}
                    onChange={(e) => handleAddressChange('postalCode', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gbp-blue-500"
                    placeholder="Postal code"
                  />
                ) : (
                  <p className="text-gray-900 py-2">{address.postalCode || 'Not specified'}</p>
                )}
              </div>
            </div>

            {/* Country */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country
              </label>
              {isEditing ? (
                <select
                  value={address.regionCode}
                  onChange={(e) => handleAddressChange('regionCode', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gbp-blue-500"
                >
                  <option value="IN">India</option>
                  <option value="US">United States</option>
                  <option value="GB">United Kingdom</option>
                  <option value="CA">Canada</option>
                  <option value="AU">Australia</option>
                  <option value="DE">Germany</option>
                  <option value="FR">France</option>
                  <option value="JP">Japan</option>
                </select>
              ) : (
                <p className="text-gray-900 py-2">{address.regionCode}</p>
              )}
            </div>

            {/* Coordinates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Latitude
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    step="any"
                    value={coordinates.latitude}
                    onChange={(e) => handleCoordinatesChange('latitude', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gbp-blue-500"
                    placeholder="26.9124"
                  />
                ) : (
                  <p className="text-gray-900 py-2">{coordinates.latitude || 'Not specified'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Longitude
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    step="any"
                    value={coordinates.longitude}
                    onChange={(e) => handleCoordinatesChange('longitude', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gbp-blue-500"
                    placeholder="75.7873"
                  />
                ) : (
                  <p className="text-gray-900 py-2">{coordinates.longitude || 'Not specified'}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Service Area */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-4">Service area</h4>
          <div className="space-y-4">
            {/* Business Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service type
              </label>
              {isEditing ? (
                <select
                  value={serviceArea.businessType}
                  onChange={(e) => setServiceArea({ ...serviceArea, businessType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gbp-blue-500"
                >
                  <option value="">Select service type</option>
                  <option value="CUSTOMER_LOCATION_ONLY">Customer location only</option>
                  <option value="CUSTOMER_AND_BUSINESS_LOCATION">Customer and business location</option>
                  <option value="BUSINESS_LOCATION_ONLY">Business location only</option>
                </select>
              ) : (
                <p className="text-gray-900 py-2">
                  {serviceArea.businessType || 'Not specified'}
                </p>
              )}
            </div>

            {/* Service Places */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Service areas/places
              </label>
              <div className="space-y-3">
                {serviceArea.places.map((place, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    {isEditing ? (
                      <>
                        <input
                          type="text"
                          value={place.name}
                          onChange={(e) => updateServicePlace(index, 'name', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gbp-blue-500"
                          placeholder="Place name (e.g., Mumbai, Maharashtra)"
                        />
                        <button
                          onClick={() => removeServicePlace(index)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <Navigation className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900">{place.name || 'Unnamed location'}</span>
                      </>
                    )}
                  </div>
                ))}
                {isEditing && (
                  <button
                    onClick={addServicePlace}
                    className="flex items-center space-x-2 text-gbp-blue-600 hover:text-gbp-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="text-sm">Add service area</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
