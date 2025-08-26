import { useState } from "react";
import {
  Settings as SettingsIcon,
  Users,
  Bell,
  Globe,
  Shield,
  CreditCard,
  HelpCircle,
} from "lucide-react";

interface SettingsSection {
  id: string;
  name: string;
  icon: any;
  description: string;
}

const settingsSections: SettingsSection[] = [
  {
    id: "white-label",
    name: "White Label",
    icon: Globe,
    description: "Customize the appearance and branding",
  },
  {
    id: "integrations",
    name: "Integrations",
    icon: SettingsIcon,
    description: "Connect with external services",
  },
  {
    id: "users",
    name: "Users",
    icon: Users,
    description: "Manage team members and permissions",
  },
  {
    id: "billing",
    name: "Billing",
    icon: CreditCard,
    description: "Subscription and payment settings",
  },
  {
    id: "notifications",
    name: "Notifications",
    icon: Bell,
    description: "Email and alert preferences",
  },
  {
    id: "security",
    name: "Security",
    icon: Shield,
    description: "Account security and privacy",
  },
  {
    id: "support",
    name: "Support",
    icon: HelpCircle,
    description: "Get help and contact support",
  },
];

export default function Settings() {
  const [activeSection, setActiveSection] = useState("white-label");

  const renderSectionContent = () => {
    switch (activeSection) {
      case "white-label":
        return <WhiteLabelSettings />;
      case "integrations":
        return <IntegrationsSettings />;
      case "users":
        return <UsersSettings />;
      case "billing":
        return <BillingSettings />;
      case "notifications":
        return <NotificationsSettings />;
      case "security":
        return <SecuritySettings />;
      case "support":
        return <SupportSettings />;
      default:
        return <WhiteLabelSettings />;
    }
  };

  return (
    <div className="flex h-full bg-gray-50">
      {/* Settings Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">
            Manage your account and preferences
          </p>
        </div>

        <nav className="p-4">
          {settingsSections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                activeSection === section.id
                  ? "bg-gbp-blue-50 text-gbp-blue-700 border border-gbp-blue-200"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <section.icon
                className={`w-5 h-5 ${
                  activeSection === section.id
                    ? "text-gbp-blue-600"
                    : "text-gray-400"
                }`}
              />
              <div className="flex-1">
                <p className="font-medium">{section.name}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {section.description}
                </p>
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-auto">{renderSectionContent()}</div>
    </div>
  );
}

function WhiteLabelSettings() {
  const [formData, setFormData] = useState({
    companyName: "",
    logoUrl: "",
    customDomain: "",
    brandColor: "#3b82f6",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-4xl">
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <div className="flex items-center space-x-3 mb-6">
          <Globe className="w-6 h-6 text-gbp-blue-500" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">White Label</h2>
            <p className="text-gray-600">Manage your white label settings</p>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <div className="w-5 h-5 text-yellow-600 mt-0.5">⚠️</div>
            <div>
              <h3 className="font-medium text-yellow-800 mb-1">
                Enable White Label Mode
              </h3>
              <p className="text-yellow-700 text-sm">
                White label mode allows agencies to re-brand Paige as their own,
                including their own logo, subdomain, email sending details, and
                more. If you are not an agency, you do not need to enable this.
              </p>
              <button className="bg-gbp-blue-500 text-white px-4 py-2 rounded-lg mt-3 text-sm font-medium">
                Enable
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Name
            </label>
            <input
              type="text"
              placeholder="Your Company Name"
              value={formData.companyName}
              onChange={(e) => handleInputChange("companyName", e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gbp-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Logo URL
            </label>
            <input
              type="url"
              placeholder="https://your-domain.com/logo.png"
              value={formData.logoUrl}
              onChange={(e) => handleInputChange("logoUrl", e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gbp-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom Domain
            </label>
            <input
              type="text"
              placeholder="your-subdomain.paige.com"
              value={formData.customDomain}
              onChange={(e) =>
                handleInputChange("customDomain", e.target.value)
              }
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gbp-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Brand Color
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={formData.brandColor}
                onChange={(e) =>
                  handleInputChange("brandColor", e.target.value)
                }
                className="w-12 h-10 border border-gray-200 rounded cursor-pointer"
              />
              <input
                type="text"
                value={formData.brandColor}
                onChange={(e) =>
                  handleInputChange("brandColor", e.target.value)
                }
                className="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gbp-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <button className="bg-gbp-blue-500 text-white px-6 py-2 rounded-lg font-medium">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

function IntegrationsSettings() {
  const integrations = [
    { name: "Google Business Profile", status: "connected", icon: "🏢" },
    { name: "Google Analytics", status: "disconnected", icon: "📊" },
    { name: "Zapier", status: "connected", icon: "⚡" },
    { name: "Slack", status: "disconnected", icon: "💬" },
    { name: "Facebook Pages", status: "disconnected", icon: "📘" },
  ];

  return (
    <div className="max-w-4xl">
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <div className="flex items-center space-x-3 mb-6">
          <SettingsIcon className="w-6 h-6 text-gbp-blue-500" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Integrations
            </h2>
            <p className="text-gray-600">
              Connect with external services and tools
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {integrations.map((integration) => (
            <div
              key={integration.name}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <div className="text-2xl">{integration.icon}</div>
                <div>
                  <h3 className="font-medium text-gray-900">
                    {integration.name}
                  </h3>
                  <p
                    className={`text-sm ${
                      integration.status === "connected"
                        ? "text-green-600"
                        : "text-gray-500"
                    }`}
                  >
                    {integration.status === "connected"
                      ? "Connected"
                      : "Not connected"}
                  </p>
                </div>
              </div>
              <button
                className={`px-4 py-2 rounded-lg font-medium ${
                  integration.status === "connected"
                    ? "bg-red-100 text-red-700 hover:bg-red-200"
                    : "bg-gbp-blue-500 text-white hover:bg-gbp-blue-600"
                }`}
              >
                {integration.status === "connected" ? "Disconnect" : "Connect"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function UsersSettings() {
  const users = [
    {
      id: "1",
      name: "Abhishek",
      email: "abhishek@example.com",
      role: "Admin",
      status: "active",
    },
    {
      id: "2",
      name: "Team Member",
      email: "member@example.com",
      role: "Member",
      status: "active",
    },
  ];

  return (
    <div className="max-w-4xl">
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Users className="w-6 h-6 text-gbp-blue-500" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Team Members
              </h2>
              <p className="text-gray-600">
                Manage users and their permissions
              </p>
            </div>
          </div>
          <button className="bg-gbp-blue-500 text-white px-4 py-2 rounded-lg font-medium">
            Invite User
          </button>
        </div>

        <div className="space-y-4">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-600">
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{user.name}</h3>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <select
                  value={user.role.toLowerCase()}
                  onChange={(e) => console.log("Role changed:", e.target.value)}
                  className="border border-gray-200 rounded px-3 py-1 text-sm"
                >
                  <option value="admin">Admin</option>
                  <option value="member">Member</option>
                  <option value="viewer">Viewer</option>
                </select>
                <button className="text-red-600 hover:text-red-700 text-sm">
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BillingSettings() {
  return (
    <div className="max-w-4xl">
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <div className="flex items-center space-x-3 mb-6">
          <CreditCard className="w-6 h-6 text-gbp-blue-500" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Billing & Subscription
            </h2>
            <p className="text-gray-600">
              Manage your subscription and payment methods
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-gray-200 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Current Plan</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Plan:</span>
                <span className="font-medium">Professional</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Price:</span>
                <span className="font-medium">$49/month</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Next billing:</span>
                <span className="font-medium">Feb 15, 2024</span>
              </div>
            </div>
            <button className="w-full mt-4 border border-gbp-blue-500 text-gbp-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-gbp-blue-50">
              Change Plan
            </button>
          </div>

          <div className="border border-gray-200 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Payment Method</h3>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-8 bg-blue-600 rounded text-white text-xs flex items-center justify-center">
                VISA
              </div>
              <div>
                <p className="font-medium">•••• •••• •••• 4242</p>
                <p className="text-sm text-gray-500">Expires 12/25</p>
              </div>
            </div>
            <button className="w-full border border-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50">
              Update Payment Method
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function NotificationsSettings() {
  const [notificationTypes, setNotificationTypes] = useState([
    {
      id: "email",
      name: "Email Notifications",
      description: "Receive updates via email",
      enabled: true,
    },
    {
      id: "review",
      name: "New Reviews",
      description: "Get notified of new customer reviews",
      enabled: true,
    },
    {
      id: "automation",
      name: "Automation Updates",
      description: "Updates on automation status",
      enabled: false,
    },
    {
      id: "weekly",
      name: "Weekly Reports",
      description: "Weekly performance summaries",
      enabled: true,
    },
    {
      id: "security",
      name: "Security Alerts",
      description: "Account security notifications",
      enabled: true,
    },
  ]);

  const toggleNotification = (id: string) => {
    setNotificationTypes((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? { ...notification, enabled: !notification.enabled }
          : notification,
      ),
    );
  };

  return (
    <div className="max-w-4xl">
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <div className="flex items-center space-x-3 mb-6">
          <Bell className="w-6 h-6 text-gbp-blue-500" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Notification Preferences
            </h2>
            <p className="text-gray-600">Choose how you want to be notified</p>
          </div>
        </div>

        <div className="space-y-4">
          {notificationTypes.map((notification) => (
            <div
              key={notification.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
            >
              <div>
                <h3 className="font-medium text-gray-900">
                  {notification.name}
                </h3>
                <p className="text-sm text-gray-500">
                  {notification.description}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notification.enabled}
                  onChange={() => toggleNotification(notification.id)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gbp-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gbp-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SecuritySettings() {
  return (
    <div className="max-w-4xl space-y-6">
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <div className="flex items-center space-x-3 mb-6">
          <Shield className="w-6 h-6 text-gbp-blue-500" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Security Settings
            </h2>
            <p className="text-gray-600">Manage your account security</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Password</h3>
            <div className="space-y-3">
              <input
                type="password"
                placeholder="Current password"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gbp-blue-500"
              />
              <input
                type="password"
                placeholder="New password"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gbp-blue-500"
              />
              <input
                type="password"
                placeholder="Confirm new password"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gbp-blue-500"
              />
            </div>
            <button className="mt-3 bg-gbp-blue-500 text-white px-4 py-2 rounded-lg font-medium">
              Update Password
            </button>
          </div>

          <div className="pt-6 border-t border-gray-200">
            <h3 className="font-medium text-gray-900 mb-3">
              Two-Factor Authentication
            </h3>
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Enable 2FA</p>
                <p className="text-sm text-gray-500">
                  Add an extra layer of security to your account
                </p>
              </div>
              <button className="bg-gbp-blue-500 text-white px-4 py-2 rounded-lg font-medium">
                Enable
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SupportSettings() {
  return (
    <div className="max-w-4xl">
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <div className="flex items-center space-x-3 mb-6">
          <HelpCircle className="w-6 h-6 text-gbp-blue-500" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Support & Help
            </h2>
            <p className="text-gray-600">
              Get help and contact our support team
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-gray-200 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-3">
              Contact Support
            </h3>
            <p className="text-gray-600 mb-4">
              Get in touch with our support team for assistance
            </p>
            <button className="bg-gbp-blue-500 text-white px-4 py-2 rounded-lg font-medium">
              Contact Support
            </button>
          </div>

          <div className="border border-gray-200 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Documentation</h3>
            <p className="text-gray-600 mb-4">
              Access our comprehensive documentation and guides
            </p>
            <button className="border border-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50">
              View Docs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
