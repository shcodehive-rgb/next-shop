import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

interface Product {
  id: string;
  title: string | { ar: string; en: string; fr: string };
  category?: string;
  description?: string;
  price?: string;
}

// Protected endpoint - requires admin authentication
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || authHeader !== 'Bearer admin-cleanup-2024') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all products
    const productsCollection = collection(db, 'products');
    const productsSnapshot = await getDocs(productsCollection);
    const allProducts: Product[] = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Product);

    // Define fitness keywords to identify products to keep
    const fitnessKeywords = [
      'sport', 'fitness', 'exercise', 'workout', 'gym', 'muscle',
      'training', 'resistance', 'yoga', 'running', 'cardio',
      'ankle', 'buttock', 'tape', 'support', 'medical', 'health',
      'protein', 'supplement', 'equipment', 'gear', 'athletic',
      'kenzio'
    ];

    // Define protected products (NEVER delete these)
    const protectedProducts = [
      'Professional ankle belts for resistance and buttock exercise',
      'Kenzio Muscle Support Medical Tape'
    ];

    // Categorize products
    const productsToDelete: Product[] = [];
    const productsToKeep: Product[] = [];
    const protectedFoundList: Product[] = [];

    allProducts.forEach(product => {
      const title = typeof product.title === 'string' 
        ? product.title.toLowerCase() 
        : JSON.stringify(product.title).toLowerCase();
      
      const category = (product.category || '').toLowerCase();
      const description = (product.description || '').toLowerCase();

      // Check if product is protected
      const isProductProtected = protectedProducts.some(protected => 
        title.includes(protected.toLowerCase())
      );

      if (isProductProtected) {
        protectedFoundList.push(product);
        return;
      }

      // Check if product is in "Sport and health" category
      if (category.includes('sport and health')) {
        productsToKeep.push(product);
        return;
      }

      // Check if product contains fitness keywords
      const isFitnessRelated = fitnessKeywords.some(keyword => 
        title.includes(keyword) || 
        category.includes(keyword) || 
        description.includes(keyword)
      );

      if (isFitnessRelated) {
        productsToKeep.push(product);
      } else {
        productsToDelete.push(product);
      }
    });

    // Delete non-fitness products
    const deletionResults = [];
    for (const product of productsToDelete) {
      try {
        await deleteDoc(doc(db, 'products', product.id));
        deletionResults.push({
          id: product.id,
          title: product.title,
          status: 'deleted'
        });
      } catch (error) {
        deletionResults.push({
          id: product.id,
          title: product.title,
          status: 'error',
          error: (error as Error).message
        });
      }
    }

    return NextResponse.json({
      success: true,
      summary: {
        totalProducts: allProducts.length,
        protectedFound: protectedFoundList.length,
        productsToKeep: productsToKeep.length,
        productsToDelete: productsToDelete.length,
        deletedSuccessfully: deletionResults.filter(r => r.status === 'deleted').length,
        deletionErrors: deletionResults.filter(r => r.status === 'error').length
      },
      details: {
        protectedFound: protectedFoundList.map(p => ({ id: p.id, title: p.title, category: p.category })),
        productsToKeep: productsToKeep.map(p => ({ id: p.id, title: p.title, category: p.category })),
        productsDeleted: deletionResults,
        attemptedDeletions: productsToDelete.map(p => ({ id: p.id, title: p.title, category: p.category }))
      }
    });

  } catch (error) {
    console.error('Product cleanup error:', error);
    return NextResponse.json({ 
      error: 'Failed to cleanup products', 
      details: (error as Error).message 
    }, { status: 500 });
  }
}

// Endpoint to preview what would be deleted without actually deleting
export async function GET(request: NextRequest) {
  try {
    // Get all products
    const productsCollection = collection(db, 'products');
    const productsSnapshot = await getDocs(productsCollection);
    const allProducts: Product[] = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Product);

    // Define fitness keywords
    const fitnessKeywords = [
      'sport', 'fitness', 'exercise', 'workout', 'gym', 'muscle',
      'training', 'resistance', 'yoga', 'running', 'cardio',
      'ankle', 'buttock', 'tape', 'support', 'medical', 'health',
      'protein', 'supplement', 'equipment', 'gear', 'athletic',
      'kenzio'
    ];

    // Define protected products
    const protectedProducts = [
      'Professional ankle belts for resistance and buttock exercise',
      'Kenzio Muscle Support Medical Tape'
    ];

    // Categorize products (preview only)
    const productsToDelete: Product[] = [];
    const productsToKeep: Product[] = [];
    const protectedFoundList: Product[] = [];

    allProducts.forEach(product => {
      const title = typeof product.title === 'string' 
        ? product.title.toLowerCase() 
        : JSON.stringify(product.title).toLowerCase();
      
      const category = (product.category || '').toLowerCase();
      const description = (product.description || '').toLowerCase();

      // Check if product is protected
      const isProductProtected = protectedProducts.some(protected => 
        title.includes(protected.toLowerCase())
      );

      if (isProductProtected) {
        protectedFoundList.push(product);
        return;
      }

      // Check if product is in "Sport and health" category
      if (category.includes('sport and health')) {
        productsToKeep.push(product);
        return;
      }

      // Check if product contains fitness keywords
      const isFitnessRelated = fitnessKeywords.some(keyword => 
        title.includes(keyword) || 
        category.includes(keyword) || 
        description.includes(keyword)
      );

      if (isFitnessRelated) {
        productsToKeep.push(product);
      } else {
        productsToDelete.push(product);
      }
    });

    return NextResponse.json({
      success: true,
      preview: true,
      summary: {
        totalProducts: allProducts.length,
        protectedFound: protectedFoundList.length,
        productsToKeep: productsToKeep.length,
        productsToDelete: productsToDelete.length
      },
      details: {
        protectedFound: protectedFoundList.map(p => ({ id: p.id, title: p.title, category: p.category })),
        productsToKeep: productsToKeep.map(p => ({ id: p.id, title: p.title, category: p.category })),
        productsToDelete: productsToDelete.map(p => ({ id: p.id, title: p.title, category: p.category }))
      }
    });

  } catch (error) {
    console.error('Product preview error:', error);
    return NextResponse.json({ 
      error: 'Failed to preview products', 
      details: (error as Error).message 
    }, { status: 500 });
  }
}
