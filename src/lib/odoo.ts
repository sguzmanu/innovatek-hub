const ODOO_URL = process.env.ODOO_URL!
const ODOO_DB = process.env.ODOO_DB!
const ODOO_USER = process.env.ODOO_USER!
const ODOO_PASSWORD = process.env.ODOO_PASSWORD!

// Maps hub brand slugs → Odoo product.brand.mv ID
export const BRAND_ID: Record<string, number> = {
  'lhotse':   93,
  'simplit':  166,
  'levo':     92,
  'dynamo-tl': 37,
  't-care':   224,
  'bandu':    217,
  'xroad':    212,
  'uma':      227,
}

// Keep for any callers that still reference the old map
export const BRAND_CATEGORY: Record<string, string> = {
  'lhotse': 'Lhotse',
  'simplit': 'Simplit',
  'levo': 'Levo',
  'dynamo-tl': 'Dynamo TL',
  't-care': 'T-Care',
  'bandu': 'Bandú',
  'xroad': 'Xroad',
  'uma': 'UMA',
}

type OdooSession = { uid: number; sessionId: string }

async function authenticate(): Promise<OdooSession> {
  const res = await fetch(`${ODOO_URL}/web/session/authenticate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0', method: 'call', id: 1,
      params: { db: ODOO_DB, login: ODOO_USER, password: ODOO_PASSWORD },
    }),
    cache: 'no-store',
  })
  const data = await res.json()
  if (!data.result?.uid) throw new Error(`Odoo auth failed: ${JSON.stringify(data.error)}`)
  const cookieHeader = res.headers.get('set-cookie') || ''
  const sessionId = cookieHeader.match(/session_id=([^;,\s]+)/)?.[1] || ''
  return { uid: data.result.uid, sessionId }
}

async function callKw(
  session: OdooSession,
  model: string,
  method: string,
  args: unknown[],
  kwargs: Record<string, unknown>
) {
  const res = await fetch(`${ODOO_URL}/web/dataset/call_kw`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': `session_id=${session.sessionId}`,
    },
    body: JSON.stringify({
      jsonrpc: '2.0', method: 'call', id: 2,
      params: { model, method, args, kwargs },
    }),
    cache: 'no-store',
  })
  const data = await res.json()
  if (data.error) throw new Error(data.error.data?.message || data.error.message)
  return data.result
}

export async function odooSearchRead(
  model: string,
  domain: unknown[],
  fields: string[],
  opts?: { limit?: number; order?: string }
) {
  const session = await authenticate()
  return callKw(session, model, 'search_read', [domain], {
    fields,
    limit: opts?.limit ?? 500,
    ...(opts?.order && { order: opts.order }),
  })
}

export async function odooSearchCount(model: string, domain: unknown[]) {
  const session = await authenticate()
  return callKw(session, model, 'search_count', [domain], {})
}

export async function odooReadGroup(
  model: string,
  domain: unknown[],
  fields: string[],
  groupby: string[]
) {
  const session = await authenticate()
  return callKw(session, model, 'read_group', [domain, fields, groupby], { lazy: false })
}

export function currentYearStart() {
  const y = new Date().getFullYear()
  return `${y}-01-01`
}

export function currentMonthStart() {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}-01`
}

/** Authenticate once, run N parallel callKw calls, return results array. */
export async function odooMultiReadGroup(
  calls: Array<{ model: string; domain: unknown[]; fields: string[]; groupby: string[] }>
) {
  const session = await authenticate()
  return Promise.all(
    calls.map(({ model, domain, fields, groupby }) =>
      callKw(session, model, 'read_group', [domain, fields, groupby], { lazy: false })
    )
  )
}

export type OdooProductDetail = {
  id: number
  name: string
  default_code: string | false
  categ_id: [number, string]
  qty_available: number
  unidadesVendidas: number
}

/** Full brand detail: products with sales per SKU + monthly units — single Odoo session. */
export async function getBrandDetailData(slug: string): Promise<{
  products: OdooProductDetail[]
  monthlyUnits: Array<{ month: string; units: number }>
  yearTotal: { ventas: number; unidades: number }
}> {
  const brandId = BRAND_ID[slug]
  const yearStart = currentYearStart()
  const session = await authenticate()

  const salesDomain = [
    ['order_id.state', 'in', ['sale', 'done']],
    ['order_id.date_order', '>=', yearStart],
    ['product_id.product_tmpl_id.brand_id', '=', brandId],
  ]

  const [templates, salesByVariantRaw, monthlyRaw, totalRaw] = await Promise.all([
    callKw(session, 'product.template', 'search_read',
      [[['active', '=', true], ['brand_id', '=', brandId], ['sale_ok', '=', true]]],
      { fields: ['id', 'name', 'default_code', 'categ_id', 'qty_available'], limit: 500, order: 'categ_id asc, name asc' }
    ),
    callKw(session, 'sale.order.line', 'read_group',
      [salesDomain, ['product_uom_qty:sum'], ['product_id']],
      { lazy: false }
    ),
    callKw(session, 'sale.order.line', 'read_group',
      [salesDomain, ['product_uom_qty:sum'], ['create_date:month']],
      { lazy: false }
    ).catch(() => []),
    callKw(session, 'sale.order.line', 'read_group',
      [salesDomain, ['price_subtotal:sum', 'product_uom_qty:sum'], []],
      { lazy: false }
    ),
  ]) as [
    Array<{ id: number; name: string; default_code: string | false; categ_id: [number, string]; qty_available: number }>,
    Array<{ product_id: [number, string]; product_uom_qty: number }>,
    Array<{ create_date: string; product_uom_qty: number }>,
    Array<{ price_subtotal: number; product_uom_qty: number }>,
  ]

  // Map variant IDs → template IDs for the variants that appear in sales
  const variantIds = salesByVariantRaw.map(r => r.product_id[0]).filter(Boolean)
  const variantToTemplate: Record<number, number> = {}

  if (variantIds.length > 0) {
    const variants = await callKw(session, 'product.product', 'search_read',
      [[['id', 'in', variantIds]]],
      { fields: ['id', 'product_tmpl_id'], limit: 2000 }
    ) as Array<{ id: number; product_tmpl_id: [number, string] }>
    for (const v of variants) variantToTemplate[v.id] = v.product_tmpl_id[0]
  }

  // Aggregate variant-level sales to template level
  const salesByTemplate: Record<number, number> = {}
  for (const row of salesByVariantRaw) {
    const tmplId = variantToTemplate[row.product_id[0]]
    if (tmplId) salesByTemplate[tmplId] = (salesByTemplate[tmplId] ?? 0) + row.product_uom_qty
  }

  const products: OdooProductDetail[] = templates.map(t => ({
    id: t.id,
    name: t.name,
    default_code: t.default_code,
    categ_id: t.categ_id,
    qty_available: t.qty_available,
    unidadesVendidas: Math.round(salesByTemplate[t.id] ?? 0),
  }))

  // Parse monthly units — create_date:month returns "YYYY-MM-DD HH:MM:SS" start-of-month
  const monthlyUnits = monthlyRaw
    .filter(r => r.create_date && r.product_uom_qty > 0)
    .map(r => ({
      month: new Date(r.create_date).toLocaleDateString('es-CL', { month: 'short', year: 'numeric' }),
      units: Math.round(r.product_uom_qty),
    }))

  const totalRow = totalRaw?.[0] ?? {}
  return {
    products,
    monthlyUnits,
    yearTotal: { ventas: totalRow['price_subtotal'] ?? 0, unidades: Math.round(totalRow['product_uom_qty'] ?? 0) },
  }
}

/** Get month sales totals for every brand slug in one session. */
export async function getAllBrandsMonthSales(): Promise<Record<string, { ventas: number; unidades: number }>> {
  const monthStart = currentMonthStart()
  const slugs = Object.keys(BRAND_ID)
  const session = await authenticate()

  const results = await Promise.all(
    slugs.map((slug) => {
      const domain = [
        ['order_id.state', 'in', ['sale', 'done']],
        ['order_id.date_order', '>=', monthStart],
        ['product_id.product_tmpl_id.brand_id', '=', BRAND_ID[slug]],
      ]
      return callKw(session, 'sale.order.line', 'read_group',
        [domain, ['price_subtotal:sum', 'product_uom_qty:sum'], []],
        { lazy: false }
      ).catch(() => null)
    })
  )

  return Object.fromEntries(
    slugs.map((slug, i) => {
      const row = results[i]?.[0] ?? {}
      return [slug, { ventas: row['price_subtotal'] ?? 0, unidades: row['product_uom_qty'] ?? 0 }]
    })
  )
}
