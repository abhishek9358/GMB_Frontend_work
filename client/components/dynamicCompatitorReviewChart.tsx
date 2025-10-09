import React, { useState, useMemo } from "react";
import { Star } from "lucide-react";

// Helper function to parse relative dates and get month/year
const parseRelativeDate = (dateStr: string, cutoffDate: string) => {
  const cutoff = new Date(cutoffDate);
  const cleanDate = dateStr.replace("Edited ", "").toLowerCase();

  if (cleanDate.includes("hour") || cleanDate.includes("day")) {
    return cutoff;
  } else if (cleanDate.includes("week")) {
    const weeks = parseInt(cleanDate) || 1;
    const date = new Date(cutoff);
    date.setDate(date.getDate() - weeks * 7);
    return date;
  } else if (cleanDate.includes("month")) {
    const months = parseInt(cleanDate) || 1;
    const date = new Date(cutoff);
    date.setMonth(date.getMonth() - months);
    return date;
  }
  return cutoff;
};

// Process reviews into monthly counts
const processReviewsByMonth = (dateRangeData: any) => {
  if (!dateRangeData?.reviews) return [];

  const monthCounts: { [key: string]: number } = {};
  const cutoffDate = dateRangeData.cutoff_date;

  dateRangeData.reviews.forEach((review: any) => {
    const date = parseRelativeDate(review.date, cutoffDate);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    monthCounts[monthKey] = (monthCounts[monthKey] || 0) + 1;
  });

  // Sort by date and convert to array
  const sortedMonths = Object.keys(monthCounts).sort();
  return sortedMonths
    .map((key) => {
      const [year, month] = key.split("-");
      const date = new Date(parseInt(year), parseInt(month) - 1);
      const monthName = date.toLocaleString("default", { month: "short" });
      return {
        month: monthName,
        fullDate: key,
        count: monthCounts[key],
      };
    })
    .slice(-6); // Get last 6 months
};

// Calculate rating distribution
const calculateRatingDistribution = (reviews: any[]) => {
  const distribution = [5, 4, 3, 2, 1].map((rating) => {
    const count = reviews.filter((r) => r.rating === rating).length;
    const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
    return { rating, count, percentage };
  });
  return distribution;
};

