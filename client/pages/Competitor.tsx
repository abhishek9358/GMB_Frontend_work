import { useState, useMemo, useEffect } from "react";
import {
  Star,
  TrendingUp,
  MessageSquare,
  Reply,
  Download,
  Plus,
  ExternalLink,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  ChevronDown,
  Loader2,
  Sparkles,
  MoreVertical,
} from "lucide-react";
import axios from "axios";
import { SERVER } from "@/constants";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import DynamicReviewChart from "@/components/dynamicCompatitorReviewChart";
import CompetitorComparisonDashboard from "@/components/CompetitorComparisionDashboard";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// =============================================
// TYPE DEFINITIONS
// =============================================

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
  cutoff_date: string; // e.g., "2025-07-12"
  months_scraped: number;
  total_reviews_found: number;
  reviews_in_range: number;
  statistics: ReviewStatistics;
  reviews: {
    rating: number; // 1 to 5
    date: string; // e.g., "3 months ago", "a week ago"
    response_by_owner: "yes" | "no";
  }[];
  _metadata: Metadata;
}

interface ReviewStatistics {
  average_rating: number; // e.g., 4.68
  owner_response_rate: number; // e.g., 87.1
  reviews_with_response: number; // e.g., 27
}

interface Metadata {
  competitor_id: string;
  competitor_title: string;
  place_id: string;
  time_range_days: number;
  cached: boolean;
  cache_timestamp: string; // ISO format
  cache_age_hours: number; // e.g., 1.599
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

interface ReviewStatistics {
  average_rating: number;
  owner_response_rate: number;
  reviews_with_response: number;
}

interface DateRangeReviewData {
  success: boolean;
  place_id: string;
  place_name: string;
  total_reviews_on_profile: number;
  cutoff_date: string;
  months_scraped: number;
  total_reviews_found: number;
  reviews_in_range: number;
  statistics: ReviewStatistics;
  reviews: {
    rating: number;
    date: string;
    response_by_owner: "yes" | "no";
  }[];
}

interface Review {
  author?: string;
  rating: number;
  date: string;
  review_text?: string;
  response_by_owner?: "yes" | "no";
}

interface BusinessData {
  place_name: string;
  place_id: string;
  category?: string | null;
  reviews: Review[];
}

interface AIRecommendations {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  actionPlan: {
    days30: string[];
    days60: string[];
    days90: string[];
  };
}

// =============================================
// ANALYTICS FUNCTIONS
// =============================================

function calculateAnalytics(reviews: Review[]) {
  const total = reviews?.length || 0;
  const avgRating =
    total > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / total : 0;
  const responseRate =
    total > 0
      ? (reviews.filter((r) => r.response_by_owner === "yes").length / total) *
        100
      : 0;

  const ratingDist: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach((r) => {
    if (r.rating >= 1 && r.rating <= 5) {
      ratingDist[r.rating]++;
    }
  });

  const positiveCount = reviews.filter((r) => r.rating >= 4).length;
  const negativeCount = reviews.filter((r) => r.rating <= 2).length;

  return {
    totalReviews: total,
    avgRating: avgRating.toFixed(1),
    responseRate: Math.round(responseRate),
    positivePercentage:
      total > 0 ? Math.round((positiveCount / total) * 100) : 0,
    negativePercentage:
      total > 0 ? Math.round((negativeCount / total) * 100) : 0,
    ratingDistribution: Object.entries(ratingDist)
      .reverse()
      .map(([rating, count]) => ({
        rating: Number(rating),
        count,
        percentage: total > 0 ? (count / total) * 100 : 0,
      })),
    highestRatingCount: ratingDist[5],
    lowestRatingCount: ratingDist[1] + ratingDist[2],
  };
}

// =============================================
// MERGE COMPETITOR DATA
// =============================================

const mergeCompetitorData = (competitors: any[], timeRange: number) => {
  if (!competitors || competitors.length === 0) return null;

  // Filter out failed/error entries
  const validCompetitors = competitors.filter(
    (comp) => comp.success && comp.reviews && Array.isArray(comp.reviews),
  );

  if (validCompetitors.length === 0) return null;

  const allReviews = validCompetitors.flatMap((comp) => comp.reviews || []);

  const totalReviewsOnProfile = validCompetitors.reduce(
    (sum, comp) => sum + (comp.total_reviews_on_profile || 0),
    0,
  );
  const totalReviewsFound = validCompetitors.reduce(
    (sum, comp) => sum + (comp.total_reviews_found || 0),
    0,
  );
  const totalReviewsInRange = validCompetitors.reduce(
    (sum, comp) => sum + (comp.reviews_in_range || 0),
    0,
  );

  const avgRating =
    validCompetitors.reduce(
      (sum, comp) => sum + (comp.statistics?.average_rating || 0),
      0,
    ) / validCompetitors.length;

  const avgResponseRate =
    validCompetitors.reduce(
      (sum, comp) => sum + (comp.statistics?.owner_response_rate || 0),
      0,
    ) / validCompetitors.length;

  const totalResponsesWithReview = validCompetitors.reduce(
    (sum, comp) => sum + (comp.statistics?.reviews_with_response || 0),
    0,
  );

  const cutoffDate =
    validCompetitors[0]?.cutoff_date || new Date().toISOString().split("T")[0];
  const monthsScraped = validCompetitors[0]?.months_scraped || timeRange;

  return {
    success: true,
    place_id: "merged_competitors",
    place_name: "All Competitors",
    total_reviews_on_profile: totalReviewsOnProfile,
    cutoff_date: cutoffDate,
    months_scraped: monthsScraped,
    total_reviews_found: totalReviewsFound,
    reviews_in_range: totalReviewsInRange,
    statistics: {
      average_rating: parseFloat(avgRating.toFixed(1)),
      owner_response_rate: Math.round(avgResponseRate),
      reviews_with_response: totalResponsesWithReview,
    },
    reviews: allReviews,
  };
};

// =============================================
// PREPARE AI ANALYTICS DATA
// =============================================

const prepareAIAnalyticsData = (
  yourClientData: any,
  competitors: any[],
  selectedBusiness: any,
  timeRange: string,
) => {
  const calculateNeutralPercentage = (analytics: any) => {
    if (analytics.neutralPercentage !== undefined) {
      return Number(analytics.neutralPercentage);
    }
    const positive = Number(analytics.positivePercentage) || 0;
    const negative = Number(analytics.negativePercentage) || 0;
    return Math.max(0, 100 - positive - negative);
  };

  const yourAnalytics = calculateAnalytics(yourClientData.reviews || []);

  const allCompetitorsAnalytics = competitors.map((competitor) => {
    const analytics = calculateAnalytics(competitor.reviews || []);
    return {
      place_name: competitor.place_name,
      place_id: competitor.place_id,
      analytics: {
        avgRating: Number(analytics.avgRating) || 0,
        totalReviews: Number(analytics.totalReviews) || 0,
        responseRate: Number(analytics.responseRate) || 0,
        positivePercentage: Number(analytics.positivePercentage) || 0,
        neutralPercentage: calculateNeutralPercentage(analytics),
        negativePercentage: Number(analytics.negativePercentage) || 0,
      },
    };
  });

  const selectedAnalytics = calculateAnalytics(selectedBusiness.reviews || []);

  const totalCompetitors = competitors.length;
  const avgMarketRating =
    totalCompetitors > 0
      ? allCompetitorsAnalytics.reduce(
          (sum, c) => sum + c.analytics.avgRating,
          0,
        ) / totalCompetitors
      : 0;
  const avgMarketReviews =
    totalCompetitors > 0
      ? Math.round(
          allCompetitorsAnalytics.reduce(
            (sum, c) => sum + c.analytics.totalReviews,
            0,
          ) / totalCompetitors,
        )
      : 0;
  const avgMarketResponseRate =
    totalCompetitors > 0
      ? Math.round(
          allCompetitorsAnalytics.reduce(
            (sum, c) => sum + c.analytics.responseRate,
            0,
          ) / totalCompetitors,
        )
      : 0;

  const yourRating = Number(yourAnalytics.avgRating);
  const yourReviews = Number(yourAnalytics.totalReviews);
  const yourResponseRate = Number(yourAnalytics.responseRate);

  const data = {
    yourClient: {
      place_name: yourClientData.place_name || yourClientData.name || "Unknown",
      place_id: yourClientData.place_id,
      category: yourClientData.category || null,
    },
    yourAnalytics: {
      avgRating: yourRating,
      totalReviews: yourReviews,
      responseRate: yourResponseRate,
      positivePercentage: Number(yourAnalytics.positivePercentage) || 0,
      neutralPercentage: calculateNeutralPercentage(yourAnalytics),
      negativePercentage: Number(yourAnalytics.negativePercentage) || 0,
    },
    primaryCompetitor: {
      place_name:
        selectedBusiness.place_name || selectedBusiness.name || "Unknown",
      place_id: selectedBusiness.place_id,
      category: selectedBusiness.category || null,
      analytics: {
        avgRating: Number(selectedAnalytics.avgRating) || 0,
        totalReviews: Number(selectedAnalytics.totalReviews) || 0,
        responseRate: Number(selectedAnalytics.responseRate) || 0,
        positivePercentage: Number(selectedAnalytics.positivePercentage) || 0,
        neutralPercentage: calculateNeutralPercentage(selectedAnalytics),
        negativePercentage: Number(selectedAnalytics.negativePercentage) || 0,
      },
    },
    allCompetitors: allCompetitorsAnalytics,
    marketInsights: {
      totalCompetitors: totalCompetitors,
      averageMarketRating: avgMarketRating.toFixed(2),
      averageMarketReviews: avgMarketReviews,
      averageMarketResponseRate: avgMarketResponseRate,
      yourRankByReviews:
        allCompetitorsAnalytics.filter(
          (c) => c.analytics.totalReviews > yourReviews,
        ).length + 1,
      yourRankByRating:
        allCompetitorsAnalytics.filter(
          (c) => c.analytics.avgRating > yourRating,
        ).length + 1,
      yourRankByResponseRate:
        allCompetitorsAnalytics.filter(
          (c) => c.analytics.responseRate > yourResponseRate,
        ).length + 1,
    },
    timeRange: timeRange || "Not specified",
  };

  console.log("📊 Prepared AI Analytics Data:", data);
  return data;
};

// =============================================
// MAIN DASHBOARD COMPONENT
// =============================================

function CompetitorDashboard() {
  const [timeRange, setTimeRange] = useState<number>(3);
  const [aiRecommendations, setAiRecommendations] =
    useState<AIRecommendations | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);
  const [competitorss, setCompetitorss] = useState<BusinessData[]>([]);
  const [clientReviews, setClientReviews] = useState<Review[]>([]);
  const [competitorsData, setCompetitorsData] =
    useState<CompetitorsReviewDataResponse | null>();
  const [showMenu, setShowMenu] = useState(false);

