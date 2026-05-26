# French catalog translations (`translations.fr`)

The storefront shows **French product/category names** from MongoDB field `translations.fr.*`, not from `client/src/locales/fr.json`. UI chrome (buttons, menus) uses the JSON locale files.

## Check what is missing

### Admin dashboard

1. Log in as admin.
2. Open **Dashboard → French translations** (`/dashboard/translations`).
3. Review counts and the table (products missing `translations.fr.name`, etc.).
4. Optional: run **Translate next batch** if `GEMINI_API_KEY` is set on the server.

### CLI (local, uses `client/.env` → `MONGODB_URI`)

```bash
cd client
pnpm list:missing-fr
pnpm list:missing-fr -- --entity=products --field=name
pnpm list:missing-fr -- --export=missing-fr-products.csv
```

Entities: `products`, `brands`, `categories`, `subcategories`, `blogs`.

## Fill missing French

| Method | When to use |
|--------|-------------|
| **Edit product** in dashboard | One-off fixes; set name/description in English only — add French via backfill or future admin FR fields |
| **`pnpm backfill:fr`** | Bulk auto-translate via Gemini (`GEMINI_API_KEY` required) |
| **Admin API** `POST /api/next/admin/i18n/backfill` | Same as backfill, batched from dashboard |

```bash
cd client
pnpm backfill:fr
pnpm backfill:fr -- --entities=products --batch=50
```

## Product fields translated

- `name`, `unit`, `description`, `specifications`, `more_details`

If `translations.fr.name` is empty, the site falls back to the English `name` when the user selects French.

## Storefront locale vs catalog

- **URL `/fr/...`** — French routes (middleware).
- **`essentialist_lang` in localStorage** — UI language preference.
- **`Accept-Language: fr` on API** — returns merged `translations.fr` fields.

After backfill, re-check GSC or spot-check a few PDPs on `/fr/product/...`.
