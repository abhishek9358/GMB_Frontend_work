import { useState, useEffect } from "react";
import { CheckCircle, ArrowUp, ArrowDown, Play, FileText } from "lucide-react";
import axios from "axios"; // Import Axios
import { useBusinesses } from "../hooks/useBusinesses";
import { SERVER } from "@/constants";
import { RootState } from "@/redux/store";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { id } from "date-fns/locale";

interface MetricCardProps {
  title: string;
  value: string;
  subtitle: string;
  trend?: "up" | "down";
  trendValue?: string;
  color: "orange" | "blue" | "green";
  actionLabel?: string;
  onAction?: () => void;
}

function MetricCard({
  title,
  value,
  subtitle,
  trend,
  trendValue,
  color,
  actionLabel,
  onAction,
}: MetricCardProps) {
  const colorClasses = {
    orange:
      "border-gbp-orange-200 bg-gradient-to-br from-gbp-orange-50 to-orange-100",
    blue: "border-gbp-blue-200 bg-gradient-to-br from-gbp-blue-50 to-blue-100",
    green:
      "border-gbp-success-200 bg-gradient-to-br from-gbp-success-50 to-green-100",
  };

  const progressColor = {
    orange: "bg-gbp-orange-500",
    blue: "bg-gbp-blue-500",
    green: "bg-gbp-success-500",
  };

  return (
    <div
      className={`p-6 rounded-xl border-2 ${colorClasses[color]} relative overflow-hidden`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-3xl font-bold text-gray-900">{value}</span>
            {trend && trendValue && (
              <div
                className={`flex items-center space-x-1 ${trend === "up" ? "text-green-600" : "text-red-600"}`}
              >
                {trend === "up" ? (
                  <ArrowUp className="w-4 h-4" />
                ) : (
                  <ArrowDown className="w-4 h-4" />
                )}
                <span className="text-sm font-medium">{trendValue}</span>
              </div>
            )}
          </div>
          <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-white bg-opacity-60 rounded-full h-2 mb-4">
        <div
          className={`h-2 rounded-full ${progressColor[color]}`}
          style={{ width: value }}
        ></div>
      </div>

      {actionLabel && (
        <button
          onClick={onAction}
          className="text-sm font-medium text-gray-700 hover:text-gray-900 underline"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export default function Dashboard() {
  const { selectedBusiness } = useBusinesses();
  const { activeLocation } = useSelector((state: RootState) => state.activeLocation);
  const [automationTasks] = useState([
    "Upload an image every 4 days",
    "Publish an update every 5 days",
    "Reply to reviews using AI",
    "Update Q&As every 12 days",
    "Send you a report bi-weekly",
    "Alert you when you're needed",
  ]);
  const [locationData, setLocationData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { locationName, accountId } = useParams<{
    locationName: string;
    accountId: string;
  }>();
  const [error, setError] = useState<string | null>(null);
  const { user } = useSelector((state: RootState) => state.user);

  // Fetch location data using Axios
  useEffect(() => {
    const fetchLocationData = async (id: string) => {
      const accId = user?.accountId; // Fallback to param if user accountId not available
      if (!id) {
        setError("No location ID provided");
        setLoading(false);
        return;
      }
      if (!accId) {
        setError("No account ID provided");
        setLoading(false);
        return;
      }

      console.log(id, "Fetching location data...");

      try {
        setLoading(true);
        setError(null); // Clear previous error
        const response = await axios.get(
          `${SERVER}/api/v1/locations/${id}/?account_id=${accId}`,
          { withCredentials: true }
        );
        setLocationData(response.data.location);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch location data");
        setLoading(false);
      }
    };

    console.log(id, "Selected Business ID:", activeLocation?.locationId);
    console.log(user?.accountId, "Account ID from params:");

    const locId = localStorage.getItem("activeLocation") || activeLocation?.locationId?.split("/")[1] || locationName; // Fallback to param if activeLocation.locationId not available
    fetchLocationData(locId);
  }, [activeLocation?.locationId, user?.accountId, locationName, accountId]); // Dependencies to refetch on changes

  if (loading) {
    return <div className="p-6 text-gray-600">Loading...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">{error}</div>;
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-full">
      {/* Help Banner */}
      <div className="bg-gradient-to-r from-gbp-orange-500 to-gbp-orange-600 rounded-xl p-6 text-white relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-orange-100 text-sm font-medium mb-1">
              Hey Help Paige Business!
            </p>
            <h2 className="text-2xl font-bold mb-2">We need your help!</h2>
          </div>
          <div className="w-24 h-24 opacity-20">
            <div className="w-full h-full bg-white bg-opacity-20 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Business Overview */}
      {locationData && (
        <div className="bg-white rounded-xl p-6 border border-gray-200 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-gbp-blue-100 to-gbp-blue-200 rounded-xl flex items-center justify-center">
                <span className="text-gbp-blue-700 font-bold text-2xl">
                  {locationData.title?.charAt(0)}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {locationData.title}
                </h2>
                <p className="text-gray-600 text-sm">
                  {locationData.info.businessCategory}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={`text-sm ${
                          i < Math.floor(locationData.stats.averageRating)
                            ? "text-yellow-400"
                            : "text-gray-300"
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {locationData.stats.averageRating}
                  </span>
                  <span className="text-sm text-gray-500">
                    ({locationData.stats.reviewCount} reviews)
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 mb-1">Status</div>
              <div className="flex items-center space-x-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    locationData.stats.businessStatus === "OPEN"
                      ? "bg-green-500"
                      : "bg-red-500"
                  }`}
                ></div>
                <span
                  className={`text-sm font-medium ${
                    locationData.stats.businessStatus === "OPEN"
                      ? "text-green-700"
                      : "text-red-700"
                  }`}
                >
                  {locationData.stats.businessStatus}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Optimization Score"
          value={`${locationData?.stats.optimisationScore}%`}
          subtitle="Profile optimization level"
          trend="up"
          trendValue="15%" // Note: API doesn't provide trend data, keeping static for now
          color="orange"
          actionLabel="See Optimizations"
          onAction={() => console.log("View optimizations")}
        />
        <MetricCard
          title="Automation Score"
          value={`${locationData?.stats.automationScore}%`}
          subtitle="Automation efficiency"
          color="blue"
          actionLabel="See Automations"
          onAction={() => console.log("View automations")}
        />
        <MetricCard
          title="Google Reviews"
          value={`${locationData?.stats.averageRating}/5`}
          subtitle="Average rating"
          color="green"
          actionLabel="See Reviews"
          onAction={() => console.log("View reviews")}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Train Paige Section */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-gbp-blue-500 to-gbp-blue-600 rounded-xl p-6 text-white">
            <h3 className="text-lg font-semibold mb-2">Train Paige</h3>
            <p className="text-blue-100 text-sm mb-4">
              Help the chatbot Paige writes to be more specific and personalized
            </p>
            <button className="bg-white text-gbp-blue-600 px-4 py-2 rounded-lg font-medium text-sm hover:bg-blue-50 transition-colors">
              Train Paige
            </button>
          </div>
        </div>

        {/* Automation Status */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Set up Automations!
            </h3>

            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-4">
                Paige will currently:
              </p>
              <div className="space-y-3">
                {automationTasks.map((task, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-gbp-success-500 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{task}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                <Play className="w-8 h-8 text-gray-400" />
              </div>
              <div className="flex-1 mx-4">
                <p className="text-sm text-gray-600 mb-2">
                  Select "Trust Paige" to have an automation upload your
                  settings based on automated Paige prompts for thousands of
                  SMBs on Google Business Profiles. You can customize each
                  setting once you select this option.
                </p>
                <button className="bg-gbp-blue-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-gbp-blue-600 transition-colors">
                  Trust Paige
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* My Tasks Section */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">My Tasks</h3>
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 bg-gbp-blue-100 rounded-full flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-gbp-blue-500" />
          </div>
          <p className="text-gray-500 text-center">
            Great! You don't have any tasks to do.
          </p>
        </div>
      </div>
    </div>
  );
}
