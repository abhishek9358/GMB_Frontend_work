import { useState } from "react";
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

export default function Reports() {
  const [selectedPeriod, setSelectedPeriod] = useState("last-3-months");
  const [reportType, setReportType] = useState("all");

  const performanceMetrics: PerformanceMetric[] = [
    {
      name: "Search views",
      value: 262,
      change: 15.2,
      trend: "up",
      color: "blue",
    },
    {
      name: "Map views",
      value: 252,
      change: 8.4,
      trend: "up",
      color: "green",
    },
    {
      name: "Phone Calls",
      value: 4,
      change: -12.5,
      trend: "down",
      color: "orange",
    },
    {
      name: "Website clicks",
      value: 13,
      change: 25.0,
      trend: "up",
      color: "purple",
    },
    {
      name: "Direction requests",
      value: 0,
      change: 0,
      trend: "neutral",
      color: "gray",
    },
    {
      name: "Profile views",
      value: 191,
      change: 18.7,
      trend: "up",
      color: "teal",
    },
  ];

  const chartData: ChartData[] = [
    { date: "May 1, 2024", searches: 120, mapViews: 85 },
    { date: "May 15, 2024", searches: 145, mapViews: 102 },
    { date: "Jun 1, 2024", searches: 165, mapViews: 128 },
    { date: "Jun 15, 2024", searches: 180, mapViews: 142 },
    { date: "Jul 1, 2024", searches: 200, mapViews: 165 },
    { date: "Jul 15, 2024", searches: 220, mapViews: 180 },
    { date: "Aug 1, 2024", searches: 240, mapViews: 195 },
    { date: "Aug 15, 2024", searches: 262, mapViews: 210 },
  ];

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
                <p className="text-2xl font-bold text-gray-900">262</p>
                <p className="text-sm text-gray-500">Search views</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">252</p>
                <p className="text-sm text-gray-500">Map views</p>
              </div>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="h-64 relative">
          <svg viewBox="0 0 800 200" className="w-full h-full">
            {/* Grid lines */}
            {[0, 50, 100, 150, 200, 250].map((y) => (
              <line
                key={y}
                x1="50"
                y1={200 - (y * 200) / 300}
                x2="750"
                y2={200 - (y * 200) / 300}
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
                  (d, i) => `${50 + i * 100},${200 - (d.searches * 200) / 300}`,
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
                  (d, i) => `${50 + i * 100},${200 - (d.mapViews * 200) / 300}`,
                )
                .join(" ")}
            />

            {/* Data points */}
            {chartData.map((d, i) => (
              <g key={i}>
                <circle
                  cx={50 + i * 100}
                  cy={200 - (d.searches * 200) / 300}
                  r="4"
                  fill="#3b82f6"
                />
                <circle
                  cx={50 + i * 100}
                  cy={200 - (d.mapViews * 200) / 300}
                  r="4"
                  fill="#9ca3af"
                />
              </g>
            ))}
          </svg>
        </div>

        <div className="flex justify-between mt-4 text-xs text-gray-500">
          <span>May 1, 2024</span>
          <span>August 1, 2024</span>
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
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className={`flex-1 bg-gray-200 rounded-sm ${colors.bg}`}
                    style={{
                      height: `${Math.random() * 100}%`,
                      backgroundColor:
                        metric.trend === "up"
                          ? "#22c55e"
                          : metric.trend === "down"
                            ? "#ef4444"
                            : "#9ca3af",
                    }}
                  ></div>
                ))}
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
                <p className="font-semibold text-gray-900">4</p>
                <p className="text-xs text-gray-500">This period</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Eye className="w-5 h-5 text-purple-500" />
                <span className="text-gray-700">Website visits</span>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">13</p>
                <p className="text-xs text-gray-500">This period</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Navigation className="w-5 h-5 text-blue-500" />
                <span className="text-gray-700">Direction requests</span>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">0</p>
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
                    style={{ width: "85%" }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900">85%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Discovery searches</span>
              <div className="flex items-center space-x-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: "15%" }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900">15%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
