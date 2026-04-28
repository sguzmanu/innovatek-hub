import { Header } from "@/components/layout/header"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import apisData from "@/data/apis.json"
import { PlugZap, CheckCircle2, XCircle, AlertCircle, Clock, Globe } from "lucide-react"

const statusConfig: Record<string, { icon: typeof CheckCircle2; color: string; bg: string; label: string }> = {
  conectada: { icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50", label: "Conectada" },
  desconectada: { icon: XCircle, color: "text-slate-400", bg: "bg-slate-50", label: "Desconectada" },
  error: { icon: AlertCircle, color: "text-red-600", bg: "bg-red-50", label: "Error" },
}

const categoryLabels: Record<string, string> = {
  erp: "ERP",
  ai: "IA",
  analytics: "Analytics",
  comunicacion: "Comunicación",
  storage: "Almacenamiento",
  otro: "Otro",
}

export default function ApisPage() {
  const apis = apisData.apis
  const connectedCount = apis.filter((a) => a.status === "conectada").length

  return (
    <div>
      <Header
        title="APIs & Conexiones"
        description={`${connectedCount} conectadas · ${apis.length} registradas`}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {apis.map((api) => {
          const cfg = statusConfig[api.status]
          const StatusIcon = cfg.icon
          return (
            <Card key={api.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="pt-5">
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2 rounded-lg ${cfg.bg}`}>
                    <StatusIcon className={`h-4 w-4 ${cfg.color}`} />
                  </div>
                  <Badge variant={api.status === "conectada" ? "default" : "secondary"} className="text-[10px]">
                    {cfg.label}
                  </Badge>
                </div>

                <h3 className="font-semibold text-sm mb-1">{api.name}</h3>
                <p className="text-xs text-muted-foreground mb-3">{api.description}</p>

                <div className="space-y-1.5 text-xs mb-3">
                  {api.endpoint && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Globe className="h-3 w-3 shrink-0" />
                      <span className="truncate font-mono text-[10px]">{api.endpoint}</span>
                    </div>
                  )}
                  {api.lastSync && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-3 w-3 shrink-0" />
                      <span>Sync: {new Date(api.lastSync).toLocaleString("es-CL", { dateStyle: "short", timeStyle: "short" })}</span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-border">
                  <p className="text-[10px] text-muted-foreground mb-1.5">Usado por:</p>
                  <div className="flex flex-wrap gap-1">
                    {api.usedBy.map((user) => (
                      <span key={user} className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{user}</span>
                    ))}
                  </div>
                </div>

                <div className="mt-2 flex justify-end">
                  <span className="text-[10px] text-muted-foreground">{categoryLabels[api.category]}</span>
                </div>
              </CardContent>
            </Card>
          )
        })}

        <Card className="border-0 shadow-sm border-dashed border-2 border-border/50 hover:border-primary/30 transition-colors cursor-pointer">
          <CardContent className="pt-5 flex flex-col items-center justify-center h-full py-10 text-center">
            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center mb-3">
              <PlugZap className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Nueva conexión</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-[150px]">Registra una nueva API o servicio</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
