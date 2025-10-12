import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BarChart3, CheckCircle2, Info, AlertCircle, Zap } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";
import axios from "axios";
import { SERVER } from "@/constants";
import { Button } from "@/components/ui/button";
import { selectActiveSite } from "@/redux/slices/activeSite.selectors";

function Stat({
  label,
  value,
  postfix,
  hint,
}: {
  label: string;
  value: number | string;
  postfix?: string;
  hint?: string;
}) {
  return (
    <div className="p-4 rounded-lg bg-white border border-blue-100">
      <p className="text-xs text-blue-600">{label}</p>
      <p className="text-2xl font-semibold text-blue-900">
        {value}
        {postfix ?? ""}
      </p>
      {hint && <p className="text-xs text-blue-500 mt-1">{hint}</p>}
    </div>
  );
}

function MetricCard({ label, mobile, desktop, unit, threshold }: any) {
  const getColor = (value: number, isMobile: boolean) => {
    const mobileMultiplier = isMobile ? 1.2 : 1;
    if (value <= threshold.good * mobileMultiplier) return "text-green-700";
    if (value <= threshold.poor * mobileMultiplier) return "text-orange-700";
    return "text-red-700";
  };

  return (
    <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
      <p className="text-xs font-medium text-gray-700 mb-2">{label}</p>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <p className="text-xs text-gray-500">Mobile</p>
          <p className={`text-lg font-bold ${getColor(mobile, true)}`}>
            {mobile}
            {unit}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Desktop</p>
          <p className={`text-lg font-bold ${getColor(desktop, false)}`}>
            {desktop}
            {unit}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SearchConsoleOverview() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [overviewData, setOverviewData] = useState<any>(null);
  const [indexingData, setIndexingData] = useState<any>(null);
  const [coreWebVitals, setCoreWebVitals] = useState<any>(null);
  const [error, setError] = useState<string>("");

  // Get active site from Redux
  const activeSite = useSelector(selectActiveSite);

  // Check authentication status
  async function getGSCAuthStatus() {
    try {
      const res = await axios.get(`${SERVER}/api/v1/seo/status`, {
        withCredentials: true,
      });
      console.log("gsc status response", res.data);

      if (res.data?.authenticated) {
        setIsAuthenticated(true);
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

  // Fetch overview data for selected site
  async function fetchOverviewData(siteUrl: string) {
    if (!siteUrl) return;

    setIsLoading(true);
    setError("");

    try {
      const res = await axios.get(`${SERVER}/api/v1/seo/overview`, {
        params: { site_url: siteUrl },
        withCredentials: true,
      });

      console.log("Overview data:", res.data);

      if (res.data?.success) {
        setOverviewData(res.data);
      }
    } catch (error: any) {
      console.error("Error fetching overview:", error);
      setError(error.response?.data?.detail || "Failed to fetch overview data");
    } finally {
      setIsLoading(false);
    }
  }

  // Fetch detailed indexing data
  async function fetchIndexingData(siteUrl: string) {
    if (!siteUrl) return;

    try {
      const res = await axios.get(`${SERVER}/api/v1/seo/indexing`, {
        params: { site_url: siteUrl },
        withCredentials: true,
      });

      console.log("Indexing data:", res.data);

      if (res.data?.success) {
        setIndexingData(res.data);
      }
    } catch (error: any) {
      console.error("Error fetching indexing data:", error);
    }
  }

  // Fetch Core Web Vitals data
  async function fetchCoreWebVitals(siteUrl: string) {
    if (!siteUrl) return;

    try {
      const res = await axios.get(`${SERVER}/api/v1/seo/core-web-vitals`, {
        params: { site_url: siteUrl },
        withCredentials: true,
      });

      console.log("Core Web Vitals data:", res.data);

      if (res.data?.success) {
        setCoreWebVitals(res.data);
      }
    } catch (error: any) {
      console.error("Error fetching Core Web Vitals:", error);
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

  // Initial load - check auth
  useEffect(() => {
    getGSCAuthStatus();
  }, []);

  // Fetch data when active site changes
  useEffect(() => {
    if (activeSite?.siteUrl && isAuthenticated) {
      fetchOverviewData(activeSite.siteUrl);
      fetchIndexingData(activeSite.siteUrl);
      fetchCoreWebVitals(activeSite.siteUrl);
    }
  }, [activeSite?.siteUrl, isAuthenticated]);

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
            analytics and performance data.
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
          <p className="text-gray-600">Loading data...</p>
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
            onClick={() => activeSite && fetchOverviewData(activeSite.siteUrl)}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Show message if no site selected
  if (!activeSite) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <Info className="w-16 h-16 text-blue-500" />
          <h2 className="text-xl font-semibold text-gray-900">
            No Site Selected
          </h2>
          <p className="text-gray-600 text-center max-w-md">
            Please select a site from the header dropdown to view analytics
            data.
          </p>
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
          Search Console • Overview
        </h1>

        <Button onClick={handleGSCLogin} variant="outline" size="sm">
          Reconnect
        </Button>
      </div>

      {overviewData && (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Performance Card */}
            <Card>
              <CardHeader>
                <CardTitle>Performance (last 90 days)</CardTitle>
                <CardDescription className="text-black">
                  Clicks, impressions, CTR and average position.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Stat
                    label="Total clicks"
                    value={
                      overviewData.performance?.totals?.clicks?.toLocaleString() ||
                      0
                    }
                  />
                  <Stat
                    label="Total impressions"
                    value={
                      overviewData.performance?.totals?.impressions?.toLocaleString() ||
                      0
                    }
                  />
                  <Stat
                    label="Average CTR"
                    value={overviewData.performance?.totals?.ctr || 0}
                    postfix="%"
                  />
                  <Stat
                    label="Average position"
                    value={
                      overviewData.performance?.timeline?.[0]?.position || 0
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Indexing Card */}
            <Card>
              <CardHeader>
                <CardTitle>Indexing Status</CardTitle>
                <CardDescription className="text-black">
                  Index coverage for pages.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-green-50 border border-green-100">
                    <p className="text-xs text-green-700">Indexed Pages</p>
                    <p className="text-2xl font-semibold text-green-800">
                      {indexingData?.indexed?.toLocaleString() ||
                        overviewData.indexing?.indexed?.toLocaleString() ||
                        0}
                    </p>
                    <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Available in search
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-orange-50 border border-orange-100">
                    <p className="text-xs text-orange-700">Not Indexed</p>
                    <p className="text-2xl font-semibold text-orange-800">
                      {indexingData?.notIndexed?.toLocaleString() ||
                        overviewData.indexing?.notIndexed?.toLocaleString() ||
                        0}
                    </p>
                    <p className="text-xs text-orange-600 mt-1">
                      Needs attention
                    </p>
                  </div>
                  <div className="col-span-2 p-4 rounded-lg bg-blue-50 border border-blue-100">
                    <p className="text-xs text-blue-700">Indexing Rate</p>
                    <p className="text-2xl font-semibold text-blue-800">
                      {indexingData?.indexingRate ||
                        overviewData.indexing?.indexingRate ||
                        0}
                      %
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      {indexingData?.totalKnown?.toLocaleString() ||
                        overviewData.indexing?.totalKnown?.toLocaleString() ||
                        0}{" "}
                      total pages known
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Core Web Vitals Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  Core Web Vitals
                </CardTitle>
                <CardDescription className="text-black">
                  Performance metrics from field data.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {coreWebVitals ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {/* Mobile */}
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-1">
                          📱 Mobile
                        </p>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm items-center">
                            <span className="text-green-700 flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4" />
                              Good
                            </span>
                            <span className="font-semibold">
                              {coreWebVitals.mobile.good}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full transition-all"
                              style={{
                                width: `${coreWebVitals.mobile.goodPercentage}%`,
                              }}
                            ></div>
                          </div>

                          <div className="flex justify-between text-sm items-center">
                            <span className="text-orange-700">
                              Needs improvement
                            </span>
                            <span className="font-semibold">
                              {coreWebVitals.mobile.needsImprovement}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-orange-500 h-2 rounded-full transition-all"
                              style={{
                                width: `${coreWebVitals.mobile.needsImprovementPercentage}%`,
                              }}
                            ></div>
                          </div>

                          <div className="flex justify-between text-sm items-center">
                            <span className="text-red-700">Poor</span>
                            <span className="font-semibold">
                              {coreWebVitals.mobile.poor}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-red-500 h-2 rounded-full transition-all"
                              style={{
                                width: `${coreWebVitals.mobile.poorPercentage}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      {/* Desktop */}
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-1">
                          🖥️ Desktop
                        </p>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm items-center">
                            <span className="text-green-700 flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4" />
                              Good
                            </span>
                            <span className="font-semibold">
                              {coreWebVitals.desktop.good}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full transition-all"
                              style={{
                                width: `${coreWebVitals.desktop.goodPercentage}%`,
                              }}
                            ></div>
                          </div>

                          <div className="flex justify-between text-sm items-center">
                            <span className="text-orange-700">
                              Needs improvement
                            </span>
                            <span className="font-semibold">
                              {coreWebVitals.desktop.needsImprovement}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-orange-500 h-2 rounded-full transition-all"
                              style={{
                                width: `${coreWebVitals.desktop.needsImprovementPercentage}%`,
                              }}
                            ></div>
                          </div>

                          <div className="flex justify-between text-sm items-center">
                            <span className="text-red-700">Poor</span>
                            <span className="font-semibold">
                              {coreWebVitals.desktop.poor}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-red-500 h-2 rounded-full transition-all"
                              style={{
                                width: `${coreWebVitals.desktop.poorPercentage}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-gray-500 mt-3 flex items-center gap-2">
                      <Info className="w-3 h-3" />
                      {coreWebVitals.dataSource}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-sm">Loading Core Web Vitals...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Core Web Vitals Detailed Metrics */}
          {coreWebVitals && (
            <Card>
              <CardHeader>
                <CardTitle>Web Vitals Detailed Metrics</CardTitle>
                <CardDescription>Key performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <MetricCard
                    label="LCP - Largest Contentful Paint"
                    mobile={coreWebVitals.metrics.lcp.mobile}
                    desktop={coreWebVitals.metrics.lcp.desktop}
                    unit="s"
                    threshold={coreWebVitals.metrics.lcp.threshold}
                  />
                  <MetricCard
                    label="FID - First Input Delay"
                    mobile={coreWebVitals.metrics.fid.mobile}
                    desktop={coreWebVitals.metrics.fid.desktop}
                    unit="ms"
                    threshold={coreWebVitals.metrics.fid.threshold}
                  />
                  <MetricCard
                    label="CLS - Cumulative Layout Shift"
                    mobile={coreWebVitals.metrics.cls.mobile}
                    desktop={coreWebVitals.metrics.cls.desktop}
                    unit=""
                    threshold={coreWebVitals.metrics.cls.threshold}
                  />
                  <MetricCard
                    label="FCP - First Contentful Paint"
                    mobile={coreWebVitals.metrics.fcp.mobile}
                    desktop={coreWebVitals.metrics.fcp.desktop}
                    unit="s"
                    threshold={coreWebVitals.metrics.fcp.threshold}
                  />
                  <MetricCard
                    label="INP - Interaction to Next Paint"
                    mobile={coreWebVitals.metrics.inp.mobile}
                    desktop={coreWebVitals.metrics.inp.desktop}
                    unit="ms"
                    threshold={coreWebVitals.metrics.inp.threshold}
                  />
                  <MetricCard
                    label="TTFB - Time to First Byte"
                    mobile={coreWebVitals.metrics.ttfb.mobile}
                    desktop={coreWebVitals.metrics.ttfb.desktop}
                    unit="ms"
                    threshold={coreWebVitals.metrics.ttfb.threshold}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Indexing Details Section */}
          {indexingData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Coverage Issues */}
              <Card>
                <CardHeader>
                  <CardTitle>Coverage Issues</CardTitle>
                  <CardDescription>Pages that need attention</CardDescription>
                </CardHeader>
                <CardContent>
                  {indexingData.issues && indexingData.issues.length > 0 ? (
                    <div className="space-y-3">
                      {indexingData.issues.map((issue: any, index: number) => (
                        <div
                          key={index}
                          className={`p-3 rounded-lg border ${
                            issue.severity === "error"
                              ? "bg-red-50 border-red-200"
                              : issue.severity === "warning"
                                ? "bg-yellow-50 border-yellow-200"
                                : "bg-blue-50 border-blue-200"
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p
                                className={`text-sm font-medium ${
                                  issue.severity === "error"
                                    ? "text-red-800"
                                    : issue.severity === "warning"
                                      ? "text-yellow-800"
                                      : "text-blue-800"
                                }`}
                              >
                                {issue.reason}
                              </p>
                              <p className="text-xs text-gray-600 mt-1">
                                {issue.pages} pages affected
                              </p>
                            </div>
                            {issue.severity === "error" && (
                              <AlertCircle className="w-4 h-4 text-red-600" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-green-500" />
                      <p className="text-sm">No coverage issues found</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Indexing Timeline */}
              {indexingData?.timeline && indexingData.timeline.length > 0 && (
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Indexing Trend (Last 30 days)</CardTitle>
                    <CardDescription>Daily indexing progress</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={indexingData.timeline}
                          margin={{ left: 8, right: 16, top: 8, bottom: 8 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" minTickGap={24} />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="estimated_indexed"
                            name="Estimated Indexed"
                            stroke="#10b981"
                            dot={false}
                          />
                          <Line
                            type="monotone"
                            dataKey="impressions"
                            name="Impressions"
                            stroke="#3b82f6"
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Traffic Trend Chart */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Traffic trend (last 30 days)</CardTitle>
              <CardDescription>
                Clicks and impressions trend for {activeSite.siteUrl}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={overviewData.performance?.timeline?.slice(-30) || []}
                    margin={{ left: 8, right: 16, top: 8, bottom: 8 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" minTickGap={24} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="clicks"
                      name="Clicks"
                      stroke="#2563eb"
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="impressions"
                      name="Impressions"
                      stroke="#fb923c"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
