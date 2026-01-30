/**
 * SEED DATA - Premium Demo Products
 * Run this in Firebase Console or integrate with your admin panel
 * 
 * Each product object to insert into 'products' collection:
 */

export const demoProducts = [
  {
    id: "1001",
    title: "Ensemble Premium Silk",
    price: "249",
    originalPrice: 599,
    cost: "100",
    category: "Fashion",
    stock: 25,
    description: "Elegant silk ensemble perfect for special occasions. Premium quality fabric with intricate detailing.",
    image: "https://images.unsplash.com/photo-1595777712802-14f350313c22?w=500&h=500&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1595777712802-14f350313c22?w=500&h=500&fit=crop",
      "https://images.unsplash.com/photo-1614613535308-eb5fbd8952ff?w=500&h=500&fit=crop"
    ],
    discountLabel: "LIVRAISON GRATUITE",
    isBestSeller: true,
    wholesalePrice: "150",
    minWholesaleQty: 5,
    allowAddToCart: true,
    reviews: [],
    badge: "LIVRAISON GRATUITE"
  },
  {
    id: "1002",
    title: "Abaya Elegance Black",
    price: "350",
    originalPrice: 750,
    cost: "150",
    category: "Fashion",
    stock: 30,
    description: "Classic black abaya with premium embroidery. Perfect for everyday elegance and formal occasions.",
    image: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=500&h=500&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=500&h=500&fit=crop",
      "https://images.unsplash.com/photo-1614613535308-eb5fbd8952ff?w=500&h=500&fit=crop"
    ],
    discountLabel: "HOT SELLER",
    isBestSeller: true,
    wholesalePrice: "250",
    minWholesaleQty: 3,
    allowAddToCart: true,
    reviews: [],
    badge: "HOT SELLER"
  },
  {
    id: "1003",
    title: "Coffret Aksiswar Gold",
    price: "180",
    originalPrice: 400,
    cost: "70",
    category: "Accessories",
    stock: 50,
    description: "Luxurious gold-toned accessory set. Perfect gift for loved ones. Includes premium packaging.",
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&h=500&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&h=500&fit=crop",
      "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500&h=500&fit=crop"
    ],
    discountLabel: "-55%",
    isBestSeller: true,
    wholesalePrice: "120",
    minWholesaleQty: 2,
    allowAddToCart: true,
    reviews: [],
    badge: "-55%"
  }
];

/**
 * HOW TO USE:
 * 
 * OPTION 1: Via Firebase Console
 * 1. Go to Firebase Console → amina-saas project
 * 2. Navigate to Firestore Database
 * 3. Create a 'products' collection (if it doesn't exist)
 * 4. Add each product object as a new document
 * 5. Use the 'id' field as the document ID
 * 
 * OPTION 2: Via Admin SDK (Server-side)
 * Use this code in a Next.js API route or cloud function:
 * 
 * import { db } from '@/lib/firebase';
 * import { setDoc, doc } from 'firebase/firestore';
 * import { demoProducts } from '@/lib/seedData';
 * 
 * export async function seedProducts() {
 *   for (const product of demoProducts) {
 *     await setDoc(doc(db, 'products', product.id), product);
 *   }
 * }
 * 
 * OPTION 3: Via Admin Panel
 * 1. Go to /admin in your app
 * 2. Fill out the product form with details above
 * 3. Upload images from URLs
 * 4. Set isBestSeller = true for all
 */