  const { activeLocation } = useSelector(
    (state: RootState) => state.activeLocation,
  );
  const activeLocationId = localStorage.getItem("activeLocation");

  const yourClientData: BusinessData = useMemo(() => {
    return {
      place_name: activeLocation?.title || "Your Business",
      place_id: activeLocation?.placeId || "",
      category: activeLocation?.category?.primaryCategory?.displayName || null,
      reviews: clientReviews,
    };
  }, [activeLocation, clientReviews]);

  const [selectedBusiness, setSelectedBusiness] =
    useState<BusinessData>(yourClientData);

  // Date range data states
  const [dateRangeData, setDateRangeData] =
    useState<DateRangeReviewData | null>(null);
  const [selfDateRangeData, setSelfDateRangeData] =
    useState<DateRangeReviewData | null>(null);
  const [allCompetDateRangeData, setAllCompetDateRangeData] = useState<
    DateRangeReviewData[]
  >([]);

  // Loading states
  const [selfDateRangeLoading, setSelfDateRangeLoading] =
    useState<boolean>(false);
  const [allCompetDateRangeLoading, setAllCompetDateRangeLoading] =
    useState<boolean>(false);
  const [dateRangeLoading, setDateRangeLoading] = useState<boolean>(false);
  const [isHardRefreshing, setIsHardRefreshing] = useState(false);

