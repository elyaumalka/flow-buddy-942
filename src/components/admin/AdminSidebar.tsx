import {
  LayoutDashboard, Users, Handshake, Megaphone, UserCheck,
  CreditCard, AlertTriangle, Percent, FileText, BarChart3,
  CheckSquare, CalendarDays, HeadphonesIcon, Settings,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarHeader, useSidebar,
} from "@/components/ui/sidebar";
import logo from "@/assets/logo.jpg";

const menuItems = [
  { title: "דשבורד", url: "/admin", icon: LayoutDashboard },
  { title: "לידים", url: "/admin/leads", icon: Users },
  { title: "שותפים", url: "/admin/partners", icon: Handshake },
  { title: "משווקים", url: "/admin/marketers", icon: Megaphone },
  { title: "לקוחות", url: "/admin/customers", icon: UserCheck },
  { title: "תשלומים", url: "/admin/payments", icon: CreditCard },
  { title: "הו״ק לטיפול", url: "/admin/collections", icon: AlertTriangle },
  { title: "עמלות", url: "/admin/commissions", icon: Percent },
  { title: "דוחות", url: "/admin/reports", icon: FileText },
  { title: "סטטיסטיקות", url: "/admin/statistics", icon: BarChart3 },
  { title: "משימות", url: "/admin/tasks", icon: CheckSquare },
  { title: "לוח שנה", url: "/admin/calendar", icon: CalendarDays },
  { title: "פניות ותקלות", url: "/admin/tickets", icon: HeadphonesIcon },
  { title: "הגדרות", url: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  const isActive = (url: string) => {
    if (url === "/admin") return location.pathname === "/admin";
    return location.pathname.startsWith(url);
  };

  return (
    <Sidebar collapsible="icon" side="right">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <img src={logo} alt="Phone-Tech" className="h-10 w-auto object-contain rounded-lg" />
            <div>
              <h1 className="font-bold text-sidebar-foreground text-sm">Phone-Tech</h1>
              <p className="text-xs text-sidebar-foreground/60">ניהול מערכת</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="flex justify-center">
            <img src={logo} alt="PT" className="h-8 w-8 object-cover rounded-lg" />
          </div>
        )}
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50">ניהול</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                    <NavLink to={item.url} end={item.url === "/admin"} activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium">
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
