import { Bell, Sparkles } from "lucide-react";
import { Button } from "@/presentation/components/ui/button";

type DashboardHeaderProps = {
  title: string;
  subtitle?: string;
};

export function DashboardHeader({ title, subtitle }: DashboardHeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-border bg-card px-6 py-4">
      <div>
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
        {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon-sm" aria-label="Notificaciones">
          <Bell className="size-4" />
        </Button>
        <Button size="sm">
          <Sparkles className="size-4" />
          Panel activo
        </Button>
      </div>
    </header>
  );
}
