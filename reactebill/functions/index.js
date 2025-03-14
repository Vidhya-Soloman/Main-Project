// Import Firebase Functions and logger
const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

// Define your HTTP function
exports.myFunction = onRequest((req, res) => {
  // Log a message
logger.info('Request received', {structuredData: true});

  // Send a response to the client
res.send('Hello from Firebase Functions!');
});
