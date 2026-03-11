import {
  LayoutDashboard, Users, CheckSquare, UserCheck, Percent, Settings,
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
  { title: "דשבורד", url: "/marketer", icon: LayoutDashboard },
  { title: "לידים", url: "/marketer/leads", icon: Users },
  { title: "משימות", url: "/marketer/tasks", icon: CheckSquare },
  { title: "לקוחות", url: "/marketer/customers", icon: UserCheck },
  { title: "עמלות", url: "/marketer/commissions", icon: Percent },
  { title: "הגדרות", url: "/marketer/settings", icon: Settings },
];

export function MarketerSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  const isActive = (url: string) => {
    if (url === "/marketer") return location.pathname === "/marketer";
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
              <p className="text-xs text-sidebar-foreground/60">פאנל משווק</p>
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
                    <NavLink to={item.url} end={item.url === "/marketer"} activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium">
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
