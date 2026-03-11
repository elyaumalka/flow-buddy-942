import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Mail, Lock, LogIn, Shield, Users, User } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import logo from "@/assets/logo.jpg";

const DEMO_ACCOUNTS = [
  { label: "התחבר כמנהל", role: "admin", icon: Shield, className: "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20" },
  { label: "התחבר כמשווק", role: "marketer", icon: Users, className: "bg-accent/10 text-accent border-accent/20 hover:bg-accent/20" },
  { label: "התחבר כלקוח", role: "customer", icon: User, className: "bg-chart-2/10 text-chart-2 border-chart-2/20 hover:bg-chart-2/20" },
] as const;

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast({ title: "שגיאת התחברות", description: error.message, variant: "destructive" });
    } else {
      navigate("/");
    }
    setLoading(false);
  };

  const handleDemoLogin = async (role: string) => {
    setDemoLoading(role);
    const demoEmail = `demo-${role}@tizrim.app`;
    const demoPassword = "demo123456";

    const { error: signInError } = await supabase.auth.signInWithPassword({ email: demoEmail, password: demoPassword });

    if (signInError) {
      const { error: signUpError } = await supabase.auth.signUp({
        email: demoEmail,
        password: demoPassword,
        options: { data: { full_name: role === "admin" ? "מנהל דמו" : role === "marketer" ? "משווק דמו" : "לקוח דמו", role } },
      });

      if (signUpError) {
        toast({ title: "שגיאה", description: signUpError.message, variant: "destructive" });
        setDemoLoading(null);
        return;
      }

      const { error: retryError } = await supabase.auth.signInWithPassword({ email: demoEmail, password: demoPassword });
      if (retryError) {
        toast({ title: "החשבון נוצר", description: "יש לאשר את המייל לפני ההתחברות", variant: "destructive" });
        setDemoLoading(null);
        return;
      }
    }

    toast({ title: `מחובר כ${role === "admin" ? "מנהל" : role === "marketer" ? "משווק" : "לקוח"}` });
    navigate("/");
    setDemoLoading(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[hsl(209,61%,12%)] via-[hsl(197,100%,20%)] to-[hsl(170,80%,30%)] p-4">
      <Card className="w-full max-w-md animate-fade-in shadow-2xl border-0">
        <CardHeader className="text-center space-y-3 pb-4">
          <img src={logo} alt="Phone-Tech פון-טק" className="mx-auto h-20 w-auto object-contain" />
          <CardTitle className="text-2xl">התחברות</CardTitle>
          <CardDescription>היכנס לחשבון שלך כדי להמשיך</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-3">
            <p className="text-sm font-medium text-center text-muted-foreground">כניסה מהירה לדמו</p>
            <div className="grid grid-cols-3 gap-2">
              {DEMO_ACCOUNTS.map((demo) => (
                <Button
                  key={demo.role}
                  variant="outline"
                  className={`flex flex-col items-center gap-1.5 h-auto py-3 border ${demo.className} transition-colors`}
                  onClick={() => handleDemoLogin(demo.role)}
                  disabled={!!demoLoading}
                >
                  <demo.icon className="h-5 w-5" />
                  <span className="text-xs font-medium leading-tight">
                    {demoLoading === demo.role ? "מתחבר..." : demo.label}
                  </span>
                </Button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">או התחבר עם מייל</span>
            <Separator className="flex-1" />
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">כתובת מייל</Label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="email" type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pr-10" required dir="ltr" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">סיסמה</Label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="pr-10" required dir="ltr" />
              </div>
            </div>
            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-sm text-primary hover:underline">שכחתי סיסמה</Link>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              <LogIn className="h-4 w-4 ml-2" />
              {loading ? "מתחבר..." : "התחבר"}
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground">
            אין לך חשבון?{" "}
            <Link to="/signup" className="text-primary hover:underline font-medium">הרשמה</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
