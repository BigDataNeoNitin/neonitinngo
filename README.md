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

All contact/donate/volunteer/newsletter forms are wired for **Netlify Forms**
(`data-netlify="true"`) — no backend or server needed. Submissions appear
automatically in your Netlify dashboard under **Forms** once deployed.

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
