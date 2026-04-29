import { notFound } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import brandsData from "@/data/marcas.json"
import { PlugZap, FileText, Target, ClipboardCheck, TrendingUp, AlertCircle, CheckCircle2, Package } from "lucide-react"
import type { Brand } from "@/lib/types"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { BRAND_CATEGORY } from "@/lib/odoo"

export const revalidate = 3600

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

type OdooProduct = {
  id: number
  name: string
  default_code: string | false
  categ_id: [number, string]
  list_price: number
  qty_available: number
  type: string
}

type VentasData = {
  totalVentas: number
  totalUnidades: number
  byMonth: Array<{ 'order_id.date_order': string; price_subtotal: number }>
  error?: string
}

async function fetchOdooData(slug: string): Promise<{
  productos: OdooProduct[]
  ventas: VentasData | null
  odooAvailable: boolean
}> {
  const base = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000'

  try {
    const [productosRes, ventasRes] = await Promise.all([
      fetch(`${base}/api/odoo/productos?slug=${slug}`, { cache: 'no-store' }),
      fetch(`${base}/api/odoo/ventas?slug=${slug}`, { cache: 'no-store' }),
    ])
    const productosData = await productosRes.json()
    const ventasData = await ventasRes.json()
    return {
      productos: productosData.products ?? [],
      ventas: ventasData,
      odooAvailable: !productosData.error,
    }
  } catch {
    return { productos: [], ventas: null, odooAvailable: false }
  }
}

function formatCLP(n: number) {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n)
}

