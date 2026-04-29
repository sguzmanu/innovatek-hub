import { NextResponse } from 'next/server'
import { odooReadGroup, BRAND_CATEGORY, currentYearStart } from '@/lib/odoo'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const slug = searchParams.get('slug')
  if (!slug || !BRAND_CATEGORY[slug]) {
    return NextResponse.json({ error: 'slug inválido' }, { status: 400 })
  }

  try {
    const brandName = BRAND_CATEGORY[slug]
    const domain = [
      ['order_id.state', 'in', ['sale', 'done']],
      ['order_id.date_order', '>=', currentYearStart()],
      ['product_id.categ_id.complete_name', 'ilike', brandName],
    ]

    const [totalResult, byMonth] = await Promise.all([
      odooReadGroup('sale.order.line', domain, ['price_subtotal:sum', 'product_uom_qty:sum'], []),
      odooReadGroup('sale.order.line', domain, ['price_subtotal:sum'], ['order_id.date_order:month']),
    ])

    const total = totalResult?.[0] ?? {}
    return NextResponse.json({
      slug,
      year: new Date().getFullYear(),
      totalVentas: total['price_subtotal'] ?? 0,
      totalUnidades: total['product_uom_qty'] ?? 0,
      byMonth: byMonth ?? [],
    })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
