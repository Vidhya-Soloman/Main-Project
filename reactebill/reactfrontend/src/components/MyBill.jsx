// MyBill.jsx

import React, { useEffect, useState } from "react";
import { auth, db } from "./firebase";
import { doc, getDoc, Timestamp } from "firebase/firestore";
import { getMessaging, getToken } from "firebase/messaging";

function MyBill() {
  const [userDetails, setUserDetails] = useState(null);
  const [readings, setReadings] = useState(null);
  const [billAmount, setBillAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [canPayNow, setCanPayNow] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [billReadyTimestamp, setBillReadyTimestamp] = useState(null);
  const [fineApplied, setFineApplied] = useState(false);
  const [initialBillAmount, setInitialBillAmount] = useState(0);
  const [fcmToken, setFcmToken] = useState(null);

  useEffect(() => {
    const fetchUserAndReadings = async () => {
      const user = auth.currentUser;
      if (!user) {
        console.log("User not authenticated");
        setLoading(false);
        return;
      }

      try {
        const userRef = doc(db, "Users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUserDetails(userSnap.data());
        }

        const readingsRef = doc(db, "Readings", user.uid);
        const readingsSnap = await getDoc(readingsRef);
        if (readingsSnap.exists()) {
          const readingsData = readingsSnap.data();
          setReadings(readingsData);

          let initialTimestamp = readingsData.initialTimestamp;
          let currentTimestamp = readingsData.timestamp;

          if (initialTimestamp instanceof Timestamp) {
            initialTimestamp = initialTimestamp.toDate();
          } else if (typeof initialTimestamp === "string") {
            initialTimestamp = new Date(initialTimestamp);
          }

          if (currentTimestamp instanceof Timestamp) {
            currentTimestamp = currentTimestamp.toDate();
          } else if (typeof currentTimestamp === "string") {
            currentTimestamp = new Date(currentTimestamp);
          }

          if (initialTimestamp && currentTimestamp) {
            const timeDifference = currentTimestamp - initialTimestamp;

            if (timeDifference >= 5 * 60 * 1000) {
              setCanPayNow(true);
              setBillReadyTimestamp(currentTimestamp);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching user or readings data:", error);
      }

      setLoading(false);
    };

    fetchUserAndReadings();
  }, []);

  useEffect(() => {
    if (userDetails && readings) {
      const { initialReading, currentReading } = readings;
      const userType = userDetails.userType;

      if (initialReading === currentReading) {
        setBillAmount(50);
        setInitialBillAmount(50);
        return;
      }

      const unitsConsumed = currentReading - initialReading;
      let bill = 0;

      if (userType === "Residential") {
        if (unitsConsumed <= 50) bill = unitsConsumed * 1.5;
        else if (unitsConsumed <= 150) bill = 50 * 1.5 + (unitsConsumed - 50) * 2.75;
        else if (unitsConsumed <= 300) bill = 50 * 1.5 + 100 * 2.75 + (unitsConsumed - 150) * 4;
        else bill = 50 * 1.5 + 100 * 2.75 + 150 * 4 + (unitsConsumed - 300) * 5.5;
      } else if (userType === "Commercial") {
        if (unitsConsumed <= 50) bill = unitsConsumed * 2;
        else if (unitsConsumed <= 150) bill = 50 * 2 + (unitsConsumed - 50) * 3.5;
        else if (unitsConsumed <= 300) bill = 50 * 2 + 100 * 3.5 + (unitsConsumed - 150) * 5;
        else bill = 50 * 2 + 100 * 3.5 + 150 * 5 + (unitsConsumed - 300) * 6;
      }

      bill += 50;               // Fixed service charge
      bill += bill * 0.05;      // 5% tax

      setBillAmount(bill);
      setInitialBillAmount(bill);
    }
  }, [userDetails, readings]);

  useEffect(() => {
    if (billReadyTimestamp) {
      const currentTimestamp = new Date();
      const timeElapsed = (currentTimestamp - billReadyTimestamp) / 60000;

      if (timeElapsed > 2 && !fineApplied) {
        const fine = 0.1 * initialBillAmount;
        setBillAmount((prevBill) => prevBill + fine);
        setFineApplied(true);
      }
    }
  }, [billReadyTimestamp, fineApplied, initialBillAmount]);

  useEffect(() => {
    const messaging = getMessaging();
    getToken(messaging, { vapidKey: "YOUR_VAPID_KEY" }).then((currentToken) => {
      if (currentToken) {
        setFcmToken(currentToken);
      } else {
        console.log("No token available. Request permission to generate one.");
      }
    }).catch((err) => {
      console.log("An error occurred while retrieving token. ", err);
    });
  }, []);

  const sendNotification = () => {
    if (fcmToken) {
      // Send the FCM token to your backend for push notification
      fetch('http://localhost:5000/send-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          registrationToken: fcmToken,
          title: "Payment Notification",
          body: "A payment has been initiated for your electricity bill.",
        }),
      })
        .then(response => response.json())
        .then(data => {
          console.log("Notification sent successfully:", data);
        })
        .catch((error) => {
          console.error("Error sending notification:", error);
        });
    }
  };

  const handlePayment = () => {
    if (!phoneNumber) {
      alert("Please enter a valid phone number linked to UPI.");
      return;
    }

    const fine = fineApplied ? 0.1 * initialBillAmount : 0;
    const totalBill = billAmount + fine;

    const transactionId = "TXN" + Math.floor(Math.random() * 1000000);
    const upiLink = `upi://pay?pa=vdsoloman552@okicici&pn=Electricity%20Board&tid=${transactionId}&tr=${transactionId}&tn=Electricity%20Bill&am=${totalBill.toFixed(2)}&cu=INR`;

    alert("You will be redirected to Google Pay (or your UPI app) to complete the payment.");

    // Send notification
    sendNotification();

    window.location.href = upiLink;
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        width: "100vw",
        background: "linear-gradient(to right, #1e3c72, #2a5298)",
        color: "#ffffff",
      }}
    >
      <h1 style={{ fontSize: "36px", fontWeight: "700", marginBottom: "20px", color: "#f4f1de" }}>
        My Bill
      </h1>

      <div
        style={{
          backgroundColor: "#f4f1de",
          padding: "30px",
          borderRadius: "12px",
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)",
          width: "400px",
          textAlign: "center",
        }}
      >
        {loading ? (
          <p style={{ fontSize: "18px" }}>Loading...</p>
        ) : userDetails && readings ? (
          <>
            <h2 style={{ fontSize: "24px", fontWeight: "600", marginBottom: "20px", color: "#2c3e50" }}>
              Hello, {userDetails.firstName} {userDetails.lastName}
            </h2>

            {/* Display initial and current readings */}
            <p style={{ fontSize: "18px", color: "#2c3e50" }}>
              <strong>Initial Reading:</strong> {readings.initialReading} kWh
            </p>
            <p style={{ fontSize: "18px", color: "#2c3e50" }}>
              <strong>Current Reading:</strong> {readings.currentReading} kWh
            </p>

            <p style={{ fontSize: "18px", color: "#2c3e50" }}>
              <strong>Initial Bill Amount:</strong> ₹{initialBillAmount.toFixed(2)}
            </p>

            {fineApplied && (
              <p style={{ fontSize: "18px", color: "red" }}>
                <strong>Fine:</strong> ₹{(0.1 * initialBillAmount).toFixed(2)}
              </p>
            )}

            <p style={{ fontSize: "18px", color: "#2c3e50" }}>
              <strong>Total Bill:</strong> ₹{(billAmount + (fineApplied ? 0.1 * initialBillAmount : 0)).toFixed(2)}
            </p>

            {canPayNow && (
              <>
                <input
                  type="text"
                  placeholder="Enter your UPI-linked Phone Number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  style={{ padding: "10px", width: "80%", marginBottom: "10px" }}
                />
                <button onClick={handlePayment} style={{ padding: "10px 20px", backgroundColor: "#3498db", color: "white", border: "none", borderRadius: "5px" }}>
                  Proceed to Pay
                </button>
              </>
            )}
          </>
        ) : (
          <p>No readings data available.</p>
        )}
      </div>
    </div>
  );
}

export default MyBill;
