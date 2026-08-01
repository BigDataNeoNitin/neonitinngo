/* ============================================================
   Real donation payments via Razorpay + Netlify Functions.
   Flow: collect amount/details -> ask our own serverless function
   to create a Razorpay order -> open Razorpay's checkout -> on
   success, ask our serverless function to verify the payment
   signature -> log the confirmed gift into Netlify Forms.
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('donationForm');
  if (!form) return;

  const payBtn = document.getElementById('donatePayBtn');
  const errorBox = document.getElementById('donateError');
  const successBox = document.getElementById('donateSuccess');

  function showError(msg) {
    errorBox.textContent = msg;
    errorBox.classList.add('is-visible');
    errorBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  function clearError() {
    errorBox.textContent = '';
    errorBox.classList.remove('is-visible');
  }
  function resetButton() {
    payBtn.disabled = false;
    payBtn.textContent = 'Donate Securely';
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearError();

    const selectedTier = form.querySelector('input[name="amount"]:checked');
    let amount = selectedTier ? selectedTier.value : null;
    if (amount === 'custom') {
      amount = form.querySelector('#customAmount').value;
    }
    amount = Number(amount);

    const name = form.querySelector('#dName').value.trim();
    const email = form.querySelector('#dEmail').value.trim();
    const phone = form.querySelector('#dPhone').value.trim();
    const frequency = form.querySelector('#dFreq').value;

    if (!amount || amount < 1) {
      showError('Please choose an amount, or enter your own.');
      return;
    }
    if (!name || !email) {
      showError('Please fill in your name and email.');
      return;
    }
    if (typeof Razorpay === 'undefined') {
      showError('Payment could not load. Please check your connection and try again.');
      return;
    }

    payBtn.disabled = true;
    payBtn.textContent = 'Preparing secure payment…';

    try {
      const orderRes = await fetch('/.netlify/functions/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, name, email, phone })
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error || 'Could not start the payment.');

      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        order_id: orderData.order_id,
        name: 'Neo Nitin Foundation',
        description: (frequency === 'monthly' ? 'Monthly Donation' : 'One-time Donation'),
        prefill: { name, email, contact: phone },
        theme: { color: '#0B3D91' },
        handler: async function (response) {
          payBtn.textContent = 'Confirming payment…';
          try {
            const verifyRes = await fetch('/.netlify/functions/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ...response, name, email, phone, amount, frequency })
            });
            const verifyData = await verifyRes.json();

            if (verifyData.verified) {
              // Log the confirmed gift into Netlify Forms so it shows up
              // in your dashboard (Site settings -> Forms) alongside
              // your other submissions -- no database required.
              const record = new URLSearchParams({
                'form-name': 'donation-completed',
                name, email, phone,
                amount: String(amount),
                frequency,
                payment_id: response.razorpay_payment_id,
                order_id: response.razorpay_order_id
              });
              fetch('/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: record.toString()
              }).catch(() => {});

              successBox.classList.add('is-visible');
              successBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
              form.reset();
              form.querySelectorAll('.tier').forEach(t => t.classList.remove('is-selected'));
            } else {
              showError('We could not confirm this payment. If money was deducted, please contact us with payment ID ' + response.razorpay_payment_id + '.');
            }
          } catch {
            showError('Payment went through, but confirmation failed. Please contact us with payment ID ' + response.razorpay_payment_id + '.');
          }
          resetButton();
        },
        modal: {
          ondismiss: resetButton
        }
      };

      const rzp = new Razorpay(options);
      rzp.on('payment.failed', function (response) {
        const desc = response && response.error && response.error.description;
        showError('Payment failed' + (desc ? ': ' + desc : '. Please try again.'));
        resetButton();
      });
      rzp.open();
    } catch (err) {
      showError(err.message || 'Something went wrong. Please try again.');
      resetButton();
    }
  });
});
