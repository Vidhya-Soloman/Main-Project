const admin = require('firebase-admin');
// Path to the service account file
const serviceAccount = require('./firebase-service-account-key.json');


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const messaging = admin.messaging();

// Function to send a push notification
const sendPushNotification = async (registrationToken, title, body) => {
  const message = {
    notification: {
      title: title,
      body: body,
    },
    token: registrationToken, // This is the FCM token from the frontend
  };

  try {
    const response = await messaging.send(message);
    console.log('Successfully sent message:', response);
  } catch (error) {
    console.error('Error sending message:', error);
  }
};

module.exports = { sendPushNotification };
