import {
  LayoutDashboard, Users, Handshake, Megaphone, UserCheck,
  CreditCard, AlertTriangle, Percent, FileText, BarChart3,
  CheckSquare, CalendarDays, HeadphonesIcon, Settings, Ticket,
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
  { title: "קופונים", url: "/admin/coupons", icon: Ticket },
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
    <Sidebar collapsible="icon" side="right" className="border-l-0">
      <SidebarHeader className="p-4 border-b border-sidebar-border/50">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="relative">
              <img src={logo} alt="Phone-Tech" className="h-11 w-auto object-contain rounded-xl shadow-lg" />
              <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-success border-2 border-sidebar-background animate-pulse" />
            </div>
            <div>
              <h1 className="font-extrabold text-sidebar-foreground text-sm tracking-tight">Phone-Tech</h1>
              <p className="text-[11px] text-sidebar-foreground/50 font-medium">ניהול מערכת</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="flex justify-center">
            <img src={logo} alt="PT" className="h-9 w-9 object-cover rounded-xl shadow-md" />
          </div>
        )}
      </SidebarHeader>
      <SidebarContent className="py-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/40 text-[10px] uppercase tracking-widest font-bold px-4">תפריט ראשי</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                    className="rounded-xl mx-2 transition-all duration-200 hover:bg-sidebar-accent/80 data-[active=true]:bg-sidebar-accent data-[active=true]:shadow-sm"
                  >
                    <NavLink to={item.url} end={item.url === "/admin"} activeClassName="text-sidebar-accent-foreground font-bold">
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span className="text-sm">{item.title}</span>}
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
