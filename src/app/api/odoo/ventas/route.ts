import { NextResponse } from 'next/server'
import { odooReadGroup, BRAND_ID, BRAND_CATEGORY, currentYearStart } from '@/lib/odoo'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const slug = searchParams.get('slug')
  if (!slug || !BRAND_ID[slug]) {
    return NextResponse.json({ error: 'slug inválido' }, { status: 400 })
  }

  try {
    const brandId = BRAND_ID[slug]
    const currentYear = new Date().getFullYear()
    const domain = [
      ['order_id.state', 'in', ['sale', 'done']],
      ['order_id.date_order', '>=', currentYearStart()],
      ['product_id.product_tmpl_id.brand_id', '=', brandId],
    ]

    const totalResult = await odooReadGroup(
      'sale.order.line',
      domain,
      ['price_subtotal:sum', 'product_uom_qty:sum'],
      []
    )

    const total = totalResult?.[0] ?? {}
    return NextResponse.json({
      slug,
      brand: BRAND_CATEGORY[slug],
      year: currentYear,
      totalVentas: total['price_subtotal'] ?? 0,
      totalUnidades: total['product_uom_qty'] ?? 0,
    })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
