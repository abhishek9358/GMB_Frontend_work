// import { useState, useEffect, useMemo, useRef } from "react";
// import {
//   Star,
//   Download,
//   QrCode,
//   MessageSquare,
//   Filter,
//   MoreHorizontal,
//   Loader2,
//   Trash2,
// } from "lucide-react";
// import axios from "axios";
// import { SERVER } from "@/constants";
// import * as XLSX from "xlsx";
// import { useSelector } from "react-redux";
// import { RootState } from "@/redux/store";
// import QRCodeSVG from "react-qr-code";

// interface Review {
//   id: string;
//   reviewId: string;
//   author: string;
//   rating: number;
//   text: string;
//   date: string;
//   sentiment: "positive" | "negative" | "neutral";
//   replied: boolean;
//   ownerReplyText: string;
//   isEditingReply: boolean;
//   updateTime: string;
// }

// // Helper to get month name
// const getMonthName = (monthIndex: number) => {
//   const date = new Date();
//   date.setMonth(monthIndex);
//   return date.toLocaleString("en-US", { month: "short" });
// };

// // Helper to parse star rating (can be string like "FIVE", "FOUR", etc. or number)
// const parseStarRating = (starRating: any): number => {
//   if (typeof starRating === "number") return starRating;
//   if (typeof starRating === "string") {
//     const ratingMap: { [key: string]: number } = {
//       ONE: 1,
//       TWO: 2,
//       THREE: 3,
//       FOUR: 4,
//       FIVE: 5,
//     };
//     return ratingMap[starRating.toUpperCase()] || 0;
//   }
//   return 0;
// };

// export default function Reviews() {
//   const [reviews, setReviews] = useState<Review[]>([]);
//   const [totalReviewsCount, setTotalReviewsCount] = useState<number>(0);
//   const [averageRating, setAverageRating] = useState<number>(0);
//   const [sortBy, setSortBy] = useState("latest");
//   const [filterRating, setFilterRating] = useState("all");
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [primaryReviewLink, setPrimaryReviewLink] = useState<string>("");
//   const [savingReplyId, setSavingReplyId] = useState<string | null>(null);
//   const [deletingReplyId, setDeletingReplyId] = useState<string | null>(null);
//   const [placeId, setPlaceId] = useState<string>("");

//   const { activeLocation } = useSelector((state: RootState) => state.activeLocation);

//   // Helper function to extract clean location ID (removes "locations/" prefix if present)
//   const extractLocationId = (rawLocationId: string | null | undefined): string => {
//     if (!rawLocationId) return "";
//     // Remove "locations/" prefix if it exists
//     return rawLocationId.replace(/^locations\//, "");
//   };

//   // Get location ID from localStorage or Redux state and clean it
//   const rawLocationId = localStorage.getItem("activeLocation") || activeLocation?.locationId || "";
//   const locationId = extractLocationId(rawLocationId);
  
//   // Get account ID - MAKE SURE THIS IS SET IN YOUR APP
//   // You can set it like: localStorage.setItem("accountId", "116574816291503260287");
//   const accountId = localStorage.getItem("accountId") || "116574816291503260287"; // Default for testing

//   // Ref for the QR code canvas to facilitate download
//   const qrCodeRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     const fetchReviews = async () => {
//       if (!locationId) {
//         setError("No location ID found. Please select a location.");
//         setLoading(false);
//         return;
//       }

//       try {
//         setLoading(true);
//         setError(null);

//         // Construct the correct API URL matching your Postman request
//         // Format: /api/v1/reviews/{location_id}/all?account_id={account_id}
//         const url = `${SERVER}/api/v1/reviews/${locationId}/all?account_id=${accountId}`;
        
//         console.log("🔍 Fetching reviews from:", url);
//         console.log("📍 Raw Location ID:", rawLocationId);
//         console.log("✨ Cleaned Location ID:", locationId);

//         const response = await axios.get(url, { 
//           withCredentials: true,
//           headers: {
//             'Content-Type': 'application/json',
//           }
//         });

//         console.log("✅ API Response received:", {
//           totalFetched: response.data.totalFetched,
//           pagesProcessed: response.data.pagesProcessed,
//           reviewsCount: response.data.reviews?.length
//         });

//         // Map the backend response to frontend format
//         const mappedReviews: Review[] = (response.data.reviews || []).map(
//           (review: any) => {
//             const rating = parseStarRating(review.starRating);
//             const createTime = review.createTime ? new Date(review.createTime) : new Date();
            
//             return {
//               id: review.reviewId || review.name || Math.random().toString(36).substring(2, 11),
//               reviewId: review.reviewId,
//               author: review.reviewer?.displayName || "Anonymous",
//               rating: rating,
//               text: review.comment || "",
//               date: createTime.toISOString().split("T")[0],
//               updateTime: review.updateTime || review.createTime || "",
//               sentiment:
//                 rating >= 4
//                   ? "positive"
//                   : rating <= 2
//                   ? "negative"
//                   : "neutral",
//               replied: !!review.reviewReply,
//               ownerReplyText: review.reviewReply?.comment || "",
//               isEditingReply: false,
//             };
//           }
//         );

//         console.log(`✅ Mapped ${mappedReviews.length} reviews`);

//         setReviews(mappedReviews);
//         setTotalReviewsCount(response.data.totalReviewCount || response.data.totalFetched || mappedReviews.length);
//         setAverageRating(response.data.averageRating || 0);
        
//         // Get place_id from backend response
//         if (response.data.placeId) {
//           const receivedPlaceId = response.data.placeId;
//           console.log("✅ Place ID received from backend:", receivedPlaceId);
//           setPlaceId(receivedPlaceId);
//           localStorage.setItem("placeId", receivedPlaceId); // Store for future use
          
//           // Generate review link
//           const reviewLink = `https://search.google.com/local/writereview?placeid=${receivedPlaceId}`;
//           setPrimaryReviewLink(reviewLink);
//           console.log("🔗 Generated review link from backend place_id:", reviewLink);
//         } else {
//           console.warn("⚠️ No place_id in backend response");
//         }
        
//         setLoading(false);
//       } catch (err: any) {
//         console.error("❌ Failed to fetch reviews:", err);
//         console.error("Error details:", {
//           status: err.response?.status,
//           statusText: err.response?.statusText,
//           data: err.response?.data,
//           url: err.config?.url
//         });
        
//         let errorMessage = "Failed to fetch reviews";
        
//         if (err.response?.status === 401) {
//           errorMessage = "Authentication required. Please log in again.";
//         } else if (err.response?.status === 403) {
//           errorMessage = "Access denied. Check your permissions for this location.";
//         } else if (err.response?.status === 404) {
//           errorMessage = `Location not found. Please verify location ID: ${locationId}`;
//         } else if (err.response?.data?.detail) {
//           errorMessage = err.response.data.detail;
//         }
        
//         setError(errorMessage);
//         setLoading(false);
//       }
//     };

//     fetchReviews();
//   }, [rawLocationId, accountId, SERVER, activeLocation?.placeId]);

//   // Separate useEffect to fetch place_id ONLY if not received from backend
//   useEffect(() => {
//     const getPlaceIdFallback = async () => {
//       // Only run this if we don't already have place_id from the reviews API
//       if (placeId) {
//         console.log("✅ Place ID already set from backend:", placeId);
//         return;
//       }

//       // Try to get place_id from fallback sources
//       let foundPlaceId = "";

//       // 1. Check localStorage (might be from previous session)
//       const storedPlaceId = localStorage.getItem("placeId");
//       if (storedPlaceId) {
//         foundPlaceId = storedPlaceId;
//         console.log("✅ Place ID from localStorage (fallback):", foundPlaceId);
//       }
//       // 2. Check Redux state
//       else if (activeLocation?.placeId) {
//         foundPlaceId = activeLocation.placeId;
//         console.log("✅ Place ID from Redux (fallback):", foundPlaceId);
//       }

//       // Set the place_id state if found
//       if (foundPlaceId) {
//         setPlaceId(foundPlaceId);
        
//         // Generate review link
//         const reviewLink = `https://search.google.com/local/writereview?placeid=${foundPlaceId}`;
//         setPrimaryReviewLink(reviewLink);
//         console.log("🔗 Generated review link from fallback:", reviewLink);
//       } else {
//         console.warn("⚠️ No place_id available from any source.");
//         console.log("💡 Backend should provide place_id automatically. Check if include_place_id=true in API call.");
//       }
//     };

