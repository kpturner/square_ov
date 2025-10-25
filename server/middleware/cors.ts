export default defineEventHandler((event) => {
  setResponseHeaders(event, {
    'Access-Control-Allow-Origin': '*', // Allows requests from any origin
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });

  // Handle preflight requests
  if (event.method === 'OPTIONS') {
    return new Response(null, { status: 204 }); // Respond with "No Content"
  }
});
