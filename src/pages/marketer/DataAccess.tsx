import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Phone, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const MINUTE_OPTIONS = ["5", "10", "15", "30", "60", "ללא הגבלה"];

export default function MarketerDataAccess() {
  const { toast } = useToast();
  const [phone, setPhone] = useState("");
  const [minutes, setMinutes] = useState("15");
  const [sent, setSent] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <div className="h-11 w-11 rounded-2xl gradient-primary flex items-center justify-center shadow-glow-sm">
          <ShieldCheck className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">גישה לנתונים אישיים</h1>
          <p className="text-muted-foreground">גישה לנתוני לקוח באישורו, באמצעות אימות טלפוני</p>
        </div>
      </div>

      <Card className="card-premium max-w-xl">
        <CardHeader>
          <CardTitle className="text-base">בקשת גישה</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4" dir="rtl">
          <div className="space-y-2">
            <Label className="font-semibold text-xs">טלפון הלקוח</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="050-0000000" dir="ltr" className="rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label className="font-semibold text-xs">משך הגישה (דקות)</Label>
            <Select value={minutes} onValueChange={setMinutes}>
              <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent className="rounded-xl">
                {MINUTE_OPTIONS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <p className="text-xs text-muted-foreground">
            * הגישה תינתן רק לאחר אישור הלקוח באמצעות אימות טלפוני.
          </p>
          {!sent ? (
            <Button
              className="rounded-xl gradient-primary border-0 gap-1.5"
              onClick={() => { if (!phone) { toast({ title: "יש להזין טלפון", variant: "destructive" }); return; } setSent(true); toast({ title: "נשלחה בקשת אימות ללקוח" }); }}
            >
              <Phone className="h-4 w-4" /> שליחת בקשת אימות
            </Button>
          ) : (
            <div className="rounded-xl bg-success/10 border border-success/20 p-3 text-sm text-success font-medium">
              נשלחה בקשת אימות ל-{phone} למשך {minutes} דקות. ממתין לאישור הלקוח.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
