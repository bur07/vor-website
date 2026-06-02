import Stripe from 'stripe'

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY not set')
  return new Stripe(process.env.STRIPE_SECRET_KEY)
}

function siteUrl(req: Request) {
  const origin = req.headers.get('origin')
  if (origin) return origin
  return process.env.NEXT_PUBLIC_SITE_URL ?? 'https://vorwindowco.com'
}

export async function POST(req: Request) {
  try {
    const d = await req.json()
    const stripe = getStripe()
    const base = siteUrl(req)

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: d.email,
      line_items: [
        {
          price_data: {
            currency: 'aud',
            product_data: {
              name: `VØR Window Co. — ${d.tier}`,
              description: `${d.paymentType} · Ref: ${d.refCode}`,
            },
            unit_amount: Math.round(d.amountPaid * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      metadata: {
        refCode:     d.refCode,
        tier:        d.tier,
        price:       String(d.price),
        note:        d.note ?? '',
        paymentType: d.paymentType,
        amountPaid:  String(d.amountPaid),
        balanceDue:  String(d.balanceDue),
        name:        d.name,
        email:       d.email,
        phone:       d.phone,
        address:     d.address ?? '',
        date:        d.date,
        time:        d.time,
      },
      success_url: `${base}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${base}/booking?ref=${d.refCode}`,
    })

    return Response.json({ url: session.url })
  } catch (err) {
    console.error('create-checkout-session error:', err)
    return Response.json({ error: 'Failed to create payment session' }, { status: 500 })
  }
}
