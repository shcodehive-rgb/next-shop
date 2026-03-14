// Product Cleanup Script for Fitness Store Transition
// This script helps identify products to keep vs delete

const PRODUCTS_TO_KEEP = [
  // Products in "Sport and health" category
  {
    category: "Sport and health",
    action: "KEEP ALL",
    reason: "Fits fitness niche"
  },
  
  // Specific protected products
  {
    name: "Professional ankle belts for resistance and buttock exercise",
    action: "PROTECT - DO NOT MODIFY",
    reason: "Active Facebook Ads running - URL must remain unchanged"
  },
  {
    name: "Kenzio Muscle Support Medical Tape",
    action: "KEEP",
    reason: "Fits fitness niche"
  }
];

const CATEGORIES_TO_DELETE = [
  "Kitchen",
  "Beauty", 
  "Electronics",
  "General Gadgets",
  "Home & Living",
  "Fashion",
  "Accessories", // if not fitness-related
  "Toys",
  "Books",
  "Other"
];

const FITNESS_KEYWORDS = [
  "sport", "fitness", "exercise", "workout", "gym", "muscle",
  "training", "resistance", "yoga", "running", "cardio",
  "ankle", "buttock", "tape", "support", "medical", "health",
  "protein", "supplement", "equipment", "gear", "athletic"
];

// Instructions for manual cleanup:
console.log("=== PRODUCT CLEANUP INSTRUCTIONS ===");
console.log("\n1. PRODUCTS TO KEEP (DO NOT TOUCH):");
console.log("- ALL products in 'Sport and health' category");
console.log("- 'Professional ankle belts for resistance and buttock exercise' (PROTECTED - Facebook Ads)");
console.log("- 'Kenzio Muscle Support Medical Tape' products");

console.log("\n2. PRODUCTS TO DELETE/HIDE:");
console.log("- Kitchen items");
console.log("- Beauty products");
console.log("- Electronics");
console.log("- General gadgets");
console.log("- Any non-fitness related items");

console.log("\n3. SAFETY CHECKLIST:");
console.log("□ Backup current product data");
console.log("□ Identify protected products first");
console.log("□ Check for active Facebook Ads links");
console.log("□ Test URLs after cleanup");
console.log("□ Verify navigation still works");

console.log("\n4. CLEANUP PROCESS:");
console.log("1. Go to Admin Panel → Products");
console.log("2. Identify fitness products (keep these)");
console.log("3. Delete/hide non-fitness products");
console.log("4. Update categories if needed");
console.log("5. Test store functionality");

export {};
