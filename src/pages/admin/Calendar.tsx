import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { StatusBadge } from "@/components/admin/StatusBadge";

const events = [
  { date: "11/03/2026", title: "שיחה עם אברהם כהן", type: "דחוף" },
  { date: "12/03/2026", title: "שליחת חשבונית", type: "רגיל" },
  { date: "13/03/2026", title: "בדיקת תקלה - רחל לוי", type: "דחוף" },
  { date: "15/03/2026", title: "פגישת צוות", type: "רגיל" },
  { date: "18/03/2026", title: "סגירת דוח חודשי", type: "רגיל" },
];

export default function AdminCalendar() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">לוח שנה</h1>
        <p className="text-muted-foreground">ניהול אירועים ומשימות</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 animate-fade-in">
          <CardContent className="p-6 flex justify-center">
            <CalendarComponent
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-lg"
            />
          </CardContent>
        </Card>
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="text-base">אירועים קרובים</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {events.map((e, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="text-sm font-medium">{e.title}</p>
                  <p className="text-xs text-muted-foreground">{e.date}</p>
                </div>
                <StatusBadge status={e.type} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
