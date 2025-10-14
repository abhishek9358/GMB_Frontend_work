import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import {
  Plus,
  Bookmark,
  Send,
  Clock,
  MoreVertical,
  Eye,
  ThumbsUp,
  Search,
  Calendar,
  ChevronDown,
  LinkIcon,
  Pencil,
  Trash2,
  Sparkles,
  ImageIcon,
  Copy,
  Save,
  Play,
  RefreshCw,
  CheckCircle2,
  X,
  AlertCircle,
  Settings,
  Tag,
  CalendarDays,
  Phone,
} from "lucide-react";
import { SERVER as ServerBackend } from "@/constants";

const SERVER = ServerBackend || "http://localhost:3000";

// Types
interface PostDraft {
  id: string;
  locationId?: string;
  summary: string;
  topicType: string;
  event?: {
    title: string;
    schedule: {
      startDate: { year: number; month: number; day: number };
      endDate: { year: number; month: number; day: number };
    };
  };
  offer?: {
    couponCode?: string;
    redeemOnlineUrl?: string;
    termsConditions?: string;
  };
  media?: MediaItem[];
  callToAction?: CallToAction;
  status: string;
  scheduledFor?: string;
  publishedAt?: string;
  googlePostId?: string;
  publishError?: string;
  createdAt: string;
  updatedAt: string;
}

interface MediaItem {
  mediaFormat: string;
  sourceUrl: string;
}

interface CallToAction {
  actionType: string;
  url?: string;
}

interface AutomationSettings {
  id?: string;
  isActive: boolean;
  frequency: string;
  intervalDays: number;
  maxPerMonth: number | null;
  defaultTopicType: string;
  includeMedia: boolean;
  includeCTA: boolean;
}

// 🔥 EXTRACTED: Edit Post Modal as separate component
interface EditPostModalProps {
  editingPost: PostDraft | null;
  showEditModal: boolean;
  onClose: () => void;
  onSave: (postData: any) => Promise<void>;
  loading: boolean;
  showMessage: (type: "success" | "error", text: string) => void;
}

