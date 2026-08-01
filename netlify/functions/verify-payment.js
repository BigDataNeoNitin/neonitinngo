// Verifies a completed Razorpay payment by recomputing the HMAC signature
// server-side, and records verified donations into Supabase.
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // store in Netlify env
let supabase = null;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

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

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, name, email, phone, amount, frequency } = payload;

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

  // If verified, try to record the donation in Supabase (best-effort)
  if (verified && supabase) {
    try {
      await supabase.from('donations').insert([{
        order_id: razorpay_order_id,
        payment_id: razorpay_payment_id,
        donor_name: name || null,
        donor_email: email || null,
        donor_phone: phone || null,
        amount: amount ? Number(amount) : null,
        frequency: frequency || null,
        currency: 'INR',
        verified: true,
        created_at: new Date().toISOString()
      }]);
    } catch (err) {
      // Do not fail the verification for a DB insert error; log to function logs
      console.error('Supabase insert failed:', err && err.message ? err.message : err);
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ verified, payment_id: razorpay_payment_id, order_id: razorpay_order_id })
  };
};
