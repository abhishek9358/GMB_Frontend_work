import { useState } from 'react';
import { Clock, Plus, X, Calendar } from 'lucide-react';
import { BusinessProfile, OpeningHours, SpecialHours } from '../../services/gmbApi';

interface HoursFormProps {
  profile: BusinessProfile;
  onUpdate: (data: Partial<BusinessProfile>) => void;
  isEditing: boolean;
}

const DAYS = [
  { key: 'MONDAY', label: 'Monday' },
  { key: 'TUESDAY', label: 'Tuesday' },
  { key: 'WEDNESDAY', label: 'Wednesday' },
  { key: 'THURSDAY', label: 'Thursday' },
  { key: 'FRIDAY', label: 'Friday' },
  { key: 'SATURDAY', label: 'Saturday' },
  { key: 'SUNDAY', label: 'Sunday' },
];

export default function HoursForm({ profile, onUpdate, isEditing }: HoursFormProps) {
  const [regularHours, setRegularHours] = useState<OpeningHours['periods']>(
    profile.hours.regularHours?.periods || []
  );
  
  const [specialHours, setSpecialHours] = useState(
    profile.hours.specialHours || []
  );

  const [moreHours, setMoreHours] = useState(
    profile.hours.moreHours || []
  );

  const updateHours = () => {
    if (isEditing) {
      onUpdate({
        hours: {
          regularHours: { periods: regularHours },
          specialHours,
          moreHours
        }
      });
    }
  };

  const updateRegularHours = (day: string, openTime: string, closeTime: string, isOpen: boolean) => {
    let updated = regularHours.filter(period => period.openDay !== day);
    
    if (isOpen && openTime && closeTime) {
      updated.push({
        openDay: day,
        openTime,
        closeDay: day,
        closeTime
      });
    }
    
    setRegularHours(updated);
    
    if (isEditing) {
      onUpdate({
        hours: {
          ...profile.hours,
          regularHours: { periods: updated }
        }
      });
    }
  };

  const addSpecialHours = () => {
    const newSpecialHours: SpecialHours = {
      specialHourPeriods: [{
        startDate: '',
        endDate: '',
        isClosed: false,
        openTime: '09:00',
        closeTime: '17:00'
      }]
    };
    
    const updated = [...specialHours, newSpecialHours];
    setSpecialHours(updated);
    updateHours();
  };

  const removeSpecialHours = (index: number) => {
    const updated = specialHours.filter((_, i) => i !== index);
    setSpecialHours(updated);
    updateHours();
  };

  const getRegularHoursForDay = (day: string) => {
    return regularHours.find(period => period.openDay === day);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Opening Hours</h3>
          <p className="text-sm text-gray-500 mt-1">When your business is open to customers</p>
        </div>
        <Clock className="w-5 h-5 text-gray-400" />
      </div>

      <div className="space-y-8">
        {/* Regular Hours */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-4">Regular hours</h4>
          <div className="space-y-3">
            {DAYS.map(({ key, label }) => {
              const dayHours = getRegularHoursForDay(key);
              const isOpen = !!dayHours;
              
              return (
                <div key={key} className="flex items-center space-x-4">
                  <div className="w-24">
                    <span className="text-sm font-medium text-gray-700">{label}</span>
                  </div>
                  
                  {isEditing ? (
                    <>
                      <input
                        type="checkbox"
                        checked={isOpen}
                        onChange={(e) => {
                          if (!e.target.checked) {
                            updateRegularHours(key, '', '', false);
                          } else {
                            updateRegularHours(key, '09:00', '17:00', true);
                          }
                        }}
                        className="w-4 h-4 text-gbp-blue-600 border-gray-300 rounded focus:ring-gbp-blue-500"
                      />
                      
                      {isOpen ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="time"
                            value={dayHours?.openTime || '09:00'}
                            onChange={(e) => updateRegularHours(key, e.target.value, dayHours?.closeTime || '17:00', true)}
                            className="px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gbp-blue-500"
                          />
                          <span className="text-gray-500">to</span>
                          <input
                            type="time"
                            value={dayHours?.closeTime || '17:00'}
                            onChange={(e) => updateRegularHours(key, dayHours?.openTime || '09:00', e.target.value, true)}
                            className="px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gbp-blue-500"
                          />
                        </div>
                      ) : (
                        <span className="text-gray-500 italic">Closed</span>
                      )}
                    </>
                  ) : (
                    <div className="flex-1">
                      {isOpen ? (
                        <span className="text-gray-900">
                          {dayHours?.openTime} - {dayHours?.closeTime}
                        </span>
                      ) : (
                        <span className="text-gray-500 italic">Closed</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Special Hours */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-medium text-gray-900">Special hours</h4>
            {isEditing && (
              <button
                onClick={addSpecialHours}
                className="flex items-center space-x-2 text-gbp-blue-600 hover:text-gbp-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm">Add special hours</span>
              </button>
            )}
          </div>
          
          <div className="space-y-4">
            {specialHours.length > 0 ? (
              specialHours.map((special, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="text-sm font-medium text-gray-700">Special Hours #{index + 1}</h5>
                    {isEditing && (
                      <button
                        onClick={() => removeSpecialHours(index)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  {special.specialHourPeriods.map((period, periodIndex) => (
                    <div key={periodIndex} className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Start Date
                          </label>
                          {isEditing ? (
                            <input
                              type="date"
                              value={period.startDate}
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gbp-blue-500"
                            />
                          ) : (
                            <p className="text-sm text-gray-900">
                              {period.startDate ? new Date(period.startDate).toLocaleDateString() : 'Not set'}
                            </p>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            End Date
                          </label>
                          {isEditing ? (
                            <input
                              type="date"
                              value={period.endDate}
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gbp-blue-500"
                            />
                          ) : (
                            <p className="text-sm text-gray-900">
                              {period.endDate ? new Date(period.endDate).toLocaleDateString() : 'Not set'}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        {isEditing ? (
                          <>
                            <input
                              type="checkbox"
                              checked={period.isClosed}
                              className="w-4 h-4 text-gbp-blue-600 border-gray-300 rounded focus:ring-gbp-blue-500"
                            />
                            <span className="text-sm text-gray-700">Closed during this period</span>
                          </>
                        ) : (
                          <span className="text-sm text-gray-900">
                            {period.isClosed ? 'Closed' : `${period.openTime} - ${period.closeTime}`}
                          </span>
                        )}
                      </div>
                      
                      {!period.isClosed && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Open Time
                            </label>
                            {isEditing ? (
                              <input
                                type="time"
                                value={period.openTime || '09:00'}
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gbp-blue-500"
                              />
                            ) : (
                              <p className="text-sm text-gray-900">{period.openTime || 'Not set'}</p>
                            )}
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Close Time
                            </label>
                            {isEditing ? (
                              <input
                                type="time"
                                value={period.closeTime || '17:00'}
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gbp-blue-500"
                              />
                            ) : (
                              <p className="text-sm text-gray-900">{period.closeTime || 'Not set'}</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm italic">No special hours set</p>
            )}
          </div>
        </div>

        {/* More Hours */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-4">Additional hours</h4>
          <div className="space-y-3">
            {moreHours.length > 0 ? (
              moreHours.map((hours, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      {hours.displayName || `Additional Hours ${index + 1}`}
                    </span>
                    <span className="text-sm text-gray-500">
                      {hours.hoursTypeId}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm italic">No additional hours set</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
