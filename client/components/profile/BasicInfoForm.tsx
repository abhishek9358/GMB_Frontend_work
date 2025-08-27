import { useState } from 'react';
import { Calendar, Info } from 'lucide-react';
import { BusinessProfile } from '../../services/gmbApi';

interface BasicInfoFormProps {
  profile: BusinessProfile;
  onUpdate: (data: Partial<BusinessProfile>) => void;
  isEditing: boolean;
}

export default function BasicInfoForm({ profile, onUpdate, isEditing }: BasicInfoFormProps) {
  const [formData, setFormData] = useState({
    title: profile.basicInfo.title || '',
    primaryCategory: profile.basicInfo.categories.find(c => c.primary)?.displayName || '',
    additionalCategories: profile.basicInfo.categories.filter(c => !c.primary).map(c => c.displayName).join(', '),
    description: profile.basicInfo.description || '',
    openingDate: profile.basicInfo.openingDate || '',
  });

  const handleChange = (field: string, value: string) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    
    if (isEditing) {
      onUpdate({
        basicInfo: {
          ...profile.basicInfo,
          title: updated.title,
          description: updated.description,
          openingDate: updated.openingDate,
          categories: [
            { displayName: updated.primaryCategory, categoryId: '', primary: true },
            ...updated.additionalCategories.split(',').map(cat => ({
              displayName: cat.trim(),
              categoryId: '',
              primary: false
            })).filter(cat => cat.displayName)
          ]
        }
      });
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">About Your Business</h3>
          <p className="text-sm text-gray-500 mt-1">Basic information about your business</p>
        </div>
        <Info className="w-5 h-5 text-gray-400" />
      </div>

      <div className="space-y-6">
        {/* Business Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business name
          </label>
          {isEditing ? (
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gbp-blue-500"
              placeholder="Enter business name"
            />
          ) : (
            <p className="text-gray-900 py-2">{formData.title || 'Not specified'}</p>
          )}
        </div>

        {/* Primary Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business category
          </label>
          {isEditing ? (
            <input
              type="text"
              value={formData.primaryCategory}
              onChange={(e) => handleChange('primaryCategory', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gbp-blue-500"
              placeholder="e.g., Restaurant, Apartment building, etc."
            />
          ) : (
            <p className="text-gray-900 py-2">{formData.primaryCategory || 'Not specified'}</p>
          )}
        </div>

        {/* Additional Categories */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional categories
          </label>
          {isEditing ? (
            <input
              type="text"
              value={formData.additionalCategories}
              onChange={(e) => handleChange('additionalCategories', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gbp-blue-500"
              placeholder="Separate multiple categories with commas"
            />
          ) : (
            <p className="text-gray-900 py-2">{formData.additionalCategories || 'None'}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">Separate multiple categories with commas</p>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          {isEditing ? (
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gbp-blue-500"
              placeholder="Describe your business, services, and what makes you unique"
              maxLength={750}
            />
          ) : (
            <p className="text-gray-900 py-2 whitespace-pre-wrap">{formData.description || 'No description provided'}</p>
          )}
          {isEditing && (
            <p className="text-xs text-gray-500 mt-1">
              {formData.description.length}/750 characters
            </p>
          )}
        </div>

        {/* Opening Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Opening date
          </label>
          {isEditing ? (
            <div className="relative">
              <input
                type="date"
                value={formData.openingDate}
                onChange={(e) => handleChange('openingDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gbp-blue-500"
              />
              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          ) : (
            <p className="text-gray-900 py-2">
              {formData.openingDate 
                ? new Date(formData.openingDate).toLocaleDateString() 
                : 'Not specified'
              }
            </p>
          )}
          <p className="text-xs text-gray-500 mt-1">When did your business first open?</p>
        </div>
      </div>
    </div>
  );
}
