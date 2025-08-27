import { Location } from "@shared/api";
import { MapPin, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface BusinessCardProps {
  location: Location;
}

export default function BusinessCard({ location }: BusinessCardProps) {
  const navigate = useNavigate();

  const getStatusColor = (status: string[]) => {
    if (status.includes("VERIFIED")) return "bg-green-100 text-green-800";
    if (status.includes("SUSPENDED")) return "bg-red-100 text-red-800";
    if (status.includes("INCOMPLETE")) return "bg-yellow-100 text-yellow-800";
    if (status.includes("UNVERIFIED")) return "bg-gray-100 text-gray-800";
    return "bg-gray-100 text-gray-800";
  };

  const getAddressString = () => {
    const address = location.storefrontAddress;
    const parts = [
      ...address.addressLines,
      address.locality,
      address.administrativeArea,
      address.postalCode
    ].filter(Boolean);
    
    return parts.length > 0 ? parts.join(", ") : "No address provided";
  };

  const getPrimaryStatus = () => {
    if (location.status.includes("VERIFIED")) return "VERIFIED";
    if (location.status.includes("SUSPENDED")) return "SUSPENDED";
    if (location.status.includes("INCOMPLETE")) return "INCOMPLETE";
    if (location.status.includes("UNVERIFIED")) return "UNVERIFIED";
    return location.status[0] || "UNKNOWN";
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start space-x-4">
        {/* Business Icon */}
        <div className="w-12 h-12 bg-gradient-to-br from-gbp-blue-100 to-gbp-blue-200 rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-gbp-blue-700 font-bold text-lg">
            {location.title.charAt(0).toUpperCase()}
          </span>
        </div>

        {/* Business Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {location.title}
              </h3>

              {/* Status Badge */}
              <div className="mb-3">
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(location.status)}`}>
                  {getPrimaryStatus()}
                </span>
              </div>

              {/* Address */}
              <div className="flex items-start space-x-2 mb-3">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-600 leading-5">
                  {getAddressString()}
                </span>
              </div>

              {/* Additional Status Info */}
              {location.status.length > 1 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {location.status.slice(1).map((status, index) => (
                    <span
                      key={index}
                      className="inline-block px-2 py-1 rounded text-xs bg-gray-100 text-gray-600"
                    >
                      {status}
                    </span>
                  ))}
                </div>
              )}

              {/* Location ID */}
              <div className="text-xs text-gray-500">
                ID: {location._id}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col space-y-2 ml-4">
              <button
                onClick={() => navigate(`/businesses/${encodeURIComponent(location._id)}/manage`)}
                className="bg-gbp-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gbp-blue-600 transition-colors"
              >
                Manage
              </button>
              <button className="border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center space-x-1">
                <ExternalLink className="w-3 h-3" />
                <span>View</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
