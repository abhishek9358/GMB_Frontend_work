import { useState, useEffect } from "react";
import {
  TrendingUp,
  Search,
  MapPin,
  Phone,
  Navigation,
  Eye,
  Download,
  Calendar,
  Filter,
} from "lucide-react";
import { SERVER } from "@/constants";
import axios from "axios";
import { RootState } from "@/redux/store";
import { useSelector } from "react-redux";

interface PerformanceMetric {
  name: string;
  value: number;
  change: number;
  trend: "up" | "down" | "neutral";
  color: string;
}

interface ChartData {
  date: string;
  searches: number;
  mapViews: number;
}

interface DailyMetric {
  date: string;
  search_views: number;
  map_views: number;
  profile_views: number;
  website_clicks: number;
  phone_calls: number;
  direction_requests: number;
}

interface APIResponse {
  success: boolean;
  locationId: string;
  metrics: {
    totals: {
      search_views: number;
      map_views: number;
      profile_views: number;
      website_clicks: number;
      phone_calls: number;
      direction_requests: number;
    };
    daily: DailyMetric[];
    changes?: {
      search_views_change: number;
      map_views_change: number;
      profile_views_change: number;
      website_clicks_change: number;
      phone_calls_change: number;
      direction_requests_change: number;
    };
  };
  period: {
    start: string;
    end: string;
  };
}