//     // Wait a bit for the reviews API to complete and potentially set place_id
//     const timer = setTimeout(() => {
//       if (locationId && !placeId && !loading) {
//         getPlaceIdFallback();
//       }
//     }, 1000);

//     return () => clearTimeout(timer);
//   }, [locationId, placeId, activeLocation?.placeId, loading]);

//   // Handler for toggling edit mode for an owner's reply
//   const handleEditToggle = (id: string) => {
//     setReviews((prevReviews) =>
//       prevReviews.map((review) =>
//         review.id === id
//           ? { ...review, isEditingReply: !review.isEditingReply }
//           : review
//       )
//     );
//   };

//   // Handler for updating owner's reply text
//   const handleOwnerResponseChange = (id: string, newResponse: string) => {
//     setReviews((prevReviews) =>
//       prevReviews.map((review) =>
//         review.id === id ? { ...review, ownerReplyText: newResponse } : review
//       )
//     );
//   };

//   // Handler for saving owner's reply using the new API
//   const handleSaveResponse = async (id: string) => {
//     const reviewToUpdate = reviews.find((review) => review.id === id);
//     if (!reviewToUpdate || !reviewToUpdate.ownerReplyText.trim()) {
//       alert("Please enter a response before saving");
//       return;
//     }

//     setSavingReplyId(id);

//     try {
//       // Build the API URL for replying to a review
//       // Format: /api/v1/reviews/{location_id}/{review_id}/reply?account_id={account_id}
//       const url = `${SERVER}/api/v1/reviews/${locationId}/${reviewToUpdate.reviewId}/reply?account_id=${accountId}`;

//       console.log("💾 Saving reply to:", url);
//       console.log("📝 Review ID:", reviewToUpdate.reviewId);
//       console.log("📍 Location ID:", locationId);
//       console.log("🔑 Account ID:", accountId);

//       const response = await axios.put(
//         url,
//         { comment: reviewToUpdate.ownerReplyText },
//         { 
//           withCredentials: true,
//           headers: {
//             'Content-Type': 'application/json',
//           }
//         }
//       );

//       console.log("✅ Reply saved successfully:", response.data);

//       // Update local state after successful API call
//       setReviews((prevReviews) =>
//         prevReviews.map((review) =>
//           review.id === id
//             ? { ...review, isEditingReply: false, replied: true }
//             : review
//         )
//       );

//       alert("Reply posted successfully!");
//     } catch (error: any) {
//       console.error("❌ Failed to save reply:", error);
//       console.error("Error details:", {
//         status: error.response?.status,
//         statusText: error.response?.statusText,
//         data: error.response?.data,
//         url: error.config?.url
//       });
      
//       let errorMessage = "Failed to save reply";
      
//       if (error.response?.status === 401) {
//         errorMessage = "Authentication expired. Please refresh the page and try again.";
//       } else if (error.response?.status === 403) {
//         errorMessage = "You don't have permission to reply to this review.";
//       } else if (error.response?.status === 404) {
//         errorMessage = "Review not found. It may have been deleted.";
//       } else if (error.response?.data?.detail) {
//         errorMessage = typeof error.response.data.detail === 'string' 
//           ? error.response.data.detail 
//           : JSON.stringify(error.response.data.detail);
//       }
      
//       alert(`Error: ${errorMessage}`);
//     } finally {
//       setSavingReplyId(null);
//     }
//   };

//   // Handler for deleting owner's reply using the new API
//   const handleDeleteResponse = async (id: string) => {
//     const reviewToUpdate = reviews.find((review) => review.id === id);
//     if (!reviewToUpdate) return;

//     if (!confirm("Are you sure you want to delete this reply?")) return;

//     setDeletingReplyId(id);

//     try {
//       // Build the API URL for deleting a review reply
//       // Format: /api/v1/reviews/{location_id}/{review_id}/reply?account_id={account_id}
//       const url = `${SERVER}/api/v1/reviews/${locationId}/${reviewToUpdate.reviewId}/reply?account_id=${accountId}`;

//       console.log("🗑️ Deleting reply from:", url);
//       console.log("📝 Review ID:", reviewToUpdate.reviewId);
//       console.log("📍 Location ID:", locationId);
//       console.log("🔑 Account ID:", accountId);

//       await axios.delete(url, { 
//         withCredentials: true,
//         headers: {
//           'Content-Type': 'application/json',
//         }
//       });

//       console.log("✅ Reply deleted successfully");

//       // Update local state after successful deletion
//       setReviews((prevReviews) =>
//         prevReviews.map((review) =>
//           review.id === id
//             ? { ...review, ownerReplyText: "", replied: false, isEditingReply: false }
//             : review
//         )
//       );

//       alert("Reply deleted successfully!");
//     } catch (error: any) {
//       console.error("❌ Failed to delete reply:", error);
//       console.error("Error details:", {
//         status: error.response?.status,
//         statusText: error.response?.statusText,
//         data: error.response?.data,
//         url: error.config?.url
//       });
      
//       let errorMessage = "Failed to delete reply";
      
//       if (error.response?.status === 401) {
//         errorMessage = "Authentication expired. Please refresh the page and try again.";
//       } else if (error.response?.status === 403) {
//         errorMessage = "You don't have permission to delete this reply.";
//       } else if (error.response?.status === 404) {
//         errorMessage = "Reply not found. It may have already been deleted.";
//       } else if (error.response?.data?.detail) {
//         errorMessage = typeof error.response.data.detail === 'string' 
//           ? error.response.data.detail 
//           : JSON.stringify(error.response.data.detail);
//       }
      
//       alert(`Error: ${errorMessage}`);
//     } finally {
//       setDeletingReplyId(null);
//     }
//   };

//   // Filter and Sort Logic (Memoized for performance)
//   const filteredReviews = useMemo(() => {
//     return reviews.filter((review) => {
//       if (filterRating === "all") return true;
//       return review.rating === parseInt(filterRating);
//     });
//   }, [reviews, filterRating]);

//   const sortedReviews = useMemo(() => {
//     return [...filteredReviews].sort((a, b) => {
//       switch (sortBy) {
//         case "latest":
//           return new Date(b.date).getTime() - new Date(a.date).getTime();
//         case "oldest":
//           return new Date(a.date).getTime() - new Date(b.date).getTime();
//         case "rating-high":
//           return b.rating - a.rating;
//         case "rating-low":
//           return a.rating - b.rating;
//         default:
//           return 0;
//       }
//     });
//   }, [filteredReviews, sortBy]);

//   const totalReviews = totalReviewsCount;
//   const calculatedAverageRating = averageRating || 
//     (reviews.length > 0
//       ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
//       : 0);
      
//   const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
//     rating,
//     count: reviews.filter((r) => r.rating === rating).length,
//     percentage:
//       (reviews.filter((r) => r.rating === rating).length / reviews.length) *
//       100 || 0,
//   }));

//   // Dynamic Monthly Reviews Data Calculation
//   const currentYear = new Date().getFullYear();
//   const monthlyData = useMemo(() => {
//     const monthMap = new Map<number, { reviews: number; repliedReviews: number }>();
    
//     for (let i = 0; i < 12; i++) {
//       monthMap.set(i, { reviews: 0, repliedReviews: 0 });
//     }

//     reviews.forEach((review) => {
//       const reviewDate = new Date(review.date);
//       if (reviewDate.getFullYear() === currentYear) {
//         const month = reviewDate.getMonth();
//         const data = monthMap.get(month)!;
//         data.reviews++;
//         if (review.replied) {
//           data.repliedReviews++;
//         }
//       }
//     });

//     return Array.from(monthMap.entries())
//       .sort(([monthA], [monthB]) => monthA - monthB)
//       .map(([monthIndex, data]) => ({
//         month: getMonthName(monthIndex),
//         reviews: data.reviews,
//         responseRate:
//           data.reviews > 0
//             ? Math.round((data.repliedReviews / data.reviews) * 100)
//             : 0,
//       }));
//   }, [reviews, currentYear]);