  const dateRangeDataLoading =
    selfDateRangeLoading || allCompetDateRangeLoading || dateRangeLoading;

  // Add Competitor Dialog State
  const [showAddCompetitorDialog, setShowAddCompetitorDialog] = useState(false);
  const [newPlaceId, setNewPlaceId] = useState("");
  const [isAddingCompetitor, setIsAddingCompetitor] = useState(false);
  const [addCompetitorError, setAddCompetitorError] = useState("");

  // =============================================
  // API FUNCTIONS
  // =============================================

  async function fetchSelfDateRangeReviewsData() {
    try {
      setSelfDateRangeLoading(true);
      const res = await axios.post(
        `${SERVER}/api/v1/scraper/date-range-reviews`,
        { months: timeRange, place_id: yourClientData?.place_id },
        { withCredentials: true, timeout: 2 * 60 * 1000 },
      );

      console.log("Self DateRange Reviews Data:", res.data);
      const dta = res.data;

      if (dta) {
        setSelfDateRangeData(dta);
        if (selectedBusiness?.place_id === activeLocation?.placeId) {
          setDateRangeData(dta);
        }
      }
    } catch (error) {
      console.error("Error fetching self date range reviews:", error);
      if (axios.isAxiosError(error)) {
        if (error.code === "ECONNABORTED") {
          alert("Request timeout. Please try with a shorter time range.");
        }
      }
    } finally {
      setSelfDateRangeLoading(false);
    }
  }

  async function fetchAllCompetDateRangeData() {
    try {
      setAllCompetDateRangeLoading(true);

      const timeRangeDays = timeRange * 30;

      const res = await axios.post(
        `${SERVER}/api/v1/scraper/all-comp/date-range-reviews`,
        {
          time_range: timeRangeDays,
          use_cache: true,
          cache_ttl_hours: 24,
          // competitor_ids: competitorss.map(c => c.place_id).filter(Boolean)
        },
        { withCredentials: true, timeout: 5 * 60 * 1000 },
      );

      const dta = res.data;
      console.log("All Competitors Data:", dta);

      setCompetitorsData(res.data);

      if (dta?.success && dta?.data) {
        const processedData = dta.data.map((comp: any) => ({
          success: comp.success || false,
          place_id: comp.place_id || comp._metadata?.place_id,
          place_name: comp.place_name || comp._metadata?.competitor_title,
          total_reviews_on_profile: comp.total_reviews_on_profile || 0,
          cutoff_date: comp.cutoff_date,
          months_scraped: comp.months_scraped,
          total_reviews_found: comp.total_reviews_found || 0,
          reviews_in_range: comp.reviews_in_range || 0,
          statistics: comp.statistics || {
            average_rating: 0,
            owner_response_rate: 0,
            reviews_with_response: 0,
          },
          reviews: comp.reviews || [],
        }));

        setAllCompetDateRangeData(processedData);
      }
    } catch (error) {
      console.error("Error fetching all competitors data:", error);
      if (axios.isAxiosError(error)) {
        if (error.code === "ECONNABORTED") {
          alert("Request timeout. Please try with a shorter time range.");
        }
      }
    } finally {
      setAllCompetDateRangeLoading(false);
    }
  }

  async function handleHardRefresh() {
    setIsHardRefreshing(true);

    try {
      // 1. Fetch Self Data with force refresh
      const selfRes = await axios.post(
        `${SERVER}/api/v1/scraper/date-range-reviews`,
        {
          months: timeRange,
          place_id: yourClientData?.place_id,
          use_cache: false, // ← Force fresh data
        },
        { withCredentials: true, timeout: 3 * 60 * 1000 },
      );

      if (selfRes.data) {
        setSelfDateRangeData(selfRes.data);
        if (selectedBusiness?.place_id === activeLocation?.placeId) {
          setDateRangeData(selfRes.data);
        }
      }

      // 2. Fetch All Competitors with force refresh
      const timeRangeDays = timeRange * 30;
      const allCompRes = await axios.post(
        `${SERVER}/api/v1/scraper/all-comp/date-range-reviews`,
        {
          time_range: timeRangeDays,
          use_cache: false, // ← Force fresh data
          force_refresh: true, // ← Backend flag
        },
        { withCredentials: true, timeout: 10 * 60 * 1000 }, // 10 min timeout
      );

      if (allCompRes.data?.success && allCompRes.data?.data) {
        const processedData = allCompRes.data.data.map((comp: any) => ({
          success: comp.success || false,
          place_id: comp.place_id || comp._metadata?.place_id,
          place_name: comp.place_name || comp._metadata?.competitor_title,
          total_reviews_on_profile: comp.total_reviews_on_profile || 0,
          cutoff_date: comp.cutoff_date,
          months_scraped: comp.months_scraped,
          total_reviews_found: comp.total_reviews_found || 0,
          reviews_in_range: comp.reviews_in_range || 0,
          statistics: comp.statistics || {
            average_rating: 0,
            owner_response_rate: 0,
            reviews_with_response: 0,
          },
          reviews: comp.reviews || [],
        }));

        setAllCompetDateRangeData(processedData);
      }

      // 3. Refresh selected business if different
      if (selectedBusiness?.place_id !== activeLocation?.placeId) {
        const selectedRes = await axios.post(
          `${SERVER}/api/v1/scraper/date-range-reviews`,
          {
            months: timeRange,
            place_id: selectedBusiness?.place_id,
            use_cache: false,
          },
          { withCredentials: true, timeout: 3 * 60 * 1000 },
        );

        if (selectedRes.data) {
          setDateRangeData(selectedRes.data);
        }
      }

      alert("✅ Data refreshed successfully!");
    } catch (error) {
      console.error("Hard refresh error:", error);
      alert("⚠️ Failed to refresh data. Please try again.");
    } finally {
      setIsHardRefreshing(false);
    }
  }

