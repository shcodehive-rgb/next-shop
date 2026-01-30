import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, setDoc, doc, serverTimestamp } from "firebase/firestore";
import { demoProducts } from "@/lib/seedProducts";

export async function POST(req: NextRequest) {
  try {
    // Optional: Add a security check (e.g., verify a secret token)
    const authToken = req.headers.get("x-seed-token");
    const expectedToken = process.env.SEED_TOKEN || "demo-seed-key";
    
    if (authToken !== expectedToken) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const productsRef = collection(db, "products");
    const results = [];

    for (const product of demoProducts) {
      await setDoc(doc(productsRef, product.id), {
        ...product,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      results.push({ id: product.id, title: product.title, status: "added" });
    }

    return NextResponse.json({
      success: true,
      message: `Successfully added ${results.length} demo products`,
      products: results,
    });
  } catch (error: any) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { error: "Failed to seed products", details: error.message },
      { status: 500 }
    );
  }
}