//   if (loading) {
//     return (
//       <div className="p-6 flex items-center justify-center min-h-screen">
//         <div className="text-center">
//           <Loader2 className="w-12 h-12 text-gbp-blue-500 animate-spin mx-auto mb-4" />
//           <p className="text-gray-600 text-lg font-medium">Loading reviews...</p>
//           <p className="text-gray-500 text-sm mt-2">This may take a moment for large datasets</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="p-6">
//         <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-2xl mx-auto">
//           <div className="flex items-start space-x-3">
//             <div className="flex-shrink-0">
//               <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//               </svg>
//             </div>
//             <div className="flex-1">
//               <h3 className="text-red-800 font-semibold text-lg mb-2">Error Loading Reviews</h3>
//               <p className="text-red-600 mb-4">{error}</p>
//               <div className="bg-white border border-red-200 rounded p-3 mb-4">
//                 <p className="text-sm text-gray-700 font-mono">
//                   Raw Location ID: {rawLocationId || "Not set"}<br />
//                   Cleaned Location ID: {locationId || "Not set"}<br />
//                   Account ID: {accountId || "Not set"}<br />
//                   Place ID: {placeId || "Not set"}
//                 </p>
//               </div>
//               <button
//                 onClick={() => window.location.reload()}
//                 className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
//               >
//                 Retry
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // Get latest review date
//   const latestReviewDate = reviews.length
//     ? new Date(Math.max(...reviews.map((r) => new Date(r.date).getTime())))
//     : null;

//   const daysSinceLastReview = latestReviewDate
//     ? Math.floor(
//         (Date.now() - latestReviewDate.getTime()) / (1000 * 60 * 60 * 24)
//       )
//     : 0;

//   const exportToCSV = () => {
//     if (reviews.length === 0) return;

//     const reviewsToExport = [...sortedReviews];

//     const data = reviewsToExport.map((r) => ({
//       Author: r.author,
//       Rating: r.rating,
//       Review: r.text,
//       Date: r.date,
//       Sentiment: r.sentiment,
//       Replied: r.replied ? "Yes" : "No",
//       OwnerReply: r.ownerReplyText || "N/A",
//     }));

//     const worksheet = XLSX.utils.json_to_sheet(data);
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, "Reviews");

//     XLSX.writeFile(workbook, `reviews_${locationId}_${new Date().toISOString().split('T')[0]}.xlsx`);
//   };

//   // Function to download the QR code
//   const downloadQrCode = () => {
//     if (qrCodeRef.current) {
//       const svg = qrCodeRef.current.querySelector('svg');
//       if (svg) {
//         const svgData = new XMLSerializer().serializeToString(svg);
//         const canvas = document.createElement("canvas");
//         const ctx = canvas.getContext("2d");
//         const img = new Image();
        
//         canvas.width = 512;
//         canvas.height = 512;
        
//         img.onload = () => {
//           ctx?.drawImage(img, 0, 0, 512, 512);
//           const url = canvas.toDataURL("image/png");
//           const link = document.createElement("a");
//           link.href = url;
//           link.download = "review_qr_code.png";
//           document.body.appendChild(link);
//           link.click();
//           document.body.removeChild(link);
//         };
        
//         img.src = "data:image/svg+xml;base64," + btoa(svgData);
//       }
//     }
//   };

//   return (
//     <div className="p-6 bg-gray-50 min-h-full">
//       {/* Debug Info (Remove in production) */}
//       <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-xs">
//         <strong>Debug Info:</strong> Raw Location: {rawLocationId} | Cleaned Location: {locationId} | Account: {accountId} | Place ID: {placeId || "Not found"} | Reviews: {reviews.length}
//       </div>

//       {/* Header */}
//       <div className="flex items-center justify-between mb-6">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>
//           <p className="text-gray-600 mt-1">
//             Manage and respond to customer reviews
//           </p>
//         </div>
//         <div className="flex items-center space-x-3">
//           <button
//             onClick={exportToCSV}
//             disabled={reviews.length === 0}
//             className="border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             <Download className="w-4 h-4" />
//             <span>Export</span>
//           </button>

//           <button className="bg-gbp-blue-500 text-white px-4 py-2 rounded-lg hover:bg-gbp-blue-600 flex items-center space-x-2">
//             <MessageSquare className="w-4 h-4" />
//             <span>Request Reviews</span>
//           </button>
//         </div>
//       </div>

//       {/* Stats Overview */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
//         <div className="bg-white rounded-lg p-6 border border-gray-200">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm font-medium text-gray-600">Total Reviews</p>
//               <p className="text-2xl font-bold text-gray-900 mt-1">
//                 {totalReviews}
//               </p>
//             </div>
//             <div className="w-12 h-12 bg-gbp-blue-100 rounded-lg flex items-center justify-center">
//               <Star className="w-6 h-6 text-gbp-blue-600" />
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-lg p-6 border border-gray-200">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm font-medium text-gray-600">
//                 Average Rating
//               </p>
//               <div className="flex items-center space-x-2 mt-1">
//                 <p className="text-2xl font-bold text-gray-900">
//                   {calculatedAverageRating.toFixed(1)}
//                 </p>
//                 <div className="flex">
//                   {[...Array(5)].map((_, i) => (
//                     <Star
//                       key={i}
//                       className={`w-4 h-4 ${
//                         i < Math.floor(calculatedAverageRating)
//                           ? "text-yellow-400 fill-current"
//                           : "text-gray-300"
//                       }`}
//                     />
//                   ))}
//                 </div>
//               </div>
//               <p className="text-xs text-gray-500 mt-1">
//                 Based on {reviews.length} reviews
//               </p>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-lg p-6 border border-gray-200">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm font-medium text-gray-600">Response Rate</p>
//               <p className="text-2xl font-bold text-gray-900 mt-1">
//                 {reviews.length > 0
//                   ? (
//                       (reviews.filter((r) => r.replied).length / reviews.length) *
//                       100
//                     ).toFixed(1)
//                   : "0.0"}
//                 %
//               </p>
//               <p className="text-xs text-gray-500 mt-1">
//                 {reviews.filter((r) => r.replied).length} of {reviews.length} replied
//               </p>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-lg p-6 border border-gray-200">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm font-medium text-gray-600">
//                 Last Review
//               </p>
//               <p className="text-2xl font-bold text-gray-900 mt-1">
//                 {daysSinceLastReview}
//               </p>
//               <p className="text-xs text-gray-500 mt-1">
//                 days ago
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Main Content Grid */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
//         {/* Rating Distribution */}
//         <div className="lg:col-span-2 bg-white rounded-lg p-6 border border-gray-200">
//           <h3 className="text-lg font-semibold text-gray-900 mb-4">
//             Rating Distribution
//           </h3>
//           <div className="space-y-3">
//             {ratingDistribution.map(({ rating, count, percentage }) => (
//               <div key={rating} className="flex items-center space-x-4">
//                 <div className="flex items-center space-x-1 w-16">
//                   <span className="text-sm font-medium text-gray-700">
//                     {rating}
//                   </span>
//                   <Star className="w-4 h-4 text-yellow-400 fill-current" />
//                 </div>
//                 <div className="flex-1">
//                   <div className="w-full bg-gray-200 rounded-full h-2">
//                     <div
//                       className="bg-gbp-success-500 h-2 rounded-full transition-all duration-300"
//                       style={{ width: `${percentage}%` }}
//                     ></div>
//                   </div>
//                 </div>
//                 <span className="text-sm text-gray-600 w-8">{count}</span>
//               </div>
//             ))}
//           </div>
//           <p className="text-xs text-gray-500 mt-4">
//             Based on {reviews.length} reviews
//           </p>
//         </div>

//         {/* Review Request Box */}
//         <div className="bg-gradient-to-br from-gbp-blue-500 to-gbp-blue-600 rounded-lg p-6 text-white">
//           <h3 className="text-lg font-semibold mb-2">Review request link</h3>
//           <p className="text-gbp-blue-100 text-sm mb-4">
//             Here's your link for staff or customers to get quick reviews.
//           </p>

//           <div className="bg-white rounded-lg p-3 mb-4">
//             <input
//               type="text"
//               value={primaryReviewLink || "Loading link..."}
//               readOnly
//               className="w-full text-xs text-gray-600 bg-transparent border-none outline-none"
//               onClick={(e) => {
//                 if (primaryReviewLink) {
//                   e.currentTarget.select();
//                   navigator.clipboard.writeText(primaryReviewLink);
//                 }
//               }}
//               title={primaryReviewLink ? "Click to copy" : ""}
//             />
//           </div>

