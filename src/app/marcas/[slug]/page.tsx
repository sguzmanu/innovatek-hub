import { notFound } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import brandsData from "@/data/marcas.json"
import { PlugZap, FileText, Target, ClipboardCheck, TrendingUp, AlertCircle, Package } from "lucide-react"
import type { Brand } from "@/lib/types"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { BRAND_ID, BRAND_CATEGORY, getBrandDetailData } from "@/lib/odoo"

export const revalidate = 300

const healthColors: Record<string, string> = {
  excelente: "text-emerald-600",
  bueno: "text-blue-600",
  regular: "text-amber-600",
  critico: "text-red-600",
}
const healthLabels: Record<string, string> = {
  excelente: "Excelente", bueno: "Bueno", regular: "Regular", critico: "Crítico",
}

interface PageProps { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return brandsData.brands.map((b) => ({ slug: b.slug }))
}

function formatCLP(n: number) {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n)
}

export default async function BrandPage({ params }: PageProps) {
  const { slug } = await params
  const brand = brandsData.brands.find((b) => b.slug === slug) as Brand | undefined
  if (!brand) notFound()

  const hasOdoo = !!BRAND_ID[slug]
  let products: Awaited<ReturnType<typeof getBrandDetailData>>['products'] = []
  let monthlyUnits: Awaited<ReturnType<typeof getBrandDetailData>>['monthlyUnits'] = []
  let yearTotal = { ventas: 0, unidades: 0 }
  let odooAvailable = false

  if (hasOdoo) {
    try {
      const data = await getBrandDetailData(slug)
      products = data.products
      monthlyUnits = data.monthlyUnits
      yearTotal = data.yearTotal
      odooAvailable = true
    } catch {
      // degrade silently
    }
  }

  const sortedProducts = [...products].sort((a, b) => b.unidadesAnio - a.unidadesAnio)
  const categoryCount = new Set(products.map(p => p.categ_id?.[1] ?? 'Sin categoría')).size
  const maxMonthUnits = Math.max(...monthlyUnits.map(m => m.units), 1)

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <Link href="/marcas" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
          <ArrowLeft className="h-3 w-3" /> Marcas
        </Link>
      </div>
      <Header
        title={brand.name}
        description={brand.description}
        actions={
          brand.odooConnected ? (
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 px-2.5 py-1.5 rounded-lg">
              <PlugZap className="h-3.5 w-3.5" /> Odoo conectado
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-2.5 py-1.5 rounded-lg">
              <PlugZap className="h-3.5 w-3.5" /> Sin conexión Odoo
            </div>
          )
        }
      />

      {/* Metrics bar */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground mb-1">Salud de marca</p>
            <p className={`text-2xl font-bold ${healthColors[brand.health]}`}>
              {brand.healthScore}<span className="text-sm text-muted-foreground font-normal">/100</span>
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">{healthLabels[brand.health]}</p>
            <Progress value={brand.healthScore} className="mt-2 h-1.5" />
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground mb-1">SKUs activos</p>
            <p className="text-2xl font-semibold">{odooAvailable ? products.length : '—'}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {odooAvailable ? `${categoryCount} categorías` : 'Sin datos Odoo'}
            </p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground mb-1">Ventas {new Date().getFullYear()}</p>
            <p className="text-lg font-semibold">{odooAvailable ? formatCLP(yearTotal.ventas) : '—'}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {odooAvailable ? `${yearTotal.unidades.toLocaleString('es-CL')} unidades` : 'Sin datos Odoo'}
            </p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground mb-1">Próxima revisión</p>
            <p className="text-lg font-semibold">
              {brand.nextReview ? new Date(brand.nextReview).toLocaleDateString('es-CL', { month: 'short', year: 'numeric' }) : '—'}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Revisión trimestral</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="productos">
        <TabsList className="mb-4">
          <TabsTrigger value="productos" className="flex items-center gap-1.5">
            <Package className="h-3.5 w-3.5" /> Productos
          </TabsTrigger>
          <TabsTrigger value="ventas" className="flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5" /> Ventas por mes
          </TabsTrigger>
          <TabsTrigger value="informes" className="flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5" /> Informes
          </TabsTrigger>
          <TabsTrigger value="seguimiento" className="flex items-center gap-1.5">
            <Target className="h-3.5 w-3.5" /> Plan de seguimiento
          </TabsTrigger>
          <TabsTrigger value="auditorias" className="flex items-center gap-1.5">
            <ClipboardCheck className="h-3.5 w-3.5" /> Auditorías
          </TabsTrigger>
        </TabsList>

        {/* PRODUCTOS */}
        <TabsContent value="productos">
          {odooAvailable && sortedProducts.length > 0 ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="pt-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground">
                        <th className="text-left pb-2 pr-4 font-medium">Producto</th>
                        <th className="text-left pb-2 pr-4 font-medium">Categoría</th>
                        <th className="text-left pb-2 pr-4 font-medium">SKU</th>
                        <th className="text-right pb-2 pr-4 font-medium">Stock</th>
                        <th className="text-right pb-2 pr-4 font-medium">Und. mes</th>
                        <th className="text-right pb-2 font-medium">Und. año ↓</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedProducts.map((p) => (
                        <tr key={p.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30">
                          <td className="py-1.5 pr-4 font-medium">{p.name}</td>
                          <td className="py-1.5 pr-4 text-muted-foreground">
                            {p.categ_id?.[1] ?? '—'}
                          </td>
                          <td className="py-1.5 pr-4 text-muted-foreground font-mono text-[11px]">
                            {p.default_code || '—'}
                          </td>
                          <td className={`py-1.5 pr-4 text-right tabular-nums font-medium ${
                            p.qty_available <= 0 ? 'text-red-500' : p.qty_available < 5 ? 'text-amber-500' : 'text-emerald-600'
                          }`}>
                            {p.qty_available.toLocaleString('es-CL')}
                          </td>
                          <td className="py-1.5 pr-4 text-right tabular-nums font-semibold">
                            {p.unidadesMes > 0
                              ? p.unidadesMes.toLocaleString('es-CL')
                              : <span className="text-muted-foreground/40">0</span>}
                          </td>
                          <td className="py-1.5 text-right tabular-nums text-muted-foreground">
                            {p.unidadesAnio > 0
                              ? p.unidadesAnio.toLocaleString('es-CL')
                              : <span className="text-muted-foreground/40">0</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-0 shadow-sm">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <Package className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-sm font-medium text-muted-foreground">
                  {odooAvailable ? 'Sin productos encontrados' : 'Odoo no disponible'}
                </p>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                  {odooAvailable
                    ? `No se encontraron productos activos para ${BRAND_CATEGORY[slug]}.`
                    : 'Verifica las variables de entorno ODOO_* en Vercel.'}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* VENTAS POR MES */}
        <TabsContent value="ventas">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">
                Unidades vendidas por mes · {new Date().getFullYear()} · {brand.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {odooAvailable ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-muted">
                      <p className="text-xs text-muted-foreground mb-1">Ventas totales {new Date().getFullYear()}</p>
                      <p className="text-2xl font-bold">{formatCLP(yearTotal.ventas)}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted">
                      <p className="text-xs text-muted-foreground mb-1">Unidades vendidas</p>
                      <p className="text-2xl font-bold">{yearTotal.unidades.toLocaleString('es-CL')}</p>
                    </div>
                  </div>

                  {monthlyUnits.length > 0 ? (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-3">Unidades por mes</p>
                      <div className="space-y-2">
                        {monthlyUnits.map((m, i) => (
                          <div key={i} className="flex items-center gap-3 text-xs">
                            <span className="w-20 text-muted-foreground shrink-0 capitalize">{m.month}</span>
                            <div className="flex-1 bg-muted rounded-full h-5 overflow-hidden">
                              <div
                                className="h-full bg-primary/80 rounded-full flex items-center justify-end pr-2"
                                style={{ width: `${Math.max(4, (m.units / maxMonthUnits) * 100)}%` }}
                              >
                                <span className="text-[10px] text-primary-foreground font-medium tabular-nums">
                                  {m.units.toLocaleString('es-CL')}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground text-center py-4">
                      Sin datos mensuales disponibles
                    </p>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <PlugZap className="h-10 w-10 text-muted-foreground mb-3" />
                  <p className="text-sm font-medium text-muted-foreground">Sin conexión a Odoo</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* INFORMES */}
        <TabsContent value="informes">
          <Card className="border-0 shadow-sm">
            <CardHeader><CardTitle className="text-sm font-semibold">Informes de {brand.name}</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-sm font-medium text-muted-foreground">Sin informes cargados</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                  Los informes trimestrales de {brand.name} aparecerán aquí.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEGUIMIENTO */}
        <TabsContent value="seguimiento">
          <Card className="border-0 shadow-sm">
            <CardHeader><CardTitle className="text-sm font-semibold">Plan de seguimiento · {brand.name}</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Target className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-sm font-medium text-muted-foreground">Plan de seguimiento pendiente</p>
                <div className="mt-6 space-y-2 w-full max-w-sm text-left">
                  {['Diagnóstico actual', 'Definir nivel objetivo', 'Establecer milestones', 'Asignar responsables'].map((step, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="w-5 h-5 rounded-full border border-border flex items-center justify-center text-[10px] shrink-0">{i + 1}</div>
                      {step}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AUDITORÍAS */}
        <TabsContent value="auditorias">
          <div className="grid grid-cols-2 gap-4">
            {['digital', 'producto', 'financiero', 'operacional'].map((type) => (
              <Card key={type} className="border-0 shadow-sm">
                <CardContent className="pt-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-sm font-semibold capitalize">{type}</p>
                      <p className="text-xs text-muted-foreground">Auditoría {type}</p>
                    </div>
                    <Badge variant="outline" className="text-[10px]">Pendiente</Badge>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <AlertCircle className="h-3 w-3" /> No realizada
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
