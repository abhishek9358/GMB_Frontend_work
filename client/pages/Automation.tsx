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
import {SERVER} from "@/constants/index"

// Replace your existing lucide-react import with this
import {
  Bookmark,  ChevronDown, Clock, Copy, Eye, Image as ImageIcon, Link as LinkIcon, 
  MoreVertical, Pencil, Plus, Search, Send,Sparkles, Settings as  ThumbsUp, Trash2,CheckCircle2,ImageOff,Cloud,  Save, 
  Play 
} from "lucide-react";
import PostAutomation from "@/components/PostAutomation";

type DraftImage = {
  id: string | number;
  type: 'file' | 'url';
  value: File | string;
  previewUrl: string;
  category: string;
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

  const [postAutomationActive, setPostAutomationActive] = useState(false);

    // Redux state
    const { user } = useSelector((state: any) => state.user);
    const { activeLocation } = useSelector((state: any) => state.activeLocation);
  
    const ACCOUNT_ID = user?.accountId || "";
    const LOCATION_ID = activeLocation?.locationId || "";

  // const toggleModule = (moduleId: string) => {
  //   setModules(
  //     modules.map((module) =>
  //       module.id === moduleId
  //         ? { ...module, enabled: !module.enabled }
  //         : module,
  //     ),
  //   );
  // };


    const toggleModule = async (moduleId: string) => {
      // 🔥 Special handling for automate-posting
      if (moduleId === "automate-posting") {
        const currentModule = modules.find((m) => m.id === moduleId);
        const newEnabledState = !currentModule?.enabled;

        // Optimistic update
        setModules((prev) =>
          prev.map((m) =>
            m.id === moduleId
              ? {
                  ...m,
                  enabled: newEnabledState,
                  status: newEnabledState ? "active" : "paused",
                }
              : m,
          ),
        );

        // Backend update
        try {
          const response = await fetch(`${SERVER}/api/post-automation`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              locationId: LOCATION_ID,
              isActive: newEnabledState,
              frequency: "weekly", // Default values
              intervalDays: 7,
              maxPerMonth: null,
              defaultTopicType: "STANDARD",
              includeMedia: true,
              includeCTA: false,
            }),
            credentials: "include",
          });

          if (!response.ok) throw new Error("Failed to toggle automation");

          setPostAutomationActive(newEnabledState);
        } catch (error) {
          console.error("Toggle failed:", error);
          // Revert on error
          setModules((prev) =>
            prev.map((m) =>
              m.id === moduleId
                ? {
                    ...m,
                    enabled: !newEnabledState,
                    status: !newEnabledState ? "active" : "paused",
                  }
                : m,
            ),
          );
        }
      } else {
        // 🔥 Other modules - local state only
        setModules((prev) =>
          prev.map((m) =>
            m.id === moduleId ? { ...m, enabled: !m.enabled } : m,
          ),
        );
      }
    };

  const progressPercentage = Math.round(
    (modules.filter((m) => m.enabled).length / modules.length) * 100,
  );

  const fetchPostAutomationStatus = useCallback(async () => {
    if (!LOCATION_ID) return;

    try {
      const response = await fetch(
        `${SERVER}/api/post-automation?locationId=${LOCATION_ID}`,
        { credentials: "include" },
      );

      if (!response.ok) return;

      const result = await response.json();
      if (result.data && result.data.length > 0) {
        const isActive = result.data[0].isActive;
        setPostAutomationActive(isActive);

        // 🔥 Update modules list bhi
        setModules((prev) =>
          prev.map((m) =>
            m.id === "automate-posting"
              ? {
                  ...m,
                  enabled: isActive,
                  status: isActive ? "active" : "paused",
                }
              : m,
          ),
        );
      }
    } catch (error) {
      console.error("Error fetching post automation:", error);
    }
  }, [LOCATION_ID]);

  useEffect(() => {
    if (LOCATION_ID) {
      fetchPostAutomationStatus(); 
    }
  }, [
    LOCATION_ID,
    fetchPostAutomationStatus,
  ]);

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



  const CATEGORY_OPTIONS = [
    { value: "ADDITIONAL", label: "Additional" },
    { value: "COVER", label: "Cover" },
    { value: "LOGO", label: "Logo" },
    { value: "PROFILE", label: "Profile" },
    { value: "INTERIOR", label: "Interior" },
    { value: "EXTERIOR", label: "Exterior" },
    
  ];


type CategorySelectorProps = {
  selected: string;
  onChange: (cat: string) => void;
};

