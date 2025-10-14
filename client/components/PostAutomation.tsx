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
} from "lucide-react";
import { SERVER as ServerBackend } from "@/constants";

const SERVER = ServerBackend || "http://localhost:3000";

// Types
interface PostDraft {
  id: string;
  locationId?: string;
  summary: string;
  topicType: string;
  event?: any;
  offer?: any;
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
  const [mediaUrl, setMediaUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

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

  // ==================== API FUNCTIONS ====================

  // Fetch Drafts
  const fetchDrafts = useCallback(async () => {
    if (!LOCATION_ID) return;

    setFetchingDrafts(true);
    try {
      const response = await fetch(
        `${SERVER}/api/post-drafts?locationId=${LOCATION_ID}&status=draft&limit=50`,
        { credentials: "include" },
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

  // Fetch Published Posts
  const fetchPublishedPosts = useCallback(async () => {
    if (!LOCATION_ID) return;

    try {
      const response = await fetch(
        `${SERVER}/api/post-drafts?locationId=${LOCATION_ID}&status=published&limit=50`,
        { credentials: "include" },
      );

      if (!response.ok) throw new Error("Failed to fetch published posts");

      const result = await response.json();
      setPublishedPosts(result.data || []);
    } catch (error) {
      console.error("Error fetching published posts:", error);
    }
  }, [LOCATION_ID]);

  // Create Draft
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

  // Update Draft/Post
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

  // Publish Draft to GMB
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
      },
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to publish post");
    }

    return response.json();
  };

  // Delete Draft
  const deleteDraft = async (draftId: string) => {
    const response = await fetch(`${SERVER}/api/post-drafts/${draftId}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!response.ok) throw new Error("Failed to delete draft");
    return response.json();
  };

  // 🔥 Delete Published Post from GMB and Database
  const deletePublishedPost = async (
    draftId: string,
    googlePostId: string,
    accountId: string,
    locationId: string,
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
      },
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to delete post from GMB");
    }

    return response.json();
  };

  // Fetch Automation Settings
  const fetchAutomationSettings = useCallback(async () => {
    if (!LOCATION_ID) return;

    try {
      const response = await fetch(
        `${SERVER}/api/post-automation?locationId=${LOCATION_ID}`,
        { credentials: "include" },
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

  // Save Automation Settings
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
    if (!postDescription.trim()) {
      showMessage("error", "Please add a post description");
      return;
    }

    if (!LOCATION_ID) {
      showMessage("error", "Please select a location first");
      return;
    }

    setLoading(true);
    try {
      const postData: any = {
        locationId: LOCATION_ID,
        summary: postDescription,
        topicType: topicType,
      };

      if (mediaUrl.trim()) {
        postData.media = [
          {
            mediaFormat: "PHOTO",
            sourceUrl: mediaUrl.trim(),
          },
        ];
      }

      if (ctaType !== "NONE" && ctaUrl.trim()) {
        postData.callToAction = {
          actionType: ctaType,
          url: ctaUrl.trim(),
        };
      }

      await createDraft(postData);

      setPostDescription("");
      setMediaUrl("");
      setCtaUrl("");
      setCtaType("NONE");

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
    if (!postDescription.trim()) {
      showMessage("error", "Please add a post description");
      return;
    }

    setLoading(true);
    try {
      const postData: any = {
        locationId: LOCATION_ID,
        summary: postDescription,
        topicType: topicType,
      };

      if (mediaUrl.trim()) {
        postData.media = [
          {
            mediaFormat: "PHOTO",
            sourceUrl: mediaUrl.trim(),
          },
        ];
      }

      if (ctaType !== "NONE" && ctaUrl.trim()) {
        postData.callToAction = {
          actionType: ctaType,
          url: ctaUrl.trim(),
        };
      }

      const draftResult = await createDraft(postData);
      await publishDraft(draftResult.data.id);

      setPostDescription("");
      setMediaUrl("");
      setCtaUrl("");
      setCtaType("NONE");

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

  // 🔥 NEW: Handle Edit Published Post
  const handleEditPublishedPost = (post: PostDraft) => {
    setEditingPost(post);
    setShowEditModal(true);
  };

  // 🔥 NEW: Handle Edit Draft
  const handleEditDraft = (post: PostDraft) => {
    setEditingPost(post);
    setShowEditModal(true);
  };

  // 🔥 MODIFY: Save Edited Post function ko update karo
  const handleSaveEditedPost = async () => {
    if (!editingPost) return;

    setLoading(true);
    try {
      const postData: any = {
        summary: editingPost.summary,
        topicType: editingPost.topicType,
        media: editingPost.media || null,
        callToAction: editingPost.callToAction || null,
      };

      await updatePost(editingPost.id, postData);

      // 🔥 Check if draft or published
      if (editingPost.status === "draft") {
        await fetchDrafts(); // Refresh drafts
      } else {
        await fetchPublishedPosts(); // Refresh published
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

  // 🔥 NEW: Save Edited Post
  //   const handleSaveEditedPost = async () => {
  //     if (!editingPost) return;

  //     setLoading(true);
  //     try {
  //       const postData: any = {
  //         summary: editingPost.summary,
  //         topicType: editingPost.topicType,
  //         media: editingPost.media || null,
  //         callToAction: editingPost.callToAction || null,
  //       };

  //       await updatePost(editingPost.id, postData);
  //       await fetchPublishedPosts();

  //       setShowEditModal(false);
  //       setEditingPost(null);
  //       showMessage("success", "Post updated successfully!");
  //     } catch (error: any) {
  //       showMessage("error", error.message);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  // 🔥 NEW: Handle Delete Published Post
  const handleDeletePublishedPost = async (post: PostDraft) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this post from Google My Business? This action cannot be undone.",
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
        LOCATION_ID,
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
          {/* 🔥 NEW: Edit Button */}
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

  // 🔥 UPDATED: Published Post Card with Edit & Delete
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

        {/* Action Buttons */}
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

  // 🔥 NEW: Edit Post Modal
  const EditPostModal = () => {
    if (!showEditModal || !editingPost) return null;

    // 🔥 Local state for editing
    const [localPost, setLocalPost] = useState<PostDraft>(editingPost);

    // 🔥 Update local state when editingPost changes
    useEffect(() => {
      if (editingPost) {
        setLocalPost(editingPost);
      }
    }, [editingPost]);

    // 🔥 Modified save handler
    const handleSave = async () => {
      setLoading(true);
      try {
        const postData: any = {
          summary: localPost.summary,
          topicType: localPost.topicType,
          media: localPost.media || null,
          callToAction: localPost.callToAction || null,
        };

        await updatePost(localPost.id, postData);

        if (localPost.status === "draft") {
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

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900">
              {localPost?.status === "draft" ? "Edit Draft" : "Edit Post"}
            </h3>
            <button
              onClick={() => {
                setShowEditModal(false);
                setEditingPost(null);
              }}
              className="text-gray-400 hover:text-gray-600"
            >
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

            {/* Description - 🔥 Yaha fix hai */}
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

            {/* CTA URL */}
            {localPost.callToAction?.actionType &&
              localPost.callToAction.actionType !== "NONE" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CTA Link
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
              onClick={() => {
                setShowEditModal(false);
                setEditingPost(null);
              }}
              className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave} // 🔥 Local save handler
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

  // ==================== TAB CONTENT ====================

  const CreateNewPost = () => (
    <div className="max-w-6xl mx-auto p-8 rounded-2xl">
      <div className="lg:col-span-2">
        {/* Post Type Selector */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Post Type
          </label>
          <select
            value={topicType}
            onChange={(e) => setTopicType(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
          >
            <option value="STANDARD">Standard Post</option>
            <option value="EVENT">Event</option>
            <option value="OFFER">Offer</option>
            <option value="PRODUCT">Product</option>
          </select>
        </div>

        {/* Description Textarea */}
        <div className="relative mb-2">
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

        {/* CTA & Link */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="relative md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Call to Action
            </label>
            <select
              value={ctaType}
              onChange={(e) => setCtaType(e.target.value)}
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

          {ctaType !== "NONE" && (
            <div className="relative md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CTA Link
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
            className="bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Publishing..." : "Post Now"}
          </button>
          <button
            onClick={handleSaveAsDraft}
            disabled={loading || !postDescription.trim()}
            className="bg-white border border-gray-300 text-gray-700 font-semibold py-2 px-6 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Save as Draft
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

  // Toggle handler with auto-save
  const handleToggleAutomation = async (isActive: boolean) => {
    setAutomationSettings({
      ...automationSettings,
      isActive: isActive,
    });

    // Auto-save immediately
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
          isActive: isActive, // Updated value
        }),
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to update automation");
       window.dispatchEvent(
         new CustomEvent("automation-toggled", {
           detail: { isActive },
         }),
       );
      showMessage(
        "success",
        isActive ? "Automation activated! ✅" : "Automation paused ⏸️",
      );
      await fetchAutomationSettings();
    } catch (error: any) {
      showMessage("error", error.message);
      // Revert on error
      setAutomationSettings({
        ...automationSettings,
        isActive: !isActive,
      });
    } finally {
      setAutomationLoading(false);
    }
  };

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

      {/* 🔥 AUTOMATION SETTINGS SECTION */}
      {showAutomationSettings && (
        <div className="mb-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Play className="w-5 h-5 text-blue-600" />
                Post Automation Settings
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Automatically publish posts from your drafts on a schedule
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={automationSettings.isActive}
                onChange={(e) => handleToggleAutomation(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              <span className="ml-3 text-sm font-medium text-gray-700">
                {automationSettings.isActive ? "Active" : "Inactive"}
              </span>
            </label>
          </div>

          {/* Automation Controls Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Frequency Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Posting Frequency
              </label>
              <select
                value={automationSettings.frequency}
                onChange={(e) => {
                  const freq = e.target.value;
                  let days = 7;
                  if (freq === "daily") days = 1;
                  else if (freq === "weekly") days = 7;
                  else if (freq === "biweekly") days = 14;
                  else if (freq === "monthly") days = 30;

                  setAutomationSettings({
                    ...automationSettings,
                    frequency: freq,
                    intervalDays:
                      freq === "custom"
                        ? automationSettings.intervalDays
                        : days,
                  });
                }}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="biweekly">Bi-weekly</option>
                <option value="monthly">Monthly</option>
                <option value="custom">Custom Interval</option>
              </select>
            </div>

            {/* Custom Interval Days */}
            {automationSettings.frequency === "custom" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Post Every X Days
                </label>
                <input
                  type="number"
                  min="1"
                  max="90"
                  value={automationSettings.intervalDays}
                  onChange={(e) =>
                    setAutomationSettings({
                      ...automationSettings,
                      intervalDays: parseInt(e.target.value) || 1,
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {/* Max Per Month */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Posts Per Month (Optional)
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={automationSettings.maxPerMonth || ""}
                onChange={(e) =>
                  setAutomationSettings({
                    ...automationSettings,
                    maxPerMonth: e.target.value
                      ? parseInt(e.target.value)
                      : null,
                  })
                }
                placeholder="No limit"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Default Post Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Post Type
              </label>
              <select
                value={automationSettings.defaultTopicType}
                onChange={(e) =>
                  setAutomationSettings({
                    ...automationSettings,
                    defaultTopicType: e.target.value,
                  })
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="STANDARD">Standard</option>
                <option value="EVENT">Event</option>
                <option value="OFFER">Offer</option>
                <option value="PRODUCT">Product</option>
              </select>
            </div>
          </div>

          {/* Checkboxes for Media and CTA */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={automationSettings.includeMedia}
                onChange={(e) =>
                  setAutomationSettings({
                    ...automationSettings,
                    includeMedia: e.target.checked,
                  })
                }
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">
                Include media in automated posts
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={automationSettings.includeCTA}
                onChange={(e) =>
                  setAutomationSettings({
                    ...automationSettings,
                    includeCTA: e.target.checked,
                  })
                }
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">
                Include CTA in automated posts
              </span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4">
            <button
              onClick={saveAutomationSettings}
              disabled={automationLoading}
              className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-wait"
            >
              <Save className="w-4 h-4" />
              {automationLoading ? "Saving..." : "Save Automation Settings"}
            </button>

            <button
              onClick={handleTestRun}
              disabled={loading || drafts.length === 0}
              className="inline-flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="w-4 h-4" />
              Test Run (Publish 1 Draft)
            </button>

            <button
              onClick={() => setShowAutomationSettings(false)}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Close
            </button>
          </div>

          {/* Info Box */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">How Automation Works:</p>
                <ul className="list-disc list-inside space-y-1 text-blue-700">
                  <li>
                    System will automatically publish drafts based on your
                    frequency
                  </li>
                  <li>
                    Drafts are published in the order they were created (oldest
                    first)
                  </li>
                  <li>
                    Make sure you have enough drafts for continuous posting
                  </li>
                  <li>
                    You can monitor published posts in the "Published Posts" tab
                  </li>
                </ul>
              </div>
            </div>
          </div>
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
        {activeTab === "create" && <CreateNewPost />}
        {activeTab === "draft" && <DraftPosts />}
        {activeTab === "past" && <PastPosts />}
      </div>

      {/* 🔥 Edit Post Modal */}
      <EditPostModal />
    </div>
  );
}

export default PostAutomation;