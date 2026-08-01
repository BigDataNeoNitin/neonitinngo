// Creates a Razorpay order. Called from js/donate.js before the checkout
// modal opens. Requires RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to be set
// as environment variables in Netlify (Site settings -> Environment variables).
//started working
const Razorpay = require('razorpay');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid request body' }) };
  }

  const rupees = Number(payload.amount);
  const name = (payload.name || '').slice(0, 120);
  const email = (payload.email || '').slice(0, 160);
  const phone = (payload.phone || '').slice(0, 20);

  if (!rupees || rupees < 1 || rupees > 1000000) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Please enter a valid donation amount.' }) };
  }

  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Payment gateway is not configured yet. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in Netlify environment variables, then redeploy.'
      })
    };
  }

  try {
    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });

    const order = await instance.orders.create({
      amount: Math.round(rupees * 100), // Razorpay expects paise
      currency: 'INR',
      receipt: 'donation_' + Date.now(),
      notes: { donor_name: name, donor_email: email, donor_phone: phone }
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        key_id: process.env.RAZORPAY_KEY_ID
      })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Could not start the payment. Please try again shortly.' })
    };
  }
};
