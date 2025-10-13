import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {  DialogContent } from "@/components/ui/dialog";
import { RootState } from "@/redux/store";
import {
  BarChart3,
  Bell,
  Calendar,
  MessageSquare,
  RefreshCw,
  Settings as SettingsIcon,
  Star,
  Upload,
  Video,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Calendar as CalendarIcon } from "lucide-react";
import {SERVER} from "@/constants/index"

// Replace your existing lucide-react import with this
import {
  Bookmark,  ChevronDown, Clock, Copy, Eye, Image as ImageIcon, Link as LinkIcon, 
  MoreVertical, Pencil, Plus, Search, Send,Sparkles, Settings as  ThumbsUp, Trash2,CheckCircle2,ImageOff,Cloud,
     
  
} from "lucide-react";

type DraftImage = {
  id: string | number;
  type: 'file' | 'url';
  value: File | string;
  previewUrl: string;
};


interface AutomationModule {
  id: string;
  name: string;
  icon: any;
  enabled: boolean;
  description: string;
  status?: "active" | "paused" | "setup";
}

const automationModules: AutomationModule[] = [
  {
    id: "upload-images",
    name: "Upload Images",
    icon: Upload,
    enabled: true,
    description: "Automatically upload and schedule business photos",
    status: "active",
  },
  {
    id: "automate-posting",
    name: "Automate Posting",
    icon: Calendar,
    enabled: false,
    description: "Create and publish regular updates to your profile",
    status: "setup",
  },
  {
    id: "review-management",
    name: "Review Management",
    icon: Star,
    enabled: true,
    description: "Automatically respond to customer reviews",
    status: "active",
  },
  {
    id: "automate-qas",
    name: "Automate Q&As",
    icon: MessageSquare,
    enabled: false,
    description: "Generate and manage Q&A content",
    status: "setup",
  },
  {
    id: "automate-videos",
    name: "Automate Videos",
    icon: Video,
    enabled: false,
    description: "Create and schedule promotional videos",
    status: "setup",
  },
  {
    id: "account-manager",
    name: "Account Manager",
    icon: Bell,
    enabled: true,
    description: "Manage alerts and notifications",
    status: "active",
  },
  {
    id: "reporting",
    name: "Reporting",
    icon: BarChart3,
    enabled: true,
    description: "Automated performance reports",
    status: "active",
  },
  {
    id: "summary",
    name: "Summary",
    icon: SettingsIcon,
    enabled: true,
    description: "View upcoming and completed automations",
    status: "active",
  },
];

