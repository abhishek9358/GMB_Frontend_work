import { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Edit, 
  Save,
  X,
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
  CheckCircle,
  Building2,
  MessageSquare,
  Sync,
  ExternalLink
} from 'lucide-react';
import { BusinessProfile } from '../services/gmbApi';
import { useGMBProfiles } from '../hooks/useGMBProfiles';
import { populateSampleData } from '../utils/sampleData';

// Import all the form components
import BasicInfoForm from '../components/profile/BasicInfoForm';
import ContactForm from '../components/profile/ContactForm';
import LocationForm from '../components/profile/LocationForm';
import HoursForm from '../components/profile/HoursForm';
import AttributesForm from '../components/profile/AttributesForm';

interface ComprehensiveProfileEditorProps {
  profile: BusinessProfile;
  onSave: (profile: BusinessProfile) => void;
  onCancel: () => void;
  isLoading: boolean;
}

function ComprehensiveProfileEditor({ profile, onSave, onCancel, isLoading }: ComprehensiveProfileEditorProps) {
  const [activeTab, setActiveTab] = useState('basic');
  const [editedProfile, setEditedProfile] = useState<BusinessProfile>(profile);
  const [hasChanges, setHasChanges] = useState(false);

  const tabs = [
    { id: 'basic', label: 'About', icon: Building2 },
    { id: 'contact', label: 'Contact', icon: Phone },
    { id: 'location', label: 'Location', icon: MapPin },
    { id: 'hours', label: 'Hours', icon: Clock },
    { id: 'attributes', label: 'Attributes', icon: CheckCircle },
  ];

  const handleProfileUpdate = (updates: Partial<BusinessProfile>) => {
    const updated = { ...editedProfile, ...updates };
    setEditedProfile(updated);
    setHasChanges(true);
  };

  const handleSave = () => {
    onSave(editedProfile);
  };

  const handleSync = async () => {
    // This would sync with the live GMB profile
    console.log('Syncing with live GMB profile...');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Manage Profile: {profile.basicInfo.title}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Update your Google My Business profile information
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleSync}
                className="flex items-center space-x-2 px-3 py-2 text-gbp-blue-600 border border-gbp-blue-600 rounded-lg hover:bg-gbp-blue-50 transition-colors"
                title="Sync with live GMB profile"
              >
                <Sync className="w-4 h-4" />
                <span className="text-sm">Sync</span>
              </button>
              <button
                onClick={onCancel}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 px-6 flex-shrink-0">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-gbp-blue-500 text-gbp-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'basic' && (
            <BasicInfoForm
              profile={editedProfile}
              onUpdate={handleProfileUpdate}
              isEditing={true}
            />
          )}
          {activeTab === 'contact' && (
            <ContactForm
              profile={editedProfile}
              onUpdate={handleProfileUpdate}
              isEditing={true}
            />
          )}
          {activeTab === 'location' && (
            <LocationForm
              profile={editedProfile}
              onUpdate={handleProfileUpdate}
              isEditing={true}
            />
          )}
          {activeTab === 'hours' && (
            <HoursForm
              profile={editedProfile}
              onUpdate={handleProfileUpdate}
              isEditing={true}
            />
          )}
          {activeTab === 'attributes' && (
            <AttributesForm
              profile={editedProfile}
              onUpdate={handleProfileUpdate}
              isEditing={true}
            />
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-4">
            {hasChanges && (
              <div className="flex items-center space-x-2 text-amber-600">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">You have unsaved changes</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading || !hasChanges}
              className="px-6 py-2 bg-gbp-blue-500 text-white rounded-lg hover:bg-gbp-blue-600 transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ProfileCardProps {
  profile: BusinessProfile;
  onView: (profile: BusinessProfile) => void;
  onEdit: (profile: BusinessProfile) => void;
  onDelete: (profile: BusinessProfile) => void;
  onSync: (profile: BusinessProfile) => void;
}

function ProfileCard({ profile, onView, onEdit, onDelete, onSync }: ProfileCardProps) {
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
          {profile.metadata.verificationState && (
            <div className="flex items-center space-x-2 mt-2">
              <div className={`w-2 h-2 rounded-full ${
                profile.metadata.verificationState === 'VERIFIED' ? 'bg-green-500' : 'bg-yellow-500'
              }`}></div>
              <span className="text-xs text-gray-600">
                {profile.metadata.verificationState}
              </span>
            </div>
          )}
        </div>
        <div className="relative">
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <MoreVertical className="w-4 h-4 text-gray-500" />
          </button>
          {showActions && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
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
                  onSync(profile);
                  setShowActions(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
              >
                <Sync className="w-4 h-4" />
                <span>Sync with GMB</span>
              </button>
              <div className="border-t border-gray-100 my-1"></div>
              <button
                onClick={() => {
                  onDelete(profile);
                  setShowActions(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
              >
                <X className="w-4 h-4" />
                <span>Remove Profile</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Business Info */}
      <div className="space-y-2 mb-4">
        {profile.location.storefrontAddress && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            <span className="truncate">
              {profile.location.storefrontAddress.addressLines?.[0]}, {profile.location.storefrontAddress.locality}
            </span>
          </div>
        )}
        {profile.contact.phoneNumbers?.[0] && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Phone className="w-4 h-4" />
            <span>{profile.contact.phoneNumbers[0].phoneNumber}</span>
          </div>
        )}
        {profile.contact.websiteUri && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Globe className="w-4 h-4" />
            <span className="truncate">{profile.contact.websiteUri}</span>
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

      {/* Attributes Summary */}
      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mt-4">
        <div>Amenities: {profile.attributes.amenities.length}</div>
        <div>Service Options: {profile.attributes.serviceOptions.length}</div>
        <div>Accessibility: {profile.attributes.accessibility.length}</div>
        <div>Parking: {profile.attributes.parking.length}</div>
      </div>

      {/* Updated */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
        <span className="text-xs text-gray-400">
          Updated {new Date(profile.metadata.lastUpdated).toLocaleDateString()}
        </span>
        <button
          onClick={() => onEdit(profile)}
          className="text-xs text-gbp-blue-600 hover:text-gbp-blue-700 font-medium"
        >
          Manage →
        </button>
      </div>
    </div>
  );
}

export default function ComprehensiveProfileManagement() {
  const {
    profiles,
    loading,
    error,
    loadProfiles,
    createProfile,
    updateProfile,
    deleteProfile,
    clearError
  } = useGMBProfiles();

  const [searchTerm, setSearchTerm] = useState('');
  const [editingProfile, setEditingProfile] = useState<BusinessProfile | null>(null);
  const [viewingProfile, setViewingProfile] = useState<BusinessProfile | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Initialize sample data for testing
  useEffect(() => {
    populateSampleData();
  }, []);

  const handleUpdateProfile = async (profileData: BusinessProfile) => {
    if (!editingProfile) return;
    
    setActionLoading(true);
    try {
      const result = await updateProfile(editingProfile.basicInfo.name, profileData);
      if (result.success) {
        setEditingProfile(null);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteProfile = async (profile: BusinessProfile) => {
    if (!confirm(`Are you sure you want to remove "${profile.basicInfo.title}" from management?`)) {
      return;
    }

    setActionLoading(true);
    try {
      await deleteProfile(profile.basicInfo.name);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSyncProfile = async (profile: BusinessProfile) => {
    console.log('Syncing profile with live GMB:', profile.basicInfo.title);
    // This would sync with the actual GMB API
  };

  // Filter profiles based on search term
  const filteredProfiles = profiles.filter(profile =>
    profile.basicInfo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.basicInfo.categories.some(cat => 
      cat.displayName.toLowerCase().includes(searchTerm.toLowerCase())
    ) ||
    profile.location.storefrontAddress?.locality?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">GMB Profile Management</h1>
            <p className="text-gray-600 mt-1">
              Comprehensive management of your Google My Business profiles
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={loadProfiles}
              className="flex items-center space-x-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Sync className="w-4 h-4" />
              <span>Refresh</span>
            </button>
            <button className="bg-gbp-blue-500 text-white px-4 py-2 rounded-lg hover:bg-gbp-blue-600 transition-colors flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Add Profile</span>
            </button>
          </div>
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
            onClick={clearError}
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
                <Building2 className="w-8 h-8 text-gbp-blue-500" />
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
                <CheckCircle className="w-8 h-8 text-green-500" />
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
                <Star className="w-8 h-8 text-yellow-500" />
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
                <MessageSquare className="w-8 h-8 text-gbp-blue-500" />
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
                  onSync={handleSyncProfile}
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
                  : 'Get started by adding your first business profile'
                }
              </p>
            </div>
          )}
        </>
      )}

      {/* Comprehensive Profile Editor */}
      {editingProfile && (
        <ComprehensiveProfileEditor
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
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-8">
              <BasicInfoForm profile={viewingProfile} onUpdate={() => {}} isEditing={false} />
              <ContactForm profile={viewingProfile} onUpdate={() => {}} isEditing={false} />
              <LocationForm profile={viewingProfile} onUpdate={() => {}} isEditing={false} />
              <HoursForm profile={viewingProfile} onUpdate={() => {}} isEditing={false} />
              <AttributesForm profile={viewingProfile} onUpdate={() => {}} isEditing={false} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
