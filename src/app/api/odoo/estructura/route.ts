import { NextResponse } from 'next/server'
import { odooSearchRead } from '@/lib/odoo'

export const dynamic = 'force-dynamic'

// Discovery endpoint — call once to understand Odoo structure
export async function GET() {
  try {
    const [brands, teams] = await Promise.all([
      odooSearchRead('product.brand.mv', [], ['id', 'name'], { limit: 300 }),
      odooSearchRead('crm.team', [], ['id', 'name'], { limit: 50 }),
    ])
    return NextResponse.json({ brands, teams })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
