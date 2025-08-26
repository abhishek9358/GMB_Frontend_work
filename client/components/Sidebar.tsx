import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Home,
  Building2,
  Zap,
  MessageSquare,
  BarChart3,
  Settings,
  Users,
  FileText,
} from "lucide-react";

const navigationItems = [
  { to: "/", label: "Dashboard", icon: Home },
  { to: "/businesses", label: "Businesses", icon: Building2 },
  { to: "/automation", label: "Automation", icon: Zap },
  { to: "/reviews", label: "Reviews", icon: MessageSquare },
  { to: "/reports", label: "Reports", icon: BarChart3 },
  { to: "/customers", label: "Customers", icon: Users },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  return (
    <aside className="bg-white border-r border-gray-200 w-64 min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gbp-orange-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">P</span>
          </div>
          <span className="font-semibold text-gray-900">Paige</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navigationItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-gbp-blue-50 text-gbp-blue-700 border-r-2 border-gbp-blue-700"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
              )
            }
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-gray-600 text-xs font-medium">AB</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              Abhishek
            </p>
            <p className="text-xs text-gray-500 truncate">Admin</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
