import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Bell, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

export default function AdminLayout() {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-16 flex items-center justify-between border-b border-border/50 bg-card/80 backdrop-blur-xl px-6 sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="rounded-xl hover:bg-primary/10 transition-colors" />
              <div>
                <h2 className="text-lg font-bold text-foreground">ניהול מערכת</h2>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="relative rounded-xl hover:bg-primary/10 transition-colors">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-0.5 -left-0.5 h-4.5 w-4.5 rounded-full gradient-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center shadow-glow-sm">3</span>
              </Button>
              <Button variant="ghost" size="icon" onClick={handleSignOut} title="התנתק" className="rounded-xl hover:bg-destructive/10 hover:text-destructive transition-colors">
                <LogOut className="h-5 w-5" />
              </Button>
              <div className="h-9 w-9 rounded-xl gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm shadow-glow-sm cursor-pointer hover:shadow-glow transition-shadow">
                {user?.user_metadata?.full_name?.slice(0, 2) || "מנ"}
              </div>
            </div>
          </header>
          <main className="flex-1 p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
