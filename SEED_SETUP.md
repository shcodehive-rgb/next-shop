# 🛍️ Database Seed Setup Guide

This guide explains how to populate your store with premium demo products.

## Method 1: API Endpoint (Recommended)

### Step 1: Set Environment Variable
Add this to your `.env.local`:
```
SEED_TOKEN=demo-seed-key
```

### Step 2: Trigger the Seed
Make a POST request to `/api/seed` with the token:

**Using curl:**
```bash
curl -X POST http://localhost:3000/api/seed \
  -H "x-seed-token: demo-seed-key" \
  -H "Content-Type: application/json"
```

**Using JavaScript (in browser console):**
```javascript
fetch('/api/seed', {
  method: 'POST',
  headers: {
    'x-seed-token': 'demo-seed-key',
    'Content-Type': 'application/json'
  }
})
.then(res => res.json())
.then(data => console.log(data))
```

### Step 3: Verify
Visit your store homepage - you should see the new products in:
- ✅ Best Sellers slider
- ✅ Product Grid
- ✅ Collection pages

## Products Included

1. **Ensemble Satin Premium** (-86%) - 123 DH → Original: 899 DH
2. **Abaya Moderne Silk** (LIVRAISON GRATUITE) - 299 DH → Original: 450 DH
3. **Coffret Cadeau Aksiswar** (HOT SALE) - 150 DH → Original: 300 DH
4. **Hijab Premium Coton** (-49%) - 45 DH → Original: 89 DH
5. **Bracelet Doré Aksiswar** (-47%) - 85 DH → Original: 160 DH

## Method 2: Manual Add via Admin Panel

Alternatively, add each product manually:
1. Go to `/admin`
2. Enter the product details from `lib/seedProducts.ts`
3. Upload images and save

## Customization

To modify the demo products:
1. Edit `lib/seedProducts.ts`
2. Change titles, prices, images, or categories
3. Re-run the seed endpoint to update

## Security Note

In production, change the `SEED_TOKEN` to a strong random string:
```
SEED_TOKEN=your-super-secret-random-key-12345
```

Only you should know this token to prevent unauthorized database changes.
