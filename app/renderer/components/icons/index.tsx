import React from "react";
import {
  Clipboard,
  Brain,
  LayoutDashboard,
  Settings,
  Shield,
  Zap,
  Crown,
  Info,
  Check,
  X,
  Search,
  Filter,
  MoreVertical,
  ChevronRight,
  ChevronLeft,
  Moon,
  Sun,
  Monitor,
  Smartphone,
  Share2,
  Download,
  Trash2,
  Copy,
  Edit2,
  Eye,
  Menu,
  LucideProps,
} from "lucide-react";

// Standardized Icon Wrapper
const createIcon = (IconComponent: React.FC<LucideProps>) => {
  return (props: LucideProps) => (
    <IconComponent
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    />
  );
};

// Export standardized icons
export const Icons = {
  Dashboard: createIcon(LayoutDashboard),
  Clipboard: createIcon(Clipboard),
  AI: createIcon(Brain),
  SmartActions: createIcon(Zap),
  Settings: createIcon(Settings),
  Security: createIcon(Shield),
  Premium: createIcon(Crown),
  Info: createIcon(Info),
  Check: createIcon(Check),
  Close: createIcon(X),
  Search: createIcon(Search),
  Filter: createIcon(Filter),
  More: createIcon(MoreVertical),
  ChevronRight: createIcon(ChevronRight),
  ChevronLeft: createIcon(ChevronLeft),
  Dark: createIcon(Moon),
  Light: createIcon(Sun),
  System: createIcon(Monitor),
  Mobile: createIcon(Smartphone),
  Share: createIcon(Share2),
  Download: createIcon(Download),
  Delete: createIcon(Trash2),
  Copy: createIcon(Copy),
  Edit: createIcon(Edit2),
  View: createIcon(Eye),
  Menu: createIcon(Menu),
};

export type IconName = keyof typeof Icons;
