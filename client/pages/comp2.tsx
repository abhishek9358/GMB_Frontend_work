import { useState, useMemo, useEffect } from 'react';
import { Star, TrendingUp, MessageSquare, Reply, ExternalLink, ArrowUpRight, ArrowDownRight, Minus, ChevronDown, Loader2, Sparkles, Plus, X, AlertCircle } from 'lucide-react';
import { RootState } from '@/redux/store';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { SERVER } from '@/constants';

// =============================================
// TYPE DEFINITIONS
// =============================================

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
  const avgRating = total > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / total : 0;
  const responseRate = total > 0 ? (reviews.filter(r => r.response_by_owner === 'yes').length / total) * 100 : 0;

  const ratingDist: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach(r => ratingDist[r.rating]++);

  const positiveCount = reviews.filter(r => r.rating >= 4).length;
  const negativeCount = reviews.filter(r => r.rating <= 2).length;

  return {
    totalReviews: total,
    avgRating: avgRating.toFixed(1),
    responseRate: Math.round(responseRate),
    positivePercentage: total > 0 ? Math.round((positiveCount / total) * 100) : 0,
    negativePercentage: total > 0 ? Math.round((negativeCount / total) * 100) : 0,
    ratingDistribution: Object.entries(ratingDist).reverse().map(([rating, count]) => ({
      rating: Number(rating),
      count,
      percentage: total > 0 ? (count / total) * 100 : 0
    })),
    highestRatingCount: ratingDist[5],
    lowestRatingCount: ratingDist[1] + ratingDist[2]
  };
}

// =============================================
// MAIN DASHBOARD COMPONENT
// =============================================

