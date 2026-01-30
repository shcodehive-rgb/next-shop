import { db } from '@/lib/firebase';
import { setDoc, doc } from 'firebase/firestore';
import { demoProducts } from '@/lib/seedData';

/**
 * API Route to seed demo products
 * POST /api/seed-products
 * 
 * This endpoint adds the demo products to Firebase Firestore
 * Should only be called once during setup
 */

export async function POST(request: Request) {
  try {
    // Security: Check for authorization header (basic check)
    const auth = request.headers.get('authorization');
    if (!auth || !auth.includes('admin-seed-key')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401 }
      );
    }

    let successCount = 0;
    const errors: string[] = [];

    for (const product of demoProducts) {
      try {
        await setDoc(doc(db, 'products', product.id), product);
        successCount++;
      } catch (err: any) {
        errors.push(`Product ${product.id}: ${err.message}`);
      }
    }

    return new Response(
      JSON.stringify({
        message: 'Seed complete',
        success: successCount,
        total: demoProducts.length,
        errors: errors.length > 0 ? errors : null
      }),
      { status: 200 }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    );
  }
}