const EditPostModal: React.FC<EditPostModalProps> = ({
  editingPost,
  showEditModal,
  onClose,
  onSave,
  loading,
  showMessage,
}) => {
  // Helper to convert GMB date format to date string
  const gmbDateToString = (gmbDate: {
    year: number;
    month: number;
    day: number;
  }) => {
    const year = gmbDate.year;
    const month = String(gmbDate.month).padStart(2, "0");
    const day = String(gmbDate.day).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Helper to convert date string to GMB format
  const dateStringToGMBFormat = (dateString: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
    };
  };

  const [localPost, setLocalPost] = useState<PostDraft | null>(editingPost);
  const [localCtaPhone, setLocalCtaPhone] = useState("");
  const [localEventTitle, setLocalEventTitle] = useState("");
  const [localEventStart, setLocalEventStart] = useState("");
  const [localEventEnd, setLocalEventEnd] = useState("");
  const [localCouponCode, setLocalCouponCode] = useState("");
  const [localRedeemUrl, setLocalRedeemUrl] = useState("");
  const [localTerms, setLocalTerms] = useState("");

  // Initialize state when editingPost changes
  useEffect(() => {
    if (editingPost) {
      setLocalPost(editingPost);
      setLocalEventTitle(editingPost.event?.title || "");
      setLocalEventStart(
        editingPost.event?.schedule?.startDate
          ? gmbDateToString(editingPost.event.schedule.startDate)
          : ""
      );
      setLocalEventEnd(
        editingPost.event?.schedule?.endDate
          ? gmbDateToString(editingPost.event.schedule.endDate)
          : ""
      );
      setLocalCouponCode(editingPost.offer?.couponCode || "");
      setLocalRedeemUrl(editingPost.offer?.redeemOnlineUrl || "");
      setLocalTerms(editingPost.offer?.termsConditions || "");
      setLocalCtaPhone(
        editingPost.callToAction?.url?.startsWith("tel:")
          ? editingPost.callToAction.url.replace("tel:", "")
          : ""
      );
    }
  }, [editingPost]);

  const handleSave = async () => {
    if (!localPost) return;

    // Validation
    if (localPost.topicType === "EVENT") {
      if (!localEventTitle.trim()) {
        showMessage("error", "Event title is required");
        return;
      }
      if (!localEventStart || !localEventEnd) {
        showMessage("error", "Event dates are required");
        return;
      }
    }

    if (localPost.topicType === "OFFER") {
      if (!localCouponCode.trim() && !localRedeemUrl.trim()) {
        showMessage("error", "Coupon code or redeem URL is required");
        return;
      }
      if (!localEventStart || !localEventEnd) {
        showMessage("error", "Offer validity dates are required");
        return;
      }
    }

    const postData: any = {
      summary: localPost.summary,
      topicType: localPost.topicType,
      media: localPost.media || null,
      callToAction: localPost.callToAction || null,
    };

    // Add EVENT data
    if (localPost.topicType === "EVENT") {
      postData.event = {
        title: localEventTitle.trim(),
        schedule: {
          startDate: dateStringToGMBFormat(localEventStart),
          endDate: dateStringToGMBFormat(localEventEnd),
        },
      };
    }

    // Add OFFER data
    if (localPost.topicType === "OFFER") {
      postData.offer = {};
      if (localCouponCode.trim()) {
        postData.offer.couponCode = localCouponCode.trim();
      }
      if (localRedeemUrl.trim()) {
        postData.offer.redeemOnlineUrl = localRedeemUrl.trim();
      }
      if (localTerms.trim()) {
        postData.offer.termsConditions = localTerms.trim();
      }

      postData.event = {
        title: "Limited Time Offer",
        schedule: {
          startDate: dateStringToGMBFormat(localEventStart),
          endDate: dateStringToGMBFormat(localEventEnd),
        },
      };
    }

    await onSave(postData);
  };

  if (!showEditModal || !localPost) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-900">
            {localPost.status === "draft" ? "Edit Draft" : "Edit Post"}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Post Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Post Type
            </label>
            <select
              value={localPost.topicType}
              onChange={(e) =>
                setLocalPost({ ...localPost, topicType: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="STANDARD">Standard Post</option>
              <option value="EVENT">Event</option>
              <option value="OFFER">Offer</option>
              <option value="PRODUCT">Product</option>
            </select>
          </div>

          {/* EVENT Fields */}
          {localPost.topicType === "EVENT" && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
              <div className="flex items-center gap-2 text-blue-700 font-medium">
                <CalendarDays className="w-4 h-4" />
                <span className="text-sm">Event Details</span>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Event Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={localEventTitle}
                  onChange={(e) => setLocalEventTitle(e.target.value)}
                  maxLength={58}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={localEventStart}
                    onChange={(e) => setLocalEventStart(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={localEventEnd}
                    onChange={(e) => setLocalEventEnd(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* OFFER Fields */}
          {localPost.topicType === "OFFER" && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg space-y-3">
              <div className="flex items-center gap-2 text-green-700 font-medium">
                <Tag className="w-4 h-4" />
                <span className="text-sm">Offer Details</span>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Coupon Code
                </label>
                <input
                  type="text"
                  value={localCouponCode}
                  onChange={(e) => setLocalCouponCode(e.target.value)}
                  maxLength={50}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Redeem URL
                </label>
                <input
                  type="url"
                  value={localRedeemUrl}
                  onChange={(e) => setLocalRedeemUrl(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Terms & Conditions
                </label>
                <textarea
                  value={localTerms}
                  onChange={(e) => setLocalTerms(e.target.value)}
                  maxLength={500}
                  rows={2}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Offer Validity <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="date"
                    value={localEventStart}
                    onChange={(e) => setLocalEventStart(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500"
                  />
                  <input
                    type="date"
                    value={localEventEnd}
                    onChange={(e) => setLocalEventEnd(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Post Description
            </label>
            <textarea
              value={localPost.summary}
              onChange={(e) =>
                setLocalPost({ ...localPost, summary: e.target.value })
              }
              maxLength={1500}
              className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Edit your post description..."
            />
            <p className="text-sm text-gray-500 mt-1 text-right">
              {localPost.summary.length}/1500 characters
            </p>
          </div>

          {/* Media URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image URL (Optional)
            </label>
            <input
              type="url"
              value={localPost.media?.[0]?.sourceUrl || ""}
              onChange={(e) =>
                setLocalPost({
                  ...localPost,
                  media: e.target.value
                    ? [{ mediaFormat: "PHOTO", sourceUrl: e.target.value }]
                    : undefined,
                })
              }
              placeholder="https://example.com/image.jpg"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* CTA */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Call to Action
            </label>
            <select
              value={localPost.callToAction?.actionType || "NONE"}
              onChange={(e) => {
                const actionType = e.target.value;
                setLocalPost({
                  ...localPost,
                  callToAction:
                    actionType === "NONE"
                      ? undefined
                      : {
                          actionType,
                          url: localPost.callToAction?.url || "",
                        },
                });
              }}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="NONE">None</option>
              <option value="BOOK">Book</option>
              <option value="ORDER">Order Online</option>
              <option value="LEARN_MORE">Learn More</option>
              <option value="SIGN_UP">Sign Up</option>
              <option value="CALL">Call Now</option>
            </select>
          </div>

          {/* Phone Number Input for CALL */}
          {localPost.callToAction?.actionType === "CALL" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-5 h-5 text-gray-400 absolute top-1/2 left-3 -translate-y-1/2" />
                <input
                  type="tel"
                  value={localCtaPhone}
                  onChange={(e) => {
                    setLocalCtaPhone(e.target.value);
                    setLocalPost({
                      ...localPost,
                      callToAction: {
                        ...localPost.callToAction!,
                        url: `tel:${e.target.value.replace(/[^0-9+]/g, "")}`,
                      },
                    });
                  }}
                  placeholder="+1 (555) 123-4567"
                  className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Enter with country code (e.g., +1 for US)
              </p>
            </div>
          )}

          {/* CTA URL for other action types */}
          {localPost.callToAction?.actionType &&
            localPost.callToAction.actionType !== "NONE" &&
            localPost.callToAction.actionType !== "CALL" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CTA Link <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  value={localPost.callToAction?.url || ""}
                  onChange={(e) =>
                    setLocalPost({
                      ...localPost,
                      callToAction: {
                        ...localPost.callToAction!,
                        url: e.target.value,
                      },
                    })
                  }
                  placeholder="https://your-website.com"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading || !localPost.summary.trim()}
            className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Component
function PostAutomation() {
  const [activeTab, setActiveTab] = useState("create");

  // Redux state
  const { user } = useSelector((state: any) => state.user);
  const { activeLocation } = useSelector((state: any) => state.activeLocation);

  const ACCOUNT_ID = user?.accountId || "";
  const LOCATION_ID = activeLocation?.locationId || "";

  // Post Draft States
  const [postDescription, setPostDescription] = useState("");
  const [topicType, setTopicType] = useState("STANDARD");
  const [ctaType, setCtaType] = useState("NONE");
  const [ctaUrl, setCtaUrl] = useState("");
  const [ctaPhone, setCtaPhone] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Event-specific states
  const [eventTitle, setEventTitle] = useState("");
  const [eventStartDate, setEventStartDate] = useState("");
  const [eventEndDate, setEventEndDate] = useState("");

  // Offer-specific states
  const [couponCode, setCouponCode] = useState("");
  const [redeemUrl, setRedeemUrl] = useState("");
  const [termsConditions, setTermsConditions] = useState("");

  // Drafts & Published Posts
  const [drafts, setDrafts] = useState<PostDraft[]>([]);
  const [publishedPosts, setPublishedPosts] = useState<PostDraft[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingDrafts, setFetchingDrafts] = useState(false);

  // Edit Modal States
  const [editingPost, setEditingPost] = useState<PostDraft | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Automation States
  const [automationSettings, setAutomationSettings] =
    useState<AutomationSettings>({
      isActive: false,
      frequency: "weekly",
      intervalDays: 7,
      maxPerMonth: null,
      defaultTopicType: "STANDARD",
      includeMedia: true,
      includeCTA: false,
    });
  const [automationLoading, setAutomationLoading] = useState(false);
  const [showAutomationSettings, setShowAutomationSettings] = useState(false);

  // Message State
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const tabs = [
    { id: "create", name: "Create New Post", icon: Plus },
    { id: "draft", name: "Draft Posts", icon: Bookmark },
    { id: "past", name: "Published Posts", icon: Send },
  ];

  // Reset type-specific fields when topic type changes
  useEffect(() => {
    if (topicType !== "EVENT" && topicType !== "OFFER") {
      setEventTitle("");
      setEventStartDate("");
      setEventEndDate("");
    }
    if (topicType !== "OFFER") {
      setCouponCode("");
      setRedeemUrl("");
      setTermsConditions("");
    }
  }, [topicType]);

  // Helper to convert date string to GMB format
  const dateStringToGMBFormat = (dateString: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
    };
  };

  // Validation function
  const validatePostData = () => {
    if (!postDescription.trim()) {
      showMessage("error", "Please add a post description");
      return false;
    }

    if (!LOCATION_ID) {
      showMessage("error", "Please select a location first");
      return false;
    }

    if (ctaType === "CALL" && !ctaPhone.trim()) {
      showMessage("error", "Phone number is required for Call Now action");
      return false;
    }

    // EVENT validation
    if (topicType === "EVENT") {
      if (!eventTitle.trim()) {
        showMessage("error", "Event title is required for EVENT posts");
        return false;
      }
      if (!eventStartDate) {
        showMessage("error", "Event start date is required");
        return false;
      }
      if (!eventEndDate) {
        showMessage("error", "Event end date is required");
        return false;
      }
      if (new Date(eventEndDate) < new Date(eventStartDate)) {
        showMessage("error", "Event end date must be after start date");
        return false;
      }
    }

    // OFFER validation
    if (topicType === "OFFER") {
      if (!couponCode.trim() && !redeemUrl.trim()) {
        showMessage(
          "error",
          "Either coupon code or redeem URL is required for OFFER posts"
        );
        return false;
      }
      if (!eventStartDate || !eventEndDate) {
        showMessage(
          "error",
          "Offer validity period (start & end date) is required"
        );
        return false;
      }
      if (new Date(eventEndDate) < new Date(eventStartDate)) {
        showMessage("error", "Offer end date must be after start date");
        return false;
      }
    }

    return true;
  };

  // Build post data with proper structure
  const buildPostData = () => {
    const postData: any = {
      locationId: LOCATION_ID,
      summary: postDescription,
      topicType: topicType,
    };

    // Add media if provided
    if (mediaUrl.trim()) {
      postData.media = [
        {
          mediaFormat: "PHOTO",
          sourceUrl: mediaUrl.trim(),
        },
      ];
    }

    // Add CTA if provided
    if (ctaType !== "NONE") {
      if (ctaType === "CALL") {
        if (ctaPhone.trim()) {
          postData.callToAction = {
            actionType: ctaType,
            // url: `tel:${ctaPhone.trim().replace(/[^0-9+]/g, "")}`,
          };
        }
      } else {
        if (ctaUrl.trim()) {
          postData.callToAction = {
            actionType: ctaType,
            url: ctaUrl.trim(),
          };
        }
      }
    }

    // Add EVENT details
    if (topicType === "EVENT") {
      postData.event = {
        title: eventTitle.trim(),
        schedule: {
          startDate: dateStringToGMBFormat(eventStartDate),
          endDate: dateStringToGMBFormat(eventEndDate),
        },
      };
    }

    // Add OFFER details
    if (topicType === "OFFER") {
      postData.offer = {};

      if (couponCode.trim()) {
        postData.offer.couponCode = couponCode.trim();
      }
      if (redeemUrl.trim()) {
        postData.offer.redeemOnlineUrl = redeemUrl.trim();
      }
      if (termsConditions.trim()) {
        postData.offer.termsConditions = termsConditions.trim();
      }

      postData.event = {
        title: "Limited Time Offer",
        schedule: {
          startDate: dateStringToGMBFormat(eventStartDate),
          endDate: dateStringToGMBFormat(eventEndDate),
        },
      };
    }

    return postData;
  };

  // Reset form function
  const resetForm = () => {
    setPostDescription("");
    setMediaUrl("");
    setCtaUrl("");
    setCtaPhone("");
    setCtaType("NONE");
    setEventTitle("");
    setEventStartDate("");
    setEventEndDate("");
    setCouponCode("");
    setRedeemUrl("");
    setTermsConditions("");
  };

  // ==================== API FUNCTIONS ====================

  const fetchDrafts = useCallback(async () => {
    if (!LOCATION_ID) return;

    setFetchingDrafts(true);
    try {
      const response = await fetch(
        `${SERVER}/api/post-drafts?locationId=${LOCATION_ID}&status=draft&limit=50`,
        { credentials: "include" }
      );

      if (!response.ok) throw new Error("Failed to fetch drafts");

      const result = await response.json();
      setDrafts(result.data || []);
    } catch (error) {
      console.error("Error fetching drafts:", error);
      showMessage("error", "Failed to load drafts");
    } finally {
      setFetchingDrafts(false);
    }
  }, [LOCATION_ID]);

  const fetchPublishedPosts = useCallback(async () => {
    if (!LOCATION_ID) return;

    try {
      const response = await fetch(
        `${SERVER}/api/post-drafts?locationId=${LOCATION_ID}&status=published&limit=50`,
        { credentials: "include" }
      );

      if (!response.ok) throw new Error("Failed to fetch published posts");

      const result = await response.json();
      setPublishedPosts(result.data || []);
    } catch (error) {
      console.error("Error fetching published posts:", error);
    }
  }, [LOCATION_ID]);

  const createDraft = async (postData: any) => {
    const payload = {
      ...postData,
      media: postData.media ? postData.media : null,
    };

    const response = await fetch(`${SERVER}/api/post-drafts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to create draft");
    }

    return response.json();
  };

  const updatePost = async (postId: string, postData: any) => {
    const payload = {
      ...postData,
      media: postData.media ? postData.media : null,
    };

    const response = await fetch(`${SERVER}/api/post-drafts/${postId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to update post");
    }

    return response.json();
  };

  const publishDraft = async (draftId: string) => {
    const formData = new FormData();
    formData.append("acct_id", ACCOUNT_ID);
    formData.append("loc_id", LOCATION_ID);

    const response = await fetch(
      `${SERVER}/api/post-drafts/${draftId}/publish-to-google`,
      {
        method: "POST",
        body: formData,
        credentials: "include",
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to publish post");
    }

    return response.json();
  };

  const deleteDraft = async (draftId: string) => {
    const response = await fetch(`${SERVER}/api/post-drafts/${draftId}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!response.ok) throw new Error("Failed to delete draft");
    return response.json();
  };

  const deletePublishedPost = async (
    draftId: string,
    googlePostId: string,
    accountId: string,
    locationId: string
  ) => {
    const formData = new FormData();
    formData.append("acct_id", accountId);
    formData.append("loc_id", locationId);
    formData.append("google_post_id", googlePostId);

    const response = await fetch(
      `${SERVER}/api/post-drafts/${draftId}/delete-from-google`,
      {
        method: "DELETE",
        body: formData,
        credentials: "include",
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to delete post from GMB");
    }

    return response.json();
  };

  const fetchAutomationSettings = useCallback(async () => {
    if (!LOCATION_ID) return;

    try {
      const response = await fetch(
        `${SERVER}/api/post-automation?locationId=${LOCATION_ID}`,
        { credentials: "include" }
      );

      if (!response.ok) return;

      const result = await response.json();
      if (result.data && result.data.length > 0) {
        const settings = result.data[0];
        setAutomationSettings({
          id: settings.id,
          isActive: settings.isActive,
          frequency: settings.frequency,
          intervalDays: settings.intervalDays || 7,
          maxPerMonth: settings.maxPerMonth,
          defaultTopicType: settings.defaultTopicType || "STANDARD",
          includeMedia: settings.includeMedia ?? true,
          includeCTA: settings.includeCTA ?? false,
        });
      }
    } catch (error) {
      console.error("Error fetching automation:", error);
    }
  }, [LOCATION_ID]);

  const saveAutomationSettings = async () => {
    if (!LOCATION_ID) return;

    setAutomationLoading(true);
    try {
      const response = await fetch(`${SERVER}/api/post-automation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locationId: LOCATION_ID,
          ...automationSettings,
        }),
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to save automation");

      showMessage("success", "Automation settings saved successfully!");
      await fetchAutomationSettings();
    } catch (error: any) {
      showMessage("error", error.message);
    } finally {
      setAutomationLoading(false);
    }
  };

  // ==================== HANDLERS ====================

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleGenerateAIDescription = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const aiGeneratedText =
        "Discover our latest seasonal offers! 🍂 From cozy autumn decor to delicious pumpkin-spice treats, we have everything you need to celebrate the season. Visit us today and get 20% off your entire purchase. Don't miss out! #AutumnVibes #SeasonalSale #ShopLocal";
      setPostDescription(aiGeneratedText.slice(0, 1500));
      setIsGenerating(false);
    }, 1500);
  };

  const handleSaveAsDraft = async () => {
    if (!validatePostData()) return;

    setLoading(true);
    try {
      const postData = buildPostData();
      await createDraft(postData);

      resetForm();
      await fetchDrafts();

      showMessage("success", "Post saved as draft!");
      setActiveTab("draft");
    } catch (error: any) {
      console.error("Draft creation error:", error);
      showMessage("error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePostNow = async () => {
    if (!validatePostData()) return;

    setLoading(true);
    try {
      const postData = buildPostData();
      const draftResult = await createDraft(postData);
      await publishDraft(draftResult.data.id);

      resetForm();
      await fetchDrafts();
      await fetchPublishedPosts();

      showMessage("success", "Post published successfully!");
      setActiveTab("past");
    } catch (error: any) {
      showMessage("error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePublishDraft = async (draftId: string) => {
    setLoading(true);
    try {
      await publishDraft(draftId);
      await fetchDrafts();
      await fetchPublishedPosts();
      showMessage("success", "Post published successfully!");
    } catch (error: any) {
      showMessage("error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDraft = async (draftId: string) => {
    if (!window.confirm("Are you sure you want to delete this draft?")) return;

    try {
      await deleteDraft(draftId);
      await fetchDrafts();
      showMessage("success", "Draft deleted!");
    } catch (error: any) {
      showMessage("error", error.message);
    }
  };

  const handleEditPublishedPost = (post: PostDraft) => {
    setEditingPost(post);
    setShowEditModal(true);
  };

  const handleEditDraft = (post: PostDraft) => {
    setEditingPost(post);
    setShowEditModal(true);
  };

  // 🔥 FIXED: Modal save handler
  const handleModalSave = async (postData: any) => {
    if (!editingPost) return;

    setLoading(true);
    try {
      await updatePost(editingPost.id, postData);

      if (editingPost.status === "draft") {
        await fetchDrafts();
      } else {
        await fetchPublishedPosts();
      }

      setShowEditModal(false);
      setEditingPost(null);
      showMessage("success", "Post updated successfully!");
    } catch (error: any) {
      showMessage("error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePublishedPost = async (post: PostDraft) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this post from Google My Business? This action cannot be undone."
      )
    )
      return;

    if (!post.googlePostId) {
      showMessage("error", "Cannot delete: Google Post ID not found");
      return;
    }

    setLoading(true);
    try {
      await deletePublishedPost(
        post.id,
        post.googlePostId,
        ACCOUNT_ID,
        LOCATION_ID
      );
      await fetchPublishedPosts();
      showMessage("success", "Post deleted from GMB successfully!");
    } catch (error: any) {
      showMessage("error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTestRun = async () => {
    if (drafts.length === 0) {
      showMessage("error", "No drafts available to test!");
      return;
    }

    setLoading(true);
    showMessage("success", "Running test post...");

    try {
      await publishDraft(drafts[0].id);
      await fetchDrafts();
      await fetchPublishedPosts();
      showMessage("success", "✅ Test successful! 1 post published to GMB.");
    } catch (error: any) {
      showMessage("error", `❌ Test failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAutomation = async (isActive: boolean) => {
    setAutomationSettings({
      ...automationSettings,
      isActive: isActive,
    });

    if (!LOCATION_ID) {
      showMessage("error", "Please select a location first");
      return;
    }

    setAutomationLoading(true);
    try {
      const response = await fetch(`${SERVER}/api/post-automation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locationId: LOCATION_ID,
          ...automationSettings,
          isActive: isActive,
        }),
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to update automation");
      window.dispatchEvent(
        new CustomEvent("automation-toggled", {
          detail: { isActive },
        })
      );
      showMessage(
        "success",
        isActive ? "Automation activated! ✅" : "Automation paused ⏸️"
      );
      await fetchAutomationSettings();
    } catch (error: any) {
      showMessage("error", error.message);
      setAutomationSettings({
        ...automationSettings,
        isActive: !isActive,
      });
    } finally {
      setAutomationLoading(false);
    }
  };

  // ==================== EFFECTS ====================

  useEffect(() => {
    if (LOCATION_ID && ACCOUNT_ID) {
      fetchDrafts();
      fetchPublishedPosts();
      fetchAutomationSettings();
    }
  }, [
    LOCATION_ID,
    ACCOUNT_ID,
    fetchDrafts,
    fetchPublishedPosts,
    fetchAutomationSettings,
  ]);

  // ==================== COMPONENTS ====================

  const DraftPostCard = ({ post }: { post: PostDraft }) => (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
      {post.media && post.media.length > 0 && (
        <div className="relative">
          <img
            src={post.media[0].sourceUrl}
            alt="Post media"
            className="w-full h-32 object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        </div>
      )}
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 line-clamp-2 mb-2">
          {post.summary}
        </h3>
        <p className="text-sm text-gray-500 mb-2">
          {new Date(post.createdAt).toLocaleDateString()}
        </p>
        <div className="flex items-center justify-between mb-4">
          <span className="inline-flex items-center bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-0.5 rounded-full">
            {post.topicType}
          </span>
          <span className="inline-flex items-center bg-gray-100 text-gray-700 text-xs font-medium px-2.5 py-0.5 rounded-full">
            <Clock className="w-3 h-3 mr-1.5" />
            Draft
          </span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => handleEditDraft(post)}
            className="flex-1 text-sm bg-white border border-blue-300 text-blue-600 py-2 px-4 rounded-md hover:bg-blue-50 flex items-center justify-center gap-1"
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit
          </button>
          <button
            onClick={() => handleDeleteDraft(post.id)}
            className="flex-1 text-sm bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50"
          >
            Delete
          </button>
          <button
            onClick={() => handlePublishDraft(post.id)}
            disabled={loading}
            className="flex-1 text-sm bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Publishing..." : "Post Now"}
          </button>
        </div>
      </div>
    </div>
  );

  const PublishedPostCard = ({ post }: { post: PostDraft }) => (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
      {post.media && post.media.length > 0 && (
        <img
          src={post.media[0].sourceUrl}
          alt="Post media"
          className="w-full h-32 object-cover"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      )}
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 line-clamp-2 mb-2">
          {post.summary}
        </h3>
        <p className="text-sm text-gray-500 mb-2">
          {post.publishedAt
            ? new Date(post.publishedAt).toLocaleDateString()
            : "N/A"}
        </p>
        <div className="flex items-center justify-between mb-3">
          <span className="inline-flex items-center bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Published
          </span>
          {post.callToAction && (
            <span className="text-sm font-medium text-blue-600">
              {post.callToAction.actionType}
            </span>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => handleEditPublishedPost(post)}
            className="flex items-center justify-center gap-1 text-sm bg-white border border-gray-300 text-gray-700 py-2 px-3 rounded-md hover:bg-gray-50"
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit
          </button>
          <button
            onClick={() => handleDeletePublishedPost(post)}
            disabled={loading}
            className="flex items-center justify-center gap-1 text-sm bg-white border border-red-300 text-red-600 py-2 px-3 rounded-md hover:bg-red-50 disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
          <button className="flex items-center justify-center gap-1 text-sm bg-blue-50 border border-blue-300 text-blue-600 py-2 px-3 rounded-md hover:bg-blue-100">
            <Eye className="w-3.5 h-3.5" />
            View
          </button>
        </div>
      </div>
    </div>
  );

  const DraftPosts = () => (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative w-full">
            <Search className="w-5 h-5 text-gray-400 absolute top-1/2 left-3 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search drafts"
              className="border border-gray-300 rounded-lg pl-10 py-2 w-full"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchDrafts}
            disabled={fetchingDrafts}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw
              className={`w-4 h-4 ${fetchingDrafts ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </div>

      {fetchingDrafts ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading drafts...</p>
        </div>
      ) : drafts.length === 0 ? (
        <div className="text-center py-16">
          <Copy className="mx-auto h-16 w-16 text-gray-300" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900">
            No drafts yet
          </h3>
          <p className="text-gray-500">
            Create your first post to get started!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {drafts.map((post) => (
            <DraftPostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );

  const PastPosts = () => (
    <div>
      <div className="flex flex-col md:flex-row justify-end items-center gap-4 mb-6">
        <button
          onClick={fetchPublishedPosts}
          className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {publishedPosts.length === 0 ? (
        <div className="text-center py-16">
          <Send className="mx-auto h-16 w-16 text-gray-300" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900">
            No published posts yet
          </h3>
          <p className="text-gray-500">Your published posts will appear here</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {publishedPosts.map((post) => (
            <PublishedPostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );

  // ==================== MAIN RENDER ====================

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Automate Posting
          </h2>
          <p className="text-gray-600 mt-1">
            Create, schedule and manage your Business posts automatically.
          </p>
        </div>
        <button
          onClick={() => setShowAutomationSettings(!showAutomationSettings)}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
        >
          <Settings className="w-4 h-4" />
          Automation Settings
        </button>
      </div>

      {/* Message Banner */}
      {message && (
        <div
          className={`p-3 rounded-lg mb-4 flex items-center justify-between ${message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
        >
          <div className="flex items-center gap-2">
            {message.type === "success" ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            {message.text}
          </div>
          <button onClick={() => setMessage(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Automation Settings Section - Keep existing code */}
      {showAutomationSettings && (
        <div className="mb-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
          {/* ... Keep all existing automation settings code ... */}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              <tab.icon
                className={`-ml-0.5 mr-2 h-5 w-5 ${activeTab === tab.id ? "text-blue-500" : "text-gray-400 group-hover:text-gray-500"}`}
              />
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === "create" && 
        <CreateNewPost
      topicType={topicType}
      setTopicType={setTopicType}
      eventTitle={eventTitle}
      setEventTitle={setEventTitle}
      eventStartDate={eventStartDate}
      setEventStartDate={setEventStartDate}
      eventEndDate={eventEndDate}
      setEventEndDate={setEventEndDate}
      couponCode={couponCode}
      setCouponCode={setCouponCode}
      redeemUrl={redeemUrl}
      setRedeemUrl={setRedeemUrl}
      termsConditions={termsConditions}
      setTermsConditions={setTermsConditions}
      postDescription={postDescription}
      setPostDescription={setPostDescription}
      isGenerating={isGenerating}
      handleGenerateAIDescription={handleGenerateAIDescription}
      mediaUrl={mediaUrl}
      setMediaUrl={setMediaUrl}
      ctaType={ctaType}
      setCtaType={setCtaType}
      ctaPhone={ctaPhone}
      setCtaPhone={setCtaPhone}
      ctaUrl={ctaUrl}
      setCtaUrl={setCtaUrl}
      loading={loading}
      handlePostNow={handlePostNow}
      handleSaveAsDraft={handleSaveAsDraft}
    />
        }
        {activeTab === "draft" && <DraftPosts />}
        {activeTab === "past" && <PastPosts />}
      </div>

      {/* 🔥 FIXED: Edit Post Modal - Now as separate component */}
      <EditPostModal
        editingPost={editingPost}
        showEditModal={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingPost(null);
        }}
        onSave={handleModalSave}
        loading={loading}
        showMessage={showMessage}
      />
    </div>
  );
}



// 🔥 EXTRACTED: CreateNewPost Component
interface CreateNewPostProps {
  topicType: string;
  setTopicType: (value: string) => void;
  eventTitle: string;
  setEventTitle: (value: string) => void;
  eventStartDate: string;
  setEventStartDate: (value: string) => void;
  eventEndDate: string;
  setEventEndDate: (value: string) => void;
  couponCode: string;
  setCouponCode: (value: string) => void;
  redeemUrl: string;
  setRedeemUrl: (value: string) => void;
  termsConditions: string;
  setTermsConditions: (value: string) => void;
  postDescription: string;
  setPostDescription: (value: string) => void;
  isGenerating: boolean;
  handleGenerateAIDescription: () => void;
  mediaUrl: string;
  setMediaUrl: (value: string) => void;
  ctaType: string;
  setCtaType: (value: string) => void;
  ctaPhone: string;
  setCtaPhone: (value: string) => void;
  ctaUrl: string;
  setCtaUrl: (value: string) => void;
  loading: boolean;
  handlePostNow: () => void;
  handleSaveAsDraft: () => void;
}

const CreateNewPost: React.FC<CreateNewPostProps> = ({
  topicType,
  setTopicType,
  eventTitle,
  setEventTitle,
  eventStartDate,
  setEventStartDate,
  eventEndDate,
  setEventEndDate,
  couponCode,
  setCouponCode,
  redeemUrl,
  setRedeemUrl,
  termsConditions,
  setTermsConditions,
  postDescription,
  setPostDescription,
  isGenerating,
  handleGenerateAIDescription,
  mediaUrl,
  setMediaUrl,
  ctaType,
  setCtaType,
  ctaPhone,
  setCtaPhone,
  ctaUrl,
  setCtaUrl,
  loading,
  handlePostNow,
  handleSaveAsDraft,
}) => (
  <div className="max-w-6xl mx-auto p-8 rounded-2xl">
    <div className="lg:col-span-2">
      {/* Post Type Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Post Type
        </label>
        <select
          value={topicType}
          onChange={(e) => setTopicType(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="STANDARD">📄 Standard Post</option>
          <option value="EVENT">📅 Event</option>
          <option value="OFFER">🎁 Offer</option>
          <option value="PRODUCT">🛍️ Product</option>
        </select>
        <p className="text-xs text-gray-500 mt-1">
          {topicType === "EVENT" && "Share upcoming events with your customers"}
          {topicType === "OFFER" && "Promote special deals and discounts"}
          {topicType === "PRODUCT" && "Showcase your products"}
          {topicType === "STANDARD" && "Share updates and news"}
        </p>
      </div>

      {/* EVENT-specific fields */}
      {topicType === "EVENT" && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-4">
          <div className="flex items-center gap-2 text-blue-700 font-medium mb-2">
            <CalendarDays className="w-5 h-5" />
            <span>Event Details</span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              maxLength={58}
              placeholder="e.g., Summer Sale 2025"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              {eventTitle.length}/58 characters
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={eventStartDate}
                onChange={(e) => setEventStartDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={eventEndDate}
                onChange={(e) => setEventEndDate(e.target.value)}
                min={eventStartDate || new Date().toISOString().split("T")[0]}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* OFFER-specific fields */}
      {topicType === "OFFER" && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg space-y-4">
          <div className="flex items-center gap-2 text-green-700 font-medium mb-2">
            <Tag className="w-5 h-5" />
            <span>Offer Details</span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Coupon Code
            </label>
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              maxLength={50}
              placeholder="e.g., SAVE20"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Redeem Online URL
            </label>
            <input
              type="url"
              value={redeemUrl}
              onChange={(e) => setRedeemUrl(e.target.value)}
              placeholder="https://your-website.com/offer"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500"
            />
          </div>

          <p className="text-xs text-amber-600 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            Either Coupon Code or Redeem URL is required
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Terms & Conditions (Optional)
            </label>
            <textarea
              value={termsConditions}
              onChange={(e) => setTermsConditions(e.target.value)}
              maxLength={500}
              rows={3}
              placeholder="e.g., Valid till stocks last. Cannot be combined with other offers."
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              {termsConditions.length}/500 characters
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 text-gray-700 font-medium mb-2">
              <CalendarDays className="w-4 h-4" />
              <span className="text-sm">
                Offer Validity Period <span className="text-red-500">*</span>
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Valid From
                </label>
                <input
                  type="date"
                  value={eventStartDate}
                  onChange={(e) => setEventStartDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Valid Until
                </label>
                <input
                  type="date"
                  value={eventEndDate}
                  onChange={(e) => setEventEndDate(e.target.value)}
                  min={eventStartDate || new Date().toISOString().split("T")[0]}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Description Textarea */}
      <div className="relative mb-2">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Post Description <span className="text-red-500">*</span>
        </label>
        <textarea
          value={postDescription}
          onChange={(e) => setPostDescription(e.target.value)}
          maxLength={1500}
          className="w-full h-36 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          placeholder="Write your post description (0-1500 chars)"
        />
        <span className="absolute bottom-3 right-3 text-sm text-gray-500">
          {postDescription.length}/1500 chars
        </span>
      </div>

      {/* AI Generate Button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={handleGenerateAIDescription}
          disabled={isGenerating}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4" />
          {isGenerating ? "Generating..." : "Generate AI Description"}
        </button>
      </div>

      {/* Media URL Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Add Image URL (Optional)
        </label>
        <div className="relative">
          <ImageIcon className="w-5 h-5 text-gray-400 absolute top-1/2 left-3 -translate-y-1/2" />
          <input
            type="url"
            value={mediaUrl}
            onChange={(e) => setMediaUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* CTA & Link/Phone Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="relative md:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Call to Action
          </label>
          <select
            value={ctaType}
            onChange={(e) => {
              setCtaType(e.target.value);
              setCtaUrl("");
              setCtaPhone("");
            }}
            className="w-full appearance-none bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="NONE">None</option>
            <option value="BOOK">Book</option>
            <option value="ORDER">Order Online</option>
            <option value="LEARN_MORE">Learn More</option>
            <option value="SIGN_UP">Sign Up</option>
            <option value="CALL">Call Now</option>
          </select>
          <ChevronDown className="w-5 h-5 text-gray-400 absolute bottom-3 right-3 pointer-events-none" />
        </div>

        {/* Phone Input for CALL */}
        {ctaType === "CALL" && (
          <div className="relative md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Phone className="w-5 h-5 text-gray-400 absolute top-1/2 left-3 -translate-y-1/2" />
              <input
                type="tel"
                value={ctaPhone}
                onChange={(e) => setCtaPhone(e.target.value)}
                placeholder="+1 (555) 123-4567"
                className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Enter with country code (e.g., +1 for US)
            </p>
          </div>
        )}

        {/* URL Input for other CTAs */}
        {ctaType !== "NONE" && ctaType !== "CALL" && (
          <div className="relative md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CTA Link <span className="text-red-500">*</span>
            </label>
            <LinkIcon className="w-5 h-5 text-gray-400 absolute bottom-3 left-3" />
            <input
              type="url"
              value={ctaUrl}
              onChange={(e) => setCtaUrl(e.target.value)}
              placeholder="https://your-website.com"
              className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-4">
        <button
          onClick={handlePostNow}
          disabled={loading || !postDescription.trim()}
          className="bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Publishing...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Post Now
            </>
          )}
        </button>
        <button
          onClick={handleSaveAsDraft}
          disabled={loading || !postDescription.trim()}
          className="bg-white border border-gray-300 text-gray-700 font-semibold py-2 px-6 rounded-lg hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          Save as Draft
        </button>
      </div>
    </div>
  </div>
);










export default PostAutomation;










