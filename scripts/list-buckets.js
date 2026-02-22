const { Storage } = require('@google-cloud/storage');

async function listBuckets() {
  const storage = new Storage();
  
  try {
    const [buckets] = await storage.getBuckets();
    console.log('Available buckets:');
    buckets.forEach(bucket => {
      console.log(`- ${bucket.name}`);
    });
  } catch (error) {
    console.error('Error listing buckets:', error);
  }
}

listBuckets();
