import { useState, useEffect } from "react";
import {
  Star,
  TrendingUp,
  Download,
  QrCode,
  MessageSquare,
  Filter,
  MoreHorizontal,
} from "lucide-react";
import axios from "axios";
import { SERVER } from "@/constants";
import * as XLSX from "xlsx";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

interface Review {
  id: string;
  author: string;
  rating: number;
  text: string;
  date: string;
  sentiment: "positive" | "negative" | "neutral";
  replied: boolean;
}

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [sortBy, setSortBy] = useState("latest");
  const [filterRating, setFilterRating] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { activeLocation } = useSelector((state: RootState) => state.activeLocation);

  const locationId = localStorage.getItem("activeLocation");

  // API endpoint
  const API_URL = `${SERVER}/api/v1/location/${ locationId || activeLocation?.locationId?.split("/")?.[1] || ""}/reviews?place_id=${activeLocation?.placeId || ""}`;

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const response = await axios.get(API_URL, { withCredentials: true });

        // Map API response to component's Review interface
        const mappedReviews: Review[] = response.data.reviews.map(
          (review: any, index: number) => ({
            id: index.toString(),
            author: review.author_name,
            rating: review.rating,
            text: review.text,
            date: new Date(review.time * 1000).toISOString().split("T")[0], // Convert timestamp to date
            sentiment:
              review.rating >= 4
                ? "positive"
                : review.rating <= 2
                  ? "negative"
                  : "neutral",
            replied: !!review.ownerReply,
          }),
        );

        setReviews(mappedReviews);
        setLoading(false);
      } catch (err) {
        // setError("Failed to fetch reviews");
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const totalReviews = reviews.length;
  const averageRating =
    reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews || 0;
  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((r) => r.rating === rating).length,
    percentage:
      (reviews.filter((r) => r.rating === rating).length / totalReviews) *
        100 || 0,
  }));

  const monthlyData = [
    { month: "Dec", reviews: 3, responseRate: 100 }, // Dec 2022: 2 reviews, both replied
    { month: "Jul", reviews: 5, responseRate: 100 }, // Jul 2023: 1 review, replied
    { month: "Jan", reviews: 1, responseRate: 0 }, // Jan 2025: 1 review, no reply
    { month: "Sep", reviews: 0, responseRate: 0 }, // current month, 0 reviews
  ];

  if (loading) {
    return <div className="p-6">Loading reviews...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">{error}</div>;
  }

  // Get latest review date
  const latestReviewDate = reviews.length
    ? new Date(Math.max(...reviews.map((r) => new Date(r.date).getTime())))
    : null;

  const daysSinceLastReview = latestReviewDate
    ? Math.floor(
        (Date.now() - latestReviewDate.getTime()) / (1000 * 60 * 60 * 24),
      )
    : 0;

  const exportToCSV = () => {
    if (reviews.length === 0) return;

    const sortedReviews = [...reviews].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

    // Prepare data
    const data = sortedReviews.map((r) => ({
      Author: r.author,
      Rating: r.rating,
      Review: r.text,
      Date: r.date,
      Sentiment: r.sentiment,
      Replied: r.replied ? "Yes" : "No",
    }));

    // Convert to worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Reviews");

    // Export file
    XLSX.writeFile(workbook, "reviews.xlsx");
  };

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>
          <p className="text-gray-600 mt-1">
            Manage and respond to customer reviews
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={exportToCSV}
            className="border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>

          <button className="bg-gbp-blue-500 text-white px-4 py-2 rounded-lg hover:bg-gbp-blue-600 flex items-center space-x-2">
            <MessageSquare className="w-4 h-4" />
            <span>Request Reviews</span>
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Reviews</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {totalReviews}
              </p>
              <p className="text-xs text-green-600 mt-1">↑ 12% vs last month</p>
            </div>
            <div className="w-12 h-12 bg-gbp-blue-100 rounded-lg flex items-center justify-center">
              <Star className="w-6 h-6 text-gbp-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Average Rating
              </p>
              <div className="flex items-center space-x-2 mt-1">
                <p className="text-2xl font-bold text-gray-900">
                  {averageRating.toFixed(1)}
                </p>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(averageRating)
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Average rating this year
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Response Rate</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {(
                  (reviews.filter((r) => r.replied).length / totalReviews) *
                  100
                ).toFixed(1)}
                %
              </p>
              <p className="text-xs text-gray-500 mt-1">Response rate</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Days since last review
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {daysSinceLastReview}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Days since last review
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Rating Distribution */}
        <div className="lg:col-span-2 bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Rating Distribution
          </h3>
          <div className="space-y-3">
            {ratingDistribution.map(({ rating, count, percentage }) => (
              <div key={rating} className="flex items-center space-x-4">
                <div className="flex items-center space-x-1 w-16">
                  <span className="text-sm font-medium text-gray-700">
                    {rating}
                  </span>
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                </div>
                <div className="flex-1">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gbp-success-500 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
                <span className="text-sm text-gray-600 w-8">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Review Request Box */}
        <div className="bg-gradient-to-br from-gbp-blue-500 to-gbp-blue-600 rounded-lg p-6 text-white">
          <h3 className="text-lg font-semibold mb-2">Review request link</h3>
          <p className="text-gbp-blue-100 text-sm mb-4">
            Here's your link for staff or put customers to get quick reviews.
          </p>

          <div className="bg-white rounded-lg p-3 mb-4">
            <input
              type="text"
              value="https://review.gptbusiness.com/A-R-Techno-Solutions-operators"
              readOnly
              className="w-full text-xs text-gray-600 bg-transparent border-none outline-none"
            />
          </div>

          <div className="flex items-center space-x-3 mb-4">
            <label className="flex items-center space-x-2 text-gbp-blue-100">
              <input
                type="checkbox"
                className="rounded text-gbp-blue-500"
                defaultChecked
              />
              <span className="text-sm">Embed reviews on your website</span>
            </label>
          </div>

          <div className="bg-white rounded-lg p-4 flex flex-col items-center">
            <div className="w-24 h-24 bg-black rounded-lg mb-3 flex items-center justify-center">
              <QrCode className="w-16 h-16 text-white" />
            </div>
            <p className="text-gray-900 text-sm font-medium mb-2">
              Get more reviews
            </p>
            <button className="bg-gbp-blue-500 text-white px-4 py-2 rounded text-sm">
              Download
            </button>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Average monthly reviews
          </h3>
          <div className="h-48 flex items-end justify-center space-x-4 px-4">
            {monthlyData.map((data) => {
              // Calculate height based on the maximum value in the dataset
              const maxReviews = Math.max(...monthlyData.map((d) => d.reviews));
              const minHeight = 8; // Minimum height for zero values
              const maxHeight = 160; // Maximum chart height
              const height =
                data.reviews === 0
                  ? minHeight
                  : Math.max(
                      minHeight,
                      (data.reviews / maxReviews) * maxHeight,
                    );

              return (
                <div
                  key={data.month}
                  className="flex flex-col items-center min-w-[60px]"
                >
                  {/* Review count label on top */}
                  <div className="mb-2 text-xs font-medium text-gray-700 h-4">
                    {data.reviews > 0 && data.reviews}
                  </div>

                  {/* Bar */}
                  <div
                    className={`w-12 rounded-t transition-all duration-300 ${
                      data.reviews === 0
                        ? "bg-gray-200"
                        : "bg-gradient-to-t from-gbp-blue-500 to-gbp-blue-400 hover:from-gbp-blue-600 hover:to-gbp-blue-500"
                    }`}
                    style={{ height: `${height}px` }}
                  ></div>

                  {/* Month label */}
                  <span className="text-xs text-gray-600 mt-2 font-medium">
                    {data.month}
                  </span>

                  {/* Response rate indicator */}
                  <div className="mt-1 flex items-center">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        data.responseRate === 100
                          ? "bg-green-500"
                          : data.responseRate > 0
                            ? "bg-yellow-500"
                            : "bg-gray-300"
                      }`}
                    ></div>
                    <span className="text-xs text-gray-500 ml-1">
                      {data.responseRate}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-4 flex items-center justify-center space-x-4 text-xs text-gray-600">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-gbp-blue-500 rounded mr-2"></div>
              <span>Reviews</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              <span>100% Response Rate</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
              <span>Partial Response</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-gray-300 rounded-full mr-2"></div>
              <span>No Response</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Days since last review
          </h3>
          <div className="h-48 flex items-center justify-center">
            <div className="text-center">
              <div className="w-32 h-32 rounded-full border-8 border-gbp-blue-500 flex items-center justify-center mb-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {daysSinceLastReview}
                  </p>

                  <p className="text-xs text-gray-500">days</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Last review was{" "}
                {latestReviewDate
                  ? latestReviewDate.toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Ideas to get more reviews */}
      <div className="bg-white rounded-lg p-6 border border-gray-200 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Ideas to get more reviews
        </h3>
        <div className="space-y-3">
          <div className="flex items-start space-x-3 p-3 bg-gbp-blue-50 rounded-lg">
            <div className="w-2 h-2 bg-gbp-blue-500 rounded-full mt-2"></div>
            <p className="text-sm text-gray-700">
              Send your review request and register a QR code outside your
              business with a QR code saying 'We'd love a review! You can either
              include reviews on a business card, or use displays and register
              for the google. Please leave your QR code in the customers may the
              first option directly.
            </p>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Reviews</h3>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-200 rounded px-3 py-1 text-sm"
                >
                  <option value="latest">Latest</option>
                  <option value="oldest">Oldest</option>
                  <option value="rating-high">Highest Rating</option>
                  <option value="rating-low">Lowest Rating</option>
                </select>
              </div>
              <button className="border border-gray-200 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-50">
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {reviews.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No reviews</p>
              <button className="mt-4 bg-gbp-blue-500 text-white px-6 py-2 rounded-lg">
                Load More
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {(() => {
                const sortedReviews = [...reviews].sort((a, b) => {
                  switch (sortBy) {
                    case "latest":
                      return (
                        new Date(b.date).getTime() - new Date(a.date).getTime()
                      );
                    case "oldest":
                      return (
                        new Date(a.date).getTime() - new Date(b.date).getTime()
                      );
                    case "rating-high":
                      return b.rating - a.rating;
                    case "rating-low":
                      return a.rating - b.rating;
                    default:
                      return 0;
                  }
                });

                return sortedReviews.map((review) => (
                  <div
                    key={review.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-gray-600">
                              {review.author
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {review.author}
                            </p>
                            <div className="flex items-center space-x-2">
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < review.rating
                                        ? "text-yellow-400 fill-current"
                                        : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-xs text-gray-500">
                                {review.date}
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-700 text-sm mb-3">
                          {review.text}
                        </p>
                        <div className="flex items-center space-x-3">
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              review.sentiment === "positive"
                                ? "bg-green-100 text-green-700"
                                : review.sentiment === "negative"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {review.sentiment}
                          </span>
                          {review.replied ? (
                            <span className="text-xs text-gray-500">
                              ✓ Replied
                            </span>
                          ) : (
                            <button className="text-xs text-gbp-blue-600 hover:text-gbp-blue-700">
                              Reply
                            </button>
                          )}
                        </div>
                      </div>
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ));
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
