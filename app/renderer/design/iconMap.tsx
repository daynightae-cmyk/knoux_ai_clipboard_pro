/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import {
  LayoutDashboard,
  Clipboard,
  Search,
  Sparkles,
  ShieldCheck,
  Settings,
  FlaskConical,
  Info,
  Menu,
  ChevronLeft,
  Lock,
  Unlock,
  KeyRound,
  ShieldAlert,
  Database,
  History,
  AlertTriangle,
  FileCheck,
  Check,
  Zap,
  RefreshCw,
  CheckCircle2,
  Globe,
  Code,
  FileText,
  Activity,
  Plus,
  Trash2,
  Copy,
  CheckCircle,
  ExternalLink,
  Phone,
  Mail,
  Instagram,
  Github,
} from "lucide-react";

export const ICON_MAP = {
  dashboard: LayoutDashboard,
  clipboard: Clipboard,
  search: Search,
  ai: Sparkles,
  security: ShieldCheck,
  settings: Settings,
  labs: FlaskConical,
  about: Info,
  menu: Menu,
  chevronLeft: ChevronLeft,
  lock: Lock,
  unlock: Unlock,
  key: KeyRound,
  shieldAlert: ShieldAlert,
  database: Database,
  history: History,
  warning: AlertTriangle,
  fileCheck: FileCheck,
  check: Check,
  zap: Zap,
  refresh: RefreshCw,
  checkCircle2: CheckCircle2,
  globe: Globe,
  code: Code,
  fileText: FileText,
  activity: Activity,
  plus: Plus,
  trash: Trash2,
  copy: Copy,
  checkCircle: CheckCircle,
  externalLink: ExternalLink,
  phone: Phone,
  mail: Mail,
  instagram: Instagram,
  github: Github,
};

export type IconType = keyof typeof ICON_MAP;

interface KnouxIconProps {
  name: IconType;
  className?: string;
}

export function KnouxIcon({ name, className = "w-4 h-4" }: KnouxIconProps) {
  const IconComponent = ICON_MAP[name] || HelpCircle;
  return <IconComponent className={className} />;
}

import { HelpCircle } from "lucide-react";