export default function Reports() {
  const [selectedPeriod, setSelectedPeriod] = useState("last-3-months");
  const [reportType, setReportType] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [performanceData, setPerformanceData] = useState<APIResponse | null>(
    null,
  );

  const {activeLocation} = useSelector((state: RootState) => state.activeLocation);

  // Calculate date ranges based on selected period
  const getDateRange = () => {
    const endDate = new Date();
    let startDate = new Date();

    switch (selectedPeriod) {
      case "last-week":
        startDate.setDate(endDate.getDate() - 7);
        break;
      case "last-month":
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case "last-3-months":
        startDate.setMonth(endDate.getMonth() - 3);
        break;
      default:
        startDate.setMonth(endDate.getMonth() - 3);
    }

    return {
      start: startDate.toISOString().split("T")[0],
      end: endDate.toISOString().split("T")[0],
    };
  };

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const { start, end } = getDateRange();
        

        const response = await axios.get(
          `${SERVER}/api/v1/account/business-performance?location_id=${activeLocation.locationId?.split("/")?.[1]}&start_date=${start}&end_date=${end}&include_change=true`,
          {
            withCredentials: true,
          },
        );

        if (!response.data.success) {
          throw new Error("Failed to fetch performance data");
        }

        const data: APIResponse = response.data;
        setPerformanceData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedPeriod]);

  // Calculate percentage changes (comparing to previous period)
  const calculateChange = (metricName: string): number => {
    if (!performanceData?.metrics.changes) return 0;

    const changeKey =
      `${metricName}_change` as keyof typeof performanceData.metrics.changes;
    return performanceData.metrics.changes[changeKey] || 0;
  };

  // Transform API data to performance metrics
  const performanceMetrics: PerformanceMetric[] = performanceData
    ? [
        {
          name: "Search views",
          value: performanceData.metrics.totals.search_views,
          change: calculateChange(
            "search_views"
          ),
          trend:
            performanceData.metrics.totals.search_views > 0 ? "up" : "neutral",
          color: "blue",
        },
        {
          name: "Map views",
          value: performanceData.metrics.totals.map_views,
          change: calculateChange("map_views"),
          trend:
            performanceData.metrics.totals.map_views > 0 ? "up" : "neutral",
          color: "green",
        },
        {
          name: "Phone Calls",
          value: performanceData.metrics.totals.phone_calls,
          change: calculateChange("phone_calls"),
          trend:
            performanceData.metrics.totals.phone_calls > 0 ? "up" : "neutral",
          color: "orange",
        },
        {
          name: "Website clicks",
          value: performanceData.metrics.totals.website_clicks,
          change: calculateChange("website_clicks"),
          trend:
            performanceData.metrics.totals.website_clicks > 0
              ? "up"
              : "neutral",
          color: "purple",
        },
        {
          name: "Direction requests",
          value: performanceData.metrics.totals.direction_requests,
          change: calculateChange("direction_requests"),
          trend: "neutral",
          color: "gray",
        },
        {
          name: "Profile views",
          value: performanceData.metrics.totals.profile_views,
          change: calculateChange("profile_views"),
          trend:
            performanceData.metrics.totals.profile_views > 0 ? "up" : "neutral",
          color: "teal",
        },
      ]
    : [];

  // Transform API data to chart data
  const chartData: ChartData[] = performanceData
    ? performanceData.metrics.daily.map((day) => ({
        date: new Date(day.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        searches: day.search_views,
        mapViews: day.map_views,
      }))
    : [];

  const getIconForMetric = (name: string) => {
    switch (name) {
      case "Search views":
        return <Search className="w-5 h-5" />;
      case "Map views":
        return <MapPin className="w-5 h-5" />;
      case "Phone Calls":
        return <Phone className="w-5 h-5" />;
      case "Website clicks":
        return <Eye className="w-5 h-5" />;
      case "Direction requests":
        return <Navigation className="w-5 h-5" />;
      case "Profile views":
        return <TrendingUp className="w-5 h-5" />;
      default:
        return <TrendingUp className="w-5 h-5" />;
    }
  };

  const getColorClasses = (color: string, trend: string) => {
    const colorMap: {
      [key: string]: { bg: string; text: string; icon: string };
    } = {
      blue: { bg: "bg-blue-50", text: "text-blue-600", icon: "text-blue-500" },
      green: {
        bg: "bg-green-50",
        text: "text-green-600",
        icon: "text-green-500",
      },
      orange: {
        bg: "bg-orange-50",
        text: "text-orange-600",
        icon: "text-orange-500",
      },
      purple: {
        bg: "bg-purple-50",
        text: "text-purple-600",
        icon: "text-purple-500",
      },
      gray: { bg: "bg-gray-50", text: "text-gray-600", icon: "text-gray-500" },
      teal: { bg: "bg-teal-50", text: "text-teal-600", icon: "text-teal-500" },
    };
    return colorMap[color] || colorMap.gray;
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gbp-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading performance data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-full">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error loading data: {error}</p>
        </div>
      </div>
    );
  }

  const maxValue = Math.max(
    ...chartData.map((d) => Math.max(d.searches, d.mapViews)),
    1,
  );

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      {/* Header with Banner */}
      <div className="bg-gradient-to-r from-gbp-success-500 to-gbp-success-600 rounded-xl p-6 text-white mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              Turn on report automations to refresh your heat maps!
            </h1>
            <p className="text-green-100">
              Get automated insights delivered to your inbox
            </p>
          </div>
          <div className="w-24 h-24 opacity-30">
            {/* Decorative illustration */}
            <div className="w-full h-full bg-white bg-opacity-20 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg p-6 border border-gray-200 mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Performance Reports
          </h2>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Period:</span>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="border border-gray-200 rounded px-3 py-1 text-sm"
              >
                <option value="last-3-months">Last 3 months</option>
                <option value="last-month">Last month</option>
                <option value="last-week">Last week</option>
                <option value="custom">Custom range</option>
              </select>
            </div>
            <button className="bg-gbp-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gbp-blue-600 flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Views on Google Chart */}
      <div className="bg-white rounded-lg p-6 border border-gray-200 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Views on Google
            </h3>
            <div className="flex items-center space-x-6 mt-2">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gbp-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Google Search</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                <span className="text-sm text-gray-600">Google Maps</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-4">
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {performanceData?.metrics.totals.search_views || 0}
                </p>
                <p className="text-sm text-gray-500">Search views</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {performanceData?.metrics.totals.map_views || 0}
                </p>
                <p className="text-sm text-gray-500">Map views</p>
              </div>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="h-64 relative">
          <svg viewBox="0 0 800 200" className="w-full h-full">
            {/* Grid lines */}
            {[0, 0.2, 0.4, 0.6, 0.8, 1].map((y) => (
              <line
                key={y}
                x1="50"
                y1={200 - y * 180}
                x2="750"
                y2={200 - y * 180}
                stroke="#f3f4f6"
                strokeWidth="1"
              />
            ))}

            {/* Search line */}
            <polyline
              fill="none"
              stroke="#3b82f6"
              strokeWidth="3"
              points={chartData
                .map(
                  (d, i) =>
                    `${50 + (i * 700) / (chartData.length - 1)},${200 - (d.searches / maxValue) * 180}`,
                )
                .join(" ")}
            />

            {/* Map views line */}
            <polyline
              fill="none"
              stroke="#9ca3af"
              strokeWidth="3"
              points={chartData
                .map(
                  (d, i) =>
                    `${50 + (i * 700) / (chartData.length - 1)},${200 - (d.mapViews / maxValue) * 180}`,
                )
                .join(" ")}
            />

            {/* Data points */}
            {chartData.map((d, i) => (
              <g key={i}>
                <circle
                  cx={50 + (i * 700) / (chartData.length - 1)}
                  cy={200 - (d.searches / maxValue) * 180}
                  r="4"
                  fill="#3b82f6"
                />
                <circle
                  cx={50 + (i * 700) / (chartData.length - 1)}
                  cy={200 - (d.mapViews / maxValue) * 180}
                  r="4"
                  fill="#9ca3af"
                />
              </g>
            ))}
          </svg>
        </div>

        <div className="flex justify-between mt-4 text-xs text-gray-500">
          <span>{chartData[0]?.date || ""}</span>
          <span>{chartData[chartData.length - 1]?.date || ""}</span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {performanceMetrics.map((metric) => {
          const colors = getColorClasses(metric.color, metric.trend);
          return (
            <div
              key={metric.name}
              className="bg-white rounded-lg p-6 border border-gray-200"
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`w-10 h-10 ${colors.bg} rounded-lg flex items-center justify-center`}
                >
                  <div className={colors.icon}>
                    {getIconForMetric(metric.name)}
                  </div>
                </div>
                <div
                  className={`text-xs font-medium px-2 py-1 rounded ${
                    metric.trend === "up"
                      ? "text-green-700 bg-green-100"
                      : metric.trend === "down"
                        ? "text-red-700 bg-red-100"
                        : "text-gray-700 bg-gray-100"
                  }`}
                >
                  {metric.change > 0 ? "+" : ""}
                  {metric.change}%
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 mb-1">
                  {metric.value}
                </p>
                <p className="text-sm text-gray-600">{metric.name}</p>
              </div>

              {/* Mini chart */}
              <div className="mt-4 h-8 flex items-end space-x-1">
                {performanceData?.metrics.daily.slice(-12).map((day, i) => {
                  let value = 0;
                  switch (metric.name) {
                    case "Search views":
                      value = day.search_views;
                      break;
                    case "Map views":
                      value = day.map_views;
                      break;
                    case "Phone Calls":
                      value = day.phone_calls;
                      break;
                    case "Website clicks":
                      value = day.website_clicks;
                      break;
                    case "Direction requests":
                      value = day.direction_requests;
                      break;
                    case "Profile views":
                      value = day.profile_views;
                      break;
                  }
                  const maxMetricValue = Math.max(
                    ...performanceData.metrics.daily.map((d) => {
                      switch (metric.name) {
                        case "Search views":
                          return d.search_views;
                        case "Map views":
                          return d.map_views;
                        case "Phone Calls":
                          return d.phone_calls;
                        case "Website clicks":
                          return d.website_clicks;
                        case "Direction requests":
                          return d.direction_requests;
                        case "Profile views":
                          return d.profile_views;
                        default:
                          return 0;
                      }
                    }),
                    1,
                  );
                  return (
                    <div
                      key={i}
                      className={`flex-1 rounded-sm`}
                      style={{
                        height: `${(value / maxMetricValue) * 100}%`,
                        backgroundColor:
                          metric.trend === "up"
                            ? "#22c55e"
                            : metric.trend === "down"
                              ? "#ef4444"
                              : "#9ca3af",
                        minHeight: value > 0 ? "2px" : "0px",
                      }}
                    ></div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Section - Additional Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Customer Actions
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-orange-500" />
                <span className="text-gray-700">Phone calls</span>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">
                  {performanceData?.metrics.totals.phone_calls || 0}
                </p>
                <p className="text-xs text-gray-500">This period</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Eye className="w-5 h-5 text-purple-500" />
                <span className="text-gray-700">Website visits</span>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">
                  {performanceData?.metrics.totals.website_clicks || 0}
                </p>
                <p className="text-xs text-gray-500">This period</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Navigation className="w-5 h-5 text-blue-500" />
                <span className="text-gray-700">Direction requests</span>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">
                  {performanceData?.metrics.totals.direction_requests || 0}
                </p>
                <p className="text-xs text-gray-500">This period</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Discovery Sources
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Direct searches</span>
              <div className="flex items-center space-x-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gbp-blue-500 h-2 rounded-full"
                    style={{
                      width: `${
                        performanceData
                          ? (
                              (performanceData.metrics.totals.search_views /
                                (performanceData.metrics.totals.search_views +
                                  performanceData.metrics.totals.map_views)) *
                              100
                            ).toFixed(0)
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {performanceData
                    ? (
                        (performanceData.metrics.totals.search_views /
                          (performanceData.metrics.totals.search_views +
                            performanceData.metrics.totals.map_views)) *
                        100
                      ).toFixed(0)
                    : 0}
                  %
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Discovery searches</span>
              <div className="flex items-center space-x-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{
                      width: `${
                        performanceData
                          ? (
                              (performanceData.metrics.totals.map_views /
                                (performanceData.metrics.totals.search_views +
                                  performanceData.metrics.totals.map_views)) *
                              100
                            ).toFixed(0)
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {performanceData
                    ? (
                        (performanceData.metrics.totals.map_views /
                          (performanceData.metrics.totals.search_views +
                            performanceData.metrics.totals.map_views)) *
                        100
                      ).toFixed(0)
                    : 0}
                  %
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
