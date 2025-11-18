// Simple API endpoint for service worker to check latest orders
// This is a basic implementation - in production you'd want proper authentication

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // In a real implementation, you would:
    // 1. Connect to your Supabase database
    // 2. Query for the latest orders
    // 3. Return the data
    
    // For now, return a mock response
    const mockOrders = [
      {
        id: 'mock-order-' + Date.now(),
        order_number: 'ORD-' + Math.floor(Math.random() * 1000),
        customer_name: 'Cliente Test',
        created_at: new Date().toISOString(),
        status: 'pending'
      }
    ];

    res.status(200).json({
      success: true,
      orders: mockOrders,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
}