export default async function BrandPage({ params }: PageProps) {
  const { slug } = await params
  const brand = brandsData.brands.find((b) => b.slug === slug) as Brand | undefined
  if (!brand) notFound()

  const hasOdooMapping = !!BRAND_CATEGORY[slug]
  const { productos, ventas, odooAvailable } = hasOdooMapping
    ? await fetchOdooData(slug)
    : { productos: [], ventas: null, odooAvailable: false }

  // Group products by category
  const byCategory: Record<string, OdooProduct[]> = {}
  for (const p of productos) {
    const cat = p.categ_id?.[1] ?? 'Sin categoría'
    if (!byCategory[cat]) byCategory[cat] = []
    byCategory[cat].push(p)
  }

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
            <p className="text-2xl font-semibold">
              {odooAvailable ? productos.length : '—'}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {odooAvailable ? `${Object.keys(byCategory).length} categorías` : 'Sin datos Odoo'}
            </p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground mb-1">Ventas {new Date().getFullYear()}</p>
            <p className="text-lg font-semibold">
              {ventas && !ventas.error ? formatCLP(ventas.totalVentas) : '—'}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {ventas && !ventas.error ? `${ventas.totalUnidades.toLocaleString('es-CL')} unidades` : 'Sin datos Odoo'}
            </p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground mb-1">Próxima revisión</p>
            <p className="text-lg font-semibold">
              {brand.nextReview ? new Date(brand.nextReview).toLocaleDateString("es-CL", { month: "short", year: "numeric" }) : "—"}
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
          <TabsTrigger value="informes" className="flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5" /> Informes
          </TabsTrigger>
          <TabsTrigger value="seguimiento" className="flex items-center gap-1.5">
            <Target className="h-3.5 w-3.5" /> Plan de seguimiento
          </TabsTrigger>
          <TabsTrigger value="auditorias" className="flex items-center gap-1.5">
            <ClipboardCheck className="h-3.5 w-3.5" /> Auditorías
          </TabsTrigger>
          <TabsTrigger value="odoo" className="flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5" /> Ventas Odoo
          </TabsTrigger>
        </TabsList>

        {/* PRODUCTOS */}
        <TabsContent value="productos">
          {odooAvailable && productos.length > 0 ? (
            <div className="space-y-4">
              {Object.entries(byCategory).map(([cat, prods]) => (
                <Card key={cat} className="border-0 shadow-sm">
                  <CardHeader className="pb-2 pt-4">
                    <CardTitle className="text-sm font-semibold flex items-center justify-between">
                      <span>{cat}</span>
                      <Badge variant="secondary" className="text-[10px]">{prods.length} SKUs</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-border text-muted-foreground">
                            <th className="text-left pb-2 pr-4 font-medium">Producto</th>
                            <th className="text-left pb-2 pr-4 font-medium">SKU</th>
                            <th className="text-right pb-2 pr-4 font-medium">Stock</th>
                            <th className="text-right pb-2 font-medium">Precio lista</th>
                          </tr>
                        </thead>
                        <tbody>
                          {prods.map((p) => (
                            <tr key={p.id} className="border-b border-border/50 last:border-0">
                              <td className="py-1.5 pr-4 font-medium">{p.name}</td>
                              <td className="py-1.5 pr-4 text-muted-foreground font-mono">
                                {p.default_code || '—'}
                              </td>
                              <td className={`py-1.5 pr-4 text-right tabular-nums ${p.qty_available <= 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                                {p.qty_available.toLocaleString('es-CL')}
                              </td>
                              <td className="py-1.5 text-right tabular-nums">
                                {formatCLP(p.list_price)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-0 shadow-sm">
              <CardContent className="pt-5 flex flex-col items-center justify-center py-16 text-center">
                <Package className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-sm font-medium text-muted-foreground">
                  {odooAvailable ? 'Sin productos encontrados en Odoo' : 'Odoo no disponible'}
                </p>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                  {!odooAvailable
                    ? 'Verifica las variables de entorno ODOO_URL, ODOO_DB, ODOO_USER y ODOO_PASSWORD en Vercel.'
                    : `No se encontraron productos con categoría que contenga "${BRAND_CATEGORY[slug]}".`}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* VENTAS ODOO */}
        <TabsContent value="odoo">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Ventas {new Date().getFullYear()} — {brand.name}</CardTitle>
            </CardHeader>
            <CardContent>
              {ventas && !ventas.error ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-muted">
                      <p className="text-xs text-muted-foreground mb-1">Total ventas</p>
                      <p className="text-2xl font-bold">{formatCLP(ventas.totalVentas)}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted">
                      <p className="text-xs text-muted-foreground mb-1">Unidades vendidas</p>
                      <p className="text-2xl font-bold">{ventas.totalUnidades.toLocaleString('es-CL')}</p>
                    </div>
                  </div>
                  {ventas.byMonth && ventas.byMonth.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-3">Por mes</p>
                      <div className="space-y-2">
                        {ventas.byMonth.map((m, i) => (
                          <div key={i} className="flex items-center gap-3 text-xs">
                            <span className="w-24 text-muted-foreground shrink-0">{m['order_id.date_order']}</span>
                            <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                              <div
                                className="h-full bg-primary rounded-full"
                                style={{ width: `${Math.min(100, (m.price_subtotal / ventas.totalVentas) * 100)}%` }}
                              />
                            </div>
                            <span className="w-28 text-right tabular-nums">{formatCLP(m.price_subtotal)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  {brand.odooConnected ? (
                    <>
                      <CheckCircle2 className="h-10 w-10 text-emerald-500 mb-3" />
                      <p className="text-sm font-medium">Odoo conectado — cargando datos</p>
                      <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                        {ventas?.error ? `Error: ${ventas.error}` : 'Sin ventas en el período.'}
                      </p>
                    </>
                  ) : (
                    <>
                      <PlugZap className="h-10 w-10 text-muted-foreground mb-3" />
                      <p className="text-sm font-medium text-muted-foreground">Sin conexión a Odoo</p>
                    </>
                  )}
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
                  {["Diagnóstico actual", "Definir nivel objetivo", "Establecer milestones", "Asignar responsables"].map((step, i) => (
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
            {["digital", "producto", "financiero", "operacional"].map((type) => (
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