//           {!primaryReviewLink && !loading && (
//             <div className="bg-yellow-500 bg-opacity-20 border border-yellow-300 rounded-lg p-3 mb-4">
//               <p className="text-xs text-white">
//                 ⚠️ Place ID not available.<br />
//                 The backend should automatically provide this. Check API logs.
//               </p>
//             </div>
//           )}

//           <div className="flex items-center space-x-3 mb-4">
//             <label className="flex items-center space-x-2 text-gbp-blue-100 cursor-pointer">
//               <input
//                 type="checkbox"
//                 className="rounded text-gbp-blue-500"
//                 defaultChecked
//               />
//               <span className="text-sm">Embed reviews on your website</span>
//             </label>
//           </div>

//           <div className="bg-white rounded-lg p-4 flex flex-col items-center">
//             <div 
//               className="w-24 h-24 rounded-lg mb-3 flex items-center justify-center bg-white" 
//               ref={qrCodeRef}
//             >
//               {primaryReviewLink ? (
//                 <QRCodeSVG value={primaryReviewLink} size={96} level="H" />
//               ) : (
//                 <QrCode className="w-16 h-16 text-gray-400" />
//               )}
//             </div>
//             <p className="text-gray-900 text-sm font-medium mb-2">
//               {primaryReviewLink ? "Scan to leave a review" : "QR code unavailable"}
//             </p>
//             <button
//               onClick={downloadQrCode}
//               disabled={!primaryReviewLink}
//               className="bg-gbp-blue-500 text-white px-4 py-2 rounded text-sm hover:bg-gbp-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//             >
//               Download QR Code
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Charts */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
//         {/* Monthly Reviews Chart */}
//         <div className="bg-white rounded-lg p-5 border border-gray-200">
//           <h3 className="text-base font-semibold text-gray-900 mb-3">
//             Monthly Reviews ({currentYear})
//           </h3>
//           <div className="h-40 flex items-end justify-between space-x-2 px-2">
//             {monthlyData.map((data) => {
//               const maxReviews = Math.max(
//                 ...monthlyData.map((d) => d.reviews),
//                 1
//               );
//               const minHeight = 6;
//               const maxHeight = 120;
//               const height =
//                 data.reviews === 0
//                   ? minHeight
//                   : Math.max(
//                       minHeight,
//                       (data.reviews / maxReviews) * maxHeight
//                     );

//               return (
//                 <div
//                   key={data.month}
//                   className="flex flex-col items-center flex-1"
//                 >
//                   <div className="mb-1 text-[10px] font-semibold text-gray-700 h-3">
//                     {data.reviews > 0 ? data.reviews : ""}
//                   </div>

//                   <div
//                     className={`w-full max-w-[40px] rounded-t transition-all duration-300 ${
//                       data.reviews === 0
//                         ? "bg-gray-200"
//                         : "bg-gradient-to-t from-gbp-blue-500 to-gbp-blue-400"
//                     }`}
//                     style={{ height: `${height}px` }}
//                   ></div>

//                   <span className="text-[11px] text-gray-700 mt-1.5 font-medium">
//                     {data.month}
//                   </span>

//                   <div className="mt-0.5 flex items-center justify-center">
//                     <div
//                       className={`w-1.5 h-1.5 rounded-full ${
//                         data.responseRate === 100
//                           ? "bg-green-500"
//                           : data.responseRate > 0
//                           ? "bg-yellow-500"
//                           : "bg-gray-300"
//                       }`}
//                     ></div>
//                     <span className="text-[10px] text-gray-500 ml-1">
//                       {data.responseRate}%
//                     </span>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>

//           <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-center space-x-4 text-[11px] text-gray-600">
//             <div className="flex items-center">
//               <div className="w-2.5 h-2.5 bg-gbp-blue-500 rounded mr-1.5"></div>
//               <span>Reviews</span>
//             </div>
//             <div className="flex items-center">
//               <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></div>
//               <span>100% Response</span>
//             </div>
//             <div className="flex items-center">
//               <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mr-1.5"></div>
//               <span>Partial</span>
//             </div>
//           </div>
//         </div>

//         {/* Days Since Last Review */}
//         <div className="bg-white rounded-lg p-5 border border-gray-200">
//           <h3 className="text-base font-semibold text-gray-900 mb-3">
//             Days since last review
//           </h3>
//           <div className="h-40 flex items-center justify-center">
//             <div className="text-center">
//               <div className="relative inline-flex items-center justify-center">
//                 <svg className="w-36 h-36 transform -rotate-90">
//                   <circle
//                     cx="72"
//                     cy="72"
//                     r="60"
//                     stroke="#E5E7EB"
//                     strokeWidth="10"
//                     fill="none"
//                   />
//                   <circle
//                     cx="72"
//                     cy="72"
//                     r="60"
//                     stroke="#3B82F6"
//                     strokeWidth="10"
//                     fill="none"
//                     strokeLinecap="round"
//                     strokeDasharray={`${2 * Math.PI * 60}`}
//                     strokeDashoffset="0"
//                   />
//                 </svg>
//                 <div className="absolute inset-0 flex flex-col items-center justify-center">
//                   <p className="text-4xl font-bold text-gray-900">
//                     {daysSinceLastReview}
//                   </p>
//                   <p className="text-xs text-gray-500 mt-1">days</p>
//                 </div>
//               </div>
//               <p className="text-xs text-gray-600 mt-3">
//                 Last review: {latestReviewDate
//                   ? latestReviewDate.toLocaleDateString('en-US', { 
//                       month: '2-digit', 
//                       day: '2-digit', 
//                       year: 'numeric' 
//                     })
//                   : "N/A"}
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Reviews List */}
//       <div className="bg-white rounded-lg border border-gray-200">
//         <div className="p-6 border-b border-gray-200">
//           <div className="flex items-center justify-between">
//             <h3 className="text-lg font-semibold text-gray-900">
//               All Reviews ({sortedReviews.length})
//             </h3>
//             <div className="flex items-center space-x-3">
//               <div className="flex items-center space-x-2">
//                 <span className="text-sm text-gray-600">Sort:</span>
//                 <select
//                   value={sortBy}
//                   onChange={(e) => setSortBy(e.target.value)}
//                   className="border border-gray-200 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-gbp-blue-500"
//                 >
//                   <option value="latest">Latest</option>
//                   <option value="oldest">Oldest</option>
//                   <option value="rating-high">Highest Rating</option>
//                   <option value="rating-low">Lowest Rating</option>
//                 </select>
//               </div>
//               <div className="flex items-center space-x-2">
//                 <span className="text-sm text-gray-600">Filter:</span>
//                 <select
//                   value={filterRating}
//                   onChange={(e) => setFilterRating(e.target.value)}
//                   className="border border-gray-200 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-gbp-blue-500"
//                 >
//                   <option value="all">All Ratings</option>
//                   <option value="5">5 Stars</option>
//                   <option value="4">4 Stars</option>
//                   <option value="3">3 Stars</option>
//                   <option value="2">2 Stars</option>
//                   <option value="1">1 Star</option>
//                 </select>
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="p-6">
//           {sortedReviews.length === 0 ? (
//             <div className="text-center py-12">
//               <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
//               <p className="text-gray-500 text-lg mb-2">No reviews found</p>
//               <p className="text-gray-400 text-sm mb-6">
//                 {filterRating !== "all" 
//                   ? "Try changing your filter settings"
//                   : "Start collecting reviews from your customers"}
//               </p>
//               {filterRating === "all" && (
//                 <button className="bg-gbp-blue-500 text-white px-6 py-3 rounded-lg hover:bg-gbp-blue-600 transition-colors">
//                   Request Reviews
//                 </button>
//               )}
//             </div>
//           ) : (
//             <div className="space-y-4">
//               {sortedReviews.map((review) => (
//                 <div
//                   key={review.id}
//                   className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
//                 >
//                   <div className="flex items-start justify-between">
//                     <div className="flex-1">
//                       <div className="flex items-center space-x-3 mb-2">
//                         <div className="w-10 h-10 bg-gradient-to-br from-gbp-blue-400 to-gbp-blue-600 rounded-full flex items-center justify-center">
//                           <span className="text-sm font-semibold text-white">
//                             {review.author
//                               .split(" ")
//                               .map((n) => n[0])
//                               .join("")
//                               .substring(0, 2)}
//                           </span>
//                         </div>
//                         <div>
//                           <p className="font-semibold text-gray-900">
//                             {review.author}
//                           </p>
//                           <div className="flex items-center space-x-2">
//                             <div className="flex">
//                               {[...Array(5)].map((_, i) => (
//                                 <Star
//                                   key={i}
//                                   className={`w-4 h-4 ${
//                                     i < review.rating
//                                       ? "text-yellow-400 fill-current"
//                                       : "text-gray-300"
//                                   }`}
//                                 />
//                               ))}
//                             </div>
//                             <span className="text-xs text-gray-500">
//                               {review.date}
//                             </span>
//                           </div>
//                         </div>
//                       </div>
                      
