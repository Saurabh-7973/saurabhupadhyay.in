# saurabhupadhyay.in

Personal site of Saurabh Upadhyay. Plain HTML and CSS: no framework, no build step,
no JavaScript. Every file at the repo root is served as-is.

## Files

| File | Page |
|---|---|
| `index.html` | Home |
| `guidester.html` | Guidester product page |
| `products.html` | Apps: Sanatan Guide, Sahaj, Snapdrop |
| `terms.html`, `privacy.html`, `refund.html`, `contact.html` | Legal pages for payment-gateway onboarding |
| `404.html` | Not-found page (Cloudflare Pages uses it automatically) |
| `style.css` | Shared styles (Guidester dashboard tokens, Inter) |
| `guidester-demo.gif` | Demo GIF, copied from the Guidester repo so the site loads nothing from GitHub |

Links and the stylesheet use root-absolute paths (`/style.css`), so preview with a
local server rather than opening files directly:

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Before going live

1. **Address.** Replace `ADDRESS_PLACEHOLDER` in `contact.html`.
2. **Read the legal pages.** `terms.html`, `privacy.html`, `refund.html` and
   `contact.html` are templates (each has a notice comment at the top). Review them
   before relying on them or submitting them to a payment gateway.
3. **Email.** The pages use a Gmail address. Once Cloudflare Email Routing is set up
   for `hello@saurabhupadhyay.in`, replace it everywhere:
   ```bash
   grep -rl 'saurabhupadhyay7973@gmail.com' *.html | xargs sed -i '' 's/saurabhupadhyay7973@gmail.com/hello@saurabhupadhyay.in/g'
   ```

## Deploy (Cloudflare Pages)

1. Cloudflare dashboard → **Workers & Pages → Create → Pages → Connect to Git**.
2. Authorise GitHub and pick `Saurabh-7973/saurabhupadhyay.in`.
3. Framework preset: **None**. Build command: **empty**. Build output directory: **`/`**.
4. **Save and Deploy**. The site is live at `<project>.pages.dev` in about a minute.

Every push to `main` redeploys.

## Custom domain

Once the domain's nameservers point at Cloudflare:

1. Pages project → **Custom domains → Set up a domain** → `saurabhupadhyay.in`.
   Cloudflare creates the DNS record.
2. Add `www.saurabhupadhyay.in` as well and redirect it to the apex.

HTTPS is automatic.
