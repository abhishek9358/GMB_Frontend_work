import { StatusBreakdown } from "@shared/api";

interface BusinessFiltersProps {
  statusBreakdown: StatusBreakdown;
  totalLocations: number;
  selectedFilter: string;
  onFilterChange: (filter: string) => void;
}

export default function BusinessFilters({ 
  statusBreakdown, 
  totalLocations, 
  selectedFilter, 
  onFilterChange 
}: BusinessFiltersProps) {
  const filterOptions = [
    { key: "all", label: "All", count: totalLocations },
    { key: "verified", label: "Verified", count: statusBreakdown.verified },
    { key: "unverified", label: "Unverified", count: statusBreakdown.unverified },
    { key: "googleUpdates", label: "Google updates", count: statusBreakdown.googleUpdates },
    { key: "disabled", label: "Disabled", count: statusBreakdown.disabled },
    { key: "suspended", label: "Suspended", count: statusBreakdown.suspended },
    { key: "duplicate", label: "Duplicate", count: statusBreakdown.duplicate },
    { key: "missingStoreCodes", label: "Missing store codes", count: statusBreakdown.missingStoreCodes },
    { key: "incomplete", label: "Incomplete", count: statusBreakdown.incomplete },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
      <h3 className="text-sm font-medium text-gray-900 mb-3">Filter by status</h3>
      <div className="space-y-1">
        {filterOptions.map((option) => (
          <button
            key={option.key}
            onClick={() => onFilterChange(option.key)}
            className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
              selectedFilter === option.key
                ? "bg-gbp-blue-50 text-gbp-blue-700 font-medium"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center justify-between">
              <span>{option.label}</span>
              <span className={`text-xs ${
                selectedFilter === option.key 
                  ? "text-gbp-blue-600" 
                  : "text-gray-500"
              }`}>
                ({option.count})
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