//                       {review.text && (
//                         <p className="text-gray-700 text-sm mb-3 leading-relaxed">
//                           {review.text}
//                         </p>
//                       )}
                      
//                       <div className="flex items-center space-x-3 mb-3">
//                         <span
//                           className={`text-xs px-2.5 py-1 rounded-full font-medium ${
//                             review.sentiment === "positive"
//                               ? "bg-green-100 text-green-700"
//                               : review.sentiment === "negative"
//                               ? "bg-red-100 text-red-700"
//                               : "bg-gray-100 text-gray-700"
//                           }`}
//                         >
//                           {review.sentiment}
//                         </span>
//                       </div>

//                       {/* Owner Response Section */}
//                       <div className="mt-4 pt-4 border-t border-gray-100">
//                         <div className="flex items-center justify-between mb-2">
//                           <p className="text-sm font-semibold text-gray-800">
//                             Owner's Response
//                           </p>
//                           {review.replied && !review.isEditingReply && (
//                             <button
//                               onClick={() => handleDeleteResponse(review.id)}
//                               disabled={deletingReplyId === review.id}
//                               className="text-red-600 hover:text-red-700 text-xs flex items-center space-x-1 disabled:opacity-50"
//                             >
//                               {deletingReplyId === review.id ? (
//                                 <Loader2 className="w-3 h-3 animate-spin" />
//                               ) : (
//                                 <Trash2 className="w-3 h-3" />
//                               )}
//                               <span>Delete</span>
//                             </button>
//                           )}
//                         </div>
                        
//                         {review.isEditingReply ? (
//                           <div>
//                             <textarea
//                               className="w-full p-3 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-gbp-blue-500 focus:border-gbp-blue-500 transition-all"
//                               rows={3}
//                               value={review.ownerReplyText}
//                               onChange={(e) =>
//                                 handleOwnerResponseChange(review.id, e.target.value)
//                               }
//                               placeholder="Write your response..."
//                             />
//                             <div className="flex justify-end mt-2 space-x-2">
//                               <button
//                                 onClick={() => handleEditToggle(review.id)}
//                                 className="text-gray-600 border border-gray-300 px-4 py-1.5 rounded-md text-sm hover:bg-gray-50 transition-colors"
//                                 disabled={savingReplyId === review.id}
//                               >
//                                 Cancel
//                               </button>
//                               <button
//                                 onClick={() => handleSaveResponse(review.id)}
//                                 disabled={savingReplyId === review.id || !review.ownerReplyText.trim()}
//                                 className="bg-gbp-blue-500 text-white px-4 py-1.5 rounded-md text-sm hover:bg-gbp-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
//                               >
//                                 {savingReplyId === review.id && (
//                                   <Loader2 className="w-4 h-4 animate-spin" />
//                                 )}
//                                 <span>{savingReplyId === review.id ? "Saving..." : "Save Reply"}</span>
//                               </button>
//                             </div>
//                           </div>
//                         ) : (
//                           <div>
//                             {review.ownerReplyText ? (
//                               <div className="bg-gray-50 rounded-lg p-3 mb-2">
//                                 <p className="text-gray-700 text-sm leading-relaxed">
//                                   {review.ownerReplyText}
//                                 </p>
//                               </div>
//                             ) : (
//                               <p className="text-gray-400 text-sm italic mb-2">
//                                 No response yet
//                               </p>
//                             )}
//                             <button
//                               onClick={() => handleEditToggle(review.id)}
//                               className="text-gbp-blue-600 border border-gbp-blue-600 px-4 py-1.5 rounded-md text-sm hover:bg-gbp-blue-50 transition-colors"
//                             >
//                               {review.ownerReplyText ? "Edit Reply" : "Add Reply"}
//                             </button>
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

import { useState, useEffect, useMemo, useRef } from "react";
import {
  Star,
  Download,
  QrCode,
  MessageSquare,
  Filter,
  MoreHorizontal,
  Loader2,
  Trash2,
} from "lucide-react";
import axios from "axios";
import { SERVER } from "@/constants";
import * as XLSX from "xlsx";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import QRCodeSVG from "react-qr-code";

interface Review {
  id: string;
  reviewId: string;
  author: string;
  rating: number;
  text: string;
  date: string;
  sentiment: "positive" | "negative" | "neutral";
  replied: boolean;
  ownerReplyText: string;
  isEditingReply: boolean;
  updateTime: string;
}

// Helper to get month name
const getMonthName = (monthIndex: number) => {
  const date = new Date();
  date.setMonth(monthIndex);
  return date.toLocaleString("en-US", { month: "short" });
};

