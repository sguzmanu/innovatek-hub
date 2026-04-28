import { Header } from "@/components/layout/header"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import brandsData from "@/data/marcas.json"
import Link from "next/link"
import { ArrowRight, PlugZap } from "lucide-react"
import type { Brand } from "@/lib/types"

const healthColors: Record<string, string> = {
  excelente: "text-emerald-600",
  bueno: "text-blue-600",
  regular: "text-amber-600",
  critico: "text-red-600",
}

const healthLabels: Record<string, string> = {
  excelente: "Excelente",
  bueno: "Bueno",
  regular: "Regular",
  critico: "Crítico",
}

const statusBadge: Record<string, { bg: string; label: string }> = {
  activa: { bg: "bg-emerald-100 text-emerald-800", label: "Activa" },
  en_desarrollo: { bg: "bg-amber-100 text-amber-800", label: "En desarrollo" },
  pausada: { bg: "bg-slate-100 text-slate-600", label: "Pausada" },
}

export default function MarcasPage() {
  const brands = brandsData.brands as Brand[]

  return (
    <div>
      <Header
        title="Marcas"
        description={`${brands.length} marcas propias · UnionX`}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {brands.map((brand) => {
          const badge = statusBadge[brand.status]
          return (
            <Link key={brand.slug} href={`/marcas/${brand.slug}`} className="block">
              <Card className="border-0 shadow-sm hover:shadow-md transition-all cursor-pointer group h-full">
                <CardContent className="pt-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: brand.color }}>
                      {brand.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex items-center gap-1.5">
                      {brand.odooConnected && (
                        <span title="Conectado a Odoo">
                          <PlugZap className="h-3.5 w-3.5 text-emerald-500" />
                        </span>
                      )}
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${badge.bg}`}>
                        {badge.label}
                      </span>
                    </div>
                  </div>

                  <h3 className="font-semibold text-sm mb-0.5">{brand.name}</h3>
                  <p className="text-xs text-muted-foreground mb-3">{brand.category}</p>

                  <div className="mb-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">Salud</span>
                      <span className={`text-xs font-semibold ${healthColors[brand.health]}`}>
                        {brand.healthScore} · {healthLabels[brand.health]}
                      </span>
                    </div>
                    <Progress value={brand.healthScore} className="h-1.5" />
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                    <p className="text-[10px] text-muted-foreground">
                      {brand.lastReport ? `Último informe: ${new Date(brand.lastReport).toLocaleDateString("es-CL")}` : "Sin informes"}
                    </p>
                    <ArrowRight className="h-3 w-3 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
