import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Phone, Bell, Lock, Link } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminSettings() {
  const { toast } = useToast();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">הגדרות</h1>
        <p className="text-muted-foreground">הגדרות מערכת וחיבורים</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Telephony Integration */}
        <Card className="animate-fade-in">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Phone className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-base">חיבור טלפוניה</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>כתובת API</Label>
              <Input placeholder="https://api.telephony.com/v1" />
            </div>
            <div className="space-y-2">
              <Label>מפתח API</Label>
              <Input type="password" placeholder="••••••••" />
            </div>
            <Button onClick={() => toast({ title: "נשמר", description: "הגדרות טלפוניה נשמרו" })}>
              <Link className="h-4 w-4 ml-2" />
              חבר
            </Button>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="animate-fade-in">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-chart-3/10 flex items-center justify-center">
                <Bell className="h-5 w-5 text-chart-3" />
              </div>
              <CardTitle className="text-base">התראות</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>התראת אי-תשלום ללקוח</Label>
              <Switch defaultChecked />
            </div>
            <div className="space-y-2">
              <Label>שלח התראה אחרי (ימים)</Label>
              <Input type="number" defaultValue={7} className="w-24" />
            </div>
            <div className="space-y-2">
              <Label>סגירת מנוי אוטומטית אחרי (ימים)</Label>
              <Input type="number" defaultValue={30} className="w-24" />
            </div>
            <Button variant="outline" onClick={() => toast({ title: "נשמר", description: "הגדרות התראות נשמרו" })}>
              שמור הגדרות
            </Button>
          </CardContent>
        </Card>

        {/* Password & Access */}
        <Card className="animate-fade-in">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                <Lock className="h-5 w-5 text-destructive" />
              </div>
              <CardTitle className="text-base">סיסמאות וגישה</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>סיסמה נוכחית</Label>
              <Input type="password" placeholder="••••••••" />
            </div>
            <div className="space-y-2">
              <Label>סיסמה חדשה</Label>
              <Input type="password" placeholder="••••••••" />
            </div>
            <div className="space-y-2">
              <Label>אישור סיסמה</Label>
              <Input type="password" placeholder="••••••••" />
            </div>
            <Button onClick={() => toast({ title: "הסיסמה שונתה בהצלחה" })}>
              עדכן סיסמה
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
