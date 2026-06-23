import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Missing auth' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const resendKey = Deno.env.get('RESEND_API_KEY')!
  const siteUrl = Deno.env.get('SITE_URL') ?? 'https://leisurely.app'

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const { planId, planName, inviterName, emails } = await req.json()

  if (!planId || !Array.isArray(emails) || emails.length === 0) {
    return new Response(JSON.stringify({ error: 'Missing fields' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const results: Array<{ email: string; error?: string }> = []

  for (const email of emails as string[]) {
    const { data: invite, error: insertError } = await supabase
      .from('plan_invites')
      .insert({ plan_id: planId, email, invited_by: user.id })
      .select('token')
      .single()

    if (insertError || !invite) {
      results.push({ email, error: insertError?.message ?? 'Insert failed' })
      continue
    }

    const joinUrl = `${siteUrl}/join/${invite.token}`

    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Leisurely <invites@leisurely.app>',
        to: email,
        subject: `${inviterName} invited you to join "${planName}" on Leisurely`,
        html: buildHtml(planName, inviterName, joinUrl),
        text: buildText(planName, inviterName, joinUrl),
        headers: {
          'List-Unsubscribe': '<mailto:unsubscribe@leisurely.app?subject=unsubscribe>',
        },
      }),
    })

    if (!emailRes.ok) {
      const body = await emailRes.text()
      results.push({ email, error: body })
    } else {
      results.push({ email })
    }
  }

  const hasErrors = results.some((r) => r.error)
  return new Response(JSON.stringify({ results }), {
    status: hasErrors ? 207 : 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})

function buildHtml(planName: string, inviterName: string, joinUrl: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>You're invited to ${planName}</title>
</head>
<body style="margin:0;padding:0;background:#F5F0E8;font-family:Inter,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F0E8;padding:32px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;max-width:560px;width:100%;">
        <tr>
          <td style="background:#7D9B76;padding:28px 40px;">
            <p style="margin:0;font-size:22px;font-weight:700;color:#ffffff;">Leisurely 🌿</p>
            <p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,0.75);">Group vacation meal planner</p>
          </td>
        </tr>
        <tr>
          <td style="padding:40px 40px 32px;">
            <p style="margin:0 0 16px;font-size:16px;color:#3D4A2E;line-height:1.6;">
              <strong>${inviterName}</strong> has invited you to join <strong>&ldquo;${planName}&rdquo;</strong> on Leisurely &mdash; where your group plans meals, groceries, and packing for the trip ahead.
            </p>
            <p style="margin:0 0 32px;font-size:14px;color:#3D4A2E;opacity:0.7;line-height:1.6;">
              Click below to accept the invite and start collaborating.
            </p>
            <a href="${joinUrl}" style="display:inline-block;background:#C17B5A;color:#ffffff;font-size:15px;font-weight:600;padding:14px 32px;border-radius:8px;text-decoration:none;">
              Accept invite &rarr;
            </a>
          </td>
        </tr>
        <tr>
          <td style="border-top:1px solid #e8e3da;padding:20px 40px;">
            <p style="margin:0;font-size:11px;color:#3D4A2E;opacity:0.45;line-height:1.6;">
              If you weren&rsquo;t expecting this invite, you can safely ignore this email.<br/>
              Direct link: ${joinUrl}
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function buildText(planName: string, inviterName: string, joinUrl: string): string {
  return `${inviterName} has invited you to join "${planName}" on Leisurely.

Accept your invite: ${joinUrl}

Leisurely is a group vacation meal planner — plan meals, groceries, and packing together.

If you weren't expecting this invite, you can safely ignore this email.`
}
