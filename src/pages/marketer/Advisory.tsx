import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb, Package, PauseCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const packages = [
  { name: "ייעוץ בסיסי", desc: "פגישת ייעוץ חד פעמית + סיכום", price: "₪250" },
  { name: "ליווי חודשי", desc: "ליווי פיננסי שוטף, עד 4 פגישות בחודש", price: "₪600" },
  { name: "ליווי מקיף", desc: "בניית תקציב, מעקב ויעדים אישיים", price: "₪900" },
];

export default function MarketerAdvisory() {
  const { toast } = useToast();

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <div className="h-11 w-11 rounded-2xl gradient-primary flex items-center justify-center shadow-glow-sm">
          <Lightbulb className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">ייעוץ כלכלי</h1>
          <p className="text-muted-foreground">חבילות ליווי וייעוץ פיננסי ללקוחות</p>
        </div>
      </div>

      <Card className="border-amber-400/40 bg-amber-50/40 dark:bg-amber-950/10">
        <CardContent className="flex items-center gap-3 py-4">
          <PauseCircle className="h-5 w-5 text-amber-600" />
          <p className="text-sm text-amber-700 dark:text-amber-400 font-medium">
            ממשק זה מוחלף בהדרגה לשירותי "ייעוץ כלכלי". חלק מהאפשרויות עדיין בשלבי הקמה.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {packages.map((p) => (
          <Card key={p.name} className="card-premium hover-lift">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">{p.name}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground min-h-10">{p.desc}</p>
              <div className="text-2xl font-extrabold text-foreground">{p.price}</div>
              <Button
                className="w-full rounded-xl gradient-primary border-0"
                onClick={() => toast({ title: "החבילה נבחרה", description: p.name })}
              >
                בחירת חבילה
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
