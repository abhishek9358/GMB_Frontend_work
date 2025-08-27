import { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Star, 
  MapPin, 
  Phone, 
  Globe, 
  Clock,
  MoreVertical,
  Filter,
  Download,
  Upload,
  Loader2,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { gmbApi, BusinessProfile } from '../services/gmbApi';

interface ProfileCardProps {
  profile: BusinessProfile;
  onView: (profile: BusinessProfile) => void;
  onEdit: (profile: BusinessProfile) => void;
  onDelete: (profile: BusinessProfile) => void;
}

function ProfileCard({ profile, onView, onEdit, onDelete }: ProfileCardProps) {
  const [showActions, setShowActions] = useState(false);

  return (
    <div className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow p-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {profile.basicInfo.title}
          </h3>
          <p className="text-sm text-gray-500">
            {profile.basicInfo.categories[0]?.displayName || 'Business'}
          </p>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <MoreVertical className="w-4 h-4 text-gray-500" />
          </button>
          {showActions && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
              <button
                onClick={() => {
                  onView(profile);
                  setShowActions(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
              >
                <Eye className="w-4 h-4" />
                <span>View Details</span>
              </button>
              <button
                onClick={() => {
                  onEdit(profile);
                  setShowActions(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
              >
                <Edit className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
              <button
                onClick={() => {
                  onDelete(profile);
                  setShowActions(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Profile</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Business Info */}
      <div className="space-y-2 mb-4">
        {profile.basicInfo.storefrontAddress && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>
              {profile.basicInfo.storefrontAddress.addressLines?.[0]}, {profile.basicInfo.storefrontAddress.locality}
            </span>
          </div>
        )}
        {profile.basicInfo.phoneNumbers?.[0] && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Phone className="w-4 h-4" />
            <span>{profile.basicInfo.phoneNumbers[0].phoneNumber}</span>
          </div>
        )}
        {profile.basicInfo.websiteUri && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Globe className="w-4 h-4" />
            <span className="truncate">{profile.basicInfo.websiteUri}</span>
          </div>
        )}
      </div>

      {/* Reviews */}
      {profile.reviews.summary && (
        <div className="flex items-center space-x-2 mb-4">
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm font-medium text-gray-900">
              {profile.reviews.summary.averageRating.toFixed(1)}
            </span>
          </div>
          <span className="text-sm text-gray-500">
            ({profile.reviews.summary.totalReviewCount} reviews)
          </span>
        </div>
      )}

      {/* Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${
            profile.metadata.verificationState === 'VERIFIED' ? 'bg-green-500' : 'bg-yellow-500'
          }`}></div>
          <span className="text-sm text-gray-600">
            {profile.metadata.verificationState || 'Unknown'}
          </span>
        </div>
        <span className="text-xs text-gray-400">
          Updated {new Date(profile.metadata.lastUpdated).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}

interface ProfileFormProps {
  profile?: BusinessProfile | null;
  onSave: (profile: Partial<BusinessProfile>) => void;
  onCancel: () => void;
  isLoading: boolean;
}

function ProfileForm({ profile, onSave, onCancel, isLoading }: ProfileFormProps) {
  const [formData, setFormData] = useState({
    title: profile?.basicInfo.title || '',
    description: profile?.basicInfo.description || '',
    phoneNumber: profile?.basicInfo.phoneNumbers?.[0]?.phoneNumber || '',
    websiteUri: profile?.basicInfo.websiteUri || '',
    addressLines: profile?.basicInfo.storefrontAddress?.addressLines?.[0] || '',
    locality: profile?.basicInfo.storefrontAddress?.locality || '',
    administrativeArea: profile?.basicInfo.storefrontAddress?.administrativeArea || '',
    postalCode: profile?.basicInfo.storefrontAddress?.postalCode || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const profileData: Partial<BusinessProfile> = {
      basicInfo: {
        name: profile?.basicInfo.name || '',
        title: formData.title,
        categories: profile?.basicInfo.categories || [],
        description: formData.description,
        phoneNumbers: formData.phoneNumber ? [{
          label: 'PRIMARY',
          phoneNumber: formData.phoneNumber
        }] : [],
        websiteUri: formData.websiteUri,
        storefrontAddress: {
          regionCode: profile?.basicInfo.storefrontAddress?.regionCode || 'US',
          languageCode: profile?.basicInfo.storefrontAddress?.languageCode || 'en',
          postalCode: formData.postalCode,
          administrativeArea: formData.administrativeArea,
          locality: formData.locality,
          addressLines: [formData.addressLines],
        },
        serviceArea: profile?.basicInfo.serviceArea,
      },
      hours: profile?.hours || { regularHours: undefined, specialHours: [], moreHours: [] },
      location: profile?.location || { address: null },
      businessAttributes: profile?.businessAttributes || {
        accessibility: [],
        amenities: [],
        parking: [],
        serviceOptions: [],
      },
      reviews: profile?.reviews || { summary: null, reviews: [] },
      media: profile?.media || { photos: [], coverPhoto: undefined, logo: undefined },
      posts: profile?.posts || [],
      performance: profile?.performance || null,
      metadata: profile?.metadata || {
        openInfo: undefined,
        verificationState: 'UNVERIFIED',
        lastUpdated: new Date().toISOString(),
      },
    };

    onSave(profileData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {profile ? 'Edit Profile' : 'Create New Profile'}
          </h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gbp-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gbp-blue-500"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website URL
              </label>
              <input
                type="url"
                value={formData.websiteUri}
                onChange={(e) => setFormData({ ...formData, websiteUri: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gbp-blue-500"
              />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gbp-blue-500"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Address</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Street Address
                </label>
                <input
                  type="text"
                  value={formData.addressLines}
                  onChange={(e) => setFormData({ ...formData, addressLines: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gbp-blue-500"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.locality}
                    onChange={(e) => setFormData({ ...formData, locality: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gbp-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    value={formData.administrativeArea}
                    onChange={(e) => setFormData({ ...formData, administrativeArea: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gbp-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gbp-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-gbp-blue-500 text-white rounded-lg hover:bg-gbp-blue-600 transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{profile ? 'Update' : 'Create'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ProfileManagement() {
  const [profiles, setProfiles] = useState<BusinessProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProfile, setEditingProfile] = useState<BusinessProfile | null>(null);
  const [viewingProfile, setViewingProfile] = useState<BusinessProfile | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Load profiles on component mount
  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await gmbApi.getBusinessProfiles();
      if (response.success && response.data) {
        setProfiles(response.data);
      } else {
        setError(response.error || 'Failed to load profiles');
      }
    } catch (err) {
      setError('Failed to load profiles');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProfile = async (profileData: Partial<BusinessProfile>) => {
    setActionLoading(true);
    try {
      const response = await gmbApi.createBusinessProfile(profileData);
      if (response.success && response.data) {
        setProfiles([...profiles, response.data]);
        setShowCreateForm(false);
      } else {
        setError(response.error || 'Failed to create profile');
      }
    } catch (err) {
      setError('Failed to create profile');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateProfile = async (profileData: Partial<BusinessProfile>) => {
    if (!editingProfile) return;
    
    setActionLoading(true);
    try {
      const response = await gmbApi.updateBusinessProfile(editingProfile.basicInfo.name, profileData);
      if (response.success && response.data) {
        setProfiles(profiles.map(p => 
          p.basicInfo.name === editingProfile.basicInfo.name ? response.data! : p
        ));
        setEditingProfile(null);
      } else {
        setError(response.error || 'Failed to update profile');
      }
    } catch (err) {
      setError('Failed to update profile');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteProfile = async (profile: BusinessProfile) => {
    if (!confirm(`Are you sure you want to delete "${profile.basicInfo.title}"?`)) {
      return;
    }

    setActionLoading(true);
    try {
      const response = await gmbApi.deleteBusinessProfile(profile.basicInfo.name);
      if (response.success) {
        setProfiles(profiles.filter(p => p.basicInfo.name !== profile.basicInfo.name));
      } else {
        setError(response.error || 'Failed to delete profile');
      }
    } catch (err) {
      setError('Failed to delete profile');
    } finally {
      setActionLoading(false);
    }
  };

  // Filter profiles based on search term
  const filteredProfiles = profiles.filter(profile =>
    profile.basicInfo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.basicInfo.categories.some(cat => 
      cat.displayName.toLowerCase().includes(searchTerm.toLowerCase())
    ) ||
    profile.basicInfo.storefrontAddress?.locality?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Profile Management</h1>
            <p className="text-gray-600 mt-1">
              Manage your Google My Business profiles
            </p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-gbp-blue-500 text-white px-4 py-2 rounded-lg hover:bg-gbp-blue-600 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Profile</span>
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search profiles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gbp-blue-500 focus:border-transparent w-full"
            />
          </div>
          <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4 text-gray-500" />
          </button>
          <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span className="text-red-700">{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-2">
            <Loader2 className="w-6 h-6 animate-spin text-gbp-blue-500" />
            <span className="text-gray-600">Loading profiles...</span>
          </div>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Profiles</p>
                  <p className="text-2xl font-bold text-gray-900">{profiles.length}</p>
                </div>
                <div className="w-8 h-8 bg-gbp-blue-100 rounded-lg flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-gbp-blue-600" />
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Verified</p>
                  <p className="text-2xl font-bold text-green-600">
                    {profiles.filter(p => p.metadata.verificationState === 'VERIFIED').length}
                  </p>
                </div>
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Rating</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {profiles.length > 0 
                      ? (profiles.reduce((acc, p) => acc + (p.reviews.summary?.averageRating || 0), 0) / profiles.length).toFixed(1)
                      : '0.0'
                    }
                  </p>
                </div>
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Star className="w-4 h-4 text-yellow-600" />
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Reviews</p>
                  <p className="text-2xl font-bold text-gbp-blue-600">
                    {profiles.reduce((acc, p) => acc + (p.reviews.summary?.totalReviewCount || 0), 0)}
                  </p>
                </div>
                <div className="w-8 h-8 bg-gbp-blue-100 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-gbp-blue-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Profiles Grid */}
          {filteredProfiles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProfiles.map((profile, index) => (
                <ProfileCard
                  key={profile.basicInfo.name || index}
                  profile={profile}
                  onView={setViewingProfile}
                  onEdit={setEditingProfile}
                  onDelete={handleDeleteProfile}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'No profiles found' : 'No profiles yet'}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm 
                  ? 'Try adjusting your search criteria'
                  : 'Get started by creating your first business profile'
                }
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-gbp-blue-500 text-white px-4 py-2 rounded-lg hover:bg-gbp-blue-600 transition-colors"
                >
                  Create Your First Profile
                </button>
              )}
            </div>
          )}
        </>
      )}

      {/* Create Profile Form */}
      {showCreateForm && (
        <ProfileForm
          onSave={handleCreateProfile}
          onCancel={() => setShowCreateForm(false)}
          isLoading={actionLoading}
        />
      )}

      {/* Edit Profile Form */}
      {editingProfile && (
        <ProfileForm
          profile={editingProfile}
          onSave={handleUpdateProfile}
          onCancel={() => setEditingProfile(null)}
          isLoading={actionLoading}
        />
      )}

      {/* Profile Details Modal */}
      {viewingProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  {viewingProfile.basicInfo.title}
                </h2>
                <button
                  onClick={() => setViewingProfile(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6">
              {/* Profile details content would go here */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Basic Information</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                      {JSON.stringify(viewingProfile.basicInfo, null, 2)}
                    </pre>
                  </div>
                </div>
                {/* Add more sections as needed */}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
