import {
  LayoutDashboard, TrendingUp, TrendingDown, Target, BarChart3, Heart, Settings,
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
  { title: "דשבורד", url: "/dashboard", icon: LayoutDashboard },
  { title: "הכנסות", url: "/dashboard/income", icon: TrendingUp },
  { title: "הוצאות", url: "/dashboard/expenses", icon: TrendingDown },
  { title: "יעדים", url: "/dashboard/goals", icon: Target },
  { title: "סטטיסטיקות", url: "/dashboard/statistics", icon: BarChart3 },
  { title: "מעשרות", url: "/dashboard/tithes", icon: Heart },
  { title: "הגדרות", url: "/dashboard/settings", icon: Settings },
];

export function CustomerSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  const isActive = (url: string) => {
    if (url === "/dashboard") return location.pathname === "/dashboard";
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
              <p className="text-xs text-sidebar-foreground/60">ניהול אישי</p>
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
                    <NavLink to={item.url} end={item.url === "/dashboard"} activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium">
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
