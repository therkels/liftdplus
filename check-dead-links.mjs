// check-dead-links.mjs
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkUrl(url) {
  try {
    const res = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      headers: { 'User-Agent': 'Mozilla/5.0 (LIFTD+ link checker)' }
    })
    const finalUrl = res.url
    const redirectedToHome = finalUrl !== url && new URL(finalUrl).pathname === '/'
    return {
      status: res.status,
      ok: res.ok && !redirectedToHome,
      finalUrl,
      note: redirectedToHome ? 'Redirected to homepage — likely dead product page' : ''
    }
  } catch (err) {
    return { status: 'ERROR', ok: false, finalUrl: '', note: err.message }
  }
}

async function main() {
  const { data: products, error } = await supabase
    .schema('private')
    .from('brand_products')
    .select('id, name, buy_url')
    .not('buy_url', 'is', null)

  if (error) throw error

  console.log(`Checking ${products.length} product links...`)

  const results = []
  for (const p of products) {
    const check = await checkUrl(p.buy_url)
    results.push({ id: p.id, name: p.name, url: p.buy_url, ...check })
    console.log(`${check.ok ? '✅' : '❌'} [${check.status}] ${p.name}`)
    await new Promise(r => setTimeout(r, 300)) // be polite, avoid hammering retailer sites
  }

  const dead = results.filter(r => !r.ok)
  const csv = [
    'id,name,url,status,final_url,note',
    ...results.map(r => `"${r.id}","${r.name}","${r.url}","${r.status}","${r.finalUrl}","${r.note}"`)
  ].join('\n')

  fs.writeFileSync('link-check-results.csv', csv)
  console.log(`\nDone. ${dead.length} dead/suspect links out of ${products.length}.`)
  console.log('Full results written to link-check-results.csv')
}

main()
