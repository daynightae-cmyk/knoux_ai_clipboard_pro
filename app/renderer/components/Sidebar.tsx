import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Clipboard,
  Brain,
  LayoutDashboard,
  Settings,
  Shield,
  Zap,
  Crown,
  Info,
} from "lucide-react";
import i18n from "../utils/i18n";

const Sidebar: React.FC = () => {
  const navigate = useNavigate();

  const navItems = [
    {
      to: "/dashboard",
      label: i18n.t("sidebar.dashboard"),
      icon: <LayoutDashboard size={20} />,
    },
    {
      to: "/clipboard",
      label: i18n.t("sidebar.clipboardHistory"),
      icon: <Clipboard size={20} />,
    },
    {
      to: "/ai",
      label: i18n.t("sidebar.aiAssistant"),
      icon: <Brain size={20} />,
    },
    {
      to: "/smart-actions",
      label: i18n.t("sidebar.smartActions"),
      icon: <Zap size={20} />,
    },
    {
      to: "/vip",
      label: i18n.t("sidebar.vip"),
      icon: <Crown size={20} className="text-yellow-400" />,
    },
  ];

  return (
    <aside className="w-64 bg-knoux-background-surface/80 backdrop-blur-xl border-r border-white/5 flex flex-col transition-colors duration-300">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-white/5">
        <div className="w-8 h-8 bg-gradient-to-br from-knoux-primary to-knoux-secondary rounded-lg flex items-center justify-center mr-3 shadow-lg shadow-knoux-primary/20">
          <Clipboard className="text-white w-5 h-5" />
        </div>
        <h1 className="font-bold text-lg text-white tracking-wide">Knoux</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `
              flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group
              ${
                isActive
                  ? "bg-knoux-primary/20 text-white border border-knoux-primary/50 shadow-lg shadow-knoux-primary/10"
                  : "text-gray-400 hover:bg-white/5 hover:text-white border border-transparent"
              }
            `}
          >
            <span
              className={`mr-3 transition-transform duration-200 group-hover:scale-110 ${item.to === "/vip" ? "text-yellow-400" : ""}`}
            >
              {item.icon}
            </span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer Actions */}
      <div className="p-4 border-t border-white/5 space-y-2">
        <button
          onClick={() => navigate("/settings")}
          className="w-full flex items-center px-4 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all group"
        >
          <Settings className="w-4 h-4 mr-3 group-hover:rotate-90 transition-transform duration-500" />
          <span>{i18n.t("sidebar.settings")}</span>
        </button>
        <button
          onClick={() => navigate("/about")}
          className="w-full flex items-center px-4 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all group"
        >
          <Info className="w-4 h-4 mr-3 group-hover:scale-110 transition-transform" />
          <span>{i18n.t("sidebar.about")}</span>
        </button>

        {/* System Status Indicator */}
        <div className="mt-4 flex items-center justify-between px-4 py-2 bg-knoux-accent/10 border border-knoux-accent/20 rounded-lg">
          <div className="flex items-center">
            <div className="relative flex h-2 w-2 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-knoux-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-knoux-accent"></span>
            </div>
            <span className="text-xs font-medium text-green-400">
              {i18n.isRTL() ? "النظام جاهز" : "System Ready"}
            </span>
          </div>
          <span className="text-[10px] text-green-500/60 font-mono">
            v1.0.0
          </span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