  async function fetchDateRangeReviewsData() {
    if (selectedBusiness?.place_id === activeLocation?.placeId) {
      return null;
    }

    try {
      setDateRangeLoading(true);
      const res = await axios.post(
        `${SERVER}/api/v1/scraper/date-range-reviews`,
        { months: timeRange, place_id: selectedBusiness?.place_id },
        { withCredentials: true, timeout: 2 * 60 * 1000 },
      );

      console.log("Selected Business DateRange Reviews:", res.data);
      const dta = res.data;

      if (dta) {
        setDateRangeData(dta);
      }
    } catch (error) {
      console.error("Error fetching date range reviews:", error);
    } finally {
      setDateRangeLoading(false);
    }
  }

  async function fetchClientReviews() {
    try {
      console.log("Fetching client reviews for:", activeLocation);

      if (!activeLocation?.placeId) {
        console.warn("No placeId available");
        return;
      }

      const res = await axios.get(
        `${SERVER}/api/v1/location/${activeLocationId}/reviews`,
        {
          withCredentials: true,
          params: { place_id: activeLocation.placeId },
        },
      );

      console.log("Client reviews response:", res.data);

      if (res.data?.reviews && Array.isArray(res.data.reviews)) {
        const formattedReviews = res.data.reviews.map((r: any) => ({
          author: r.author_name || "Anonymous",
          rating: r.rating || 0,
          date: r.relative_time_description || "Unknown",
          review_text: r.text || "",
          response_by_owner: r.ownerReply ? "yes" : "no",
        }));

        setClientReviews(formattedReviews);

        if (selectedBusiness?.place_id === activeLocation.placeId) {
          setSelectedBusiness({
            place_name: activeLocation.title,
            place_id: activeLocation.placeId,
            category:
              activeLocation.category?.primaryCategory?.displayName || null,
            reviews: formattedReviews,
          });
        }

        console.log("✅ Formatted client reviews:", formattedReviews);
      }
    } catch (error) {
      console.error("Failed to fetch client reviews:", error);
    }
  }

  const fetchServerCompetitors = async () => {
    try {
      const res = await axios.get(`${SERVER}/api/v1/competitors`, {
        withCredentials: true,
        params: {
          fetch_missing_reviews: true,
          wait_for_reviews: false,
        },
      });

      console.log("Competitors response:", res.data);

      if (res.data?.data && Array.isArray(res.data.data)) {
        const formattedCompetitors = res.data.data.map((c: any) => {
          let reviews = [];
          if (c.reviews) {
            try {
              reviews =
                typeof c.reviews === "string"
                  ? JSON.parse(c.reviews)
                  : c.reviews;
            } catch (e) {
              console.error(`Failed to parse reviews for ${c.title}:`, e);
              reviews = [];
            }
          }

          return {
            place_name: c.title || "Unknown",
            place_id: c.placeId || "",
            category: c.category?.primaryCategory?.displayName || null,
            reviews: Array.isArray(reviews) ? reviews : [],
          };
        });

        setCompetitorss(formattedCompetitors);
        console.log("✅ Fetched competitors:", formattedCompetitors);
      }
    } catch (error) {
      console.error("Failed to fetch competitors:", error);
    }
  };

  const handleAddNewCompetitor = async () => {
    if (!newPlaceId.trim()) {
      setAddCompetitorError("Please enter a valid Place ID");
      return;
    }

    setIsAddingCompetitor(true);
    setAddCompetitorError("");

    try {
      const res = await axios.post(
        `${SERVER}/api/v1/competitors`,
        { placeId: newPlaceId.trim() },
        {
          withCredentials: true,
          timeout: 2 * 60 * 1000,
        },
      );

      if (res.data?.success) {
        console.log("✅ Successfully added competitor:", res.data.data);

        const newCompetitor = res.data.data;
        let reviews = [];

        try {
          reviews =
            typeof newCompetitor.reviews === "string"
              ? JSON.parse(newCompetitor.reviews)
              : newCompetitor.reviews || [];
        } catch (e) {
          console.error("Failed to parse new competitor reviews:", e);
        }

        const formattedCompetitor = {
          place_name: newCompetitor.title || "New Competitor",
          place_id: newCompetitor.placeId,
          category:
            newCompetitor.category?.primaryCategory?.displayName || null,
          reviews: reviews,
        };

        setCompetitorss((prev) => [...prev, formattedCompetitor]);
        setShowAddCompetitorDialog(false);
        setNewPlaceId("");
        alert(`✅ ${formattedCompetitor.place_name} added successfully!`);
        setSelectedBusiness(formattedCompetitor);
      }
    } catch (error: any) {
      console.error("Failed to add competitor:", error);

      let errorMessage = "Failed to add competitor. ";

      if (axios.isAxiosError(error)) {
        if (error.code === "ECONNABORTED") {
          errorMessage += "Request timeout.";
        } else if (error.response?.status === 400) {
          errorMessage += error.response.data?.detail || "Invalid Place ID.";
        } else if (error.response?.status === 503) {
          errorMessage += "Service unavailable.";
        } else {
          errorMessage += error.response?.data?.detail || error.message;
        }
      }

      setAddCompetitorError(errorMessage);
    } finally {
      setIsAddingCompetitor(false);
    }
  };

