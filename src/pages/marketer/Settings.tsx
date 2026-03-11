import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, User, Building, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function MarketerSettings() {
  const { toast } = useToast();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">הגדרות</h1>
        <p className="text-muted-foreground">פרטים אישיים והגדרות חשבון</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Info */}
        <Card className="animate-fade-in">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-base">פרטים אישיים</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>שם מלא</Label>
              <Input defaultValue="אבי ישראלי" />
            </div>
            <div className="space-y-2">
              <Label>טלפון</Label>
              <Input defaultValue="050-5551234" dir="ltr" />
            </div>
            <div className="space-y-2">
              <Label>מייל</Label>
              <Input defaultValue="avi@example.com" dir="ltr" />
            </div>
            <div className="space-y-2">
              <Label>כתובת</Label>
              <Input defaultValue="ירושלים" />
            </div>
            <Button onClick={() => toast({ title: "הפרטים עודכנו בהצלחה" })}>
              שמור שינויים
            </Button>
          </CardContent>
        </Card>

        {/* Bank Details */}
        <Card className="animate-fade-in">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-success/10 flex items-center justify-center">
                <Building className="h-5 w-5 text-success" />
              </div>
              <CardTitle className="text-base">פרטי חשבון בנק</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>שם בנק</Label>
              <Input placeholder="לאומי, הפועלים..." />
            </div>
            <div className="space-y-2">
              <Label>מספר סניף</Label>
              <Input placeholder="000" dir="ltr" />
            </div>
            <div className="space-y-2">
              <Label>מספר חשבון</Label>
              <Input placeholder="000000" dir="ltr" />
            </div>
            <Button variant="outline" onClick={() => toast({ title: "פרטי הבנק עודכנו" })}>
              שמור פרטי בנק
            </Button>
          </CardContent>
        </Card>

        {/* Password */}
        <Card className="animate-fade-in">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                <Lock className="h-5 w-5 text-destructive" />
              </div>
              <CardTitle className="text-base">שינוי סיסמה</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>סיסמה נוכחית</Label>
              <Input type="password" placeholder="••••••••" dir="ltr" />
            </div>
            <div className="space-y-2">
              <Label>סיסמה חדשה</Label>
              <Input type="password" placeholder="••••••••" dir="ltr" />
            </div>
            <Button onClick={() => toast({ title: "הסיסמה שונתה בהצלחה" })}>
              עדכן סיסמה
            </Button>
          </CardContent>
        </Card>

        {/* Documents */}
        <Card className="animate-fade-in">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-chart-3/10 flex items-center justify-center">
                <Upload className="h-5 w-5 text-chart-3" />
              </div>
              <CardTitle className="text-base">העלאת מסמכים</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">העלה מסמכים כגון אישור ניהול חשבון, תעודת זהות וכו׳</p>
            <div className="border-2 border-dashed rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
              <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">גרור קבצים לכאן או לחץ להעלאה</p>
            </div>
            <Button variant="outline" onClick={() => toast({ title: "המסמך הועלה בהצלחה" })}>
              העלה מסמך
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
