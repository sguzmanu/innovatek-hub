import { NextResponse } from 'next/server'
import { odooSearchRead, BRAND_CATEGORY } from '@/lib/odoo'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const slug = searchParams.get('slug')
  if (!slug || !BRAND_CATEGORY[slug]) {
    return NextResponse.json({ error: 'slug inválido' }, { status: 400 })
  }

  try {
    const brandName = BRAND_CATEGORY[slug]
    const products = await odooSearchRead(
      'product.template',
      [
        ['active', '=', true],
        ['categ_id.complete_name', 'ilike', brandName],
        ['sale_ok', '=', true],
      ],
      ['id', 'name', 'default_code', 'categ_id', 'list_price', 'qty_available', 'type'],
      { limit: 500, order: 'categ_id asc, name asc' }
    )
    return NextResponse.json({ slug, total: products.length, products })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
