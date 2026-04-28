import { Header } from "@/components/layout/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import brandsData from "@/data/marcas.json"
import skillsData from "@/data/skills.json"
import automationsData from "@/data/automatizaciones.json"
import apisData from "@/data/apis.json"
import Link from "next/link"
import { ShoppingBag, Cpu, Zap, PlugZap, ArrowRight, Activity } from "lucide-react"
import type { Brand } from "@/lib/types"

const healthLabels: Record<string, string> = {
  excelente: "Excelente",
  bueno: "Bueno",
  regular: "Regular",
  critico: "Crítico",
}

const statusColors: Record<string, string> = {
  activa: "bg-emerald-100 text-emerald-800",
  en_desarrollo: "bg-amber-100 text-amber-800",
  pausada: "bg-slate-100 text-slate-600",
}

const statusLabels: Record<string, string> = {
  activa: "Activa",
  en_desarrollo: "En desarrollo",
  pausada: "Pausada",
}

export default function DashboardPage() {
  const brands = brandsData.brands as Brand[]
  const activeSkills = skillsData.skills.filter((s) => s.active).length
  const activeAutomations = automationsData.automations.filter((a) => a.status === "activa").length
  const connectedApis = apisData.apis.filter((a) => a.status === "conectada").length
  const avgHealth = Math.round(brands.reduce((acc, b) => acc + b.healthScore, 0) / brands.length)

  const stats = [
    { title: "Marcas activas", value: brands.filter((b) => b.status === "activa").length, total: brands.length, icon: ShoppingBag, href: "/marcas", color: "text-blue-600", bg: "bg-blue-50" },
    { title: "Skills activos", value: activeSkills, total: skillsData.skills.length, icon: Cpu, href: "/skills", color: "text-violet-600", bg: "bg-violet-50" },
    { title: "Automatizaciones", value: activeAutomations, total: automationsData.automations.length, icon: Zap, href: "/automatizaciones", color: "text-amber-600", bg: "bg-amber-50" },
    { title: "APIs conectadas", value: connectedApis, total: apisData.apis.length, icon: PlugZap, href: "/apis", color: "text-emerald-600", bg: "bg-emerald-50" },
  ]

  return (
    <div>
      <Header
        title="Dashboard"
        description={`Resumen general · ${new Date().toLocaleDateString("es-CL", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}`}
      />

      <Card className="mb-6 border-0 shadow-sm bg-gradient-to-r from-slate-900 to-slate-700 text-white">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium uppercase tracking-wide">Salud global del portafolio</p>
              <p className="text-5xl font-bold mt-1">{avgHealth}<span className="text-2xl text-slate-400">/100</span></p>
            </div>
            <div className="text-right">
              <Activity className="h-10 w-10 text-slate-400 ml-auto mb-2" />
              <p className="text-slate-300 text-sm">{brands.length} marcas monitoreadas</p>
            </div>
          </div>
          <Progress value={avgHealth} className="mt-4 h-2 bg-slate-700 [&>div]:bg-emerald-400" />
        </CardContent>
      </Card>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Link key={stat.href} href={stat.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer border-0 shadow-sm">
                <CardContent className="pt-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2 rounded-lg ${stat.bg}`}>
                      <Icon className={`h-4 w-4 ${stat.color}`} />
                    </div>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  </div>
                  <p className="text-2xl font-bold">{stat.value}<span className="text-sm font-normal text-muted-foreground">/{stat.total}</span></p>
                  <p className="text-xs text-muted-foreground mt-0.5">{stat.title}</p>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">Estado de marcas</CardTitle>
            <Link href="/marcas" className="text-xs text-primary flex items-center gap-1 hover:underline">
              Ver todas <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {brands.map((brand) => (
              <Link key={brand.slug} href={`/marcas/${brand.slug}`} className="block">
                <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors cursor-pointer">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ backgroundColor: brand.color }}>
                    {brand.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{brand.name}</p>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${statusColors[brand.status]}`}>
                        {statusLabels[brand.status]}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{brand.category}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold">{brand.healthScore}<span className="text-xs text-muted-foreground">/100</span></p>
                    <p className="text-[10px] text-muted-foreground">{healthLabels[brand.health]}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
