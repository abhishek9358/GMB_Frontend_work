import { useState } from 'react';
import { Phone, Globe, MessageCircle, Plus, X } from 'lucide-react';
import { BusinessProfile, ContactInfo } from '../../services/gmbApi';

interface ContactFormProps {
  profile: BusinessProfile;
  onUpdate: (data: Partial<BusinessProfile>) => void;
  isEditing: boolean;
}

export default function ContactForm({ profile, onUpdate, isEditing }: ContactFormProps) {
  const [phoneNumbers, setPhoneNumbers] = useState(
    profile.contact.phoneNumbers.length > 0 
      ? profile.contact.phoneNumbers 
      : [{ label: 'PRIMARY', phoneNumber: '' }]
  );
  const [websiteUri, setWebsiteUri] = useState(profile.contact.websiteUri || '');
  const [chatEnabled, setChatEnabled] = useState(profile.contact.chatEnabled || false);
  const [chatUrl, setChatUrl] = useState(profile.contact.chatUrl || '');

  const handlePhoneChange = (index: number, field: 'label' | 'phoneNumber', value: string) => {
    const updated = [...phoneNumbers];
    updated[index] = { ...updated[index], [field]: value };
    setPhoneNumbers(updated);
    updateContact({ phoneNumbers: updated });
  };

  const addPhoneNumber = () => {
    const updated = [...phoneNumbers, { label: 'MOBILE', phoneNumber: '' }];
    setPhoneNumbers(updated);
    updateContact({ phoneNumbers: updated });
  };

  const removePhoneNumber = (index: number) => {
    const updated = phoneNumbers.filter((_, i) => i !== index);
    setPhoneNumbers(updated);
    updateContact({ phoneNumbers: updated });
  };

  const updateContact = (contactData: Partial<ContactInfo>) => {
    if (isEditing) {
      onUpdate({
        contact: {
          ...profile.contact,
          ...contactData
        }
      });
    }
  };

  const handleWebsiteChange = (value: string) => {
    setWebsiteUri(value);
    updateContact({ websiteUri: value });
  };

  const handleChatChange = (enabled: boolean, url?: string) => {
    setChatEnabled(enabled);
    if (url !== undefined) setChatUrl(url);
    updateContact({ 
      chatEnabled: enabled, 
      chatUrl: url !== undefined ? url : chatUrl 
    });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
          <p className="text-sm text-gray-500 mt-1">How customers can reach you</p>
        </div>
        <Phone className="w-5 h-5 text-gray-400" />
      </div>

      <div className="space-y-6">
        {/* Phone Numbers */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Phone number(s)
          </label>
          <div className="space-y-3">
            {phoneNumbers.map((phone, index) => (
              <div key={index} className="flex items-center space-x-3">
                {isEditing ? (
                  <>
                    <select
                      value={phone.label}
                      onChange={(e) => handlePhoneChange(index, 'label', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gbp-blue-500"
                    >
                      <option value="PRIMARY">Primary</option>
                      <option value="MOBILE">Mobile</option>
                      <option value="TOLL_FREE">Toll Free</option>
                      <option value="FAX">Fax</option>
                    </select>
                    <input
                      type="tel"
                      value={phone.phoneNumber}
                      onChange={(e) => handlePhoneChange(index, 'phoneNumber', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gbp-blue-500"
                      placeholder="+1 (555) 123-4567"
                    />
                    {phoneNumbers.length > 1 && (
                      <button
                        onClick={() => removePhoneNumber(index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <span className="text-sm font-medium text-gray-500 w-20">
                      {phone.label}:
                    </span>
                    <span className="text-gray-900">
                      {phone.phoneNumber || 'Not provided'}
                    </span>
                  </>
                )}
              </div>
            ))}
            {isEditing && (
              <button
                onClick={addPhoneNumber}
                className="flex items-center space-x-2 text-gbp-blue-600 hover:text-gbp-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm">Add another phone number</span>
              </button>
            )}
          </div>
        </div>

        {/* Website */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Website
          </label>
          {isEditing ? (
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="url"
                value={websiteUri}
                onChange={(e) => handleWebsiteChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gbp-blue-500"
                placeholder="https://yourwebsite.com"
              />
            </div>
          ) : (
            <p className="text-gray-900 py-2">
              {websiteUri ? (
                <a 
                  href={websiteUri} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gbp-blue-600 hover:underline"
                >
                  {websiteUri}
                </a>
              ) : (
                'Not provided'
              )}
            </p>
          )}
        </div>

        {/* Chat */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Chat
          </label>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              {isEditing ? (
                <>
                  <input
                    type="checkbox"
                    checked={chatEnabled}
                    onChange={(e) => handleChatChange(e.target.checked)}
                    className="w-4 h-4 text-gbp-blue-600 border-gray-300 rounded focus:ring-gbp-blue-500"
                  />
                  <span className="text-sm text-gray-700">Enable chat messaging</span>
                </>
              ) : (
                <>
                  <MessageCircle className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-900">
                    {chatEnabled ? 'Chat enabled' : 'Chat not enabled'}
                  </span>
                </>
              )}
            </div>
            
            {chatEnabled && (
              <div className="ml-7">
                {isEditing ? (
                  <input
                    type="url"
                    value={chatUrl}
                    onChange={(e) => handleChatChange(chatEnabled, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gbp-blue-500"
                    placeholder="https://your-chat-service.com"
                  />
                ) : (
                  <p className="text-sm text-gray-600">
                    {chatUrl ? (
                      <a 
                        href={chatUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-gbp-blue-600 hover:underline"
                      >
                        {chatUrl}
                      </a>
                    ) : (
                      'No chat URL specified'
                    )}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
