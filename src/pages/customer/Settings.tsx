import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, User, UserPlus, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function CustomerSettings() {
  const { toast } = useToast();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">הגדרות</h1>
        <p className="text-muted-foreground">ניהול פרטים אישיים והגדרות חשבון</p>
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
              <Input defaultValue="ישראל ישראלי" />
            </div>
            <div className="space-y-2">
              <Label>טלפון</Label>
              <Input defaultValue="050-1234567" dir="ltr" />
            </div>
            <div className="space-y-2">
              <Label>מייל</Label>
              <Input defaultValue="israel@example.com" dir="ltr" />
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

        {/* Password */}
        <Card className="animate-fade-in">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                <Lock className="h-5 w-5 text-destructive" />
              </div>
              <CardTitle className="text-base">סיסמה וקוד זיהוי</CardTitle>
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
            <div className="space-y-2">
              <Label>קוד זיהוי לטלפון</Label>
              <Input placeholder="4 ספרות" maxLength={4} dir="ltr" />
            </div>
            <Button onClick={() => toast({ title: "הסיסמה שונתה בהצלחה" })}>
              עדכן סיסמה
            </Button>
          </CardContent>
        </Card>

        {/* Add Users */}
        <Card className="animate-fade-in">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-success/10 flex items-center justify-center">
                <UserPlus className="h-5 w-5 text-success" />
              </div>
              <CardTitle className="text-base">הוספת משתמשים</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">הוסף בני משפחה או שותפים עם הרשאות מותאמות</p>
            <div className="space-y-2">
              <Label>מייל המשתמש</Label>
              <Input placeholder="user@example.com" dir="ltr" />
            </div>
            <div className="space-y-2">
              <Label>שם המשתמש</Label>
              <Input placeholder="שם מלא" />
            </div>
            <Button variant="outline" onClick={() => toast({ title: "הזמנה נשלחה" })}>
              <UserPlus className="h-4 w-4 ml-2" />
              שלח הזמנה
            </Button>
          </CardContent>
        </Card>

        {/* Invoices */}
        <Card className="animate-fade-in">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-chart-3/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-chart-3" />
              </div>
              <CardTitle className="text-base">חשבוניות אחרונות</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { month: "מרץ 2026", amount: "₪149", date: "01/03/2026" },
              { month: "פברואר 2026", amount: "₪149", date: "01/02/2026" },
              { month: "ינואר 2026", amount: "₪149", date: "01/01/2026" },
            ].map((inv, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="text-sm font-medium">{inv.month}</p>
                  <p className="text-xs text-muted-foreground">{inv.date}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{inv.amount}</span>
                  <Button variant="ghost" size="sm" onClick={() => toast({ title: "מוריד חשבונית..." })}>
                    הורד
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
