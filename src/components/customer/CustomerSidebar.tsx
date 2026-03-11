import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  Target,
  BarChart3,
  Heart,
  Settings,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";

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
      <SidebarHeader className="p-4 border-b">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-chart-1 flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">₪</span>
            </div>
            <div>
              <h1 className="font-bold text-foreground">תזרים+</h1>
              <p className="text-xs text-muted-foreground">ניהול אישי</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="flex justify-center">
            <div className="h-8 w-8 rounded-lg bg-chart-1 flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">₪</span>
            </div>
          </div>
        )}
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>ניהול</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                  >
                    <NavLink
                      to={item.url}
                      end={item.url === "/dashboard"}
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    >
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
