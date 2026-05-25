import Stripe from 'stripe'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  if (searchParams.get('token') !== 'vor2024setup') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) return Response.json({ error: 'STRIPE_SECRET_KEY not set' }, { status: 500 })

  const stripe = new Stripe(key)
  try {
    const wh = await stripe.webhookEndpoints.create({
      url: 'https://vorwindowco.com/api/stripe-webhook',
      enabled_events: ['checkout.session.completed'],
    })
    return Response.json({ secret: wh.secret, id: wh.id })
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 })
  }
}
