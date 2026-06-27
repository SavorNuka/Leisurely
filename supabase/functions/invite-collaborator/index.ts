import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

function escHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}

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
  const siteUrl = Deno.env.get('SITE_URL') ?? 'https://leisurelymeals.com'

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const { planId, planName, inviterName: rawInviterName, emails, startDate, endDate } = await req.json()
  const inviterName = escHtml(rawInviterName ?? 'Someone')

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
    const unsubUrl = `${supabaseUrl}/functions/v1/unsubscribe?email=${encodeURIComponent(email)}`

    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Leisurely <invites@leisurelymeals.com>',
        to: email,
        subject: `You're invited to join ${planName} on Leisurely`,
        html: buildHtml(planName, inviterName, joinUrl, unsubUrl, startDate, endDate),
        text: buildText(planName, inviterName, joinUrl, unsubUrl, startDate, endDate),
        headers: {
          'List-Unsubscribe': `<${unsubUrl}>, <mailto:unsubscribe@leisurelymeals.com?subject=unsubscribe>`,
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
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

function buildTripLine(planName: string, startDate?: string, endDate?: string): string {
  if (!startDate || !endDate) return planName
  // T12:00:00 prevents UTC midnight → prior day in west-coast timezones
  const fmt = (iso: string) =>
    new Date(iso + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return `${planName}  ·  ${fmt(startDate)} – ${fmt(endDate)}`
}

function buildHtml(
  planName: string,
  inviterName: string,
  joinUrl: string,
  unsubUrl: string,
  startDate?: string,
  endDate?: string
): string {
  const tripLine = buildTripLine(planName, startDate, endDate)
  const preheader = `${inviterName} invited you to plan your trip together on Leisurely — where groups plan meals, groceries, and packing stress-free.`

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>You're invited to join ${planName} on Leisurely</title>
</head>
<body style="margin:0;padding:0;background-color:#F2F1EC;font-family:Arial,Helvetica,sans-serif;">

  <!-- Preheader -->
  <div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">
    ${preheader}
  </div>
  <!-- Invisible padding (industry-standard &nbsp;&zwnj; pairs) -->
  <div style="display:none;font-size:1px;color:#F2F1EC;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">
    &nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F2F1EC;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

          <!-- HEADER -->
          <tr>
            <td bgcolor="#1C1A18" style="background-color:#1C1A18;padding:32px 40px;border-radius:12px 12px 0 0;">
              <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:28px;font-weight:400;color:#F5F0E8;letter-spacing:0.04em;line-height:1.2;">Leisurely</p>
              <p style="margin:8px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:400;color:rgba(245,240,232,0.45);letter-spacing:0.08em;text-transform:uppercase;">Meal planning, minus the stress.</p>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td bgcolor="#FFFFFF" style="background-color:#FFFFFF;padding:40px 40px 0;">

              <!-- Headline -->
              <p style="margin:0 0 24px;font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:400;color:#1C1A18;line-height:1.35;">
                ${inviterName} invited you to join <em>${escHtml(planName)}</em> on Leisurely.
              </p>

              <!-- Trip chip -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td bgcolor="#F2F1EC" style="background-color:#F2F1EC;border-radius:6px;padding:10px 16px;">
                    <span style="font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;color:#7A756C;letter-spacing:0.07em;text-transform:uppercase;">${tripLine}</span>
                  </td>
                </tr>
              </table>

              <!-- Body copy -->
              <p style="margin:0 0 32px;font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#3D3A35;line-height:1.65;">
                Leisurely helps groups plan meals, groceries, and packing for trips — all in one place, stress-free. Click below to join the plan and start collaborating.
              </p>

              <!-- CTA button -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                <tr>
                  <td bgcolor="#E8A94B" style="background-color:#E8A94B;border-radius:8px;">
                    <a href="${joinUrl}" style="display:inline-block;padding:14px 40px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:700;color:#1C1A18;text-decoration:none;letter-spacing:0.01em;">Join the trip</a>
                  </td>
                </tr>
              </table>

              <!-- Account note -->
              <p style="margin:0 0 40px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#7A756C;line-height:1.65;">
                You'll need a free account to join. You can sign up at the link above — it only takes a moment.
              </p>

            </td>
          </tr>

          <!-- DIVIDER -->
          <tr>
            <td bgcolor="#FFFFFF" style="background-color:#FFFFFF;padding:0 40px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-top:1px solid #EAE8E1;font-size:0;line-height:0;">&nbsp;</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td bgcolor="#EAE8E1" style="background-color:#EAE8E1;padding:24px 40px;border-radius:0 0 12px 12px;">
              <p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#7A756C;line-height:1.6;">
                You received this because ${inviterName} invited you to a Leisurely trip plan. If you weren't expecting this, you can safely ignore this email.
              </p>
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#7A756C;line-height:1.6;">
                <a href="${joinUrl}" style="color:#7A756C;text-decoration:underline;">Direct link</a>
                &nbsp;&nbsp;|&nbsp;&nbsp;
                <a href="${unsubUrl}" style="color:#7A756C;text-decoration:underline;">Unsubscribe</a>
                &nbsp;&nbsp;|&nbsp;&nbsp;
                Leisurely &middot; Meal planning, minus the stress.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`
}

function buildText(
  planName: string,
  inviterName: string,
  joinUrl: string,
  unsubUrl: string,
  startDate?: string,
  endDate?: string
): string {
  const tripLine = buildTripLine(planName, startDate, endDate)
  return `${inviterName} invited you to join ${planName} on Leisurely.

Trip: ${tripLine}

Leisurely helps groups plan meals, groceries, and packing for trips — stress-free.

Join the trip: ${joinUrl}

You'll need a free account to join. You can sign up at the link above.

---
If you weren't expecting this, you can safely ignore this email.
Unsubscribe: ${unsubUrl}`
}
