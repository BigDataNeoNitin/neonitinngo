// Serverless function to receive form submissions and write them to Supabase.
// Expects JSON: { formName: 'contact'|'donation-completed'|'volunteer'|'newsletter', fields: {...} }
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // keep this secret in Netlify env

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Netlify environment variables.');
}

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ ok: false, error: 'Method not allowed' }) };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch (err) {
    return { statusCode: 400, body: JSON.stringify({ ok: false, error: 'Invalid JSON' }) };
  }

  const { formName, fields } = payload;
  if (!formName || !fields) {
    return { statusCode: 400, body: JSON.stringify({ ok: false, error: 'Missing formName or fields' }) };
  }

  if (!supabase) {
    return { statusCode: 500, body: JSON.stringify({ ok: false, error: 'Supabase not configured' }) };
  }

  try {
    if (formName === 'donation-completed' || formName === 'donation') {
      await supabase.from('donations').insert([{
        order_id: fields.order_id || null,
        payment_id: fields.payment_id || null,
        donor_name: fields.name || null,
        donor_email: fields.email || null,
        donor_phone: fields.phone || null,
        amount: fields.amount ? Number(fields.amount) : null,
        frequency: fields.frequency || null,
        currency: fields.currency || 'INR',
        verified: !!fields.payment_id,
        created_at: new Date().toISOString()
      }]);
    } else if (formName === 'contact') {
      await supabase.from('contacts').insert([{
        name: fields.name || null,
        email: fields.email || null,
        phone: fields.phone || null,
        message: fields.message || null,
        created_at: new Date().toISOString()
      }]);
    } else if (formName === 'volunteer') {
      await supabase.from('volunteers').insert([{
        name: fields.name || null,
        email: fields.email || null,
        phone: fields.phone || null,
        village: fields.village || null,
        skills: fields.skills || null,
        created_at: new Date().toISOString()
      }]);
    } else if (formName === 'newsletter') {
      await supabase.from('newsletters').insert([{
        email: fields.email || null,
        created_at: new Date().toISOString()
      }]);
    } else {
      // Generic fallback table
      await supabase.from('submissions').insert([{
        form_name: formName,
        payload: fields,
        created_at: new Date().toISOString()
      }]);
    }

    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    console.error('Supabase insert error:', err && err.message ? err.message : err);
    return { statusCode: 500, body: JSON.stringify({ ok: false, error: 'Database insert failed' }) };
  }
};