// Helper to parse star rating (can be string like "FIVE", "FOUR", etc. or number)
const parseStarRating = (starRating: any): number => {
  if (typeof starRating === "number") return starRating;
  if (typeof starRating === "string") {
    const ratingMap: { [key: string]: number } = {
      ONE: 1,
      TWO: 2,
      THREE: 3,
      FOUR: 4,
      FIVE: 5,
    };
    return ratingMap[starRating.toUpperCase()] || 0;
  }
  return 0;
};

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [totalReviewsCount, setTotalReviewsCount] = useState<number>(0);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState("latest");
  const [filterRating, setFilterRating] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [primaryReviewLink, setPrimaryReviewLink] = useState<string>("");
  const [savingReplyId, setSavingReplyId] = useState<string | null>(null);
  const [deletingReplyId, setDeletingReplyId] = useState<string | null>(null);
  const [placeId, setPlaceId] = useState<string>("");
  const [generatingAIId, setGeneratingAIId] = useState<string | null>(null);

  const { activeLocation } = useSelector((state: RootState) => state.activeLocation);
  const { user } = useSelector((state: RootState) => state.user)

  // Helper function to extract clean location ID (removes "locations/" prefix if present)
  const extractLocationId = (rawLocationId: string | null | undefined): string => {
    if (!rawLocationId) return "";
    // Remove "locations/" prefix if it exists
    return rawLocationId.replace(/^locations\//, "");
  };

  // Get location ID from localStorage or Redux state and clean it
  const locationId = activeLocation?.locationId;
  
  // Get account ID - MAKE SURE THIS IS SET IN YOUR APP
  // You can set it like: localStorage.setItem("accountId", "116574816291503260287");
  const accountId = user?.accountId || ""; // Default for testing

  // Ref for the QR code canvas to facilitate download
  const qrCodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!locationId) {
        setError("No location ID found. Please select a location.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Construct the correct API URL matching your Postman request
        // Format: /api/v1/reviews/{location_id}/all?account_id={account_id}
        const url = `${SERVER}/api/v1/reviews/${locationId}/all?account_id=${user?.accountId}`;
        
        console.log("🔍 Fetching reviews from:", url);
        console.log("✨ Cleaned Location ID:", locationId);

        const response = await axios.get(url, { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          }
        });

        console.log("✅ API Response received:", {
          totalFetched: response.data.totalFetched,
          pagesProcessed: response.data.pagesProcessed,
          reviewsCount: response.data.reviews?.length
        });

        // Map the backend response to frontend format
        const mappedReviews: Review[] = (response.data.reviews || []).map(
          (review: any) => {
            const rating = parseStarRating(review.starRating);
            const createTime = review.createTime ? new Date(review.createTime) : new Date();
            
            return {
              id: review.reviewId || review.name || Math.random().toString(36).substring(2, 11),
              reviewId: review.reviewId,
              author: review.reviewer?.displayName || "Anonymous",
              rating: rating,
              text: review.comment || "",
              date: createTime.toISOString().split("T")[0],
              updateTime: review.updateTime || review.createTime || "",
              sentiment:
                rating >= 4
                  ? "positive"
                  : rating <= 2
                  ? "negative"
                  : "neutral",
              replied: !!review.reviewReply,
              ownerReplyText: review.reviewReply?.comment || "",
              isEditingReply: false,
            };
          }
        );

        console.log(`✅ Mapped ${mappedReviews.length} reviews`);

        setReviews(mappedReviews);
        setTotalReviewsCount(response.data.totalReviewCount || response.data.totalFetched || mappedReviews.length);
        setAverageRating(response.data.averageRating || 0);
        
        // Get place_id from backend response
        if (response.data.placeId) {
          const receivedPlaceId = response.data.placeId;
          console.log("✅ Place ID received from backend:", receivedPlaceId);
          setPlaceId(receivedPlaceId);
          localStorage.setItem("placeId", receivedPlaceId); // Store for future use
          
          // Generate review link
          const reviewLink = `https://search.google.com/local/writereview?placeid=${receivedPlaceId}`;
          setPrimaryReviewLink(reviewLink);
          console.log("🔗 Generated review link from backend place_id:", reviewLink);
        } else {
          console.warn("⚠️ No place_id in backend response");
        }
        
        setLoading(false);
      } catch (err: any) {
        console.error("❌ Failed to fetch reviews:", err);
        console.error("Error details:", {
          status: err.response?.status,
          statusText: err.response?.statusText,
          data: err.response?.data,
          url: err.config?.url
        });
        
        let errorMessage = "Failed to fetch reviews";
        
        if (err.response?.status === 401) {
          errorMessage = "Authentication required. Please log in again.";
        } else if (err.response?.status === 403) {
          errorMessage = "Access denied. Check your permissions for this location.";
        } else if (err.response?.status === 404) {
          errorMessage = `Location not found. Please verify location ID: ${locationId}`;
        } else if (err.response?.data?.detail) {
          errorMessage = err.response.data.detail;
        }
        
        setError(errorMessage);
        setLoading(false);
      }
    };

    fetchReviews();
  }, [locationId, accountId, SERVER, activeLocation?.placeId]);

  // Separate useEffect to fetch place_id ONLY if not received from backend
  useEffect(() => {
    const getPlaceIdFallback = async () => {
      // Only run this if we don't already have place_id from the reviews API
      if (placeId) {
        console.log("✅ Place ID already set from backend:", placeId);
        return;
      }

      // Try to get place_id from fallback sources
      let foundPlaceId = "";

      // 1. Check localStorage (might be from previous session)
      const storedPlaceId = localStorage.getItem("placeId");
      if (storedPlaceId) {
        foundPlaceId = storedPlaceId;
        console.log("✅ Place ID from localStorage (fallback):", foundPlaceId);
      }
      // 2. Check Redux state
      else if (activeLocation?.placeId) {
        foundPlaceId = activeLocation.placeId;
        console.log("✅ Place ID from Redux (fallback):", foundPlaceId);
      }

      // Set the place_id state if found
      if (foundPlaceId) {
        setPlaceId(foundPlaceId);
        
        // Generate review link
        const reviewLink = `https://search.google.com/local/writereview?placeid=${foundPlaceId}`;
        setPrimaryReviewLink(reviewLink);
        console.log("🔗 Generated review link from fallback:", reviewLink);
      } else {
        console.warn("⚠️ No place_id available from any source.");
        console.log("💡 Backend should provide place_id automatically. Check if include_place_id=true in API call.");
      }
    };

    // Wait a bit for the reviews API to complete and potentially set place_id
    const timer = setTimeout(() => {
      if (locationId && !placeId && !loading) {
        getPlaceIdFallback();
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [locationId, placeId, activeLocation?.placeId, loading]);

  // Handler for generating AI response suggestion
  const handleGenerateAIResponse = async (id: string) => {
    const reviewToUpdate = reviews.find((review) => review.id === id);
    if (!reviewToUpdate) return;

    setGeneratingAIId(id);

    try {
      console.log("🤖 Requesting AI response suggestion...");
      
      // Build request with available data
      const requestData = {
        review_text: reviewToUpdate.text || "No review text provided",
        star_rating: reviewToUpdate.rating,
        reviewer_name: reviewToUpdate.author,
        // Use optional chaining and provide undefined if properties don't exist
        business_name: (activeLocation as any)?.title || (activeLocation as any)?.name || undefined,
        business_type: (activeLocation as any)?.businessType || (activeLocation as any)?.category || undefined
      };

      console.log("📤 Sending AI request:", { 
        star_rating: requestData.star_rating, 
        review_length: requestData.review_text.length 
      });

      const response = await axios.post(
        `${SERVER}/api/v1/ai/generate-review-response`,
        requestData,
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      if (response.data.success && response.data.response) {
        console.log("✅ AI response generated successfully");
        console.log("📝 Response length:", response.data.response.length, "characters");
        
        // Auto-fill the AI-generated response
        setReviews((prevReviews) =>
          prevReviews.map((review) =>
            review.id === id
              ? { ...review, ownerReplyText: response.data.response, isEditingReply: true }
              : review
          )
        );
      } else {
        throw new Error(response.data.error || "Failed to generate AI response");
      }
    } catch (error: any) {
      console.error("❌ Failed to generate AI response:", error);
      
      let errorMessage = "Failed to generate AI suggestion";
      
      if (error.response?.status === 400) {
        errorMessage = "Invalid request. Please check the review data.";
      } else if (error.response?.status === 500) {
        const detail = error.response?.data?.detail || "";
        if (detail.includes("GOOGLE_API_KEY")) {
          errorMessage = "AI service not configured. Please contact support.";
        } else {
          errorMessage = "AI service temporarily unavailable. Please try again.";
        }
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(`❌ ${errorMessage}`);
    } finally {
      setGeneratingAIId(null);
    }
  };

  // Handler for toggling edit mode for an owner's reply
  const handleEditToggle = (id: string) => {
    setReviews((prevReviews) =>
      prevReviews.map((review) =>
        review.id === id
          ? { ...review, isEditingReply: !review.isEditingReply }
          : review
      )
    );
  };

  // Handler for updating owner's reply text
  const handleOwnerResponseChange = (id: string, newResponse: string) => {
    setReviews((prevReviews) =>
      prevReviews.map((review) =>
        review.id === id ? { ...review, ownerReplyText: newResponse } : review
      )
    );
  };

  // Handler for saving owner's reply using the new API
  const handleSaveResponse = async (id: string) => {
    const reviewToUpdate = reviews.find((review) => review.id === id);
    if (!reviewToUpdate || !reviewToUpdate.ownerReplyText.trim()) {
      alert("Please enter a response before saving");
      return;
    }

    setSavingReplyId(id);

    try {
      // Build the API URL for replying to a review
      // Format: /api/v1/reviews/{location_id}/{review_id}/reply?account_id={account_id}
      const url = `${SERVER}/api/v1/reviews/${locationId}/${reviewToUpdate.reviewId}/reply?account_id=${accountId}`;

      console.log("💾 Saving reply to:", url);

      const response = await axios.put(
        url,
        { comment: reviewToUpdate.ownerReplyText },
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      console.log("✅ Reply saved successfully:", response.data);

      // Update local state after successful API call
      setReviews((prevReviews) =>
        prevReviews.map((review) =>
          review.id === id
            ? { ...review, isEditingReply: false, replied: true }
            : review
        )
      );

      alert("✅ Reply posted successfully!");
    } catch (error: any) {
      console.error("❌ Failed to save reply:", error);
      console.error("Error details:", {
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url
      });
      
      let errorMessage = "Failed to save reply";
      
      if (error.response?.status === 401) {
        errorMessage = "Session expired. Please refresh the page and log in again.";
      } else if (error.response?.status === 403) {
        errorMessage = "You don't have permission to reply to reviews for this location. Please check your account access.";
      } else if (error.response?.status === 404) {
        errorMessage = "Review not found. It may have been deleted.";
      } else if (error.response?.data?.detail) {
        if (typeof error.response.data.detail === 'string') {
          errorMessage = error.response.data.detail;
        } else if (error.response.data.detail.error) {
          errorMessage = error.response.data.detail.error;
        }
      }
      
      alert(`❌ Error: ${errorMessage}`);
    } finally {
      setSavingReplyId(null);
    }
  };

  // Handler for deleting owner's reply using the new API
  const handleDeleteResponse = async (id: string) => {
    const reviewToUpdate = reviews.find((review) => review.id === id);
    if (!reviewToUpdate) return;

    if (!confirm("Are you sure you want to delete this reply?")) return;

    setDeletingReplyId(id);

    try {
      // Build the API URL for deleting a review reply
      // Format: /api/v1/reviews/{location_id}/{review_id}/reply?account_id={account_id}
      const url = `${SERVER}/api/v1/reviews/${locationId}/${reviewToUpdate.reviewId}/reply?account_id=${accountId}`;

      console.log("🗑️ Deleting reply from:", url);

      await axios.delete(url, { 
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        }
      });

      console.log("✅ Reply deleted successfully");

      // Update local state after successful deletion
      setReviews((prevReviews) =>
        prevReviews.map((review) =>
          review.id === id
            ? { ...review, ownerReplyText: "", replied: false, isEditingReply: false }
            : review
        )
      );

      alert("✅ Reply deleted successfully!");
    } catch (error: any) {
      console.error("❌ Failed to delete reply:", error);
      console.error("Error details:", {
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url
      });
      
      let errorMessage = "Failed to delete reply";
      
      if (error.response?.status === 401) {
        errorMessage = "Session expired. Please refresh the page and log in again.";
      } else if (error.response?.status === 403) {
        errorMessage = "You don't have permission to delete replies for this location.";
      } else if (error.response?.status === 404) {
        errorMessage = "Reply not found. It may have already been deleted.";
      } else if (error.response?.data?.detail) {
        if (typeof error.response.data.detail === 'string') {
          errorMessage = error.response.data.detail;
        } else if (error.response.data.detail.error) {
          errorMessage = error.response.data.detail.error;
        }
      }
      
      alert(`❌ Error: ${errorMessage}`);
    } finally {
      setDeletingReplyId(null);
    }
  };

  // Filter and Sort Logic (Memoized for performance)
  const filteredReviews = useMemo(() => {
    return reviews.filter((review) => {
      if (filterRating === "all") return true;
      return review.rating === parseInt(filterRating);
    });
  }, [reviews, filterRating]);

  const sortedReviews = useMemo(() => {
    return [...filteredReviews].sort((a, b) => {
      switch (sortBy) {
        case "latest":
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case "oldest":
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case "rating-high":
          return b.rating - a.rating;
        case "rating-low":
          return a.rating - b.rating;
        default:
          return 0;
      }
    });
  }, [filteredReviews, sortBy]);

  const totalReviews = totalReviewsCount;
  const calculatedAverageRating = averageRating || 
    (reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0);
      
  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((r) => r.rating === rating).length,
    percentage:
      (reviews.filter((r) => r.rating === rating).length / reviews.length) *
      100 || 0,
  }));

  // Dynamic Monthly Reviews Data Calculation
  const currentYear = new Date().getFullYear();
  const monthlyData = useMemo(() => {
    const monthMap = new Map<number, { reviews: number; repliedReviews: number }>();
    
    for (let i = 0; i < 12; i++) {
      monthMap.set(i, { reviews: 0, repliedReviews: 0 });
    }

    reviews.forEach((review) => {
      const reviewDate = new Date(review.date);
      if (reviewDate.getFullYear() === currentYear) {
        const month = reviewDate.getMonth();
        const data = monthMap.get(month)!;
        data.reviews++;
        if (review.replied) {
          data.repliedReviews++;
        }
      }
    });

    return Array.from(monthMap.entries())
      .sort(([monthA], [monthB]) => monthA - monthB)
      .map(([monthIndex, data]) => ({
        month: getMonthName(monthIndex),
        reviews: data.reviews,
        responseRate:
          data.reviews > 0
            ? Math.round((data.repliedReviews / data.reviews) * 100)
            : 0,
      }));
  }, [reviews, currentYear]);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-gbp-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg font-medium">Loading reviews...</p>
          <p className="text-gray-500 text-sm mt-2">This may take a moment for large datasets</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-2xl mx-auto">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-red-800 font-semibold text-lg mb-2">Error Loading Reviews</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <div className="bg-white border border-red-200 rounded p-3 mb-4">
                <p className="text-sm text-gray-700 font-mono">
                  Cleaned Location ID: {locationId || "Not set"}<br />
                  Account ID: {accountId || "Not set"}<br />
                  Place ID: {placeId || "Not set"}
                </p>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Get latest review date
  const latestReviewDate = reviews.length
    ? new Date(Math.max(...reviews.map((r) => new Date(r.date).getTime())))
    : null;

  const daysSinceLastReview = latestReviewDate
    ? Math.floor(
        (Date.now() - latestReviewDate.getTime()) / (1000 * 60 * 60 * 24)
      )
    : 0;

  const exportToCSV = () => {
    if (reviews.length === 0) return;

    const reviewsToExport = [...sortedReviews];

    const data = reviewsToExport.map((r) => ({
      Author: r.author,
      Rating: r.rating,
      Review: r.text,
      Date: r.date,
      Sentiment: r.sentiment,
      Replied: r.replied ? "Yes" : "No",
      OwnerReply: r.ownerReplyText || "N/A",
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Reviews");

    XLSX.writeFile(workbook, `reviews_${locationId}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Function to download the QR code
  const downloadQrCode = () => {
    if (qrCodeRef.current) {
      const svg = qrCodeRef.current.querySelector('svg');
      if (svg) {
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();
        
        canvas.width = 512;
        canvas.height = 512;
        
        img.onload = () => {
          ctx?.drawImage(img, 0, 0, 512, 512);
          const url = canvas.toDataURL("image/png");
          const link = document.createElement("a");
          link.href = url;
          link.download = "review_qr_code.png";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        };
        
        img.src = "data:image/svg+xml;base64," + btoa(svgData);
      }
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      {/* Debug Info (Remove in production) */}

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
            disabled={reviews.length === 0}
            className="border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  {calculatedAverageRating.toFixed(1)}
                </p>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(calculatedAverageRating)
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Based on {reviews.length} reviews
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Response Rate</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {reviews.length > 0
                  ? (
                      (reviews.filter((r) => r.replied).length / reviews.length) *
                      100
                    ).toFixed(1)
                  : "0.0"}
                %
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {reviews.filter((r) => r.replied).length} of {reviews.length} replied
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Last Review
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {daysSinceLastReview}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                days ago
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
                      className="bg-gbp-success-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
                <span className="text-sm text-gray-600 w-8">{count}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-4">
            Based on {reviews.length} reviews
          </p>
        </div>

        {/* Review Request Box */}
        <div className="bg-gradient-to-br from-gbp-blue-500 to-gbp-blue-600 rounded-lg p-6 text-white">
          <h3 className="text-lg font-semibold mb-2">Review request link</h3>
          <p className="text-gbp-blue-100 text-sm mb-4">
            Here's your link for staff or customers to get quick reviews.
          </p>

          <div className="bg-white rounded-lg p-3 mb-4">
            <input
              type="text"
              value={primaryReviewLink || "Loading link..."}
              readOnly
              className="w-full text-xs text-gray-600 bg-transparent border-none outline-none"
              onClick={(e) => {
                if (primaryReviewLink) {
                  e.currentTarget.select();
                  navigator.clipboard.writeText(primaryReviewLink);
                }
              }}
              title={primaryReviewLink ? "Click to copy" : ""}
            />
          </div>

          {!primaryReviewLink && !loading && (
            <div className="bg-yellow-500 bg-opacity-20 border border-yellow-300 rounded-lg p-3 mb-4">
              <p className="text-xs text-white">
                ⚠️ Place ID not available.<br />
                The backend should automatically provide this. Check API logs.
              </p>
            </div>
          )}

          <div className="flex items-center space-x-3 mb-4">
            <label className="flex items-center space-x-2 text-gbp-blue-100 cursor-pointer">
              <input
                type="checkbox"
                className="rounded text-gbp-blue-500"
                defaultChecked
              />
              <span className="text-sm">Embed reviews on your website</span>
            </label>
          </div>

          <div className="bg-white rounded-lg p-4 flex flex-col items-center">
            <div 
              className="w-24 h-24 rounded-lg mb-3 flex items-center justify-center bg-white" 
              ref={qrCodeRef}
            >
              {primaryReviewLink ? (
                <QRCodeSVG value={primaryReviewLink} size={96} level="H" />
              ) : (
                <QrCode className="w-16 h-16 text-gray-400" />
              )}
            </div>
            <p className="text-gray-900 text-sm font-medium mb-2">
              {primaryReviewLink ? "Scan to leave a review" : "QR code unavailable"}
            </p>
            <button
              onClick={downloadQrCode}
              disabled={!primaryReviewLink}
              className="bg-gbp-blue-500 text-white px-4 py-2 rounded text-sm hover:bg-gbp-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Download QR Code
            </button>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Monthly Reviews Chart */}
        <div className="bg-white rounded-lg p-5 border border-gray-200">
          <h3 className="text-base font-semibold text-gray-900 mb-3">
            Monthly Reviews ({currentYear})
          </h3>
          <div className="h-40 flex items-end justify-between space-x-2 px-2">
            {monthlyData.map((data) => {
              const maxReviews = Math.max(
                ...monthlyData.map((d) => d.reviews),
                1
              );
              const minHeight = 6;
              const maxHeight = 120;
              const height =
                data.reviews === 0
                  ? minHeight
                  : Math.max(
                      minHeight,
                      (data.reviews / maxReviews) * maxHeight
                    );

              return (
                <div
                  key={data.month}
                  className="flex flex-col items-center flex-1"
                >
                  <div className="mb-1 text-[10px] font-semibold text-gray-700 h-3">
                    {data.reviews > 0 ? data.reviews : ""}
                  </div>

                  <div
                    className={`w-full max-w-[40px] rounded-t transition-all duration-300 ${
                      data.reviews === 0
                        ? "bg-gray-200"
                        : "bg-gradient-to-t from-gbp-blue-500 to-gbp-blue-400"
                    }`}
                    style={{ height: `${height}px` }}
                  ></div>

                  <span className="text-[11px] text-gray-700 mt-1.5 font-medium">
                    {data.month}
                  </span>

                  <div className="mt-0.5 flex items-center justify-center">
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${
                        data.responseRate === 100
                          ? "bg-green-500"
                          : data.responseRate > 0
                          ? "bg-yellow-500"
                          : "bg-gray-300"
                      }`}
                    ></div>
                    <span className="text-[10px] text-gray-500 ml-1">
                      {data.responseRate}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-center space-x-4 text-[11px] text-gray-600">
            <div className="flex items-center">
              <div className="w-2.5 h-2.5 bg-gbp-blue-500 rounded mr-1.5"></div>
              <span>Reviews</span>
            </div>
            <div className="flex items-center">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></div>
              <span>100% Response</span>
            </div>
            <div className="flex items-center">
              <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mr-1.5"></div>
              <span>Partial</span>
            </div>
          </div>
        </div>

        {/* Days Since Last Review */}
        <div className="bg-white rounded-lg p-5 border border-gray-200">
          <h3 className="text-base font-semibold text-gray-900 mb-3">
            Days since last review
          </h3>
          <div className="h-40 flex items-center justify-center">
            <div className="text-center">
              <div className="relative inline-flex items-center justify-center">
                <svg className="w-36 h-36 transform -rotate-90">
                  <circle
                    cx="72"
                    cy="72"
                    r="60"
                    stroke="#E5E7EB"
                    strokeWidth="10"
                    fill="none"
                  />
                  <circle
                    cx="72"
                    cy="72"
                    r="60"
                    stroke="#3B82F6"
                    strokeWidth="10"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 60}`}
                    strokeDashoffset="0"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-4xl font-bold text-gray-900">
                    {daysSinceLastReview}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">days</p>
                </div>
              </div>
              <p className="text-xs text-gray-600 mt-3">
                Last review: {latestReviewDate
                  ? latestReviewDate.toLocaleDateString('en-US', { 
                      month: '2-digit', 
                      day: '2-digit', 
                      year: 'numeric' 
                    })
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              All Reviews ({sortedReviews.length})
            </h3>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-200 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-gbp-blue-500"
                >
                  <option value="latest">Latest</option>
                  <option value="oldest">Oldest</option>
                  <option value="rating-high">Highest Rating</option>
                  <option value="rating-low">Lowest Rating</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Filter:</span>
                <select
                  value={filterRating}
                  onChange={(e) => setFilterRating(e.target.value)}
                  className="border border-gray-200 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-gbp-blue-500"
                >
                  <option value="all">All Ratings</option>
                  <option value="5">5 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="2">2 Stars</option>
                  <option value="1">1 Star</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          {sortedReviews.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">No reviews found</p>
              <p className="text-gray-400 text-sm mb-6">
                {filterRating !== "all" 
                  ? "Try changing your filter settings"
                  : "Start collecting reviews from your customers"}
              </p>
              {filterRating === "all" && (
                <button className="bg-gbp-blue-500 text-white px-6 py-3 rounded-lg hover:bg-gbp-blue-600 transition-colors">
                  Request Reviews
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {sortedReviews.map((review) => (
                <div
                  key={review.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-gbp-blue-400 to-gbp-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-sm font-semibold text-white">
                            {review.author
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .substring(0, 2)}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
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
                      
                      {review.text && (
                        <p className="text-gray-700 text-sm mb-3 leading-relaxed">
                          {review.text}
                        </p>
                      )}
                      
                      <div className="flex items-center space-x-3 mb-3">
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                            review.sentiment === "positive"
                              ? "bg-green-100 text-green-700"
                              : review.sentiment === "negative"
                              ? "bg-red-100 text-red-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {review.sentiment}
                        </span>
                      </div>

                      {/* Owner Response Section */}
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-semibold text-gray-800">
                            Owner's Response
                          </p>
                          {review.replied && !review.isEditingReply && (
                            <button
                              onClick={() => handleDeleteResponse(review.id)}
                              disabled={deletingReplyId === review.id}
                              className="text-red-600 hover:text-red-700 text-xs flex items-center space-x-1 disabled:opacity-50"
                            >
                              {deletingReplyId === review.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Trash2 className="w-3 h-3" />
                              )}
                              <span>Delete</span>
                            </button>
                          )}
                        </div>
                        
                        {review.isEditingReply ? (
                          <div>
                            <div className="relative">
                              <textarea
                                className="w-full p-3 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-gbp-blue-500 focus:border-gbp-blue-500 transition-all"
                                rows={4}
                                value={review.ownerReplyText}
                                onChange={(e) =>
                                  handleOwnerResponseChange(review.id, e.target.value)
                                }
                                placeholder="Write your response..."
                              />
                              {generatingAIId === review.id && (
                                <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center rounded-md">
                                  <div className="text-center">
                                    <Loader2 className="w-8 h-8 text-gbp-blue-500 animate-spin mx-auto mb-2" />
                                    <p className="text-sm text-gray-600">Generating AI suggestion...</p>
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            {/* AI Suggestion Button */}
                            <div className="mt-2 flex items-center space-x-2">
                              <button
                                onClick={() => handleGenerateAIResponse(review.id)}
                                disabled={generatingAIId === review.id || savingReplyId === review.id}
                                className="flex items-center space-x-1.5 px-3 py-1.5 text-xs bg-purple-50 text-purple-700 border border-purple-200 rounded-md hover:bg-purple-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Get AI-powered response suggestion"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                                <span>AI Suggestion</span>
                              </button>
                              <span className="text-xs text-gray-500 italic">
                                ✨ Let AI help craft a professional response
                              </span>
                            </div>
                            
                            <div className="flex justify-end mt-3 space-x-2">
                              <button
                                onClick={() => handleEditToggle(review.id)}
                                className="text-gray-600 border border-gray-300 px-4 py-1.5 rounded-md text-sm hover:bg-gray-50 transition-colors"
                                disabled={savingReplyId === review.id || generatingAIId === review.id}
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleSaveResponse(review.id)}
                                disabled={savingReplyId === review.id || generatingAIId === review.id || !review.ownerReplyText.trim()}
                                className="bg-gbp-blue-500 text-white px-4 py-1.5 rounded-md text-sm hover:bg-gbp-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                              >
                                {savingReplyId === review.id && (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                )}
                                <span>{savingReplyId === review.id ? "Saving..." : "Save Reply"}</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            {review.ownerReplyText ? (
                              <div className="bg-gray-50 rounded-lg p-3 mb-2">
                                <p className="text-gray-700 text-sm leading-relaxed">
                                  {review.ownerReplyText}
                                </p>
                              </div>
                            ) : (
                              <p className="text-gray-400 text-sm italic mb-2">
                                No response yet
                              </p>
                            )}
                            <button
                              onClick={() => handleEditToggle(review.id)}
                              className="text-gbp-blue-600 border border-gbp-blue-600 px-4 py-1.5 rounded-md text-sm hover:bg-gbp-blue-50 transition-colors"
                            >
                              {review.ownerReplyText ? "Edit Reply" : "Add Reply"}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}