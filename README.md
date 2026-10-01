# Amazon Bazar — Website

Smoke shop website for **Amazon Bazar**, 1030 Norwich-New London Turnpike, Uncasville, CT.

Built with **Vite + React + React Router**, and **pre-rendered to static HTML** at build time, so every page is
fast, SEO-friendly, and can be hosted anywhere (Netlify, Vercel, Cloudflare Pages, GitHub Pages, cPanel…).

## Quick start

```bash
npm install
npm run dev        # local dev server → http://localhost:5173
npm run build      # production build → dist/
npm run preview    # preview the production build → http://localhost:4173
```

Deploy by uploading the contents of `dist/` (or point your host at `npm run build` with output folder `dist`).

## Project structure

```
public/images/        All images (clean, URL-safe names)
  brands/             Brand cards (Geek Bar, Raz, ZYN…)
  categories/         Home page category cards
  heroes/             Page banners
  products/<brand>/   Flavor / variant photos
  gallery/            Cigar + accessory store photos
src/
  data/
    brands/*.json     ← PRODUCTS: one file per brand (models, flavors, prices, stock, images)
    catalog.js        Categories + helpers (nav/menus are generated from this)
    site.js           ← STORE INFO: phone, address, hours, map links
    home.js           Home page text: reviews, deals, featured brands…
    galleries.js      Cigar lineup + gallery photo lists
  components/         Header, footer, age gate, product picker, gallery…
  pages/              One file per page type
  styles/global.css   Theme colors, fonts, buttons (design tokens at the top)
scripts/
  prerender.mjs       Build step: static HTML per page, old-URL redirects, sitemap.xml, robots.txt
  optimize-images.mjs Shrinks oversized images (npm run optimize-images)
```

## Common edits

| I want to…                         | Edit                                                     |
| ---------------------------------- | -------------------------------------------------------- |
| Change a price / mark out of stock | `src/data/brands/<brand>.json` → `price`, `inStock`      |
| Add a flavor                       | Add a `{ name, price, image, inStock }` to the variants  |
| Add a new brand                    | Copy a brand JSON, change `slug`, `name`, `category`, `order` — the menu, category page and sitemap update automatically |
| Change phone / hours / address     | `src/data/site.js`                                       |
| Change reviews, deals, ribbon text | `src/data/home.js`                                       |
| Change theme colors                | `:root` variables at the top of `src/styles/global.css`  |

New images go in `public/images/...` and are referenced as `/images/...`. Run `npm run optimize-images` after adding
large photos.

## Updating prices from Excel

```bash
npm run export-prices   # writes tools/pricing/prices.xlsx with every product on the site
# edit Price / In Stock (Yes/No) in Excel and save
npm run sync-prices -- --dry   # preview what will change
npm run sync-prices            # apply, then rebuild/deploy
```

The sync prints every change, every row it couldn't match (typos, duplicates, products not on the site) and which
site products are missing from the sheet. It also accepts the old sheet format
(`Category / Brand / ItemName / Price / SourcePage`, kept as `tools/pricing/legacy-price.xlsx`).

## Promotions

`src/data/promos.js` controls:

- **Deal of the week** — shown on the home page until its `ends` date, then automatically replaced by `EVERGREEN_DEAL`.
- **New arrivals** — the scrolling product row on the home page (brand slug + model + flavor, as named on the site).
- **Brand badges** — "Best Seller", "New", "Hot" labels on brand cards.

## Pickup list (reserve online, pay in store)

Customers add flavors to a pickup list (saved on their device), enter a name and pickup time, then **text the order to
the store** (opens their SMS app with the message filled in), copy it, or call. Nothing is paid or stored online.
The receiving number is `SITE.textNumber` in `src/data/site.js` — it must be able to receive texts; set it to `null`
to hide the "Text order" button.

## Search

The search button in the header (or `/` / `Ctrl+K`) searches every brand, model, flavor, cigar and accessory
category. Results link straight to the selected flavor.

## Install as an app / offline

The site has a web-app manifest and a service worker (`public/sw.js`), so phones can "Add to Home Screen" and
previously visited pages work offline (with `public/offline.html` as a fallback). After changing the logo, run
`node scripts/generate-icons.mjs`. If you change `sw.js`, bump its `VERSION`.

## Analytics (optional)

Copy `.env.example` to `.env`, set `VITE_GA_ID=G-XXXXXXXXXX`, and rebuild. Google Analytics 4 then records page views
plus `call_click`, `directions_click`, `text_click`, `search`, `add_to_pickup` and `send_pickup_order` events.
With no ID set, no analytics code is loaded.

## URLs

| Page              | URL                                        |
| ----------------- | ------------------------------------------ |
| Home              | `/`                                        |
| Category          | `/disposable-vapes`, `/pod-systems`, `/nicotine-pouches` |
| Brand             | `/disposable-vapes/geek-bar`, `/nicotine-pouches/zyn`, … |
| Cigarettes        | `/cigarettes`                              |
| Cigars            | `/cigars`                                  |
| Hookahs & Acc.    | `/accessories`                             |

A selected flavor is kept in the link (e.g. `/disposable-vapes/geek-bar?model=geek-bar-pulse&flavor=pink-lemonade`)
so customers can share it.

Old URLs from the previous static site (`/Pages/GKP.html`, `/Pages/zyn.html`, …) redirect to the new pages
(HTML redirects in `dist/Pages/`, plus a `_redirects` file for Netlify/Cloudflare that sends real 301s).