export default function Automation() {
  const [selectedModule, setSelectedModule] = useState(automationModules[0]);
  const [modules, setModules] = useState(automationModules);

  const toggleModule = (moduleId: string) => {
    setModules(
      modules.map((module) =>
        module.id === moduleId
          ? { ...module, enabled: !module.enabled }
          : module,
      ),
    );
  };

  const progressPercentage = Math.round(
    (modules.filter((m) => m.enabled).length / modules.length) * 100,
  );

  return (
    <div className="flex h-full bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Automation</h1>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Progress
              </span>
              <span className="text-sm font-medium text-gbp-blue-600">
                {progressPercentage}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gbp-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Automation Settings */}
        <div className="p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Automation Settings
          </h3>
          <div className="space-y-1">
            {modules.map((module) => (
              <div
                key={module.id}
                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedModule.id === module.id
                    ? "bg-gbp-blue-50 border border-gbp-blue-200"
                    : "hover:bg-gray-50"
                }`}
                onClick={() => setSelectedModule(module)}
              >
                <div className="flex items-center space-x-3">
                  <module.icon
                    className={`w-5 h-5 ${selectedModule.id === module.id ? "text-gbp-blue-600" : "text-gray-400"}`}
                  />
                  <span
                    className={`text-sm font-medium ${selectedModule.id === module.id ? "text-gbp-blue-700" : "text-gray-700"}`}
                  >
                    {module.name}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      module.enabled
                        ? module.status === "active"
                          ? "bg-green-500"
                          : "bg-yellow-500"
                        : "bg-gray-300"
                    }`}
                  ></div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={module.enabled}
                      onChange={() => toggleModule(module.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gbp-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gbp-blue-600"></div>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-auto">
        <AutomationContent module={selectedModule} />
      </div>
    </div>
  );
}

interface AutomationContentProps {
  module: AutomationModule;
}

interface FileImportDialogProps {
  open: boolean;
  onClose: () => void;
  onImport: (data: { files: File[] }) => void;
  acceptTypes?: string;
  title?: string;
  description?: string;
  importButtonLabel?: string;
  cancelButtonLabel?: string;
  imageSrc?: string;
  multiple?: boolean;
  files: File[];
  setFiles: React.Dispatch<React.SetStateAction<File[]>>;
  isImporting?: boolean;
}

function AutomationContent({ module }: AutomationContentProps) {
  switch (module.id) {
    case "upload-images":
      return <ImageUploadAutomation />;
    case "review-management":
      return <ReviewManagementAutomation />;
    case "automate-qas":
      return <QAAutomation />;
    case "automate-videos":
      return <VideoAutomation />;
    case "account-manager":
      return <AccountManagerAutomation />;
    case "reporting":
      return <ReportingAutomation />;
    case "summary":
      return <SummaryAutomation />;
    default:
      return <DefaultAutomation module={module} />;
  }
}



// Placeholder for your FileImportDialog component (MUST be defined elsewhere)
// import FileImportDialog from './FileImportDialog'; 

// --- Configuration ---
const API_BASE_URL = "http://localhost:3000/api/v1"; // <-- UPDATE THIS TO YOUR SERVER ROOT

// Dummy implementation for the dialog trigger/state management
const Dialog = ({ children }) => <>{children}</>;
const DialogTrigger = ({ asChild, children, ...props }) => <div {...props}>{children}</div>;


// Mock FileImportDialog structure for completeness
const FileImportDialog = ({ open, onClose, onImport, files, setFiles }) => {
    if (!open) return null;

    const handleFilesDrop = (newFiles) => {
        // In a real scenario, this function would be complex, 
        // but for integration, we just call onImport with the final list.
        onImport({ files: newFiles });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full">
                <h4 className="font-bold mb-4">Select Files to Upload</h4>
                {/* Simulated file list */}
                {files.length > 0 && (
                    <ul className="mb-4 text-sm list-disc list-inside">
                        {files.map((f, i) => <li key={i}>{f.name} ({Math.round(f.size / 1024)} KB)</li>)}
                    </ul>
                )}
                
                {/* Input simulation for demo */}
                <input
                    type="file"
                    multiple
                    onChange={(e) => {
                        const selectedFiles = Array.from(e.target.files || []);
                        setFiles(selectedFiles);
                    }}
                    className="mb-4 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gbp-blue-100 file:text-gbp-blue-700 hover:file:bg-gbp-blue-200"
                />

                <div className="flex justify-end space-x-2">
                    <button 
                        onClick={() => {
                            // In a real scenario, you might use the files state here 
                            // or just rely on the handleImport from the main component flow.
                            handleFilesDrop(files); 
                        }}
                        className="bg-gbp-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-gbp-blue-700"
                        disabled={files.length === 0}
                    >
                        Process & Upload ({files.length})
                    </button>
                    <button 
                        onClick={onClose}
                        className="border border-gray-300 px-4 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}









function ImageUploadAutomation() {
  const [dialogOpen, setDialogOpen] = useState(false);
  // This 'files' state is now primarily for the dialog
  const [files, setFiles] = useState<File[]>([]);

  // --- NEW: State for managing images in the draft/staging area ---
  const [draftImages, setDraftImages] = useState<DraftImage[]>([]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [url, setUrl] = useState("");
  const [urlError, setUrlError] = useState("");

  const [scheduledDate, setScheduledDate] = useState<string>("");
  const [automationSettings, setAutomationSettings] = useState({
    isActive: false,
    frequency: "daily",
    intervalDays: 1,
    maxPerMonth: null as number | null,
  });
  const [fetchingDrafts, setFetchingDrafts] = useState(false);
  const [automationLoading, setAutomationLoading] = useState(false);

  const [uploadedImages, setUploadedImages] = useState<any[]>([]);
  const [fetchingUploaded, setFetchingUploaded] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const [gmbImages, setGmbImages] = useState<any[]>([]); // GMB se aane wali real images
  const [fetchingGMB, setFetchingGMB] = useState(false);

  const { user } = useSelector((state: RootState) => state.user);
  const { activeLocation } = useSelector(
    (state: RootState) => state.activeLocation,
  );

  const ACCOUNT_ID = user?.accountId || "";
  const LOCATION_ID = activeLocation?.locationId || "";

  // --- API upload functions (unchanged) ---
  const uploadFromSourceUrl = useCallback(
    async (sourceUrl: string) => {
      /* ...your existing code... */ return Promise.resolve();
    },
    [ACCOUNT_ID, LOCATION_ID],
  );
  const uploadToTempServer = useCallback(
    async (file: File): Promise<{ temp_url: string; file_id: string }> => {
      /* ...your existing code... */ return Promise.resolve({
        temp_url: "",
        file_id: "",
      });
    },
    [],
  );
  const uploadFinalMedia = useCallback(
    async (tempUrl: string) => {
      /* ...your existing code... */ return Promise.resolve();
    },
    [ACCOUNT_ID, LOCATION_ID],
  );

  // Fetch previously uploaded images from GMB
  const fetchUploadedImages = useCallback(async () => {
    try {
      const response = await fetch(
        `${SERVER}/api/media-drafts?locationId=${LOCATION_ID}&status=uploaded`,
        { credentials: "include" },
      );

      if (!response.ok) throw new Error("Failed to fetch uploaded images");

      const result = await response.json();

      // Convert to UI format
      const uploadedImages = result.data.map((img: any) => ({
        id: img.googleMediaId || img.id,
        url: img.fileUrl,
        category: img.category,
        uploadedAt: new Date(img.uploadedAt).toLocaleDateString(),
        title: img.title,
        description: img.description,
      }));

      return uploadedImages;
    } catch (error) {
      console.error("Error fetching uploaded images:", error);
      return [];
    }
  }, [LOCATION_ID]);

  const fetchDraftsFromBackend = useCallback(async () => {
    setFetchingDrafts(true);
    try {
      const response = await fetch(
        `${SERVER}/api/media-drafts?locationId=${LOCATION_ID}&status=draft`,
        { credentials: "include" },
      );

      if (!response.ok) throw new Error("Failed to fetch drafts");

      const result = await response.json();

      // Convert backend drafts to UI format
      const backendDrafts: DraftImage[] = result.data.map((draft: any) => ({
        id: draft.id,
        type: "file",
        value: draft.fileName,
        previewUrl: draft.fileUrl,
      }));

      setDraftImages(backendDrafts);
    } catch (error) {
      console.error("Error fetching drafts:", error);
    } finally {
      setFetchingDrafts(false);
    }
  }, [LOCATION_ID]);

  // Upload file to draft (backend)
  const uploadToDraft = async (file: File, scheduleDate?: string) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("locationId", LOCATION_ID);
    formData.append("category", "ADDITIONAL");

    if (scheduleDate) {
      formData.append("scheduledFor", scheduleDate);
    }

    const response = await fetch(`${SERVER}/api/media-drafts`, {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Draft upload failed");
    }

    return response.json();
  };

  // Upload URL to draft
  const uploadUrlToDraft = async (imageUrl: string, scheduleDate?: string) => {
    const formData = new FormData();
    formData.append("fileUrl", imageUrl);
    formData.append("locationId", LOCATION_ID);
    formData.append("category", "ADDITIONAL");

    if (scheduleDate) {
      formData.append("scheduledFor", scheduleDate);
    }

    const response = await fetch(`${SERVER}/api/media-drafts`, {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    if (!response.ok) throw new Error("URL draft failed");
    return response.json();
  };

  // Post draft to GMB
  const postDraftToGMB = async (draftId: string) => {
    const formData = new FormData();
    formData.append("acct_id", ACCOUNT_ID);
    formData.append("loc_id", LOCATION_ID);

    const response = await fetch(
      `${SERVER}/api/media-drafts/${draftId}/upload-to-google`,
      {
        method: "POST",
        body: formData,
        credentials: "include",
      },
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "GMB upload failed");
    }

    return response.json();
  };

  // Delete draft
  const deleteDraft = async (draftId: string) => {
    const response = await fetch(`${SERVER}/api/media-drafts/${draftId}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!response.ok) throw new Error("Delete failed");
    return response.json();
  };

  // Save automation settings
  const saveAutomationSettings = async () => {
    setAutomationLoading(true);
    try {
      const response = await fetch(`${SERVER}/api/media-automation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locationId: LOCATION_ID,
          isActive: automationSettings.isActive,
          frequency: automationSettings.frequency,
          intervalDays: automationSettings.intervalDays,
          maxPerMonth: automationSettings.maxPerMonth,
        }),
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to save automation");

      setMessage({ type: "success", text: "Automation settings saved!" });
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setAutomationLoading(false);
    }
  };

  // Fetch automation settings
  const fetchAutomationSettings = useCallback(async () => {
    try {
      const response = await fetch(
        `${SERVER}/api/media-automation?locationId=${LOCATION_ID}`,
        { credentials: "include" },
      );

      if (!response.ok) return;

      const result = await response.json();
      if (result.data && result.data.length > 0) {
        const settings = result.data[0];
        setAutomationSettings({
          isActive: settings.isActive,
          frequency: settings.frequency,
          intervalDays: settings.intervalDays || 1,
          maxPerMonth: settings.maxPerMonth,
        });
      }
    } catch (error) {
      console.error("Error fetching automation:", error);
    }
  }, [LOCATION_ID]);

  // REPLACE EXISTING handleAddUrlToDrafts with:
  const handleAddUrlToDrafts = async () => {
    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
      setUrlError("Please enter a valid image URL.");
      return;
    }

    try {
      new URL(trimmedUrl);
    } catch {
      setUrlError("Invalid URL format.");
      return;
    }

    setLoading(true);
    setUrlError("");

    try {
      // Upload to backend
      const result = await uploadUrlToDraft(trimmedUrl, scheduledDate);

      // Add to local state
      const newDraft: DraftImage = {
        id: result.data.id,
        type: "url",
        value: trimmedUrl,
        previewUrl: trimmedUrl,
      };

      setDraftImages((prev) => [...prev, newDraft]);
      setUrl("");
      setScheduledDate("");
      setMessage({ type: "success", text: "Image added to drafts!" });
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  };

  // REPLACE EXISTING handleAddFilesToDrafts with:
  const handleAddFilesToDrafts = useCallback(
    async ({ files: importedFiles }: { files: File[] }) => {
      if (importedFiles.length === 0) return;

      setLoading(true);
      let successCount = 0;

      for (const file of importedFiles) {
        try {
          // Upload to backend
          const result = await uploadToDraft(file, scheduledDate);

          // Add to local state
          const newDraft: DraftImage = {
            id: result.data.id,
            type: "file",
            value: file,
            previewUrl: URL.createObjectURL(file),
          };

          setDraftImages((prev) => [...prev, newDraft]);
          successCount++;
        } catch (error) {
          console.error("Draft upload failed:", file.name, error);
          alert(error);
          setMessage({ type: "error", text: JSON.stringify(error) });
        }
      }

      setLoading(false);
      setDialogOpen(false);
      setScheduledDate("");
      setMessage({
        type: "success",
        text: `${successCount} image(s) added to drafts!`,
      });
      setTimeout(() => setMessage(null), 3000);
    },
    [scheduledDate],
  );

  // REPLACE EXISTING handleRemoveDraft with:
  const handleRemoveDraft = async (idToRemove: string | number) => {
    try {
      // Delete from backend
      await deleteDraft(idToRemove as string);

      // Remove from local state
      setDraftImages((prev) =>
        prev.filter((draft) => {
          if (
            draft.id === idToRemove &&
            draft.type === "file" &&
            typeof draft.value !== "string"
          ) {
            URL.revokeObjectURL(draft.previewUrl);
          }
          return draft.id !== idToRemove;
        }),
      );

      setMessage({ type: "success", text: "Draft removed!" });
      setTimeout(() => setMessage(null), 2000);
    } catch (error: any) {
      setMessage({ type: "error", text: "Failed to remove draft" });
    }
  };

  // REPLACE EXISTING handlePostAllDrafts with:
  const handlePostAllDrafts = async () => {
    if (draftImages.length === 0) return;

    setLoading(true);
    setMessage({
      type: "success",
      text: `Posting ${draftImages.length} image(s)...`,
    });

    let successCount = 0;
    let errorCount = 0;

    for (const draft of draftImages) {
      try {
        await postDraftToGMB(draft.id as string);
        successCount++;
      } catch (error) {
        console.error("Failed to post:", draft, error);
        errorCount++;
      }
    }

    setLoading(false);

    // Refresh drafts from backend
    await fetchDraftsFromBackend();

    setFetchingGMB(true);
    const updatedGMBImages = await fetchGMBMedia();
    setGmbImages(updatedGMBImages);
    setFetchingGMB(false);

    setMessage({
      type: successCount > 0 ? "success" : "error",
      text: `Posted ${successCount} images${errorCount > 0 ? `. ${errorCount} failed.` : "!"}`,
    });
  };

  const deleteUploadedImage = async (googleMediaId: string) => {
    try {
      const response = await fetch(`${SERVER}/api/media/${googleMediaId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) throw new Error("Delete failed");

      // Refresh list
      const updatedImages = await fetchUploadedImages();
      setUploadedImages(updatedImages);

      setMessage({ type: "success", text: "Image deleted!" });
    } catch (error: any) {
      setMessage({ type: "error", text: error.message });
    }
  };

  // Fetch actual GMB media (real images from Google)
  // const fetchGMBMedia = useCallback(async () => {
  //   if (!ACCOUNT_ID || !LOCATION_ID) return [];

  //   try {
  //     const response = await fetch(
  //       `${SERVER}/api/v1/accounts/${ACCOUNT_ID}/locations/${LOCATION_ID}/media`,
  //       { credentials: "include" },
  //     );

  //     if (!response.ok) throw new Error("Failed to fetch GMB media");

  //     const result = await response.json();

  //     // Google's response format: mediaItems array
  //     const gmbImages = result.data.map((item: any) => ({
  //       id: item.name?.split("/").pop() || item.mediaItemId,
  //       url: item.googleUrl || item.sourceUrl,
  //       category: item.locationAssociation?.category || "ADDITIONAL",
  //       uploadedAt: item.createTime
  //         ? new Date(item.createTime).toLocaleDateString()
  //         : "Unknown",
  //       title: item.description || null,
  //       description: item.description || null,
  //       mediaFormat: item.mediaFormat,
  //       dimensions: item.dimensions,
  //       isGMBImage: true, // flag to distinguish from drafts
  //     }));

  //     return gmbImages;
  //   } catch (error) {
  //     console.error("Error fetching GMB media:", error);
  //     return [];
  //   }
  // }, [ACCOUNT_ID, LOCATION_ID]);

  const fetchGMBMedia = useCallback(async () => {
    if (!ACCOUNT_ID || !LOCATION_ID) return [];

    try {
      const response = await fetch(
        `${SERVER}/api/v1/accounts/${ACCOUNT_ID}/locations/${LOCATION_ID}/media`,
        { credentials: "include" },
      );

      if (!response.ok) throw new Error("Failed to fetch GMB media");

      const result = await response.json();

      console.log("gmb images result", result);

      // 🔥 FIX: result.data ki jagah result.mediaItems use karo
      const gmbImages = (result.mediaItems || []).map((item: any) => ({
        id: item.name?.split("/").pop() || item.mediaItemId,
        url: item.thumbnailUrl || item.googleUrl, 
        fullUrl: item.googleUrl, 
        category: item.locationAssociation?.category || "ADDITIONAL",
        uploadedAt: item.createTime
          ? new Date(item.createTime).toLocaleDateString()
          : "Unknown",
        title: item.description || null,
        description: item.description || null,
        mediaFormat: item.mediaFormat,
        dimensions: item.dimensions,
        thumbnailUrl: item.thumbnailUrl, // 👈 ye bhi add kar lo
        isGMBImage: true,
      }));

      console.log("Gmbimages", gmbImages)

      return gmbImages;
    } catch (error) {
      console.error("Error fetching GMB media:", error);
      return [];
    }
  }, [ACCOUNT_ID, LOCATION_ID]);



  useEffect(() => {
    if (LOCATION_ID && ACCOUNT_ID) {
      fetchDraftsFromBackend();
      fetchAutomationSettings();

      // 🔥 Fetch real GMB images
      setFetchingGMB(true);
      fetchGMBMedia().then((images) => {
        setGmbImages(images);
        setFetchingGMB(false);
      });
    }
  }, [
    LOCATION_ID,
    ACCOUNT_ID,
    fetchDraftsFromBackend,
    fetchAutomationSettings,
    fetchGMBMedia,
  ]);



  // --- JSX RENDER ---
  return (
    <div className="max-w-6xl mx-auto bg-blue-50 p-8 rounded-2xl">
      {/* Header and Upload Options (mostly unchanged) */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Image Upload Automation
          </h1>
          <p className="text-gray-600 mt-1">
            Easily upload images, trust AI to manage frequency, and keep your
            profile fresh automatically.
          </p>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-1">
          You have 3 options to upload images:
        </h2>
        <p className="text-gray-500 mb-4">
          Pro Tip: Try to add at least 5 images.
        </p>
        {message && (
          <div
            className={`p-3 rounded-lg mb-4 text-sm ${message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
          >
            {message.text}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Option 1: URL Upload - Button now adds to draft */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h4 className="font-semibold text-gray-900 mb-2">
              Upload Using Link
            </h4>
            <input
              type="url"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setUrlError("");
              }}
              placeholder="https://example.com/image.jpg"
              className={`w-full border rounded px-3 py-2 text-sm mb-2 ${urlError ? "border-red-500" : "border-gray-300"}`}
              disabled={loading}
            />
            {urlError && (
              <p className="text-red-500 text-xs mb-2">{urlError}</p>
            )}
            <button
              onClick={handleAddUrlToDrafts} // UPDATED
              disabled={loading || !url.trim()}
              className="w-full bg-gbp-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-gbp-blue-700 disabled:opacity-60"
            >
              Add to Drafts
            </button>
          </div>
          {/* Other upload options ... */}
          <div className="bg-white rounded-lg p-4 shadow-sm flex flex-col items-center justify-center border-2 border-dashed border-blue-300">
            <h4 className="font-semibold text-gray-900 mb-2">
              Drag and Drop Upload
            </h4>
            <div
              className="text-center cursor-pointer"
              onClick={() => !loading && setDialogOpen(true)}
            >
              <Cloud className="w-10 h-10 mx-auto mb-2 text-gbp-blue-500" />
              <p className="text-sm text-gray-500">Click or drop images here</p>
            </div>
          </div>
        </div>
      </div>

      <FileImportDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onImport={handleAddFilesToDrafts}
        files={files}
        setFiles={setFiles}
      />

      {/* 🔥 ADD THIS SECTION - After the 3 upload options grid */}

      {/* Automation Settings Section */}
      <div className="mt-8 bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              Automation Settings
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Set up automatic image posting to your GMB profile
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={automationSettings.isActive}
              onChange={(e) =>
                setAutomationSettings({
                  ...automationSettings,
                  isActive: e.target.checked,
                })
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gbp-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gbp-blue-600"></div>
            <span className="ml-3 text-sm font-medium text-gray-700">
              {automationSettings.isActive ? "Active" : "Inactive"}
            </span>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Frequency Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Frequency
            </label>
            <select
              value={automationSettings.frequency}
              onChange={(e) =>
                setAutomationSettings({
                  ...automationSettings,
                  frequency: e.target.value,
                })
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gbp-blue-500"
              disabled={!automationSettings.isActive}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="custom">Custom Interval</option>
            </select>
          </div>

          {/* Custom Interval Days */}
          {automationSettings.frequency === "custom" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Every X Days
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={automationSettings.intervalDays}
                onChange={(e) =>
                  setAutomationSettings({
                    ...automationSettings,
                    intervalDays: parseInt(e.target.value) || 1,
                  })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gbp-blue-500"
                disabled={!automationSettings.isActive}
              />
            </div>
          )}

          {/* Monthly Limit */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Uploads Per Month (Optional)
            </label>
            <input
              type="number"
              min="1"
              placeholder="No limit"
              value={automationSettings.maxPerMonth || ""}
              onChange={(e) =>
                setAutomationSettings({
                  ...automationSettings,
                  maxPerMonth: e.target.value ? parseInt(e.target.value) : null,
                })
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gbp-blue-500"
              disabled={!automationSettings.isActive}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-between items-center">
          <p className="text-sm text-gray-500">
            {automationSettings.isActive
              ? `🤖 Automation will post images ${automationSettings.frequency === "custom" ? `every ${automationSettings.intervalDays} days` : automationSettings.frequency}`
              : "⏸️ Automation is currently paused"}
          </p>
          <button
            onClick={saveAutomationSettings}
            disabled={automationLoading || !automationSettings.isActive}
            className="flex items-center gap-2 bg-gbp-blue-600 text-white font-semibold px-5 py-2 rounded-lg hover:bg-gbp-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {automationLoading ? "Saving..." : "Save Automation Settings"}
          </button>
        </div>
      </div>

      {/* --- NEW/UPDATED Draft Images Section --- */}
      {/* REPLACE existing "Images to Post (Drafts)" section with: */}

      {draftImages.length > 0 && (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                Images to Post ({draftImages.length} Drafts)
              </h2>
              <p className="text-gray-500">
                {fetchingDrafts
                  ? "Loading drafts..."
                  : "These images are ready to be posted to your GMB profile."}
              </p>
            </div>
            <button
              onClick={handlePostAllDrafts}
              disabled={loading || fetchingDrafts}
              className="flex items-center gap-2 bg-gbp-blue-600 text-white font-semibold px-5 py-2 rounded-lg hover:bg-gbp-blue-700 disabled:opacity-60"
            >
              <Send className="w-4 h-4" />
              {loading
                ? "Posting..."
                : `Post ${draftImages.length} Image(s) to GMB`}
            </button>
          </div>

          {/* Horizontal Scrollable Row */}
          <div className="flex overflow-x-auto space-x-4 p-2 -m-2">
            {draftImages.map((draft) => (
              <div
                key={draft.id}
                className="relative flex-shrink-0 w-48 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <img
                  src={draft.previewUrl}
                  alt="Draft preview"
                  className="w-full h-32 object-cover rounded-t-lg"
                  onError={(e) => {
                    e.currentTarget.onerror = null; // 👈 Critical!
                    e.currentTarget.style.display = "none"; // Hide broken image
                    // Or show a div instead
                  }}
                />
                <button
                  onClick={() => handleRemoveDraft(draft.id)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 shadow-lg"
                  aria-label="Remove from drafts"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="p-3">
                  <p className="text-xs text-gray-600 truncate">
                    {draft.type === "file" && typeof draft.value !== "string"
                      ? draft.value.name
                      : "Image from URL"}
                  </p>
                  <div className="mt-2 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                    <span className="text-xs text-green-600">
                      Ready to post
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Show empty state when no drafts */}
      {draftImages.length === 0 && !fetchingDrafts && (
        <div className="mt-8 bg-gray-50 rounded-lg p-12 text-center">
          <ImageOff className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            No drafts yet
          </h3>
          <p className="text-gray-500">
            Upload images using any of the options above to get started!
          </p>
        </div>
      )}

      {/* Previously Uploaded to GMB Section */}
      <div className="grid grid-cols-1 mt-8">
        <div>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                GMB Profile Images ({gmbImages.length})
              </h2>
              <p className="text-gray-500">
                {fetchingGMB
                  ? "Loading images from Google My Business..."
                  : "All images currently on your Google My Business profile."}
              </p>
            </div>

            {/* Category Filter */}
            <div className="flex gap-3 items-center">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="all">All Categories</option>
                <option value="ADDITIONAL">Additional</option>
                <option value="COVER">Cover</option>
                <option value="PROFILE">Profile</option>
                <option value="LOGO">Logo</option>
              </select>

              {/* Refresh Button */}
              <button
                onClick={async () => {
                  setFetchingGMB(true);
                  const images = await fetchGMBMedia();
                  setGmbImages(images);
                  setFetchingGMB(false);
                }}
                disabled={fetchingGMB}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                title="Refresh images"
              >
                <RefreshCw
                  className={`w-4 h-4 ${fetchingGMB ? "animate-spin" : ""}`}
                />
              </button>
            </div>
          </div>

          {fetchingGMB ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gbp-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading images from GMB...</p>
            </div>
          ) : gmbImages.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-12 text-center">
              <ImageOff className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                No images found
              </h3>
              <p className="text-gray-500">
                Upload and post your first images to see them here!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {gmbImages
                .filter(
                  (img) =>
                    categoryFilter === "all" || img.category === categoryFilter,
                )
                .map((image) => (
                  <div
                    key={image.id}
                    className="relative bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
                  >
                    <img
                      src={image.url}
                      alt={image.title || "GMB Image"}
                      className="w-full h-40 object-cover"
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.onerror = null; 
                        target.src =
                          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='150'%3E%3Crect fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' fill='%236b7280' font-size='14'%3ENo Image%3C/text%3E%3C/svg%3E";
                      }}
                    />

                    {/* Category Badge */}
                    <div className="absolute top-2 left-2">
                      <CategoryTag category={image.category} />
                    </div>

                    {/* GMB Badge */}
                    <div className="absolute top-2 right-2">
                      <span className="bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded">
                        Live on GMB
                      </span>
                    </div>

                    {/* Image Info */}
                    <div className="p-3 bg-white">
                      <p className="text-xs text-gray-500">
                        {image.uploadedAt}
                      </p>
                      {image.mediaFormat && (
                        <p className="text-xs text-gray-400 mt-1">
                          {image.mediaFormat}
                        </p>
                      )}
                    </div>

                    {/* Hover Actions */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <button
                        className="bg-white text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-100"
                        onClick={() => window.open(image.url, "_blank")}
                      >
                        View Full
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* AI Generate Descriptions Footer */}
      <div className="mt-8 bg-white/80 backdrop-blur-sm shadow-sm rounded-lg p-4 flex justify-between items-center">
        {/* ... your existing footer code ... */}
      </div>
    </div>
  );
}


function ReviewManagementAutomation() {
  return (
    <div className="max-w-4xl">
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Automate Review Replies
        </h2>
        <p className="text-gray-600 mb-6">
          Paige can reply to your Google reviews based on their star ratings and
          your guidance. Paige is able to customize how the AI responds and
          provides based on best practices and your training notes.
        </p>

        <div className="space-y-6">
          {[1, 2, 3, 4, 5].map((stars) => (
            <div key={stars} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="font-medium text-gray-900">
                    {stars} star review
                  </span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < stars ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 border border-gray-200 rounded text-sm">
                    Create template
                  </button>
                  <button className="px-3 py-1 bg-gbp-blue-500 text-white rounded text-sm">
                    AI approval required
                  </button>
                  <button className="px-3 py-1 border border-gray-200 rounded text-sm">
                    AI fully automated
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                I will read all reviews and suggest replies based on best
                practices and your training notes. You can either approve or
                edit them before I publish each one.
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-4">Approvals</h3>
          <div className="space-y-3">
            <div>
              <span className="text-sm text-gray-600">
                Who should I send this approval request to?
              </span>
              <div className="mt-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="approval"
                    className="text-gbp-blue-500"
                    defaultChecked
                  />
                  <span className="text-sm text-gray-700">
                    Me (test@example.com)
                  </span>
                </label>
                <label className="flex items-center space-x-2 mt-1">
                  <input
                    type="radio"
                    name="approval"
                    className="text-gbp-blue-500"
                  />
                  <span className="text-sm text-gray-700">Multiple people</span>
                </label>
                <label className="flex items-center space-x-2 mt-1">
                  <input
                    type="radio"
                    name="approval"
                    className="text-gbp-blue-500"
                  />
                  <span className="text-sm text-gray-700">Nobody</span>
                </label>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                className="text-gbp-blue-500"
                defaultChecked
              />
              <span className="text-sm text-gray-700">
                Do you want to see these tasks in your dashboard feed?
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button className="bg-gbp-blue-500 text-white px-6 py-2 rounded-lg font-medium">
            Save and Continue
          </button>
        </div>
      </div>
    </div>
  );
}

function QAAutomation() {
  return (
    <div className="max-w-4xl">
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Automate Questions & Answers
        </h2>
        <p className="text-gray-600 mb-6">
          Automatically generate question and answer content on your Google
          Business Profile using your target keywords.
        </p>

        <div className="bg-gbp-blue-500 text-white p-6 rounded-lg mb-6">
          <div className="flex items-center space-x-3 mb-3">
            <MessageSquare className="w-6 h-6" />
            <h3 className="text-lg font-semibold">
              How often do you want to add and answer questions on your profile?
            </h3>
          </div>
          <div className="flex items-center space-x-2 text-gbp-blue-100">
            <span>✓ Trust Paige</span>
          </div>
          <p className="text-gbp-blue-100 text-sm mt-2">
            Paige analyses this frequency automatically based on an analysis of
            over 1,000+ data points weekly. Trusting Paige will help you rank
            higher faster.
          </p>
          <button className="bg-white text-gbp-blue-600 px-4 py-2 rounded-lg mt-3 text-sm font-medium">
            Set custom timing
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Approvals</h3>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Do you want to approve extra before I publish them?
              </p>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="qa-approval"
                    className="text-gbp-blue-500"
                  />
                  <span className="text-sm text-gray-700">No</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="qa-approval"
                    className="text-gbp-blue-500"
                    defaultChecked
                  />
                  <span className="text-sm text-gray-700">Yes</span>
                </label>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">
                Who should I send this approval request to?
              </p>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="qa-approver"
                  className="text-gbp-blue-500"
                  defaultChecked
                />
                <span className="text-sm text-gray-700">
                  Me (test@example.com)
                </span>
              </label>
              <label className="flex items-center space-x-2 mt-1">
                <input
                  type="radio"
                  name="qa-approver"
                  className="text-gbp-blue-500"
                />
                <span className="text-sm text-gray-700">Multiple people</span>
              </label>
              <label className="flex items-center space-x-2 mt-1">
                <input
                  type="radio"
                  name="qa-approver"
                  className="text-gbp-blue-500"
                />
                <span className="text-sm text-gray-700">Nobody</span>
              </label>
            </div>

            <div className="mt-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  className="text-gbp-blue-500"
                  defaultChecked
                />
                <span className="text-sm text-gray-700">
                  Do you want to see these tasks in your dashboard feed?
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function VideoAutomation() {
  return (
    <div className="max-w-4xl">
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Automate Video Creation & Posting
        </h2>

        <div className="bg-gbp-blue-500 text-white p-6 rounded-lg mb-6">
          <div className="flex items-center space-x-3 mb-3">
            <Video className="w-6 h-6" />
            <h3 className="text-lg font-semibold">
              How often do you want to create and upload a new video?
            </h3>
          </div>
          <div className="flex items-center space-x-2 text-gbp-blue-100">
            <span>✓ Trust Paige</span>
          </div>
          <p className="text-gbp-blue-100 text-sm mt-2">
            Paige analyses this frequency automatically based on an analysis of
            over 1,000+ data points weekly. Trusting Paige will help you rank
            higher faster.
          </p>
          <button className="bg-white text-gbp-blue-600 px-4 py-2 rounded-lg mt-3 text-sm font-medium">
            Set custom timing
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-4">
              Where do you want me to publish these videos?
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                      <span className="text-white text-xs font-bold">G</span>
                    </div>
                    <span className="font-medium">Google Business Profile</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      defaultChecked
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gbp-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gbp-blue-600"></div>
                  </label>
                </div>
                <p className="text-sm text-gray-600">
                  I can publish these videos to your Google Business Profile's
                  media
                </p>
                <button className="mt-3 w-full bg-gbp-blue-500 text-white py-2 rounded text-sm">
                  Connected
                </button>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center">
                      <span className="text-white text-xs font-bold">Y</span>
                    </div>
                    <span className="font-medium">YouTube</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gbp-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gbp-blue-600"></div>
                  </label>
                </div>
                <p className="text-sm text-gray-600">
                  I can publish these videos to your YouTube channel
                </p>
                <button className="mt-3 w-full border border-gray-200 text-gray-600 py-2 rounded text-sm hover:bg-gray-50">
                  Connect
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-800 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">f</span>
                  </div>
                  <span className="font-medium">Facebook</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gbp-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gbp-blue-600"></div>
                </label>
              </div>
              <p className="text-sm text-gray-600">
                I can publish these videos to your Facebook page
              </p>
              <button className="mt-3 w-full border border-gray-200 text-gray-600 py-2 rounded text-sm hover:bg-gray-50">
                Connect
              </button>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">I</span>
                  </div>
                  <span className="font-medium">Instagram</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gbp-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gbp-blue-600"></div>
                </label>
              </div>
              <p className="text-sm text-gray-600">
                I can publish these videos to your Instagram page
              </p>
              <button className="mt-3 w-full border border-gray-200 text-gray-600 py-2 rounded text-sm hover:bg-gray-50">
                Connect
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AccountManagerAutomation() {
  return (
    <div className="max-w-4xl">
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Account Manager Alerts
        </h2>
        <p className="text-gray-600 mb-6">
          What type of alerts do you want to receive?
        </p>

        <div className="space-y-4">
          {[
            "New task for me to complete",
            "Not getting enough reviews",
            "Doing great with reviews",
            "Doing great with image uploading",
            "A change was made to your profile",
            "Need to upload more images",
            "Weekly Summary of Automations",
          ].map((alert, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  className="text-gbp-blue-500 rounded"
                  defaultChecked={index < 4}
                />
                <span className="text-gray-700">{alert}</span>
              </div>
              <div className="text-sm text-gray-500">
                <span>Who should this alert go to?</span>
                <div className="mt-1">
                  <label className="flex items-center space-x-1">
                    <input
                      type="radio"
                      name={`alert-${index}`}
                      className="text-gbp-blue-500"
                      defaultChecked
                    />
                    <span className="text-xs">Me (test@example.com)</span>
                  </label>
                  <label className="flex items-center space-x-1">
                    <input
                      type="radio"
                      name={`alert-${index}`}
                      className="text-gbp-blue-500"
                    />
                    <span className="text-xs">Multiple people</span>
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <button className="bg-gbp-blue-500 text-white px-6 py-2 rounded-lg font-medium">
            Save and Continue
          </button>
        </div>
      </div>
    </div>
  );
}

function ReportingAutomation() {
  return (
    <div className="max-w-4xl">
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Automated Reporting
        </h2>
        <p className="text-gray-600 mb-6">
          Where should I send the monthly reports?
        </p>

        <div className="space-y-6">
          <div>
            <p className="text-sm text-gray-600 mb-3">
              I can send this report to you, or to a group of people if you'd
              prefer so you can also first set reporting via the reports tab.
            </p>

            <div className="space-y-3">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="report-recipient"
                  className="text-gbp-blue-500"
                  defaultChecked
                />
                <span className="text-sm text-gray-700">
                  Me (test@example.com)
                </span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="report-recipient"
                  className="text-gbp-blue-500"
                />
                <span className="text-sm text-gray-700">Multiple people</span>
              </label>
            </div>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 mb-3">BCC:</h3>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="bcc"
                  className="text-gbp-blue-500"
                  defaultChecked
                />
                <span className="text-sm text-gray-700">No One</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="radio" name="bcc" className="text-gbp-blue-500" />
                <span className="text-sm text-gray-700">
                  Me (test@example.com)
                </span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="radio" name="bcc" className="text-gbp-blue-500" />
                <span className="text-sm text-gray-700">Multiple people</span>
              </label>
            </div>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 mb-3">
              Which day of the month do you want me to send reports?
            </h3>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="report-day"
                  className="text-gbp-blue-500"
                  defaultChecked
                />
                <span className="text-sm text-gray-700">
                  Every 30 days starting today
                </span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="report-day"
                  className="text-gbp-blue-500"
                />
                <span className="text-sm text-gray-700">
                  A specific day each month
                </span>
              </label>
            </div>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 mb-3">
              Which metrics would you like to see?
            </h3>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  className="text-gbp-blue-500"
                  defaultChecked
                />
                <span className="text-sm text-gray-700">
                  Only positive metrics
                </span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="text-gbp-blue-500" />
                <span className="text-sm text-gray-700">All metrics</span>
              </label>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button className="bg-gbp-blue-500 text-white px-6 py-2 rounded-lg font-medium">
            Go Finish
          </button>
        </div>
      </div>
    </div>
  );
}

function SummaryAutomation() {
  return (
    <div className="max-w-4xl">
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Automation Summary
        </h2>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Upcoming automations
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-500 text-center">
                No upcoming automations scheduled
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Completed automations
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-500 text-center">
                No completed automations yet
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


function DefaultAutomation({ module }: { module: AutomationModule }) {
  // Check if the selected module is "Automate Posting"
  if (module.id === 'automate-posting') {
    // --- STATE AND HELPER COMPONENTS FOR THE POSTING UI ---
    const [activeTab, setActiveTab] = useState("create");

    const tabs = [
      { id: "create", name: "Create New Post", icon: Plus },
      { id: "draft", name: "Draft Posts", icon: Bookmark },
      { id: "past", name: "Past Posts", icon: Send },
    ];

    const DraftPostCard = ({ post }) => (
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="relative">
          <img src={post.imageUrl} alt={post.title} className="w-full h-32 object-cover" />
          {post.type === 'video' && (
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
               <div className="w-12 h-12 bg-white/30 rounded-full flex items-center justify-center">
                 <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"></path></svg>
               </div>
             </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-gray-800 truncate">{post.title}</h3>
          <p className="text-sm text-gray-500 mb-2">{post.date}</p>
          <div className="flex items-center justify-between mb-4">
            <span className="inline-flex items-center bg-gray-100 text-gray-700 text-xs font-medium px-2.5 py-0.5 rounded-full">
              <Clock className="w-3 h-3 mr-1.5" />
              Status: Draft
            </span>
            <MoreVertical className="w-5 h-5 text-gray-400 cursor-pointer" />
          </div>
          <div className="flex items-center gap-2">
            <button className="w-full text-sm bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50">Edit</button>
            <button className="w-full text-sm bg-gbp-blue-600 text-white py-2 px-4 rounded-md hover:bg-gbp-blue-700">Post Now</button>
          </div>
        </div>
      </div>
    );

    const PastPostCard = ({ post, showStats = false }) => {
        const statusColors = {
          Published: "bg-green-100 text-green-800",
          Offer: "bg-orange-100 text-orange-800",
          Draft: "bg-gray-100 text-gray-700"
        };
        return (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <img src={post.imageUrl} alt={post.title} className="w-full h-32 object-cover" />
              <div className="p-4">
                  <h3 className="font-semibold text-gray-800 truncate">{post.title}</h3>
                  <p className="text-sm text-gray-500 mb-2">{post.date}</p>
                   <div className="flex items-center justify-between mb-3">
                      <span className={`inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full ${statusColors[post.status] || statusColors.Draft}`}>
                          {post.status}
                      </span>
                      <span className="text-sm font-medium text-gbp-blue-600">{post.cta}</span>
                   </div>
                  {showStats && post.views && post.clicks && (
                     <div className="flex items-center text-sm text-gray-500 space-x-4 mb-4">
                        <div className="flex items-center">
                            <Eye className="w-4 h-4 mr-1"/> {post.views} Views
                        </div>
                        <div className="flex items-center">
                            <ThumbsUp className="w-4 h-4 mr-1"/> {post.clicks} Clicks
                        </div>
                     </div>
                  )}
                   <div className="flex items-center gap-2">
                       <button className="w-full text-sm bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50">View Post</button>
                       <button className="w-full text-sm bg-gray-100 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-200">Duplicate Post</button>
                   </div>
              </div>
          </div>
        )
    };
    
    // --- Tab Content Components ---
    const CreateNewPost = () => {
        // --- NEW: State for description and AI loading state ---
        const [postDescription, setPostDescription] = useState("");
        const [isGenerating, setIsGenerating] = useState(false);
        
        // --- NEW: Handler for AI description generation ---
        const handleGenerateAIDescription = () => {
            setIsGenerating(true);
            // Simulate an API call to a generative AI
            setTimeout(() => {
                const aiGeneratedText = "Discover our latest seasonal offers! 🍂 From cozy autumn decor to delicious pumpkin-spice treats, we have everything you need to celebrate the season. Visit us today and get 20% off your entire purchase. Don't miss out! #AutumnVibes #SeasonalSale #ShopLocal";
                setPostDescription(aiGeneratedText.slice(0, 1500)); // Ensure it doesn't exceed max length
                setIsGenerating(false);
            }, 1500); // 1.5 second delay to simulate network request
        };

        const recentPosts = [
            { id: 1, title: 'Insit Image', date: 'Oite 20 - 201M', status: 'Published', cta: 'Order Online', imageUrl: 'https://storage.googleapis.com/gemini-generative-ai-api-prod/v1/files/ac80a0f5-93b5-4148-8120-1b20755a1d7f' },
            { id: 2, title: 'Fcst Waturton', date: 'Bupi More 18:00', status: 'Published', cta: 'Buy More', imageUrl: 'https://storage.googleapis.com/gemini-generative-ai-api-prod/v1/files/b49d7d13-1b91-447b-83c0-302a64c489c6' },
            { id: 3, title: 'Ffuf Uruatiee', date: 'Tite-201 - 20M', status: 'Published', cta: 'Call Now', imageUrl: 'https://storage.googleapis.com/gemini-generative-ai-api-prod/v1/files/a2d325e0-84c1-4b13-8d00-478670c51152' },
        ];
        
        return (
            // <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="max-w-6xl mx-auto  p-8 rounded-2x2">
                 
                <div className="lg:col-span-2">
                    <div className="relative">
                        {/* UPDATED: Textarea with value and onChange handler */}
                        <textarea 
                            value={postDescription}
                            onChange={(e) => setPostDescription(e.target.value)}
                            maxLength={1500}
                            className="w-full h-36 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gbp-blue-500 focus:border-gbp-blue-500 resize-none" 
                            placeholder="Describe your post (0-1500 chars)"
                        />
                        {/* UPDATED: Dynamic character count */}
                        <span className="absolute bottom-3 right-3 text-sm text-gray-500">
                            {postDescription.length}/1500 chars
                        </span>
                    </div>

                    {/* NEW: AI Generate Button */}
                    <div className="flex justify-end mt-2">
                        <button
                            onClick={handleGenerateAIDescription}
                            disabled={isGenerating}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gbp-blue-600 bg-gbp-blue-50 rounded-lg hover:bg-gbp-blue-100 disabled:opacity-50 disabled:cursor-wait"
                        >
                            <Sparkles className="w-4 h-4" />
                            {isGenerating ? "Generating..." : "Generate AI Description"}
                        </button>
                    </div>

                    <div className="mt-4 flex items-center justify-center w-full p-8 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
                        <div className="text-center">
                            <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <p className="mt-2 text-sm text-gray-600"><span className="font-semibold text-gbp-blue-600">Drag & drop images/videos here</span> or click to upload</p>
                        </div>
                    </div>
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="relative md:col-span-1">
                            <select className="w-full appearance-none bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded-lg focus:outline-none focus:bg-white focus:border-gray-500">
                                <option>None</option>
                                <option>Book</option>
                                <option>Buy</option>
                                <option>Order Online</option>
                                <option>Learn More</option>
                                <option>Sign Up</option>
                                <option>Call Now</option>
                            </select>
                            <ChevronDown className="w-5 h-5 text-gray-400 absolute top-1/2 right-3 -translate-y-1/2 pointer-events-none"/>
                        </div>
                        <div className="relative md:col-span-2">
                            <LinkIcon className="w-5 h-5 text-gray-400 absolute top-1/2 left-3 -translate-y-1/2"/>
                            <input type="text" placeholder="Link" className="w-full border border-gray-300 rounded-lg pl-10 pr-20 py-3 focus:ring-2 focus:ring-gbp-blue-500" />
                            <div className="absolute top-1/2 right-3 -translate-y-1/2 flex gap-2">
                                <Pencil className="w-5 h-5 text-gray-500 hover:text-gbp-blue-600 cursor-pointer"/>
                                <Trash2 className="w-5 h-5 text-gray-500 hover:text-red-600 cursor-pointer"/>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 mt-8">
                        <button className="bg-gbp-blue-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-gbp-blue-700">Post Now</button>
                        <button className="bg-white border border-gray-300 text-gray-700 font-semibold py-2 px-6 rounded-lg hover:bg-gray-50">Save as Draft</button>
                    </div>
                </div>
                
            </div>
        );
    };
    
    const DraftPosts = () => {
      const drafts = [
          { id: 1, title: 'Line 2 Tione', date: '223 liae - 201 PMM', type: 'image', imageUrl: 'https://storage.googleapis.com/gemini-generative-ai-api-prod/v1/files/ac80a0f5-93b5-4148-8120-1b20755a1d7f' },
          { id: 2, title: 'Siugrer', date: 'Oireen 126.10 Pam', type: 'video', imageUrl: 'https://storage.googleapis.com/gemini-generative-ai-api-prod/v1/files/a2d325e0-84c1-4b13-8d00-478670c51152' },
      ];
      return (
        <div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="relative w-full">
                <Search className="w-5 h-5 text-gray-400 absolute top-1/2 left-3 -translate-y-1/2" />
                <input type="text" placeholder="Search" className="border border-gray-300 rounded-lg pl-10 py-2 w-full" />
              </div>
              <button className="flex items-center gap-2 border border-gray-300 rounded-lg px-4 py-2 whitespace-nowrap">
                <Calendar className="w-5 h-5 text-gray-500" /> Date Range
              </button>
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <span className="text-sm text-gray-600">Sort by:</span>
              <select className="border border-gray-300 rounded-lg px-4 py-2 text-sm">
                <option>Newest Ditee</option>
                <option>Oldest Date</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {drafts.map(post => <DraftPostCard key={post.id} post={post} />)}
            {drafts.length === 0 && (
              <div className="sm:col-span-2 lg:col-span-3 xl:col-span-4 text-center py-16">
                  <Copy className="mx-auto h-16 w-16 text-gray-300" />
                  <h3 className="mt-4 text-lg font-semibold text-gray-900">No drafts yet, create your first post!</h3>
              </div>
            )}
          </div>
        </div>
      );
    };
    
    const PastPosts = () => {
      const posts = [
          { id: 1, title: 'Home 2 Drait Qpusnd', date: 'Oite 20 - 201M', status: 'Published', cta: 'Order Online', imageUrl: 'https://storage.googleapis.com/gemini-generative-ai-api-prod/v1/files/b49d7d13-1b91-447b-83c0-302a64c489c6' },
          { id: 2, title: 'Insit Image', date: 'Oite 20 - 201M', status: 'Published', cta: 'Buy More', imageUrl: 'https://storage.googleapis.com/gemini-generative-ai-api-prod/v1/files/ac80a0f5-93b5-4148-8120-1b20755a1d7f' },
          { id: 3, title: 'Foy Offer', date: 'Tite-201 - 201M', status: 'Offer', cta: 'Buy More', imageUrl: 'https://storage.googleapis.com/gemini-generative-ai-api-prod/v1/files/b49d7d13-1b91-447b-83c0-302a64c489c6' },
          { id: 4, title: 'Fubieistron', date: 'Rain ID 110 Vesi', status: 'Published', cta: 'Call Now', views: '129', clicks: '11', imageUrl: 'https://storage.googleapis.com/gemini-generative-ai-api-prod/v1/files/ac80a0f5-93b5-4148-8120-1b20755a1d7f' },
          { id: 5, title: 'Fult Waterton', date: 'Tite-201 20 im 28', status: 'Published', cta: 'Call Now', views: '25', clicks: 'N/A', imageUrl: 'https://storage.googleapis.com/gemini-generative-ai-api-prod/v1/files/a2d325e0-84c1-4b13-8d00-478670c51152' },
      ];
      return (
        <div>
          <div className="flex flex-col md:flex-row justify-end items-center gap-4 mb-6">
            <div className="flex items-center gap-2 w-full md:w-auto">
              <span className="text-sm text-gray-600">Sort by:</span>
              <select className="border border-gray-300 rounded-lg px-4 py-2 text-sm">
                <option>Newest - Oldest</option>
                <option>Oldest - Newest</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {posts.map(post => <PastPostCard key={post.id} post={post} showStats={true} />)}
          </div>
        </div>
      );
    };

    // --- RENDER THE MAIN POSTING UI ---
    return (
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Automate Posting</h2>
        <p className="text-gray-600 mt-1 mb-6">Create, schedule and manage your Business posts automatically.</p>
  
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  ${activeTab === tab.id
                    ? "border-gbp-blue-500 text-gbp-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  } group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
              >
                <tab.icon className={`-ml-0.5 mr-2 h-5 w-5 ${activeTab === tab.id ? "text-gbp-blue-500" : "text-gray-400 group-hover:text-gray-500"}`} />
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
      </div>
    );
  }

  // Fallback for any other module that doesn't have a specific UI yet
  return (
    <div className="max-w-4xl">
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <div className="flex items-center space-x-3 mb-4">
          <module.icon className="w-8 h-8 text-gbp-blue-500" />
          <h2 className="text-xl font-semibold text-gray-900">{module.name}</h2>
        </div>
        <p className="text-gray-600 mb-6">{module.description}</p>

        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <module.icon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Coming Soon
          </h3>
          <p className="text-gray-500">
            This automation module is currently under development.
          </p>
        </div>
      </div>
    </div>
  );
}
















// CategoryTag component ko fix karo
const CategoryTag = ({ category }: { category: string }) => {
  const categoryColors: Record<string, string> = {
    ADDITIONAL: "bg-blue-100 text-blue-700",
    COVER: "bg-purple-100 text-purple-700",
    PROFILE: "bg-green-100 text-green-700",
    LOGO: "bg-orange-100 text-orange-700",
  };

  const bgColor = categoryColors[category] || "bg-gray-100 text-gray-700";

  return (  // 🔥 ADD THIS RETURN
    <span
      className={`text-xs font-semibold px-2 py-1 rounded ${bgColor}`}
    >
      {category}
    </span>
  );
};