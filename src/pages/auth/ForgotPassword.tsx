import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Mail, ArrowRight } from "lucide-react";
import logo from "@/assets/logo.jpg";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
    if (error) {
      toast({ title: "שגיאה", description: error.message, variant: "destructive" });
    } else {
      setSent(true);
      toast({ title: "נשלח!", description: "בדוק את תיבת הדואר שלך" });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[hsl(209,61%,12%)] via-[hsl(197,100%,20%)] to-[hsl(170,80%,30%)] p-4">
      <Card className="w-full max-w-md animate-fade-in shadow-2xl border-0">
        <CardHeader className="text-center space-y-3">
          <img src={logo} alt="Phone-Tech פון-טק" className="mx-auto h-20 w-auto object-contain" />
          <CardTitle className="text-2xl">שכחתי סיסמה</CardTitle>
          <CardDescription>{sent ? "נשלח לך מייל עם קישור לאיפוס הסיסמה" : "הזן את כתובת המייל שלך ונשלח לך קישור לאיפוס"}</CardDescription>
        </CardHeader>
        <CardContent>
          {!sent ? (
            <form onSubmit={handleReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">כתובת מייל</Label>
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="email" type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pr-10" required dir="ltr" />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>{loading ? "שולח..." : "שלח קישור איפוס"}</Button>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">בדוק את תיבת הדואר שלך ולחץ על הקישור לאיפוס הסיסמה.</p>
            </div>
          )}
          <p className="text-center text-sm text-muted-foreground mt-4">
            <Link to="/login" className="text-primary hover:underline font-medium flex items-center justify-center gap-1">
              <ArrowRight className="h-4 w-4" />
              חזור לדף ההתחברות
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
