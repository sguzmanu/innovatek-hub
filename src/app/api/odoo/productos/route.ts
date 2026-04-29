import { NextResponse } from 'next/server'
import { odooSearchRead, BRAND_ID, BRAND_CATEGORY } from '@/lib/odoo'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const slug = searchParams.get('slug')
  if (!slug || !BRAND_ID[slug]) {
    return NextResponse.json({ error: 'slug inválido' }, { status: 400 })
  }

  try {
    const brandId = BRAND_ID[slug]
    const products = await odooSearchRead(
      'product.template',
      [
        ['active', '=', true],
        ['brand_id', '=', brandId],
        ['sale_ok', '=', true],
      ],
      ['id', 'name', 'default_code', 'categ_id', 'list_price', 'qty_available', 'type'],
      { limit: 500, order: 'categ_id asc, name asc' }
    )
    return NextResponse.json({ slug, brand: BRAND_CATEGORY[slug], total: products.length, products })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
