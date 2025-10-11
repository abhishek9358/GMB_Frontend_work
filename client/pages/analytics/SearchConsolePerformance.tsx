import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BarChart3, AlertCircle, TrendingUp, TrendingDown } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  Brush,
} from "recharts";
import axios from "axios";
import { SERVER } from "@/constants";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SearchConsolePerformance() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sites, setSites] = useState<any[]>([]);
  const [selectedSite, setSelectedSite] = useState<string>("");
  const [performanceData, setPerformanceData] = useState<any>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<number>(90);
  const [error, setError] = useState<string>("");

  // Check authentication status
  async function getGSCAuthStatus() {
    try {
      const res = await axios.get(`${SERVER}/api/v1/seo/status`, {
        withCredentials: true,
      });
      console.log("gsc status response", res.data);

      if (res.data?.authenticated) {
        setIsAuthenticated(true);
        await fetchSites();
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("GSC status error:", error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }

  // Fetch all sites
  async function fetchSites() {
    try {
      const res = await axios.get(`${SERVER}/api/v1/seo/sites`, {
        withCredentials: true,
      });
      console.log("Sites response:", res.data);

      if (res.data?.success && res.data?.sites) {
        setSites(res.data.sites);
        if (res.data.sites.length > 0) {
          setSelectedSite(res.data.sites[0].siteUrl);
        }
      }
    } catch (error) {
      console.error("Error fetching sites:", error);
      setError("Failed to fetch sites");
    }
  }

  // Fetch performance data
  async function fetchPerformanceData(siteUrl: string, days: number) {
    if (!siteUrl) return;

    setIsLoading(true);
    setError("");

    try {
      const res = await axios.get(`${SERVER}/api/v1/seo/performance`, {
        params: {
          site_url: siteUrl,
          days: days,
        },
        withCredentials: true,
      });

      console.log("Performance data:", res.data);

      if (res.data?.success) {
        setPerformanceData(res.data);
      }
    } catch (error: any) {
      console.error("Error fetching performance:", error);
      setError(
        error.response?.data?.detail || "Failed to fetch performance data",
      );
    } finally {
      setIsLoading(false);
    }
  }

  // Handle GSC Login
  const handleGSCLogin = async () => {
    try {
      const res = await axios.get(`${SERVER}/api/v1/seo/login`, {
        withCredentials: true,
      });
      console.log("Res", res);

      if (res.data?.authorization_url) {
        window.open(res.data?.authorization_url, "_blank");
      }
    } catch (error) {
      console.error("Error in gsc login", error);
    }
  };

  // Handle site selection
  const handleSiteChange = (siteUrl: string) => {
    setSelectedSite(siteUrl);
  };

  // Handle period change
  const handlePeriodChange = (period: string) => {
    const days = parseInt(period);
    setSelectedPeriod(days);
    if (selectedSite) {
      fetchPerformanceData(selectedSite, days);
    }
  };

  // Initial load
  useEffect(() => {
    getGSCAuthStatus();
  }, []);

  // Fetch data when site is selected
  useEffect(() => {
    if (selectedSite) {
      fetchPerformanceData(selectedSite, selectedPeriod);
    }
  }, [selectedSite]);

  // Calculate summary stats
  const summaryStats = performanceData
    ? {
        totalClicks: performanceData.totals?.clicks || 0,
        totalImpressions: performanceData.totals?.impressions || 0,
        avgCTR: performanceData.totals?.ctr || 0,
        avgPosition: performanceData.totals?.position || 0,
      }
    : null;

  // Show login button if not authenticated
  if (!isAuthenticated && !isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <AlertCircle className="w-16 h-16 text-blue-500" />
          <h2 className="text-xl font-semibold text-gray-900">
            Google Search Console Not Connected
          </h2>
          <p className="text-gray-600 text-center max-w-md">
            Please authenticate with Google Search Console to view your website
            performance data.
          </p>
          <Button onClick={handleGSCLogin} size="lg">
            Connect Google Search Console
          </Button>
        </div>
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">Loading performance data...</p>
        </div>
      </div>
    );
  }

  // Show error if any
  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <AlertCircle className="w-16 h-16 text-red-500" />
          <h2 className="text-xl font-semibold text-gray-900">
            Error Loading Data
          </h2>
          <p className="text-gray-600 text-center max-w-md">{error}</p>
          <Button
            onClick={() => fetchPerformanceData(selectedSite, selectedPeriod)}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BarChart3 className="w-6 h-6" />
          Search Console • Performance
        </h1>

        <div className="flex items-center gap-4">
          {/* Period Selector */}
          <Select
            value={selectedPeriod.toString()}
            onValueChange={handlePeriodChange}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="28">Last 28 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="180">Last 6 months</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>

          {/* Site Selector */}
          <Select value={selectedSite} onValueChange={handleSiteChange}>
            <SelectTrigger className="w-[300px]">
              <SelectValue placeholder="Select a website" />
            </SelectTrigger>
            <SelectContent>
              {sites.map((site) => (
                <SelectItem key={site.siteUrl} value={site.siteUrl}>
                  {site.siteUrl}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={handleGSCLogin} variant="outline" size="sm">
            Reconnect
          </Button>
        </div>
      </div>

      {performanceData && (
        <>
          {/* Summary Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Clicks</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {summaryStats?.totalClicks.toLocaleString()}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Impressions</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {summaryStats?.totalImpressions.toLocaleString()}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Average CTR</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {summaryStats?.avgCTR}%
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Average Position</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {summaryStats?.avgPosition}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <TrendingDown className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Timeline Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Timeline (last {performanceData.period})</CardTitle>
              <CardDescription>
                Clicks, impressions, CTR and position over time.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={performanceData.timeline || []}
                    margin={{ left: 8, right: 16, top: 8, bottom: 8 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" minTickGap={24} />
                    <YAxis yAxisId="left" orientation="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="clicks"
                      name="Clicks"
                      stroke="#2563eb"
                      dot={false}
                      strokeWidth={2}
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="impressions"
                      name="Impressions"
                      stroke="#fb923c"
                      dot={false}
                      strokeWidth={2}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="ctr"
                      name="CTR %"
                      stroke="#16a34a"
                      dot={false}
                      strokeWidth={2}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="position"
                      name="Position"
                      stroke="#9333ea"
                      dot={false}
                      strokeWidth={2}
                    />
                    <Brush dataKey="date" height={20} stroke="#94a3b8" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Top Queries Table */}
          <Card>
            <CardHeader>
              <CardTitle>Top queries (Top 50)</CardTitle>
              <CardDescription>
                Search terms driving traffic to your site.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {performanceData.topQueries &&
              performanceData.topQueries.length > 0 ? (
                <div className="overflow-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-600 border-b-2 border-gray-200">
                        <th className="py-3 pr-4 font-semibold">Query</th>
                        <th className="py-3 pr-4 font-semibold text-right">
                          Clicks
                        </th>
                        <th className="py-3 pr-4 font-semibold text-right">
                          Impressions
                        </th>
                        <th className="py-3 pr-4 font-semibold text-right">
                          CTR %
                        </th>
                        <th className="py-3 pr-4 font-semibold text-right">
                          Position
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {performanceData.topQueries.map(
                        (q: any, index: number) => (
                          <tr
                            key={index}
                            className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                          >
                            <td className="py-3 pr-4 font-medium text-gray-900 max-w-md truncate">
                              {q.query}
                            </td>
                            <td className="py-3 pr-4 text-right text-blue-700 font-semibold">
                              {q.clicks.toLocaleString()}
                            </td>
                            <td className="py-3 pr-4 text-right text-gray-700">
                              {q.impressions.toLocaleString()}
                            </td>
                            <td className="py-3 pr-4 text-right">
                              <span
                                className={`font-medium ${
                                  q.ctr > 5
                                    ? "text-green-700"
                                    : q.ctr > 2
                                      ? "text-orange-700"
                                      : "text-red-700"
                                }`}
                              >
                                {q.ctr}%
                              </span>
                            </td>
                            <td className="py-3 pr-4 text-right">
                              <span
                                className={`font-medium ${
                                  q.position <= 3
                                    ? "text-green-700"
                                    : q.position <= 10
                                      ? "text-orange-700"
                                      : "text-gray-700"
                                }`}
                              >
                                {q.position}
                              </span>
                            </td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">
                    No query data available for this period
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
