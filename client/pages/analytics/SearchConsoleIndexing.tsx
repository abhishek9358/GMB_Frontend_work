import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BarChart3, Loader2, AlertCircle, Info } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { SERVER } from "@/constants";
import { selectActiveSite } from "@/redux/slices/activeSite.selectors";

export default function SearchConsoleIndexing() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [urls, setUrls] = useState("");
  const [message, setMessage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Get active site from Redux
  const activeSite = useSelector(selectActiveSite);

  // Check authentication status
  async function checkAuthStatus() {
    try {
      const response = await fetch(`${SERVER}/api/v1/seo/status`, {
        credentials: "include",
      });
      const result = await response.json();
      setIsAuthenticated(result?.authenticated || false);
    } catch (error) {
      console.error("Auth check error:", error);
      setIsAuthenticated(false);
    }
  }

  // Fetch indexing data
  const fetchIndexingData = async (selectedSite) => {
    try {
      setLoading(true);
      setError(null);

      if (!selectedSite) {
        throw new Error("No site URL available");
      }

      const response = await fetch(
        `${SERVER}/api/v1/seo/indexing?site_url=${encodeURIComponent(selectedSite)}`,
        {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        },
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Please login to Search Console first");
        }
        throw new Error(`Failed to fetch: ${response.statusText}`);
      }

      const result = await response.json();
      if (result.success) {
        setData(result);
      } else {
        throw new Error("Failed to load indexing data");
      }
    } catch (err) {
      console.error("Error fetching indexing data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Submit URLs for indexing
  const handleSubmit = async (e) => {
    e.preventDefault();

    const list = urls
      .split(/\n|,/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (list.length === 0) {
      setMessage({ type: "error", text: "Please enter at least one URL." });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const results = await Promise.allSettled(
        list.map((url) =>
          fetch(`${SERVER}/api/v1/seo/indexing/submit`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url }),
          }).then((res) => res.json()),
        ),
      );

      const successful = results.filter((r) => r.status === "fulfilled").length;
      const failed = results.filter((r) => r.status === "rejected").length;

      if (failed === 0) {
        setMessage({
          type: "success",
          text: `Successfully submitted ${successful} URL(s) for indexing. Updates will appear soon.`,
        });
        setUrls("");
        setTimeout(
          () => activeSite && fetchIndexingData(activeSite.siteUrl),
          2000,
        );
      } else {
        setMessage({
          type: "warning",
          text: `Submitted ${successful} URL(s). ${failed} failed.`,
        });
      }
    } catch (err) {
      console.error("Error submitting URLs:", err);
      setMessage({
        type: "error",
        text: "Failed to submit URLs. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Initial auth check
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Fetch data when active site changes
  useEffect(() => {
    if (activeSite?.siteUrl && isAuthenticated) {
      fetchIndexingData(activeSite.siteUrl);
    }
  }, [activeSite?.siteUrl, isAuthenticated]);

  // Loading state
  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading indexing data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Error Loading Data
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => activeSite && fetchIndexingData(activeSite.siteUrl)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // No site selected
  if (!activeSite) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <Info className="w-12 h-12 text-blue-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            No Site Selected
          </h2>
          <p className="text-gray-600">
            Please select a site from the header dropdown to view indexing data.
          </p>
        </div>
      </div>
    );
  }

  // No data
  if (!data) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">No data available</p>
        </div>
      </div>
    );
  }

  const indexedPct = Math.round(
    (data.indexed / Math.max(1, data.totalKnown)) * 100,
  );

  const chartData = [
    { name: "Indexed", value: data.indexed, color: "#22c55e" },
    { name: "Not indexed", value: data.notIndexed, color: "#f59e0b" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BarChart3 className="w-6 h-6" />
          Search Console • Indexing
        </h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchIndexingData(activeSite.siteUrl)}
            disabled={loading}
            className="text-sm px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-50"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
          <span className="text-xs text-gray-500">
            Business: {data.business.name} • Live data
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Coverage</CardTitle>
            <CardDescription className="text-black">
              Known pages and index status.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-green-50 border border-green-100">
                <p className="text-xs text-green-700">Indexed</p>
                <p className="text-2xl font-semibold text-green-800">
                  {data.indexed}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-blue-50 border border-amber-100">
                <p className="text-xs text-blue-700">Not indexed</p>
                <p className="text-2xl font-semibold text-amber-800">
                  {data.notIndexed}
                </p>
              </div>
              <div className="col-span-2 p-4 rounded-lg bg-gray-50 border border-gray-100">
                <p className="text-xs text-gray-600">Indexed %</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {indexedPct}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Coverage chart</CardTitle>
            <CardDescription className="text-black">
              Visual breakdown of indexed vs not indexed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    dataKey="value"
                    data={chartData}
                    nameKey="name"
                    innerRadius={50}
                    outerRadius={80}
                  >
                    {chartData.map((e, i) => (
                      <Cell key={i} fill={e.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Request indexing</CardTitle>
            <CardDescription className="text-black">
              Paste page URLs to request indexing. Not indexed pages:{" "}
              {data.notIndexed}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <textarea
                value={urls}
                onChange={(e) => setUrls(e.target.value)}
                placeholder={
                  data.indexedUrls?.sample?.slice(0, 3).join("\n") ||
                  "Enter URLs (one per line)"
                }
                rows={5}
                disabled={submitting}
                className="w-full border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              />

              {data.indexedUrls?.sample && (
                <div className="flex items-center gap-2 flex-wrap">
                  {data.indexedUrls.sample.slice(0, 5).map((u) => (
                    <button
                      type="button"
                      key={u}
                      onClick={() => setUrls((p) => (p ? p + "\n" : "") + u)}
                      disabled={submitting}
                      className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-50"
                    >
                      {u.length > 40 ? u.substring(0, 40) + "..." : u}
                    </button>
                  ))}
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={submitting || !urls.trim()}
                className="w-full px-4 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {submitting ? "Submitting..." : "Submit indexing request"}
              </button>

              {message && (
                <div
                  className={`text-sm rounded p-3 border ${
                    message.type === "success"
                      ? "text-green-700 bg-green-50 border-green-200"
                      : message.type === "warning"
                        ? "text-amber-700 bg-amber-50 border-amber-200"
                        : "text-red-700 bg-red-50 border-red-200"
                  }`}
                >
                  {message.text}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Index Coverage Over Time</CardTitle>
            <CardDescription>
              Timeline showing indexed vs not indexed pages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-400 rounded"></div>
                  <span className="text-sm">Not indexed</span>
                  <span className="text-sm font-semibold">
                    {data.notIndexed}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-sm">Indexed</span>
                  <span className="text-sm font-semibold">{data.indexed}</span>
                </div>
              </div>

              {data.timeline && data.timeline.length > 0 ? (
                <div className="h-48 relative">
                  <div className="absolute bottom-6 left-8 right-0 h-32 flex items-end gap-px">
                    {data.timeline.slice(-30).map((day, i) => {
                      const maxTotal = Math.max(
                        ...data.timeline.map((d) => d.impressions || 100),
                      );
                      const estimated =
                        day.estimated_indexed || day.impressions / 10;
                      const totalHeight =
                        ((day.impressions || 0) / maxTotal) * 100;
                      const indexedHeight =
                        (estimated / (day.impressions || 1)) * totalHeight;
                      const notIndexedHeight = totalHeight - indexedHeight;

                      return (
                        <div
                          key={i}
                          className="flex-1 flex flex-col justify-end h-full group relative"
                        >
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10 pointer-events-none">
                            <div>
                              Date: {new Date(day.date).toLocaleDateString()}
                            </div>
                            <div>Impressions: {day.impressions}</div>
                            <div>Est. Indexed: {Math.round(estimated)}</div>
                          </div>

                          <div
                            className="bg-gray-400 w-full transition-all duration-200 group-hover:bg-gray-500"
                            style={{ height: `${notIndexedHeight}%` }}
                          ></div>
                          <div
                            className="bg-green-500 w-full transition-all duration-200 group-hover:bg-green-600"
                            style={{ height: `${indexedHeight}%` }}
                          ></div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-xs text-gray-500">
                    <span>
                      {Math.max(
                        ...data.timeline.map((d) => d.impressions || 0),
                      )}
                    </span>
                    <span>0</span>
                  </div>

                  <div className="absolute bottom-0 left-8 right-0 flex justify-between text-xs text-gray-500">
                    {[0, 10, 20, 29].map((index) => {
                      const day = data.timeline.slice(-30)[index];
                      if (!day) return null;
                      const date = new Date(day.date);
                      return (
                        <span key={index}>
                          {date.toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "2-digit",
                          })}
                        </span>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center text-gray-500">
                  No timeline data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-xs text-gray-600">i</span>
              </div>
              Why pages aren't indexed
            </CardTitle>
            <CardDescription>
              Pages that aren't indexed can't be served on Google
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto">
              {data.issues && data.issues.length > 0 ? (
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-600 border-t border-gray-200">
                      <th className="py-3 pr-4 font-normal">Reason</th>
                      <th className="py-3 pr-4 font-normal">Source</th>
                      <th className="py-3 pr-4 font-normal">Severity</th>
                      <th className="py-3 pr-4 font-normal text-right">
                        Pages
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.issues.map((it, index) => (
                      <tr
                        key={index}
                        className="border-t border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-3 pr-4 font-medium text-gray-900">
                          {it.reason}
                        </td>
                        <td className="py-3 pr-4 text-gray-600">
                          {it.reason.includes("Crawled") ||
                          it.reason.includes("Discovered")
                            ? "Google systems"
                            : "Website"}
                        </td>
                        <td className="py-3 pr-4">
                          <span
                            className={`px-2 py-1 text-xs rounded ${
                              it.severity === "error"
                                ? "bg-red-100 text-red-700"
                                : it.severity === "warning"
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {it.severity}
                          </span>
                        </td>
                        <td className="py-3 text-right font-medium">
                          {it.pages}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No indexing issues found
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
