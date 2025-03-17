import React, { useEffect, useState } from "react";
import { auth, db } from "./firebase";
import { doc, getDoc, Timestamp } from "firebase/firestore";

function MyBill() {
  const [userDetails, setUserDetails] = useState(null);
  const [readings, setReadings] = useState(null);
  const [billAmount, setBillAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [canPayNow, setCanPayNow] = useState(false);
  const [timeDifferenceInMinutes, setTimeDifferenceInMinutes] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showPaymentInput, setShowPaymentInput] = useState(false);

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
            setTimeDifferenceInMinutes(timeDifference / 60000);

            if (timeDifference >= 5 * 60 * 1000) {
              setCanPayNow(true);
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

      bill += 50;
      bill += bill * 0.05;

      setBillAmount(bill);
    }
  }, [userDetails, readings]);

  const handlePayment = () => {
    if (!phoneNumber) {
      alert("Please enter a valid phone number linked to UPI.");
      return;
    }

    const transactionId = "TXN" + Math.floor(Math.random() * 1000000);
    const upiLink = `upi://pay?pa=vdsoloman552@okicici&pn=Electricity%20Board&tid=${transactionId}&tr=${transactionId}&tn=Electricity%20Bill&am=${billAmount}&cu=INR`;

    window.location.href = upiLink; // Redirect to UPI payment app
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

            <p style={{ fontSize: "18px", marginBottom: "10px", color: "#2c3e50" }}>
              <strong>Initial Reading:</strong> {readings.initialReading}
            </p>
            <p style={{ fontSize: "18px", marginBottom: "10px", color: "#2c3e50" }}>
              <strong>Current Reading:</strong> {readings.currentReading}
            </p>

            <p style={{ fontSize: "18px", marginTop: "20px", color: "#2c3e50" }}>
              <strong>Total Bill: ₹{billAmount.toFixed(2)}</strong>
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
                <button onClick={handlePayment}>Proceed to Pay</button>
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
