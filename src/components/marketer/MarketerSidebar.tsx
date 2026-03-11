import {
  LayoutDashboard,
  Users,
  CheckSquare,
  UserCheck,
  Percent,
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
      <SidebarHeader className="p-4 border-b">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-success flex items-center justify-center">
              <span className="text-success-foreground font-bold text-lg">₪</span>
            </div>
            <div>
              <h1 className="font-bold text-foreground">תזרים+</h1>
              <p className="text-xs text-muted-foreground">פאנל משווק</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="flex justify-center">
            <div className="h-8 w-8 rounded-lg bg-success flex items-center justify-center">
              <span className="text-success-foreground font-bold text-sm">₪</span>
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
                      end={item.url === "/marketer"}
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
