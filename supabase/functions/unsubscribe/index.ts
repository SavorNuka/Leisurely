import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  // RFC 8058 one-click: Gmail POSTs with body "List-Unsubscribe=One-Click"
  if (req.method === 'POST') {
    return new Response(null, { status: 200, headers: corsHeaders })
  }

  const siteUrl = Deno.env.get('SITE_URL') ?? 'https://leisurelymeals.com'
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Unsubscribed · Leisurely</title>
  <style>
    body { font-family: Arial, Helvetica, sans-serif; background: #F2F1EC; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
    .card { background: #fff; border-radius: 12px; padding: 40px; max-width: 400px; width: 100%; text-align: center; box-shadow: 0 2px 12px rgba(0,0,0,0.07); }
    h1 { font-family: Georgia, 'Times New Roman', serif; font-weight: 400; color: #1C1A18; margin: 0 0 12px; font-size: 28px; }
    p { color: #7A756C; font-size: 14px; line-height: 1.65; margin: 0 0 24px; }
    a { color: #1C1A18; font-size: 13px; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Unsubscribed</h1>
    <p>You won't receive future Leisurely invite emails at this address.</p>
    <a href="${siteUrl}">Back to Leisurely</a>
  </div>
</body>
</html>`

  return new Response(html, {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' },
  })
})
