const { Storage } = require('@google-cloud/storage');

async function setupCors() {
  const storage = new Storage();
  const bucket = storage.bucket('amina-saas.firebasestorage.app');
  
  const corsConfiguration = [
    {
      origin: ['http://localhost:3001', 'http://localhost:3000'],
      method: ['GET', 'HEAD', 'PUT', 'POST', 'DELETE', 'OPTIONS'],
      responseHeader: ['Content-Type', 'Authorization', 'Content-Length', 'X-Requested-With', 'Origin', 'Accept'],
      maxAgeSeconds: 3600
    }
  ];

  try {
    await bucket.setCorsConfiguration(corsConfiguration);
    console.log('CORS configuration updated successfully');
  } catch (error) {
    console.error('Error setting CORS configuration:', error);
  }
}

setupCors();
