// Immediate Product Deletion Script
// This will delete all non-fitness products immediately

const deleteProducts = async () => {
  try {
    const response = await fetch('/api/cleanup-products', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer admin-cleanup-2024',
        'Content-Type': 'application/json'
      }
    });
    
    const result = await response.json();
    console.log('Cleanup Result:', result);
    
    if (result.success) {
      alert(`✅ Cleanup Complete!\n\nDeleted: ${result.summary.deletedSuccessfully} products\nProtected: ${result.summary.protectedFound} products\nKept: ${result.summary.productsToKeep} fitness products`);
    } else {
      alert(`❌ Error: ${result.error}`);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('❌ Failed to execute cleanup');
  }
};

// Execute immediately
deleteProducts();
