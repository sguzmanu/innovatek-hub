import { NextResponse } from 'next/server'
import { odooSearchRead } from '@/lib/odoo'

export const dynamic = 'force-dynamic'

// Discovery endpoint — call once to understand Odoo category structure
export async function GET() {
  try {
    const [categories, teams] = await Promise.all([
      odooSearchRead('product.category', [], ['id', 'name', 'parent_id', 'complete_name'], { limit: 200 }),
      odooSearchRead('crm.team', [], ['id', 'name'], { limit: 50 }),
    ])
    return NextResponse.json({ categories, teams })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