  // =============================================
  // USE EFFECTS
  // =============================================

  console.log("Yha dekhte hai", { selfDateRangeData, competitorsData });

  useEffect(() => {
    if (clientReviews.length === 0 && activeLocationId) {
      fetchClientReviews();
    }
  }, [clientReviews, activeLocationId]);

  useEffect(() => {
    fetchServerCompetitors();
  }, []);

  useEffect(() => {
    if (selectedBusiness?.place_id === activeLocation?.placeId) {
      // If your business is selected, use selfDateRangeData
      if (selfDateRangeData) {
        setDateRangeData(selfDateRangeData);
      }
    } else if (selectedBusiness?.place_id) {
      // If competitor is selected, fetch their data
      fetchDateRangeReviewsData();
    }
  }, [timeRange, selectedBusiness, selfDateRangeData]);

  useEffect(() => {
    if (yourClientData?.place_id) {
      fetchSelfDateRangeReviewsData();
    }
    if (competitorss.length > 0) {
      fetchAllCompetDateRangeData();
    }
  }, [timeRange, competitorss.length]);

  // =============================================
  // COMPUTED VALUES
  // =============================================

  const allBusinesses = useMemo(() => {
    return [
      {
        place_name: activeLocation?.title || yourClientData.place_name,
        place_id: activeLocation?.placeId || yourClientData.place_id,
        category:
          activeLocation?.category?.primaryCategory?.displayName || null,
        reviews: clientReviews,
      },
      ...competitorss,
    ];
  }, [activeLocation, yourClientData, clientReviews, competitorss]);

  const yourAnalytics = useMemo(
    () => calculateAnalytics(yourClientData.reviews || []),
    [yourClientData],
  );
  const selectedAnalytics = useMemo(
    () => calculateAnalytics(selectedBusiness?.reviews || []),
    [selectedBusiness],
  );
  const allCompetitorsAnalytics = useMemo(() => {
    const allReviews = competitorss.flatMap((c) => c.reviews || []);
    return calculateAnalytics(allReviews || []);
  }, [competitorss]);

  const latestReviews = selectedBusiness?.reviews?.slice(0, 5) || [];

  // =============================================
  // HELPER FUNCTIONS
  // =============================================

  const getComparisonIcon = (
    yourVal: number,
    compVal: number,
    inverse = false,
  ) => {
    if (Math.abs(yourVal - compVal) < 0.1)
      return <Minus className="w-4 h-4 text-gray-400" />;
    const isWinning = inverse ? yourVal < compVal : yourVal > compVal;
    return isWinning ? (
      <ArrowUpRight className="w-4 h-4 text-green-600" />
    ) : (
      <ArrowDownRight className="w-4 h-4 text-red-600" />
    );
  };

  function getReviewVelocity(reviews: any) {
    if (!reviews || !reviews.months_scraped || !reviews.reviews_in_range) {
      return 0;
    }
    const velocity = reviews.reviews_in_range / reviews.months_scraped;
    return velocity.toFixed(2);
  }

  // =============================================
  // AI RECOMMENDATIONS
  // =============================================

  const generateAIRecommendations = async () => {
    setIsLoadingAI(true);
    setShowAIPanel(true);

    try {
      const analyticsData = prepareAIAnalyticsData(
        yourClientData,
        competitorss,
        selectedBusiness,
        String(timeRange),
      );

      const apiUrl = `${SERVER}/api/v1/ai-recommendations`;
      console.log("🔍 Calling AI API:", apiUrl);

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(analyticsData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ AI API Error:", errorText);
        throw new Error(`HTTP ${response.status}`);
      }

      const aiResponse: AIRecommendations = await response.json();
      console.log("✅ AI Response:", aiResponse);
      setAiRecommendations(aiResponse);
    } catch (error) {
      console.error("💥 Error generating AI recommendations:", error);
      alert("Failed to generate AI recommendations. Please try again.");
    } finally {
      setIsLoadingAI(false);
    }
  };

  // =============================================
  // HTML REPORT
  // =============================================

