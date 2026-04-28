import { Header } from "@/components/layout/header"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import automationsData from "@/data/automatizaciones.json"
import { Zap, Clock, Calendar, Play, Pause, AlertTriangle } from "lucide-react"

const statusConfig: Record<string, { icon: typeof Play; color: string; bg: string; label: string }> = {
  activa: { icon: Play, color: "text-emerald-600", bg: "bg-emerald-50", label: "Activa" },
  pausada: { icon: Pause, color: "text-amber-600", bg: "bg-amber-50", label: "Pausada" },
  error: { icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50", label: "Error" },
}

export default function AutomatizacionesPage() {
  const automations = automationsData.automations
  const activeCount = automations.filter((a) => a.status === "activa").length

  return (
    <div>
      <Header
        title="Automatizaciones"
        description={`${activeCount} activas · ${automations.length} en total`}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {automations.map((auto) => {
          const cfg = statusConfig[auto.status]
          const StatusIcon = cfg.icon
          return (
            <Card key={auto.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="pt-5">
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2 rounded-lg ${cfg.bg}`}>
                    <StatusIcon className={`h-4 w-4 ${cfg.color}`} />
                  </div>
                  <Badge variant={auto.status === "activa" ? "default" : "secondary"} className="text-[10px]">
                    {cfg.label}
                  </Badge>
                </div>

                <h3 className="font-semibold text-sm mb-1">{auto.name}</h3>
                <p className="text-xs text-muted-foreground mb-3">{auto.description}</p>

                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-3 w-3 shrink-0" />
                    <span>{auto.trigger}</span>
                  </div>
                  {auto.lastRun && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-3 w-3 shrink-0" />
                      <span>Última ejecución: {new Date(auto.lastRun).toLocaleDateString("es-CL")}</span>
                    </div>
                  )}
                  {auto.nextRun && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Zap className="h-3 w-3 shrink-0" />
                      <span>Próxima: {new Date(auto.nextRun).toLocaleDateString("es-CL")}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                  <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{auto.tool}</span>
                  <span className="text-[10px] text-muted-foreground">{auto.category}</span>
                </div>
              </CardContent>
            </Card>
          )
        })}

        <Card className="border-0 shadow-sm border-dashed border-2 border-border/50 hover:border-primary/30 transition-colors cursor-pointer">
          <CardContent className="pt-5 flex flex-col items-center justify-center h-full py-10 text-center">
            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center mb-3">
              <span className="text-2xl text-muted-foreground">+</span>
            </div>
            <p className="text-sm font-medium text-muted-foreground">Nueva automatización</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-[160px]">Agrega un flujo automatizado al registro</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
