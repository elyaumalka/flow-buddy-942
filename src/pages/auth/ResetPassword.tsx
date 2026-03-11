import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Lock } from "lucide-react";
import logo from "@/assets/logo.jpg";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.includes("type=recovery")) { navigate("/login"); }
  }, [navigate]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ title: "שגיאה", description: "הסיסמאות אינן תואמות", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      toast({ title: "שגיאה", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "הסיסמה עודכנה בהצלחה!" });
      navigate("/login");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[hsl(209,61%,12%)] via-[hsl(197,100%,20%)] to-[hsl(170,80%,30%)] p-4">
      <Card className="w-full max-w-md animate-fade-in shadow-2xl border-0">
        <CardHeader className="text-center space-y-3">
          <img src={logo} alt="Phone-Tech פון-טק" className="mx-auto h-20 w-auto object-contain" />
          <CardTitle className="text-2xl">איפוס סיסמה</CardTitle>
          <CardDescription>הזן את הסיסמה החדשה שלך</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleReset} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">סיסמה חדשה</Label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="password" type="password" placeholder="לפחות 6 תווים" value={password} onChange={(e) => setPassword(e.target.value)} className="pr-10" required minLength={6} dir="ltr" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">אישור סיסמה</Label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="confirmPassword" type="password" placeholder="הזן שוב את הסיסמה" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="pr-10" required minLength={6} dir="ltr" />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>{loading ? "מעדכן..." : "עדכן סיסמה"}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