  const generateReportContent = (
    selectedBusiness: BusinessData,
    yourClientData: BusinessData,
    timeRange: number,
    selectedAnalytics: any,
    allBusinesses: BusinessData[],
    latestReviews: Review[],
    aiRecommendations: AIRecommendations | null,
  ) => {
    const reportData = {
      reportDate: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      selectedBusiness: {
        name: selectedBusiness.place_name,
        isYourBusiness: selectedBusiness.place_id === yourClientData.place_id,
      },
      timeRange: timeRange,
      metrics: {
        totalReviews: selectedAnalytics.totalReviews,
        averageRating: selectedAnalytics.avgRating,
        responseRate: selectedAnalytics.responseRate,
        positivePercentage: selectedAnalytics.positivePercentage,
        negativePercentage: selectedAnalytics.negativePercentage,
      },
      ratingDistribution: selectedAnalytics.ratingDistribution,
      comparisonData: allBusinesses.map((business) => {
        const analytics = calculateAnalytics(business.reviews || []);
        return {
          name: business.place_name,
          isYourBusiness: business.place_id === yourClientData.place_id,
          totalReviews: analytics.totalReviews,
          avgRating: analytics.avgRating,
          responseRate: analytics.responseRate,
          positivePercentage: analytics.positivePercentage,
          negativePercentage: analytics.negativePercentage,
          highestRatingCount: analytics.highestRatingCount,
          lowestRatingCount: analytics.lowestRatingCount,
        };
      }),
      latestReviews: latestReviews.map((review) => ({
        author: review.author || "Anonymous",
        rating: review.rating,
        date: review.date,
        reviewText: review.review_text || "No review text",
        responded: review.response_by_owner === "yes",
      })),
      aiInsights: aiRecommendations
        ? {
            summary: aiRecommendations.summary,
            strengths: aiRecommendations.strengths,
            weaknesses: aiRecommendations.weaknesses,
            recommendations: aiRecommendations.recommendations,
            actionPlan: aiRecommendations.actionPlan,
          }
        : null,
    };

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Competitor Analysis Report</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; line-height: 1.6; width: 794px; height: 1123px; box-sizing: border-box; }
        .header { text-align: center; margin-bottom: 40px; border-bottom: 3px solid #2563eb; padding-bottom: 20px; }
        .metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 30px 0; }
        .metric-card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; background: #f9fafb; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #e5e7eb; padding: 12px; text-align: left; }
        th { background: #f3f4f6; font-weight: 600; }
        .ai-insights { background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Competitor Analysis Report</h1>
        <p>${reportData.reportDate} | ${reportData.selectedBusiness.name}</p>
      </div>
      
      <div class="metrics">
        <div class="metric-card">
          <div>Total Reviews</div>
          <h2>${reportData.metrics.totalReviews}</h2>
        </div>
        <div class="metric-card">
          <div>Average Rating</div>
          <h2>${reportData.metrics.averageRating} ⭐</h2>
        </div>
        <div class="metric-card">
          <div>Response Rate</div>
          <h2>${reportData.metrics.responseRate}%</h2>
        </div>
        <div class="metric-card">
          <div>Positive Reviews</div>
          <h2>${reportData.metrics.positivePercentage}%</h2>
        </div>
      </div>

      <h2>Competitive Comparison</h2>
      <table>
        <thead>
          <tr>
            <th>Business</th>
            <th>Reviews</th>
            <th>Rating</th>
            <th>Response Rate</th>
            <th>Positive %</th>
          </tr>
        </thead>
        <tbody>
          ${reportData.comparisonData
            .map(
              (b) => `
            <tr style="${b.isYourBusiness ? "background: #dbeafe;" : ""}">
              <td><strong>${b.name}</strong></td>
              <td>${b.totalReviews}</td>
              <td>${b.avgRating} ⭐</td>
              <td>${b.responseRate}%</td>
              <td>${b.positivePercentage}%</td>
            </tr>
          `,
            )
            .join("")}
        </tbody>
      </table>

      ${
        reportData.aiInsights
          ? `
        <h2>AI Recommendations</h2>
        <div class="ai-insights">
          <h3>Summary</h3>
          <p>${reportData.aiInsights.summary}</p>
          
          <h3>Strengths</h3>
          <ul>
            ${reportData.aiInsights.strengths.map((s) => `<li>${s}</li>`).join("")}
          </ul>
          
          <h3>Recommendations</h3>
          <ul>
            ${reportData.aiInsights.recommendations.map((r) => `<li>${r}</li>`).join("")}
          </ul>
        </div>
      `
          : ""
      }
    </body>
    </html>
  `;

    return { reportData, htmlContent };
  };

  const openHTMLReport = () => {
    setIsDownloadingPDF(true);

    try {
      const { htmlContent } = generateReportContent(
        selectedBusiness,
        yourClientData,
        timeRange,
        selectedAnalytics,
        allBusinesses,
        latestReviews,
        aiRecommendations,
      );

      const reportWindow = window.open("", "_blank");
      if (reportWindow) {
        reportWindow.document.write(htmlContent);
        reportWindow.document.close();
      } else {
        alert("⚠️ Please allow pop-ups to view the report");
      }
    } catch (error) {
      console.error("Error generating report:", error);
      alert("⚠️ Error generating report. Please try again.");
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  const downloadReport = async () => {
    setIsDownloadingPDF(true);
    try {
      const { htmlContent, reportData } = generateReportContent(
        selectedBusiness,
        yourClientData,
        timeRange,
        selectedAnalytics,
        allBusinesses,
        latestReviews,
        aiRecommendations,
      );

      // Create a temporary container for HTML content
      const container = document.createElement("div");
      container.style.position = "absolute";
      container.style.left = "-9999px";
      container.style.width = "794px"; // A4 width in pixels at 96 DPI
      container.style.height = "auto";
      container.innerHTML = htmlContent;
      document.body.appendChild(container);

      // Use html2canvas to render the HTML to a canvas
      const canvas = await html2canvas(container, {
        scale: 2, // Increase resolution for better quality
        width: 794, // A4 width in pixels
        windowWidth: 794,
      });

      // Create PDF with jsPDF
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgData = canvas.toDataURL("image/png");
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      // Add first page
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if content overflows
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Save the PDF
      pdf.save(
        `Competitor_Analysis_Report_${reportData.selectedBusiness.name}.pdf`,
      );

      // Clean up
      document.body.removeChild(container);
      console.log("✅ PDF Download complete!");
    } catch (err) {
      console.error("Error generating PDF:", err);
      alert("⚠️ Error generating PDF report. Please try again.");
    } finally {
      setIsDownloadingPDF(false);
    }
  };
  // =============================================
  // RENDER
  // =============================================

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-1">
              COMPETITOR ANALYSIS
            </p>
            <h1 className="text-4xl font-bold text-gray-900">
              {selectedBusiness?.place_name}
            </h1>
            {selectedBusiness?.place_id === yourClientData?.place_id && (
              <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                Your Business
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={selectedBusiness?.place_id}
                onChange={(e) => {
                  const selected = allBusinesses.find(
                    (b) => b.place_id === e.target.value,
                  );
                  if (selected) setSelectedBusiness(selected);
                }}
                className="appearance-none px-6 py-3 pr-10 bg-blue-600 text-white rounded-lg font-medium cursor-pointer hover:bg-blue-700 transition-colors"
              >
                <option value={yourClientData?.place_id}>
                  {yourClientData?.place_name} (Your Business)
                </option>
                <option disabled>───────────────</option>
                {competitorss.map((comp) => (
                  <option key={comp.place_id} value={comp.place_id}>
                    {comp.place_name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white pointer-events-none" />
            </div>

            {/* 🔥 NEW: Hard Refresh Button */}
            <button
              onClick={handleHardRefresh}
              disabled={isHardRefreshing || dateRangeDataLoading}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Force refresh all data (bypasses cache)"
            >
              {isHardRefreshing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Refreshing...
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Hard Refresh
                </>
              )}
            </button>

            <div className="flex items-center gap-4 relative">
              {/* Add Competitor Button */}
              <button
                onClick={() => console.log("Open Add Competitor Dialog")}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Add Competitor
              </button>

              {/* 3-dot menu button */}
              <div className="relative">
                <button
                  onClick={() => setShowMenu((prev) => !prev)}
                  className="p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <MoreVertical className="w-5 h-5 text-gray-700" />
                </button>

                {/* Dropdown menu */}
                {showMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        openHTMLReport();
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View Report
                    </button>
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        downloadReport();
                      }}
                      disabled={isDownloadingPDF}
                      className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isDownloadingPDF ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          Download Report
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Time Range */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">Time range:</span>
          <select
            value={String(timeRange)}
            onChange={(e) => setTimeRange(Number(e.target.value))}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-black hover:border-blue-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none cursor-pointer"
          >
            <option value={1}>Last 30 Days</option>
            <option value={2}>Last 60 Days</option>
            <option value={3}>Last 90 Days</option>
          </select>
        </div>

        {dateRangeDataLoading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            <div className="text-center">
              <p className="text-lg font-medium text-gray-700">
                Loading review data...
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {selfDateRangeLoading && "Fetching your reviews..."}
                {allCompetDateRangeLoading && " Fetching competitors data..."}
                {dateRangeLoading && " Loading comparison data..."}
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-500 font-medium">
                    Total Reviews
                  </span>
                  <MessageSquare className="w-5 h-5 text-blue-500" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {dateRangeData?.total_reviews_on_profile || 0}
                </div>
                <p className="text-xs text-gray-500">On profile</p>
              </div>

              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-500 font-medium">
                    Average Rating
                  </span>
                  <Star className="w-5 h-5 text-blue-500" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {dateRangeData?.statistics?.average_rating || 0}
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i <
                        Math.round(
                          dateRangeData?.statistics?.average_rating || 0,
                        )
                          ? "text-blue-500 fill-blue-500"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-500 font-medium">
                    Response Rate
                  </span>
                  <Reply className="w-5 h-5 text-blue-500" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {dateRangeData?.statistics?.owner_response_rate || 0}%
                </div>
                <p className="text-xs text-gray-500">
                  {dateRangeData?.statistics?.reviews_with_response || 0}{" "}
                  responses
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-500 font-medium">
                    Review Velocity
                  </span>
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {getReviewVelocity(dateRangeData)}
                </div>
                <p className="text-xs text-gray-500">Reviews per month</p>
              </div>
            </div>

            {/* Charts */}
            {dateRangeData &&
            selfDateRangeData &&
            allCompetDateRangeData.length > 0 ? (
              <DynamicReviewChart
                dateRangeData={dateRangeData}
                allCompetitorsData={mergeCompetitorData(
                  allCompetDateRangeData,
                  timeRange,
                )}
                competitorData={
                  dateRangeData?.place_id === selfDateRangeData?.place_id
                    ? null
                    : selfDateRangeData
                }
              />
            ) : (
              <div className="bg-white rounded-lg p-8 border border-gray-200 text-center">
                <p className="text-gray-500">
                  No chart data available. Please select a different time range
                  or add competitors.
                </p>
              </div>
            )}
          </>
        )}

        {/* Comparison Dashboard */}
        {/* <CompetitorComparisonDashboard competitorsData={competitorsData} yourBusiness={selfDateRangeData} /> */}

        {competitorsData && selfDateRangeData && (
          <CompetitorComparisonDashboard
            competitorsData={competitorsData}
            yourBusiness={selfDateRangeData}
          />
        )}

        {/* AI Insights Button */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                <Sparkles className="w-6 h-6" />
                AI-Powered Insights & Recommendations
              </h2>
              <p className="text-white/90">
                Get personalized recommendations based on your competitive
                analysis
              </p>
            </div>
            <button
              onClick={generateAIRecommendations}
              disabled={isLoadingAI}
              className="px-8 py-4 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoadingAI ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate AI Insights
                </>
              )}
            </button>
          </div>
        </div>

        {/* AI Recommendations Panel */}
        {showAIPanel && (
          <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-lg">
            {isLoadingAI ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                <p className="text-lg font-medium text-gray-700">
                  Analyzing your data...
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  This may take a few seconds
                </p>
              </div>
            ) : aiRecommendations ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-purple-600" />
                    AI-Generated Insights
                  </h2>
                  <button
                    onClick={() => setShowAIPanel(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                {/* Executive Summary */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-3">
                    📊 Executive Summary
                  </h3>
                  <p className="text-blue-800 leading-relaxed">
                    {aiRecommendations.summary}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Strengths */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-green-900 mb-4">
                      💪 Top Strengths
                    </h3>
                    <ul className="space-y-3">
                      {aiRecommendations.strengths.map((strength, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-green-800"
                        >
                          <span className="text-green-600 font-bold">•</span>
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Weaknesses */}
                  <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-red-900 mb-4">
                      ⚠️ Areas for Improvement
                    </h3>
                    <ul className="space-y-3">
                      {aiRecommendations.weaknesses.map((weakness, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-red-800"
                        >
                          <span className="text-red-600 font-bold">•</span>
                          <span>{weakness}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-purple-900 mb-4">
                    🎯 Strategic Recommendations
                  </h3>
                  <ul className="space-y-3">
                    {aiRecommendations.recommendations.map((rec, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-3 text-purple-800"
                      >
                        <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                          {idx + 1}
                        </span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Plan */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-yellow-900 mb-4">
                    📅 30-60-90 Day Action Plan
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="font-semibold text-yellow-800 mb-3">
                        First 30 Days
                      </h4>
                      <ul className="space-y-2">
                        {aiRecommendations.actionPlan.days30.map(
                          (action, idx) => (
                            <li
                              key={idx}
                              className="text-sm text-yellow-700 flex items-start gap-2"
                            >
                              <span>✓</span>
                              <span>{action}</span>
                            </li>
                          ),
                        )}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-yellow-800 mb-3">
                        Days 31-60
                      </h4>
                      <ul className="space-y-2">
                        {aiRecommendations.actionPlan.days60.map(
                          (action, idx) => (
                            <li
                              key={idx}
                              className="text-sm text-yellow-700 flex items-start gap-2"
                            >
                              <span>✓</span>
                              <span>{action}</span>
                            </li>
                          ),
                        )}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-yellow-800 mb-3">
                        Days 61-90
                      </h4>
                      <ul className="space-y-2">
                        {aiRecommendations.actionPlan.days90.map(
                          (action, idx) => (
                            <li
                              key={idx}
                              className="text-sm text-yellow-700 flex items-start gap-2"
                            >
                              <span>✓</span>
                              <span>{action}</span>
                            </li>
                          ),
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* Latest Reviews */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Latest reviews - {selectedBusiness?.place_name}
            </h2>
          </div>
          {latestReviews.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {latestReviews.map((review, idx) => (
                  <div
                    key={idx}
                    className="border border-gray-200 rounded-lg p-5 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">
                          {review.author || "Anonymous"}
                        </p>
                        <p className="text-xs text-gray-500">{review.date}</p>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed mb-3 line-clamp-3">
                      {review.review_text || "No review text provided"}
                    </p>
                    {review.response_by_owner === "yes" && (
                      <p className="text-xs font-medium text-green-600">
                        Owner responded
                      </p>
                    )}
                  </div>
                ))}
              </div>
              <div className="text-center">
                <a
                  href={`https://www.google.com/maps/place/?q=place_id:${selectedBusiness?.place_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
                >
                  View All on Google Business
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">
                No reviews available for this business.
              </p>
            </div>
          )}
        </div>

