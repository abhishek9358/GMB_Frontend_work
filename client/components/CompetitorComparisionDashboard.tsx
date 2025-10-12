import React from "react";
import { ChevronUp, ChevronDown, Minus } from "lucide-react";

interface CompetitorsReviewDataResponse {
  success: boolean;
  total_competitors: number;
  processed: number;
  time_range_days: number;
  data: CompetitorData[];
  cache_info: CacheInfo;
  request_params: RequestParams;
}

interface CompetitorData {
  success: boolean;
  place_id: string;
  place_name: string;
  total_reviews_on_profile: number;
  cutoff_date: string;
  months_scraped: number;
  total_reviews_found: number;
  reviews_in_range: number;
  statistics: ReviewStatistics;
  reviews: Review[];
  _metadata?: Metadata;
}

interface Review {
  rating: number;
  date: string;
  response_by_owner: "yes" | "no";
}

interface ReviewStatistics {
  average_rating: number;
  owner_response_rate: number;
  reviews_with_response: number;
}

interface Metadata {
  competitor_id: string;
  competitor_title: string;
  place_id: string;
  time_range_days: number;
  cached: boolean;
  cache_timestamp: string;
  cache_age_hours: number;
}

interface CacheInfo {
  cached_count: number;
  fresh_fetch_count: number;
  failed_count: number;
  cache_ttl_hours: number;
  force_refresh: boolean;
}

interface RequestParams {
  time_range_days: number;
  use_cache: boolean;
}

interface CompetitorComparisonDashboardProps {
  yourBusiness?: CompetitorData; // optional now
  competitorsData?: CompetitorsReviewDataResponse;
}

const CompetitorComparisonDashboard: React.FC<
  CompetitorComparisonDashboardProps