function CompetitorDashboard() {
    const [clientReviews, setClientReviews] = useState<Review[]>([]);
      const { activeLocation } = useSelector(
      (state: RootState) => state.activeLocation,
    );

    const activeLocationId = localStorage.getItem("activeLocation")
  const [yourBusiness, setYourBusiness] =
    useState<BusinessData>({
      place_name: activeLocation?.title || "",
      place_id: activeLocation?.placeId || "",
      reviews: clientReviews
    });
  const [competitors, setCompetitors] =
    useState<BusinessData[]>([]);
  const [selectedBusiness, setSelectedBusiness] =
    useState<BusinessData>({
      place_name: activeLocation.title,
      place_id: activeLocation.placeId,
      reviews: clientReviews
    });
  const [timeRange, setTimeRange] = useState(6);
  const [chartMode, setChartMode] = useState<"single" | "comparison">("single");
  const [hoveredDataPoint, setHoveredDataPoint] = useState<{
    month: string;
    value: number;
    x: number;
    y: number;
    label?: string;
  } | null>(null);

  const [aiRecommendations, setAiRecommendations] =
    useState<AIRecommendations | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);

  const [showAddCompetitorDialog, setShowAddCompetitorDialog] = useState(false);
  const [newPlaceId, setNewPlaceId] = useState("");
  const [isAddingCompetitor, setIsAddingCompetitor] = useState(false);
  const [addCompetitorError, setAddCompetitorError] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 1. fetch reviews of compatitor with this time range
    const fetchCompetitorReviews = async () => {
      try {
        if(selectedBusiness.place_id){
          setIsLoading(true);
          setError(null);
          const res = await axios.post(
            `${SERVER}/api/v1/scraper/date-range-reviews`,
            {
              place_id: selectedBusiness.place_id,
              months: timeRange,
            },
            { withCredentials: true },
          );
          console.log("Competitor Reviews", res.data);
          if (res.data?.reviews && Array.isArray(res.data?.reviews)) {
            const formattedReviews = res.data.reviews.map((r: any) => ({
              "author": r.author_name || "",
              "rating": r.rating || 0,
              "date": r.relative_time_description || r.date || "Unknown",
              "review_text": r.text || "",
              "response_by_owner": r.response_by_owner
            }));
            setSelectedBusiness({
              place_name: selectedBusiness.place_name,
              place_id: selectedBusiness.place_id,
              reviews: formattedReviews
            });
          }
        }
      } catch (err) {
        setError("Failed to fetch competitor reviews. Please try again.");
        console.error("Error fetching competitor reviews:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCompetitorReviews();



  }, [timeRange]);

  // =============================================
  // API INTEGRATION FUNCTIONS
  // =============================================

  // Fetch client's own reviews
  const fetchClientReviews = async () => {
    try {
      setIsLoading(true);
      setError(null);

       const res = await axios.get(`${SERVER}/api/v1/location/${activeLocationId}/reviews?place_id=${activeLocation.placeId}`, { withCredentials: true });
      console.log("Reviews", res.data);
      if (res.data?.reviews && Array.isArray(res.data?.reviews)) {
        const formattedReviews = res.data.reviews.map((r: any) => ({
          "author": r.author_name || "Anonymous",
          "rating": r.rating || 0,
          "date": r.relative_time_description || "Unknown",
          "review_text": r.text || "",
          "response_by_owner": r.ownerReply ? "yes" : "no"
        }));
        setClientReviews(formattedReviews);
        if(selectedBusiness.place_id === activeLocation.placeId){
          setSelectedBusiness({
            place_name: activeLocation.title,
            place_id: activeLocation.placeId,
            reviews: formattedReviews
          });
        }
      }

      // Replace with your actual API endpoint
      // const response = await fetch(`${SERVER}/api/v1/location/${activeLocationId}/reviews?place_id=${placeId}`, {
      //   credentials: 'include'
      // });

      // Mock API call - replace with actual API
      // await new Promise((resolve) => setTimeout(resolve, 1000));

      // For demo, using mock data
      // In production, you would:
      // const data = await response.json();
      // const formattedReviews = data.reviews.map(r => ({...}));
      // setYourBusiness({...yourBusiness, reviews: formattedReviews});
    } catch (err) {
      setError("Failed to fetch reviews. Please try again.");
      console.error("Error fetching client reviews:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch all competitors
  const fetchCompetitors = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Replace with your actual API endpoint
      // const response = await fetch(`${SERVER}/api/v1/competitors`, {
      //   credentials: 'include'
      // });

      const res = await axios.get(`${SERVER}/api/v1/competitors`, { withCredentials: true });
      console.log("Compet res", res)
      if (res.data?.data && Array.isArray(res.data?.data)) {
        setCompetitors(res.data?.data?.map((c: any) => ({
          place_name: c?.title || "",
          place_id: c?.placeId || "",
          reviews: c?.reviews || []
        })));
        console.log("Fetched competitors from server:", res.data);
      }

      // Mock API call
      // await new Promise((resolve) => setTimeout(resolve, 1000));

      // For demo, using mock data
      // In production:
      // const data = await response.json();
      // setCompetitors(data.data.map(c => ({...})));
    } catch (err) {
      setError("Failed to fetch competitors. Please try again.");
      console.error("Error fetching competitors:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Add new competitor
  const handleAddCompetitor = async () => {
    if (!newPlaceId.trim()) {
      setAddCompetitorError("Please enter a Place ID");
      return;
    }

    setIsAddingCompetitor(true);
    setAddCompetitorError("");

    try {
      // Replace with your actual API endpoint
      const response = await axios.post(`${SERVER}/api/v1/competitors`, {
        placeId: newPlaceId
      }, { withCredentials: true });

      // Mock API call
      // await new Promise((resolve) => setTimeout(resolve, 2000));

      // Simulate success
      const newCompetitor: BusinessData = {
        place_name: response?.data?.title ,
        place_id: newPlaceId,
        reviews: response?.data?.reviews || [],
      };

      console.log("newCompetitor", newCompetitor);

      setCompetitors([...competitors, newCompetitor]);
      setShowAddCompetitorDialog(false);
      setNewPlaceId("");

      // Show success notification (you can use a toast library)
      // alert("✅ Competitor added successfully!");
    } catch (err) {
      console.error("Error adding competitor:", err);
      setAddCompetitorError(
        "Failed to add competitor. Please check the Place ID and try again.",
      );
    } finally {
      setIsAddingCompetitor(false);
    }
  };

  // Generate AI recommendations
  const generateAIRecommendations = async () => {
    setIsLoadingAI(true);
    setShowAIPanel(true);

    try {
      const yourAnalytics = calculateAnalytics(yourBusiness.reviews);
      const selectedAnalytics = calculateAnalytics(selectedBusiness.reviews);

      // Replace with your actual AI API endpoint
      // const response = await fetch(`${SERVER}/api/v1/ai/recommendations`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   credentials: 'include',
      //   body: JSON.stringify({
      //     yourBusiness: yourAnalytics,
      //     competitor: selectedAnalytics,
      //     timeRange
      //   })
      // });

      // Mock AI response
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const mockAIResponse: AIRecommendations = {
        summary: `${yourBusiness.place_name} shows strong performance with ${yourAnalytics.avgRating} average rating and ${yourAnalytics.responseRate}% response rate. However, there are ${yourAnalytics.totalReviews - selectedAnalytics.totalReviews} fewer reviews than ${selectedBusiness.place_name}, presenting an opportunity for growth.`,
        strengths: [
          `High response rate of ${yourAnalytics.responseRate}% demonstrates excellent customer engagement`,
          `Strong average rating of ${yourAnalytics.avgRating} stars indicates quality service delivery`,
          `${yourAnalytics.positivePercentage}% positive reviews show high customer satisfaction`,
        ],
        weaknesses: [
          `Review volume is ${Math.abs(yourAnalytics.totalReviews - selectedAnalytics.totalReviews)} behind ${selectedBusiness.place_name}`,
          `${yourAnalytics.negativePercentage}% negative reviews need attention and resolution`,
          `Response time to reviews could be improved for faster engagement`,
        ],
        recommendations: [
          "Implement automated review request system after each completed service",
          "Create response templates for common review types to improve response time",
          "Address recurring issues mentioned in negative reviews",
          "Incentivize satisfied customers to leave detailed reviews",
          "Monitor competitor strategies and adapt best practices",
        ],
        actionPlan: {
          days30: [
            "Set up automated email/SMS review requests",
            "Respond to all pending reviews within 48 hours",
            "Create review response templates",
          ],
          days60: [
            "Launch customer feedback survey to improve service",
            "Implement staff training on review management",
            "Optimize Google Business Profile with photos and updates",
          ],
          days90: [
            "Analyze review trends and adjust strategy",
            "Create case studies from positive reviews",
            "Implement loyalty program to encourage repeat reviews",
          ],
        },
      };

      setAiRecommendations(mockAIResponse);
    } catch (err) {
      console.error("Error generating AI recommendations:", err);
      setError("Failed to generate AI recommendations. Please try again.");
    } finally {
      setIsLoadingAI(false);
    }
  };

  // Export report as HTML
  const exportReport = () => {
    const yourAnalytics = calculateAnalytics(yourBusiness.reviews);
    const selectedAnalytics = calculateAnalytics(selectedBusiness.reviews);

    const reportData = {
      reportDate: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      selectedBusiness: {
        name: selectedBusiness.place_name,
        isYourBusiness: selectedBusiness.place_id === yourBusiness.place_id,
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
      comparisonData: [yourBusiness, ...competitors].map((business) => {
        const analytics = calculateAnalytics(business.reviews);
        return {
          name: business.place_name,
          isYourBusiness: business.place_id === yourBusiness.place_id,
          totalReviews: analytics.totalReviews,
          avgRating: analytics.avgRating,
          responseRate: analytics.responseRate,
          positivePercentage: analytics.positivePercentage,
        };
      }),
      latestReviews: selectedBusiness.reviews.slice(0, 5),
      aiInsights: aiRecommendations,
    };

    const htmlContent = generateHTMLReport(reportData);
    const reportWindow = window.open("", "_blank");
    if (reportWindow) {
      reportWindow.document.write(htmlContent);
      reportWindow.document.close();
    }
  };

  // Generate HTML report
  const generateHTMLReport = (data: any) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Competitor Analysis Report - ${data.selectedBusiness.name}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
            padding: 40px;
            color: #1f2937;
            line-height: 1.6;
            background: #f9fafb;
          }
          .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          .header { 
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 30px;
            border-bottom: 4px solid #3b82f6;
          }
          .header h1 { 
            color: #1f2937;
            font-size: 36px;
            margin-bottom: 15px;
            font-weight: 700;
          }
          .metrics-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
            margin: 40px 0;
          }
          .metric-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 12px;
            padding: 24px;
            color: white;
          }
          .metric-card .value {
            font-size: 36px;
            font-weight: 700;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          th, td {
            padding: 16px;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
          }
          th {
            background: #f9fafb;
            font-weight: 700;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📊 Competitor Analysis Report</h1>
            <div>${data.selectedBusiness.name}</div>
            <div>📅 ${data.reportDate} | ⏱️ Time Range: ${data.timeRange} Months</div>
          </div>

          <div class="metrics-grid">
            <div class="metric-card">
              <div class="label">💬 Total Reviews</div>
              <div class="value">${data.metrics.totalReviews}</div>
            </div>
            <div class="metric-card">
              <div class="label">⭐ Average Rating</div>
              <div class="value">${data.metrics.averageRating}</div>
            </div>
            <div class="metric-card">
              <div class="label">↩️ Response Rate</div>
              <div class="value">${data.metrics.responseRate}%</div>
            </div>
            <div class="metric-card">
              <div class="label">👍 Positive Reviews</div>
              <div class="value">${data.metrics.positivePercentage}%</div>
            </div>
          </div>

          <h2>🏆 Competitive Comparison</h2>
          <table>
            <thead>
              <tr>
                <th>Business Name</th>
                <th>Total Reviews</th>
                <th>Avg Rating</th>
                <th>Response Rate</th>
                <th>Positive %</th>
              </tr>
            </thead>
            <tbody>
              ${data.comparisonData
                .map(
                  (business: any) => `
                <tr style="${business.isYourBusiness ? "background: #dbeafe; font-weight: 600;" : ""}">
                  <td>${business.name}${business.isYourBusiness ? " 👑" : ""}</td>
                  <td>${business.totalReviews}</td>
                  <td>${business.avgRating} ⭐</td>
                  <td>${business.responseRate}%</td>
                  <td>${business.positivePercentage}%</td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>

          ${
            data.aiInsights
              ? `
            <h2>🤖 AI-Powered Insights</h2>
            <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>📊 Summary</h3>
              <p>${data.aiInsights.summary}</p>
              
              <h3 style="margin-top: 20px;">💪 Strengths</h3>
              <ul>
                ${data.aiInsights.strengths.map((s: string) => `<li>${s}</li>`).join("")}
              </ul>
              
              <h3 style="margin-top: 20px;">⚠️ Weaknesses</h3>
              <ul>
                ${data.aiInsights.weaknesses.map((w: string) => `<li>${w}</li>`).join("")}
              </ul>
              
              <h3 style="margin-top: 20px;">🎯 Recommendations</h3>
              <ul>
                ${data.aiInsights.recommendations.map((r: string) => `<li>${r}</li>`).join("")}
              </ul>
            </div>
          `
              : ""
          }

          <div style="margin-top: 60px; text-align: center; color: #6b7280; border-top: 2px solid #e5e7eb; padding-top: 30px;">
            <p>© ${new Date().getFullYear()} - Competitor Analysis Dashboard</p>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  // =============================================
  // EFFECTS
  // =============================================

  useEffect(() => {
    fetchClientReviews();
    fetchCompetitors();
  }, []);

  // =============================================
  // COMPUTED VALUES
  // =============================================

  const allBusinesses = [yourBusiness, ...competitors];
  const yourAnalytics = useMemo(
    () => calculateAnalytics(yourBusiness.reviews),
    [yourBusiness.reviews],
  );
  const selectedAnalytics = useMemo(
    () => calculateAnalytics(selectedBusiness.reviews),
    [selectedBusiness.reviews],
  );
  const allCompetitorsAnalytics = useMemo(() => {
    const allReviews = competitors.flatMap((c) => c.reviews);
    return calculateAnalytics(allReviews);
  }, [competitors]);

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

  const latestReviews = selectedBusiness.reviews.slice(0, 5);

  // Generate chart data dynamically
  const generateChartData = (reviews: Review[]) => {
    const months = ["May", "Jun", "Jul", "Aug", "Sep", "Oct"];
    // In production, calculate actual monthly review counts from review dates
    return months.map((month, i) => ({
      month,
      value: Math.floor(Math.random() * 5) + 1, // Replace with actual data
    }));
  };

  // =============================================
  // RENDER
  // =============================================

  if (isLoading && competitors.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-700">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Error Banner */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-800">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-1">
              COMPETITOR ANALYSIS
            </p>
            <h1 className="text-4xl font-bold text-gray-900">
              {selectedBusiness.place_name}
            </h1>
            {selectedBusiness.place_id === yourBusiness.place_id && (
              <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                Your Business
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={selectedBusiness.place_id}
                onChange={(e) =>
                  setSelectedBusiness(
                    allBusinesses.find((b) => b.place_id === e.target.value)!,
                  )
                }
                className="appearance-none px-6 py-3 pr-10 bg-blue-600 text-white rounded-lg font-medium cursor-pointer hover:bg-blue-700 transition-colors"
              >
                <option value={yourBusiness.place_id}>
                  {yourBusiness.place_name} (Your Business)
                </option>
                {competitors.length > 0 && (
                  <option disabled>───────────────</option>
                )}
                {competitors.map((comp) => (
                  <option key={comp.place_id} value={comp.place_id}>
                    {comp.place_name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white pointer-events-none" />
            </div>
            <button
              onClick={() => setShowAddCompetitorDialog(true)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Competitor
            </button>
            <button
              onClick={exportReport}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <ExternalLink className="w-5 h-5" />
              View Report
            </button>
          </div>
        </div>

        {/* Time Range */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">Time range:</span>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(Number(e.target.value))}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-black hover:border-blue-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none cursor-pointer"
          >
            <option value={1}>1 Month</option>
            <option value={3}>3 Months</option>
            <option value={6}>6 Months</option>
            <option value={12}>12 Months</option>
          </select>
        </div>

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
              {selectedAnalytics.totalReviews}
            </div>
            <p className="text-xs text-gray-500">Last {timeRange} months</p>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-500 font-medium">
                Average Rating
              </span>
              <Star className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {selectedAnalytics.avgRating}
            </div>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${i < Math.round(parseFloat(selectedAnalytics.avgRating)) ? "text-blue-500 fill-blue-500" : "text-gray-300"}`}
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
              {selectedAnalytics.responseRate}%
            </div>
            <p className="text-xs text-gray-500">
              {selectedAnalytics.totalReviews} total responses
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-500 font-medium">
                Positive Reviews
              </span>
              <TrendingUp className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {selectedAnalytics.positivePercentage}%
            </div>
            <p className="text-xs text-gray-500">4-5 star ratings</p>
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Rating Distribution
          </h3>
          <div className="space-y-4">
            {selectedAnalytics.ratingDistribution.map((item) => (
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

        {/* Comparison Dashboard */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Competitive Comparison
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Compare your business against all competitors
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-max">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-500 uppercase sticky left-0 bg-gray-50 z-10">
                    Metric
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-blue-600 uppercase bg-blue-50">
                    {yourBusiness.place_name}
                  </th>
                  {competitors.map((comp) => (
                    <th
                      key={comp.place_id}
                      className="px-6 py-4 text-left text-sm font-semibold text-gray-500 uppercase"
                    >
                      {comp.place_name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 sticky left-0 bg-white">
                    Total Reviews
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-blue-700 bg-blue-50">
                    {yourAnalytics.totalReviews}
                  </td>
                  {competitors.map((comp) => {
                    const analytics = calculateAnalytics(comp.reviews);
                    return (
                      <td key={comp.place_id} className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-700">
                            {analytics.totalReviews}
                          </span>
                          {getComparisonIcon(
                            yourAnalytics.totalReviews,
                            analytics.totalReviews,
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>

                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 sticky left-0 bg-white">
                    Average Rating
                  </td>
                  <td className="px-6 py-4 bg-blue-50">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-blue-700">
                        {yourAnalytics.avgRating}
                      </span>
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${i < Math.round(parseFloat(yourAnalytics.avgRating)) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                          />
                        ))}
                      </div>
                    </div>
                  </td>
                  {competitors.map((comp) => {
                    const analytics = calculateAnalytics(comp.reviews);
                    return (
                      <td key={comp.place_id} className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-700">
                            {analytics.avgRating}
                          </span>
                          {getComparisonIcon(
                            parseFloat(yourAnalytics.avgRating),
                            parseFloat(analytics.avgRating),
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>

                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 sticky left-0 bg-white">
                    Response Rate
                  </td>
                  <td className="px-6 py-4 bg-blue-50">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-blue-700">
                        {yourAnalytics.responseRate}%
                      </span>
                      <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${yourAnalytics.responseRate}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  {competitors.map((comp) => {
                    const analytics = calculateAnalytics(comp.reviews);
                    return (
                      <td key={comp.place_id} className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-700">
                            {analytics.responseRate}%
                          </span>
                          {getComparisonIcon(
                            yourAnalytics.responseRate,
                            analytics.responseRate,
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>

                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 sticky left-0 bg-white">
                    Positive Reviews
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-blue-700 bg-blue-50">
                    {yourAnalytics.positivePercentage}%
                  </td>
                  {competitors.map((comp) => {
                    const analytics = calculateAnalytics(comp.reviews);
                    return (
                      <td key={comp.place_id} className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-700">
                            {analytics.positivePercentage}%
                          </span>
                          {getComparisonIcon(
                            yourAnalytics.positivePercentage,
                            analytics.positivePercentage,
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

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
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-3">
                    📊 Executive Summary
                  </h3>
                  <p className="text-blue-800 leading-relaxed">
                    {aiRecommendations.summary}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              Latest Reviews - {selectedBusiness.place_name}
            </h2>
          </div>
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
                        className={`w-4 h-4 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
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
          {latestReviews.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No reviews available</p>
            </div>
          )}
        </div>

        {/* All Competitors Summary */}
        {competitors.length > 0 && (
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              All Competitors Overview
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {competitors.map((comp) => {
                const analytics = calculateAnalytics(comp.reviews);
                return (
                  <div
                    key={comp.place_id}
                    className={`border-2 rounded-lg p-5 cursor-pointer transition-all ${
                      selectedBusiness.place_id === comp.place_id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-blue-300"
                    }`}
                    onClick={() => setSelectedBusiness(comp)}
                  >
                    <h3 className="font-semibold text-gray-900 mb-3">
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
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
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
                <X className="w-6 h-6" />
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
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
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
                  <li>Copy the Place ID from the URL</li>
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
                onClick={handleAddCompetitor}
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