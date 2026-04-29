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
  return `${new Date().getFullYear()}-01-01`
}