function CategorySelector({ selected, onChange }: CategorySelectorProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-3">
      {CATEGORY_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`px-3 py-1 rounded-md border transition-all ${
            selected === opt.value
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
          }`}
        >
          {opt.label}
        </button>
      ))}
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

  // 🔥 NEW: Category state for uploads
  const [urlCategory, setUrlCategory] = useState("ADDITIONAL");
  const [fileCategory, setFileCategory] = useState("ADDITIONAL");

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
        category: draft.category, 
      }));

      setDraftImages(backendDrafts);
    } catch (error) {
      console.error("Error fetching drafts:", error);
    } finally {
      setFetchingDrafts(false);
    }
  }, [LOCATION_ID]);

  // Upload file to draft (backend)
  const uploadToDraft = async (file: File, scheduleDate?: string, category: string = "ADDITIONAL") => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("locationId", LOCATION_ID);
    formData.append("category", category);

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
  const uploadUrlToDraft = async (imageUrl: string, scheduleDate?: string, category: string = "ADDITIONAL") => {
    const formData = new FormData();
    formData.append("source_url", imageUrl); // 🔥 BACKEND expects 'source_url' not 'fileUrl'
    formData.append("locationId", LOCATION_ID);
    formData.append("category", category);

    if (scheduleDate) {
      formData.append("scheduledFor", scheduleDate);
    }

    const response = await fetch(`${SERVER}/api/media-drafts/url`, {
      // 🔥 Correct endpoint
      method: "POST",
      body: formData,
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "URL draft failed");
    }

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

       const img = new Image();
    img.src = url;
    await new Promise((resolve, reject) => {
      img.onload = () => resolve("");
      img.onerror = reject;
    });

    const width = img.width;
    const height = img.height;

    if (urlCategory === "COVER" && (width / height < 1.7 || width / height > 1.8)) {
      setMessage({
        type: "error",
        text: "Cover photo must have a 16:9 aspect ratio (e.g., 1280×720).",
      });
      return;
    }

      // 🔥 Upload to backend using correct function
      const result = await uploadUrlToDraft(trimmedUrl, scheduledDate, urlCategory);

      // Add to local state
      const newDraft: DraftImage = {
        id: result.data.id,
        type: "url",
        value: trimmedUrl,
        previewUrl: trimmedUrl, // URL itself is the preview
        category: urlCategory,
      };

      setDraftImages((prev) => [...prev, newDraft]);
      setUrl("");
      setScheduledDate("");
      setUrlCategory("ADDITIONAL")
      setMessage({ type: "success", text: "Image from URL added to drafts!" });
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      console.error("URL upload error:", error);
      setMessage({
        type: "error",
        text: error.message || "Failed to add URL to drafts",
      });
      setUrlError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTestRun = async () => {
    if (draftImages.length === 0) {
      setMessage({ type: "error", text: "No drafts available to test!" });
      return;
    }

    setLoading(true);
    setMessage({ type: "success", text: "Running test post..." });

    try {
      // Pick first draft
      const testDraft = draftImages[0];

      // Post to GMB
      await postDraftToGMB(testDraft.id as string);

      // Refresh lists
      await fetchDraftsFromBackend();
      const updatedGMBImages = await fetchGMBMedia();
      setGmbImages(updatedGMBImages);

      setMessage({
        type: "success",
        text: "✅ Test successful! 1 image posted to GMB.",
      });
    } catch (error: any) {
      setMessage({
        type: "error",
        text: `❌ Test failed: ${error.message}`,
      });
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
          const objectUrl = URL.createObjectURL(file);
           const img = new Image();
           img.src = objectUrl;

           await new Promise((resolve, reject) => {
             img.onload = () => resolve("");
             img.onerror = reject;
           });

           const width = img.width;
           const height = img.height;

           if (
             fileCategory === "COVER" &&
             (width / height < 1.7 || width / height > 1.8)
           ) {
             setMessage({
               type: "error",
               text: `Cover photo "${file.name}" must have a 16:9 aspect ratio (e.g., 1280×720).`,
             });
             URL.revokeObjectURL(objectUrl);
            //  continue; // skip invalid cover images
           }


          // Upload to backend
          const result = await uploadToDraft(file, scheduledDate, fileCategory);

          // Add to local state
          const newDraft: DraftImage = {
            id: result.data.id,
            type: "file",
            value: file,
            previewUrl: URL.createObjectURL(file),
            category: fileCategory
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
      setFileCategory("ADDITIONAL"); 
      setMessage({
        type: "success",
        text: `${successCount} image(s) added to drafts!`,
      });
      setTimeout(() => setMessage(null), 3000);
    },
    [scheduledDate, fileCategory],
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

      console.log("Gmbimages", gmbImages);

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
            <p className="text-xs text-gray-500 mb-3">
              Paste image URL (JPG, PNG, GIF, WEBP)
            </p>
            {/* Category Selector */}
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Category
            </label>
            <CategorySelector
              selected={urlCategory}
              onChange={(cat) => setUrlCategory(cat)}
            />

            <input
              type="url"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setUrlError("");
              }}
              placeholder="https://example.com/image.jpg"
              className={`w-full border rounded-lg px-3 py-2 text-sm mb-2 focus:ring-2 focus:ring-gbp-blue-500 ${
                urlError ? "border-red-500" : "border-gray-300"
              }`}
              disabled={loading}
            />

            {urlError && (
              <div className="flex items-start gap-2 mb-2 p-2 bg-red-50 rounded">
                <X className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-red-600 text-xs">{urlError}</p>
              </div>
            )}

            <button
              onClick={handleAddUrlToDrafts}
              disabled={loading || !url.trim()}
              className="w-full bg-gbp-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-gbp-blue-700 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Add to Drafts
                </>
              )}
            </button>
          </div>

          {/* Other upload options ... */}
          <div className="bg-white rounded-lg p-4 shadow-sm flex flex-col items-center justify-center border-2 border-dashed border-blue-300">
            <h4 className="font-semibold text-gray-900 mb-2">
              Drag and Drop Upload
            </h4>

              {/* Category selector added for drag-drop uploads too */}
            <CategorySelector
              selected={fileCategory}
              onChange={(cat) => setFileCategory(cat)}
            />

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column - Frequency Settings */}
          <div className="space-y-4">
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
                    // Reset intervalDays when switching from custom
                    intervalDays:
                      e.target.value === "custom"
                        ? automationSettings.intervalDays
                        : e.target.value === "daily"
                          ? 1
                          : 7,
                  })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gbp-blue-500 focus:border-transparent"
                disabled={!automationSettings.isActive}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="custom">Custom Interval</option>
              </select>
            </div>

            {/* Custom Interval Days - Show only when custom selected */}
            {automationSettings.frequency === "custom" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Post Every (Days)
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
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gbp-blue-500 focus:border-transparent"
                  disabled={!automationSettings.isActive}
                  placeholder="e.g., 3 (every 3 days)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Images will be posted every {automationSettings.intervalDays}{" "}
                  day(s)
                </p>
              </div>
            )}
          </div>

          {/* Right Column - Limits & Info */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Uploads Per Month (Optional)
              </label>
              <input
                type="number"
                min="1"
                max="100"
                placeholder="No limit"
                value={automationSettings.maxPerMonth || ""}
                onChange={(e) =>
                  setAutomationSettings({
                    ...automationSettings,
                    maxPerMonth: e.target.value
                      ? parseInt(e.target.value)
                      : null,
                  })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gbp-blue-500 focus:border-transparent"
                disabled={!automationSettings.isActive}
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave empty for unlimited posts per month
              </p>
            </div>

            {/* Automation Summary Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">
                📋 Automation Summary
              </h4>
              {automationSettings.isActive ? (
                <div className="space-y-1 text-sm text-blue-700">
                  <p>
                    • <strong>Status:</strong> Active
                  </p>
                  <p>
                    • <strong>Frequency:</strong>{" "}
                    {automationSettings.frequency === "custom"
                      ? `Every ${automationSettings.intervalDays} day(s)`
                      : automationSettings.frequency === "daily"
                        ? "Every day"
                        : "Every week"}
                  </p>
                  <p>
                    • <strong>Monthly Limit:</strong>{" "}
                    {automationSettings.maxPerMonth || "Unlimited"}
                  </p>
                  {automationSettings.maxPerMonth && (
                    <p className="text-xs text-blue-600 mt-2">
                      ⚠️ Automation will pause after{" "}
                      {automationSettings.maxPerMonth} uploads this month
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-600">
                  ⏸️ Automation is currently paused
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 pt-6 border-t border-gray-200 flex justify-between items-center">
          <div className="flex items-center gap-2 text-sm">
            {automationSettings.isActive ? (
              <>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-700 font-medium">
                  Automation is running
                </span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span className="text-gray-600">Automation is paused</span>
              </>
            )}
          </div>

          <div className="flex gap-3">
            {/* Test Run Button (Optional) */}
            <button
              onClick={async () => {
                // Optional: Test automation by posting 1 draft immediately
                handleTestRun();
              }}
              disabled={
                automationLoading ||
                !automationSettings.isActive ||
                draftImages.length === 0
              }
              className="flex items-center gap-2 border border-gbp-blue-600 text-gbp-blue-600 font-semibold px-4 py-2 rounded-lg hover:bg-gbp-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="w-4 h-4" />
              Test Run
            </button>

            {/* Save Button */}
            <button
              onClick={saveAutomationSettings}
              disabled={automationLoading}
              className="flex items-center gap-2 bg-gbp-blue-600 text-white font-semibold px-5 py-2 rounded-lg hover:bg-gbp-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {automationLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Automation Settings
                </>
              )}
            </button>
          </div>
        </div>

        {/* Next Scheduled Post Info (if automation active) */}
        {automationSettings.isActive && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>ℹ️ Next scheduled post:</strong>{" "}
              {/* Calculate based on frequency */}
              {automationSettings.frequency === "daily"
                ? "Tomorrow at this time"
                : automationSettings.frequency === "weekly"
                  ? "Next week at this time"
                  : `In ${automationSettings.intervalDays} day(s)`}
            </p>
          </div>
        )}
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
   return <PostAutomation />
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