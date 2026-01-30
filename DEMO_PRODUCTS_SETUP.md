# Demo Products Setup Guide

## Option 1: Via Firebase Console (Easiest) ✅

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select **amina-saas** project
3. Go to **Firestore Database**
4. Click **Create Collection** (if products doesn't exist)
5. Name it: `products`
6. Click **Add Document** and manually add each product from `lib/seedData.ts`

### Product 1: Ensemble Premium Silk
```
Document ID: 1001
title: "Ensemble Premium Silk"
price: "249"
originalPrice: 599
cost: "100"
category: "Fashion"
stock: 25
discountLabel: "LIVRAISON GRATUITE"
isBestSeller: true
image: "https://images.unsplash.com/photo-1595777712802-14f350313c22?w=500&h=500&fit=crop"
```

### Product 2: Abaya Elegance Black
```
Document ID: 1002
title: "Abaya Elegance Black"
price: "350"
originalPrice: 750
cost: "150"
category: "Fashion"
stock: 30
discountLabel: "HOT SELLER"
isBestSeller: true
image: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=500&h=500&fit=crop"
```

### Product 3: Coffret Aksiswar Gold
```
Document ID: 1003
title: "Coffret Aksiswar Gold"
price: "180"
originalPrice: 400
cost: "70"
category: "Accessories"
stock: 50
discountLabel: "-55%"
isBestSeller: true
image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&h=500&fit=crop"
```

---

## Option 2: Via Admin Panel (App UI) ✅

1. Open your app and go to `/admin`
2. Scroll down to **Add New Product**
3. Fill in each field with the product data above
4. Set **Is Best Seller** ✓ (checkbox)
5. Upload images from the URLs provided
6. Click **Add Product**
7. Repeat for all 3 products

---

## Option 3: Via API Endpoint (Code-Based) ✅

Run this in your browser console or curl:

```bash
curl -X POST http://localhost:3000/api/seed-products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer admin-seed-key" \
  -d '{}'
```

---

## Verification ✓

After adding products:

1. Go to **Homepage** → Should see 3 products in "الأكثر طلباً" (Best Sellers) slider
2. Go to **/products** → Should see all 3 in the grid
3. Check the **red badges** with "LIVRAISON GRATUITE", "HOT SELLER", "-55%"
4. Verify **prices** show original price crossed-out and new price in green

---

## Field Descriptions

- **title**: Product name (Arabic-friendly)
- **price**: Selling price in DH (string)
- **originalPrice**: Pre-discount price in DH (number)
- **discountLabel**: Badge text shown on card (manual, not auto-calculated)
- **isBestSeller**: true/false - determines if shown in Best Sellers slider
- **category**: Must match one of your existing categories
- **cost**: Your cost price (internal use only)
- **stock**: Available quantity
- **image**: Primary image URL
- **images**: Array of image URLs (gallery)
- **description**: Product description

---

## Troubleshooting

**Q: Products not showing?**
- A: Check that `isBestSeller: true` is set in Firestore
- Check product category matches an existing category in your database

**Q: Images not loading?**
- A: Verify the image URLs are valid and accessible
- Try different images from Unsplash

**Q: Badges not showing?**
- A: Make sure `discountLabel` field is NOT empty (empty string = no badge)
- Badge only shows if you manually enter text in this field

---

## Next Steps

Once products are added:
1. Test responsive layout on mobile and desktop
2. Click on products to view details
3. Test "Add to Cart" functionality
4. Verify Best Sellers slider auto-scrolls smoothly
5. Check category filtering works
