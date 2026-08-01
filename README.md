# Neo Nitin Foundation — Website

A free, fully static, fully customizable website for an NGO themed around
Dr. B.R. Ambedkar's call to **"Educate, Agitate, Organize"** — focused on
free education, healthcare and career support for underprivileged children
in rural areas. Plain HTML/CSS/JS, no build step, no framework — ready to
deploy on Netlify as-is.

## Pages included

- `index.html` — Home (hero, impact stats, three pillars, programs, testimonials)
- `about.html` — Story, mission/vision, philosophy, timeline
- `programs.html` — Detailed Education / Health / Career program sections
- `get-involved.html` — Donate (tiers + form), Volunteer form, Partner/CSR section
- `contact.html` — Contact form, info, map, FAQ accordion
- `css/style.css` — All styling, driven by CSS variables (see below)
- `js/script.js` — Nav, counters, testimonial slider, FAQ, forms, scroll reveal

The contact, volunteer and newsletter forms are wired for **Netlify Forms**
(`data-netlify="true"`) — submissions appear automatically in your Netlify
dashboard under **Forms**. The **Donate** form processes real payments
through **Razorpay**, using two serverless functions in `netlify/functions/`
— see the setup section below before going live.

## Setting up real donation payments (Razorpay)

The Donate form on `get-involved.html` is fully wired to accept live
payments (UPI, cards, netbanking, wallets) — you just need to connect your
own Razorpay account. Nothing runs on a server you manage; it's two small
serverless functions that Netlify hosts for free.

**1. Create a Razorpay account**
Sign up at https://razorpay.com and complete KYC (required before you can
accept live payments — for an NGO you'll typically submit your trust deed
and 12A/80G certificates).

**2. Get your API keys**
In the Razorpay Dashboard: **Settings → API Keys → Generate Key**.
You'll get a `Key Id` and `Key Secret`. Start in **Test Mode** to try the
flow safely with fake cards before switching to Live Mode.

**3. Add the keys to Netlify**
In your Netlify site: **Site settings → Environment variables → Add a variable**,
and add both:
```
RAZORPAY_KEY_ID = rzp_test_xxxxxxxxxxxx   (or rzp_live_... when ready)
RAZORPAY_KEY_SECRET = your_secret_key
```
Then trigger a redeploy (**Deploys → Trigger deploy**) so the functions can
read them. The secret key is never exposed to the browser — only the two
functions in `netlify/functions/` use it.

**4. Test it**
Open your deployed site's Get Involved page, pick an amount, and pay with
a Razorpay test card (e.g. `4111 1111 1111 1111`, any future expiry, any
CVV — full list at https://razorpay.com/docs/payments/payments/test-card-upi-details/).
A successful test payment will show the on-page success message and appear
as a `donation-completed` submission under **Site settings → Forms** in
Netlify, along with the Razorpay payment ID.

**5. Go live**
Once KYC is approved, replace the test keys in Netlify's environment
variables with your `rzp_live_...` key and secret, and redeploy. Real
payments will now be accepted.

**How the payment flow works, technically:**
1. Donor picks an amount and fills in their details, then submits the form.
2. `js/donate.js` calls `netlify/functions/create-order.js`, which asks
   Razorpay to create an order (your secret key never leaves the server).
3. Razorpay's checkout modal opens in the browser and collects payment.
4. On success, `js/donate.js` calls `netlify/functions/verify-payment.js`,
   which recomputes the payment signature server-side to confirm the
   payment is genuine (this step is what prevents someone from faking a
   "success" message in their browser).
5. Once verified, the confirmed donation is logged into Netlify Forms
   (`donation-completed`) so you have a record — donor name, email, phone,
   amount, frequency and the Razorpay payment/order IDs.

**Receipts:** Razorpay can auto-email a payment receipt; for an official
80G tax receipt, connect Razorpay's webhook (or check Forms daily) to
trigger your own receipt email/PDF — this site doesn't generate 80G PDFs
automatically yet.

## Deploy to Netlify (2 minutes)

**Option A — Drag & drop (fastest)**
1. Go to https://app.netlify.com/drop
2. Drag this whole folder onto the page.
3. Done — your site is live at a `*.netlify.app` URL. You can rename it
   or add a custom domain under **Site settings → Domain management**.

**Option B — Git-based (recommended for ongoing edits)**
1. Push this folder to a new GitHub/GitLab repo.
2. In Netlify: **Add new site → Import an existing project** → pick the repo.
3. Build command: *(leave blank)* — Publish directory: `.`
4. Deploy. Every future `git push` auto-deploys.

After the first deploy, open **Site settings → Forms** in Netlify to confirm
the `contact`, `donation`, `volunteer` and `newsletter` forms were detected.

## How to customize

### 1. Colors, fonts & spacing — one place
Open `css/style.css` and edit the `:root { ... }` block at the top.
Every color, font and spacing value on the whole site is a variable there,
e.g.:
```css
--color-blue: #0B3D91;     /* primary brand color */
--color-saffron: #F2A93B;  /* accent color */
--font-display: 'Fraunces', Georgia, serif;
```
Change a value once and it updates across every page.

### 2. Text content
All copy lives directly inside the `.html` files — edit any heading,
paragraph or button label in place. Section boundaries are marked with
`<!-- ============ SECTION NAME ============ -->` comments to make them
easy to find.

### 3. Images
Every `<img>` currently points to a placeholder image service
(`picsum.photos`) so the site looks complete out of the box. **Replace
these with your own photos before launch** — add real files to an
`images/` folder and update the `src="..."` attributes, e.g.:
```html
<img src="images/classroom-1.jpg" alt="...">
```
Keep the `alt` text descriptive — it matters for accessibility and SEO.

### 4. Logo
The logo is a small inline SVG in the header/footer of each page
(look for `<svg class="brand-mark">`). Swap it for your own logo file:
```html
<img src="images/logo.svg" alt="Neo Nitin Foundation logo" class="brand-mark">
```

### 5. Stats & counters
Numbers on the homepage animate automatically. To update a number,
change the `data-count` attribute:
```html
<span data-count="12400">0</span>
```

### 6. Forms
- Each `<form>` has `name="..."` and `data-netlify="true"` — keep both.
- The hidden `form-name` input inside each form must match the form's
  `name` attribute exactly, or Netlify won't route submissions correctly.
- To receive email notifications for new submissions, go to
  **Site settings → Forms → Form notifications** in Netlify and add
  your email.
- The `donation` form only *records intent* — it does not process real
  payments. To accept real payments, connect a payment gateway (e.g.
  Razorpay, Stripe, Instamojo) button/link on the Donate section, or embed
  their checkout widget in `get-involved.html`.

### 7. Adding a new page
Copy any existing page (e.g. `contact.html`), keep the `<head>`,
header/nav and footer blocks as-is, and replace the content inside
`<main>...</main>`. Add a link to it in the `.nav-links` list on every
page and in the footer.

## Notes

- Fully responsive down to small mobile screens, with a hamburger menu
  below 900px width.
- Keyboard-focus styles, `prefers-reduced-motion` support, and semantic
  HTML are built in for accessibility.
- No external JS frameworks or build tools — works by opening `index.html`
  directly or via any static host (Netlify, Vercel, GitHub Pages, etc.).
