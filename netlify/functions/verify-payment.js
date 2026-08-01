// Verifies a completed Razorpay payment by recomputing the HMAC signature
// server-side. Never trust a "payment succeeded" message from the browser
// alone -- this is the step that actually confirms the money is real.
const crypto = require('crypto');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ verified: false, error: 'Method not allowed' }) };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, body: JSON.stringify({ verified: false, error: 'Invalid request body' }) };
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = payload;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return { statusCode: 400, body: JSON.stringify({ verified: false, error: 'Missing payment fields' }) };
  }

  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    return { statusCode: 500, body: JSON.stringify({ verified: false, error: 'Payment gateway is not configured.' }) };
  }

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(razorpay_order_id + '|' + razorpay_payment_id)
    .digest('hex');

  const verified = expectedSignature === razorpay_signature;

  return {
    statusCode: 200,
    body: JSON.stringify({ verified, payment_id: razorpay_payment_id, order_id: razorpay_order_id })
  };
};