> = ({ yourBusiness, competitorsData }) => {
  console.log("Dekhta hu data:", { yourBusiness, competitorsData });

  const calculatePositivePercentage = (reviews?: Review[]): number => {
    if (!reviews || reviews.length === 0) return 0;
    const positive = reviews?.filter((r) => r?.rating >= 4)?.length ?? 0;
    return parseFloat(((positive / reviews.length) * 100).toFixed(0));
  };

  const calculateNegativePercentage = (reviews?: Review[]): number => {
    if (!reviews || reviews.length === 0) return 0;
    const negative = reviews?.filter((r) => r?.rating <= 2)?.length ?? 0;
    return parseFloat(((negative / reviews.length) * 100).toFixed(0));
  };

  const getComparison = (
    yourValue?: number,
    competitorValue?: number,
    higherIsBetter: boolean = true,
  ): "better" | "worse" | "same" => {
    if (yourValue === undefined || competitorValue === undefined) return "same";
    if (yourValue === competitorValue) return "same";
    if (higherIsBetter) {
      return yourValue > competitorValue ? "better" : "worse";
    } else {
      return yourValue < competitorValue ? "better" : "worse";
    }
  };

  const getIndicator = (comparison: "better" | "worse" | "same") => {
    if (comparison === "better") {
      return <ChevronUp className="w-4 h-4 text-green-600 inline ml-2" />;
    } else if (comparison === "worse") {
      return <ChevronDown className="w-4 h-4 text-red-600 inline ml-2" />;
    } else {
      return <Minus className="w-4 h-4 text-gray-400 inline ml-2" />;
    }
  };

  const getMetricsForBusiness = (business?: CompetitorData) => {
    if (!business) {
      return {
        totalReviews: 0,
        avgRating: 0,
        responseRate: 0,
        positive: 0,
        negative: 0,
      };
    }

    const positive = calculatePositivePercentage(business?.reviews);
    const negative = calculateNegativePercentage(business?.reviews);

    return {
      totalReviews: business?.reviews_in_range ?? 0,
      avgRating: business?.statistics?.average_rating ?? 0,
      responseRate: business?.statistics?.owner_response_rate ?? 0,
      positive,
      negative,
    };
  };

  const yourMetrics = getMetricsForBusiness(yourBusiness);
  const successfulCompetitors =
    competitorsData?.data?.filter((comp) => comp?.success) ?? [];
  const competitorMetrics = successfulCompetitors?.map((comp) =>
    getMetricsForBusiness(comp),
  );

  const bgColors = [
    "bg-blue-50 text-blue-700",
    "bg-green-50 text-green-700",
    "bg-orange-50 text-orange-700",
    "bg-purple-50 text-purple-700",
    "bg-pink-50 text-pink-700",
  ];

  const metrics = [
    {
      label: "Total Reviews",
      getValue: (m: ReturnType<typeof getMetricsForBusiness>) =>
        m?.totalReviews ?? 0,
      higherIsBetter: true,
      format: (val: number) => val?.toString() ?? "0",
    },
    {
      label: "Average Rating",
      getValue: (m: ReturnType<typeof getMetricsForBusiness>) =>
        m?.avgRating ?? 0,
      higherIsBetter: true,
      format: (val: number) => (
        <>
          {(val ?? 0).toFixed(1)} <span className="text-yellow-400">★</span>
        </>
      ),
    },
    {
      label: "Response Rate",
      getValue: (m: ReturnType<typeof getMetricsForBusiness>) =>
        m?.responseRate ?? 0,
      higherIsBetter: true,
      format: (val: number) => (
        <>
          {(val ?? 0).toFixed(1)}%
          <div className="w-20 h-2 bg-gray-200 rounded-full inline-block ml-2">
            <div
              className="h-full bg-blue-500 rounded-full"
              style={{ width: `${val ?? 0}%` }}
            />
          </div>
        </>
      ),
    },
    {
      label: "Positive Reviews (4-5★)",
      getValue: (m: ReturnType<typeof getMetricsForBusiness>) =>
        m?.positive ?? 0,
      higherIsBetter: true,
      format: (val: number) => `${val ?? 0}%`,
    },
    {
      label: "Negative Reviews (1-2★)",
      getValue: (m: ReturnType<typeof getMetricsForBusiness>) =>
        m?.negative ?? 0,
      higherIsBetter: false,
      format: (val: number) => `${val ?? 0}%`,
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Comparison Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Compare your business against{" "}
            {competitorsData?.total_competitors ?? 0} competitor
            {(competitorsData?.total_competitors ?? 0) > 1
              ? "s"
              : ""} (Last {competitorsData?.time_range_days ?? 0} days)
          </p>
          {competitorsData?.cache_info?.cached_count ? (
            <p className="text-sm text-gray-500 mt-1">
              ℹ️ Using cached data (
              {competitorsData?.cache_info?.cached_count ?? 0} cached)
            </p>
          ) : null}
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
          <table className="w-full min-w-max">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left p-4 font-semibold text-gray-700 bg-gray-50 sticky left-0 z-10">
                  METRIC
                </th>
                {successfulCompetitors?.map((comp, idx) => (
                  <th
                    key={comp?.place_id ?? idx}
                    className={`text-left p-4 font-semibold ${
                      bgColors[idx % bgColors.length]
                    }`}
                  >
                    {comp?.place_name?.toUpperCase() ?? "UNKNOWN"}
                  </th>
                ))}
                <th className="text-left p-4 font-semibold text-indigo-700 bg-indigo-50">
                  {yourBusiness?.place_name?.toUpperCase() ?? "YOUR BUSINESS"}
                </th>
              </tr>
            </thead>
            <tbody>
              {metrics?.map((metric, metricIdx) => (
                <tr
                  key={metricIdx}
                  className={`border-b border-gray-100 ${
                    metricIdx % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }`}
                >
                  <td className="p-4 font-medium text-gray-800 sticky left-0 bg-inherit z-10">
                    {metric?.label ?? ""}
                  </td>
                  {successfulCompetitors?.map((comp, compIdx) => {
                    const compMetric = competitorMetrics?.[compIdx];
                    const compValue = metric?.getValue?.(compMetric) ?? 0;
                    const yourValue = metric?.getValue?.(yourMetrics) ?? 0;
                    const comparison = getComparison(
                      compValue,
                      yourValue,
                      metric?.higherIsBetter ?? true,
                    );

                    return (
                      <td
                        key={comp?.place_id ?? compIdx}
                        className={`p-4 ${bgColors[compIdx % bgColors.length]}`}
                      >
                        <div className="flex items-center">
                          {metric?.format?.(compValue)}
                          {getIndicator(comparison)}
                        </div>
                      </td>
                    );
                  })}
                  <td className="p-4 text-indigo-700 bg-indigo-50">
                    <div className="flex items-center font-semibold">
                      {metric?.format?.(metric?.getValue?.(yourMetrics) ?? 0)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex items-center gap-6 text-sm flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-indigo-100 border-2 border-indigo-600 rounded"></div>
            <span className="text-gray-600">Your Business</span>
          </div>
          <div className="flex items-center gap-2">
            <ChevronUp className="w-4 h-4 text-green-600" />
            <span className="text-gray-600">Better than your business</span>
          </div>
          <div className="flex items-center gap-2">
            <ChevronDown className="w-4 h-4 text-red-600" />
            <span className="text-gray-600">Worse than your business</span>
          </div>
          <div className="flex items-center gap-2">
            <Minus className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">Same as your business</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompetitorComparisonDashboard;