const DynamicReviewChart = ({dateRangeData}: {dateRangeData: any}) => {
  // Sample data - replace with your actual dateRangeData
//   const dateRangeData = {
//     success: true,
//     place_id: "ChIJn3y_J-20bTkRYRCIxaD8Prc",
//     place_name: "Reinstatement Ninja",
//     total_reviews_on_profile: 358,
//     cutoff_date: "2025-07-09",
//     months_scraped: 3,
//     total_reviews_found: 60,
//     reviews_in_range: 39,
//     statistics: {
//       average_rating: 5,
//       owner_response_rate: 0,
//       reviews_with_response: 0,
//     },
//     reviews: Array(39)
//       .fill(null)
//       .map((_, i) => ({
//         rating: 5,
//         date:
//           i < 5
//             ? `${i + 1} days ago`
//             : i < 15
//               ? `${Math.floor((i - 5) / 7) + 1} weeks ago`
//               : i < 25
//                 ? "a month ago"
//                 : i < 35
//                   ? "2 months ago"
//                   : "3 months ago",
//         response_by_owner: "no" as const,
//       })),
//   };

  const [chartMode, setChartMode] = useState<"single" | "comparison">("single");
  const [hoveredDataPoint, setHoveredDataPoint] = useState<any>(null);

  const monthlyData = useMemo(
    () => processReviewsByMonth(dateRangeData),
    [dateRangeData],
  );
  const ratingDistribution = useMemo(
    () => calculateRatingDistribution(dateRangeData?.reviews || []),
    [dateRangeData],
  );

  // Calculate max value for y-axis scaling
  const maxReviews = Math.max(...monthlyData.map((d) => d.count), 10);
  const yAxisMax = Math.ceil(maxReviews / 5) * 5; // Round up to nearest 5
  const yScale = 230 / yAxisMax;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Review Analytics
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart Section */}
          <div className="lg:col-span-2 bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Review trends
                </h3>
                <p className="text-sm text-gray-500">
                  Past {dateRangeData.months_scraped} months
                </p>
              </div>
              <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setChartMode("single")}
                  className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${
                    chartMode === "single"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-black"
                  }`}
                >
                  {dateRangeData.place_name}
                </button>
                <button
                  onClick={() => setChartMode("comparison")}
                  className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${
                    chartMode === "comparison"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-black"
                  }`}
                >
                  Comparison
                </button>
              </div>
            </div>

            <div className="h-64 relative">
              <svg className="w-full h-full" viewBox="0 0 800 250">
                {/* Y-axis labels and grid lines */}
                {Array.from({ length: 6 }, (_, i) => {
                  const val = (yAxisMax / 5) * i;
                  const y = 230 - val * yScale;
                  return (
                    <g key={i}>
                      <line
                        x1="60"
                        y1={y}
                        x2="780"
                        y2={y}
                        stroke="#e5e7eb"
                        strokeDasharray="3,3"
                      />
                      <text
                        x="40"
                        y={y + 5}
                        fill="#6b7280"
                        fontSize="12"
                        textAnchor="end"
                      >
                        {Math.round(val)}
                      </text>
                    </g>
                  );
                })}

                {/* X-axis labels */}
                {monthlyData.map((data, i) => (
                  <text
                    key={i}
                    x={100 + i * (600 / (monthlyData.length - 1 || 1))}
                    y="245"
                    fill="#6b7280"
                    fontSize="12"
                    textAnchor="middle"
                  >
                    {data.month}
                  </text>
                ))}

                {chartMode === "single" ? (
                  <>
                    {/* Single line */}
                    {monthlyData.length > 1 && (
                      <polyline
                        points={monthlyData
                          .map((data, i) => {
                            const x =
                              100 + i * (600 / (monthlyData.length - 1));
                            const y = 230 - data.count * yScale;
                            return `${x},${y}`;
                          })
                          .join(" ")}
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="3"
                      />
                    )}

                    {monthlyData.map((data, i) => {
                      const x = 100 + i * (600 / (monthlyData.length - 1 || 1));
                      const y = 230 - data.count * yScale;

                      return (
                        <g key={i}>
                          <circle
                            cx={x}
                            cy={y}
                            r="15"
                            fill="transparent"
                            style={{ cursor: "pointer" }}
                            onMouseEnter={() =>
                              setHoveredDataPoint({
                                month: data.month,
                                value: data.count,
                                x,
                                y,
                                label: dateRangeData.place_name,
                              })
                            }
                            onMouseLeave={() => setHoveredDataPoint(null)}
                          />
                          <circle
                            cx={x}
                            cy={y}
                            r="5"
                            fill="#3b82f6"
                            style={{ pointerEvents: "none" }}
                          />
                          {hoveredDataPoint?.month === data.month &&
                            hoveredDataPoint?.label ===
                              dateRangeData.place_name && (
                              <circle
                                cx={x}
                                cy={y}
                                r="8"
                                fill="#3b82f6"
                                opacity="0.5"
                              />
                            )}
                        </g>
                      );
                    })}
                  </>
                ) : (
                  <>
                    {/* Comparison mode - three lines */}
                    {/* Line 1: Your Client (Blue) */}
                    {monthlyData.length > 1 && (
                      <polyline
                        points={monthlyData
                          .map((data, i) => {
                            const x =
                              100 + i * (600 / (monthlyData.length - 1));
                            const y = 230 - data.count * yScale;
                            return `${x},${y}`;
                          })
                          .join(" ")}
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="3"
                      />
                    )}

                    {monthlyData.map((data, i) => {
                      const x = 100 + i * (600 / (monthlyData.length - 1 || 1));
                      const y = 230 - data.count * yScale;

                      return (
                        <g key={`client-${i}`}>
                          <circle
                            cx={x}
                            cy={y}
                            r="15"
                            fill="transparent"
                            style={{ cursor: "pointer" }}
                            onMouseEnter={() =>
                              setHoveredDataPoint({
                                month: data.month,
                                value: data.count,
                                x,
                                y,
                                label: "A R Techno Solutions",
                              })
                            }
                            onMouseLeave={() => setHoveredDataPoint(null)}
                          />
                          <circle
                            cx={x}
                            cy={y}
                            r="5"
                            fill="#3b82f6"
                            style={{ pointerEvents: "none" }}
                          />
                          {hoveredDataPoint?.month === data.month &&
                            hoveredDataPoint?.label ===
                              "A R Techno Solutions" && (
                              <circle
                                cx={x}
                                cy={y}
                                r="8"
                                fill="#3b82f6"
                                opacity="0.5"
                              />
                            )}
                        </g>
                      );
                    })}

                    {/* Line 2: Competitor (Green) - slightly different data */}
                    {monthlyData.length > 1 && (
                      <polyline
                        points={monthlyData
                          .map((data, i) => {
                            const x =
                              100 + i * (600 / (monthlyData.length - 1));
                            const adjustedCount = Math.max(
                              0,
                              data.count + (i === 4 ? 1 : 0),
                            ); // Slight variation
                            const y = 230 - adjustedCount * yScale;
                            return `${x},${y}`;
                          })
                          .join(" ")}
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="3"
                      />
                    )}

                    {monthlyData.map((data, i) => {
                      const x = 100 + i * (600 / (monthlyData.length - 1 || 1));
                      const adjustedCount = Math.max(
                        0,
                        data.count + (i === 4 ? 1 : 0),
                      );
                      const y = 230 - adjustedCount * yScale;

                      return (
                        <g key={`comp-${i}`}>
                          <circle
                            cx={x}
                            cy={y}
                            r="15"
                            fill="transparent"
                            style={{ cursor: "pointer" }}
                            onMouseEnter={() =>
                              setHoveredDataPoint({
                                month: data.month,
                                value: adjustedCount,
                                x,
                                y,
                                label: dateRangeData.place_name,
                              })
                            }
                            onMouseLeave={() => setHoveredDataPoint(null)}
                          />
                          <circle
                            cx={x}
                            cy={y}
                            r="5"
                            fill="#10b981"
                            style={{ pointerEvents: "none" }}
                          />
                          {hoveredDataPoint?.month === data.month &&
                            hoveredDataPoint?.label ===
                              dateRangeData.place_name && (
                              <circle
                                cx={x}
                                cy={y}
                                r="8"
                                fill="#10b981"
                                opacity="0.5"
                              />
                            )}
                        </g>
                      );
                    })}

                    {/* Line 3: All Competitors (Orange) */}
                    {monthlyData.length > 1 && (
                      <polyline
                        points={monthlyData
                          .map((data, i) => {
                            const x =
                              100 + i * (600 / (monthlyData.length - 1));
                            const adjustedCount = Math.max(
                              0,
                              data.count + (i === 4 ? 2 : 0),
                            ); // More variation
                            const y = 230 - adjustedCount * yScale;
                            return `${x},${y}`;
                          })
                          .join(" ")}
                        fill="none"
                        stroke="#f97316"
                        strokeWidth="3"
                      />
                    )}

                    {monthlyData.map((data, i) => {
                      const x = 100 + i * (600 / (monthlyData.length - 1 || 1));
                      const adjustedCount = Math.max(
                        0,
                        data.count + (i === 4 ? 2 : 0),
                      );
                      const y = 230 - adjustedCount * yScale;

                      return (
                        <g key={`all-${i}`}>
                          <circle
                            cx={x}
                            cy={y}
                            r="15"
                            fill="transparent"
                            style={{ cursor: "pointer" }}
                            onMouseEnter={() =>
                              setHoveredDataPoint({
                                month: data.month,
                                value: adjustedCount,
                                x,
                                y,
                                label: "All Competitors",
                              })
                            }
                            onMouseLeave={() => setHoveredDataPoint(null)}
                          />
                          <circle
                            cx={x}
                            cy={y}
                            r="5"
                            fill="#f97316"
                            style={{ pointerEvents: "none" }}
                          />
                          {hoveredDataPoint?.month === data.month &&
                            hoveredDataPoint?.label === "All Competitors" && (
                              <circle
                                cx={x}
                                cy={y}
                                r="8"
                                fill="#f97316"
                                opacity="0.5"
                              />
                            )}
                        </g>
                      );
                    })}
                  </>
                )}
              </svg>

              {/* Tooltip */}
              {hoveredDataPoint && (
                <div
                  className="absolute bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg text-sm pointer-events-none z-10"
                  style={{
                    left: `${(hoveredDataPoint.x / 800) * 100}%`,
                    top: `${(hoveredDataPoint.y / 250) * 100}%`,
                    transform: "translate(-50%, -120%)",
                  }}
                >
                  <div className="font-semibold">{hoveredDataPoint.label}</div>
                  <div className="text-gray-300">{hoveredDataPoint.month}</div>
                  <div className="font-bold text-lg">
                    {hoveredDataPoint.value} reviews
                  </div>
                </div>
              )}
            </div>

            {chartMode === "comparison" && (
              <div className="flex items-center justify-center gap-6 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-600">A R Techno Solutions</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-gray-600">
                    {dateRangeData.place_name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="text-gray-600">All Competitors</span>
                </div>
              </div>
            )}
          </div>

          {/* Rating Distribution Section */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Rating distribution
            </h3>
            <div className="space-y-4">
              {ratingDistribution.map((item) => (
                <div key={item.rating}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium text-gray-700">
                        {item.rating} star
                      </span>
                      <Star className="w-4 h-4 text-blue-500 fill-blue-500" />
                    </div>
                    <span className="text-sm text-gray-600">
                      {item.count} ({Math.round(item.percentage)}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DynamicReviewChart;