        {/* All Competitors Summary */}
        {competitorss.length > 0 && (
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              All Competitors Overview
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {competitorss.map((comp) => {
                const analytics = calculateAnalytics(comp.reviews || []);
                return (
                  <div
                    key={comp.place_id}
                    className={`border-2 rounded-lg p-5 cursor-pointer transition-all ${
                      selectedBusiness?.place_id === comp.place_id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-blue-300"
                    }`}
                    onClick={() => setSelectedBusiness(comp)}
                  >
                    <h3
                      className="font-semibold text-gray-900 mb-3 truncate"
                      title={comp.place_name}
                    >
                      {comp.place_name}
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Total Reviews:</span>
                        <span className="font-semibold text-gray-900">
                          {analytics.totalReviews}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Avg Rating:</span>
                        <div className="flex items-center gap-1">
                          <span className="font-semibold text-gray-900">
                            {analytics.avgRating}
                          </span>
                          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Response Rate:</span>
                        <span className="font-semibold text-gray-900">
                          {analytics.responseRate}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-200 rounded-full mt-3">
                        <div
                          className="h-full bg-blue-500 rounded-full transition-all"
                          style={{ width: `${analytics.responseRate}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Add Competitor Dialog */}
      {showAddCompetitorDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-fadeIn">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                Add New Competitor
              </h3>
              <button
                onClick={() => {
                  setShowAddCompetitorDialog(false);
                  setNewPlaceId("");
                  setAddCompetitorError("");
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-4">
                Enter the Google Business Place ID to fetch competitor data and
                add it to your analysis.
              </p>

              <label className="block text-sm font-medium text-gray-700 mb-2">
                Place ID <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                value={newPlaceId}
                onChange={(e) => {
                  setNewPlaceId(e.target.value);
                  setAddCompetitorError("");
                }}
                placeholder="e.g., ChIJN1t_tDeuEmsRUsoyG83frY4"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                disabled={isAddingCompetitor}
              />

              {addCompetitorError && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <svg
                    className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="text-sm text-red-700">{addCompetitorError}</p>
                </div>
              )}

              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="text-sm font-semibold text-blue-900 mb-2">
                  💡 How to find Place ID:
                </h4>
                <ol className="text-xs text-blue-800 space-y-1 ml-4 list-decimal">
                  <li>Go to Google Maps</li>
                  <li>Search for the business</li>
                  <li>Click on the business</li>
                  <li>
                    Copy the Place ID from the URL (or use Place ID Finder tool)
                  </li>
                </ol>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setShowAddCompetitorDialog(false);
                  setNewPlaceId("");
                  setAddCompetitorError("");
                }}
                disabled={isAddingCompetitor}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleAddNewCompetitor}
                disabled={isAddingCompetitor || !newPlaceId.trim()}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isAddingCompetitor ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    Add Competitor
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CompetitorDashboard;
