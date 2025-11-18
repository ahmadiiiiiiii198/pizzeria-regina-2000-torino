// Simple test function to see if Netlify functions work at all

exports.handler = async (event) => {
  console.log('Test webhook called!');
  
  return {
    statusCode: 200,
    body: JSON.stringify({ 
      message: 'Test webhook is working!',
      method: event.httpMethod,
      timestamp: new Date().toISOString()
    }),
  };
};
