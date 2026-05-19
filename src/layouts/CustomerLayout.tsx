import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { CustomerSidebar } from "@/components/customer/CustomerSidebar";
import { Bell, LogOut, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { QuickAddMenu } from "@/components/customer/QuickAddMenu";
import { ReportsDialog } from "@/components/customer/ReportsDialog";

export default function CustomerLayout() {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const [reportsOpen, setReportsOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <CustomerSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-16 flex items-center justify-between border-b border-border/50 bg-card/80 backdrop-blur-xl px-6 sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="rounded-xl hover:bg-primary/10 transition-colors" />
              <h2 className="text-lg font-bold text-foreground">החשבון שלי</h2>
            </div>
            <div className="flex items-center gap-2">
              <QuickAddMenu />
              <Button
                size="sm"
                variant="outline"
                onClick={() => setReportsOpen(true)}
                className="rounded-xl gap-1.5 font-bold border-border/60 hover:bg-primary/10 hover:text-primary hover:border-primary/40 transition-colors"
              >
                <FileText className="h-4 w-4" />
                הפקת דוחות
              </Button>
              <ThemeToggle />
              <Button variant="ghost" size="icon" className="relative rounded-xl hover:bg-primary/10 transition-colors">
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleSignOut} title="התנתק" className="rounded-xl hover:bg-destructive/10 hover:text-destructive transition-colors">
                <LogOut className="h-5 w-5" />
              </Button>
              <div className="h-9 w-9 rounded-xl gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm shadow-glow-sm">
                {user?.user_metadata?.full_name?.slice(0, 2) || "לק"}
              </div>
            </div>
          </header>
          <main className="flex-1 p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
        <ReportsDialog open={reportsOpen} onOpenChange={setReportsOpen} />
      </div>
    </SidebarProvider>
  );
}
