import {
  LayoutDashboard,
  BriefcaseBusiness,
  CalendarClock,
  UserRound,
  Sheet,
  CreditCard,
  Crown,
  MessageSquare,
  Settings,
  Chrome,
} from "lucide-react";

export enum APP_CONSTANTS {
  RECORDS_PER_PAGE = 10,
  ACTIVITY_MAX_DURATION_MINUTES = 8 * 60, // 8 Hours
  ACTIVITY_MAX_DURATION_MS = 8 * 60 * 60 * 1000, // 8 hours in milliseconds
}

// Function to get Chrome extension URL from environment variable
const getChromeExtensionUrl = () => {
  const extensionId = process.env.NEXT_PUBLIC_CHROME_EXTENSION_ID;
  if (extensionId) {
    return `https://chrome.google.com/webstore/detail/${extensionId}`;
  }
  return "#"; // Placeholder when no extension ID is set
};

export const SIDEBAR_LINKS = [
  {
    icon: LayoutDashboard,
    route: "/dashboard",
    label: "Dashboard",
  },
  {
    icon: BriefcaseBusiness,
    route: "/dashboard/myjobs",
    label: "My Jobs",
  },
  {
    icon: UserRound,
    route: "/dashboard/profile",
    label: "Profile",
  },
  {
    icon: Sheet,
    route: "/dashboard/admin",
    label: "Administration",
  },
  {
    label: "Pricing",
    icon: CreditCard,
    route: "/pricing"
  },
  {
    label: "Subscription",
    icon: Settings,
    route: "/dashboard/subscription"
  },
  {
    label: "Feedback",
    icon: MessageSquare,
    route: "/dashboard/feedback"
  },
  {
    label: "Chrome Extension",
    icon: Chrome,
    route: getChromeExtensionUrl()
  },
];
