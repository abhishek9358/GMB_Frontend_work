import { useState } from "react";
import {
  Upload,
  MessageSquare,
  Star,
  Video,
  BarChart3,
  Bell,
  Calendar,
  ChevronDown,
  Settings as SettingsIcon,
} from "lucide-react";

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

function ImageUploadAutomation() {
  return (
    <div className="max-w-4xl">
      <div className="bg-gbp-blue-500 text-white p-6 rounded-lg mb-6">
        <div className="flex items-center space-x-3 mb-3">
          <Upload className="w-6 h-6" />
          <h2 className="text-xl font-semibold">
            How often do you want to drip images onto your profile?
          </h2>
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

      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          You have 3 options to upload images:
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">
              Upload using link
            </h4>
            <p className="text-sm text-gray-600 mb-4">
              Upload from the via direct link upload box.
            </p>
            <input
              type="url"
              placeholder="Image URL"
              className="w-full border border-gray-200 rounded px-3 py-2 text-sm"
            />
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Drag and Drop</h4>
            <p className="text-sm text-gray-600 mb-4">
              Drag and drop images locally onto
            </p>
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Drop images here</p>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Integrations</h4>
            <p className="text-sm text-gray-600 mb-4">
              Integrate your asset library/photo gallery
            </p>
            <button className="w-full border border-gray-200 rounded px-3 py-2 text-sm text-gray-600 hover:bg-gray-50">
              Coming soon
            </button>
          </div>
        </div>
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
