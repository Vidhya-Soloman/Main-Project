const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
admin.initializeApp();

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.json());

app.post('/send-notification', (req, res) => {
  const { registrationToken, title, body } = req.body;

  const message = {
    notification: {
      title: title,
      body: body,
    },
    token: registrationToken,
  };

  admin.messaging().send(message)
    .then((response) => {
      console.log("Successfully sent message:", response);
      res.status(200).send({ success: true });
    })
    .catch((error) => {
      console.error("Error sending message:", error);
      res.status(500).send({ error: "Error sending notification" });
    });
});

app.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
});
