import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, Users, DollarSign, AlertTriangle, Percent, HeadphonesIcon, Megaphone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const reportTypes = [
  { title: "דוח הכנסות", desc: "סיכום הכנסות לפי תקופה", icon: DollarSign },
  { title: "דוח הו״ק לטיפול", desc: "חובות ותשלומים שנכשלו", icon: AlertTriangle },
  { title: "דוח לקוחות", desc: "רשימת לקוחות וסטטוסים", icon: Users },
  { title: "דוח לידים", desc: "לידים חדשים ומקורות הגעה", icon: FileText },
  { title: "דוח משווקים", desc: "פעילות משווקים ותוצאות", icon: Megaphone },
  { title: "דוח עמלות", desc: "סיכום עמלות לתשלום", icon: Percent },
  { title: "דוח פניות", desc: "פניות פתוחות וסגורות", icon: HeadphonesIcon },
];

export default function AdminReports() {
  const { toast } = useToast();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">דוחות</h1>
        <p className="text-muted-foreground">הורדת דוחות מרוכזים לפי נושאים</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {reportTypes.map((report, i) => (
          <Card key={i} className="animate-fade-in hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <report.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">{report.title}</CardTitle>
                  <p className="text-xs text-muted-foreground">{report.desc}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full"
                variant="outline"
                onClick={() => toast({ title: `מוריד ${report.title}...` })}
              >
                <Download className="h-4 w-4 ml-2" />
                הורדת דוח
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
