import React, { useState, useEffect } from "react";
import { auth, db } from "./firebase"; // Firebase setup
import { doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs } from "firebase/firestore"; 
import { useNavigate } from "react-router-dom";

function LCD() {
  const [port, setPort] = useState(null);                      // Store port object
  const [initialReading, setInitialReading] = useState("");     // Store initial reading
  const [currentReading, setCurrentReading] = useState(null);   // Store current reading
  const [isReadingEntered, setIsReadingEntered] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [isFieldDisabled, setIsFieldDisabled] = useState(false);
  const navigate = useNavigate();

  // ✅ Fetch user data on load
  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (!user) {
        navigate("/login"); 
        return;
      }

      const userRef = doc(db, "Users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        setUserDetails(userSnap.data());

        // Check if the user has already entered the reading
        const readingRef = doc(db, "Readings", user.uid);
        const readingSnap = await getDoc(readingRef);

        if (readingSnap.exists()) {
          const data = readingSnap.data();
          setCurrentReading(data.currentReading);       // Fetch the current reading
          setInitialReading(data.initialReading);       // Set initialReading
          setIsReadingEntered(true);
          sendTextToArduino(data.currentReading);       // Send current reading to Arduino
        }
      }
    };

    fetchUserData();
  }, [navigate]);

  // ✅ Connect to Arduino via Web Serial API
  const connectToArduino = async () => {
    if (port && port.readable) {
      alert("Already connected to Arduino!");
      return;
    }

    try {
      const serialPort = await navigator.serial.requestPort();
      await serialPort.open({ baudRate: 9600 });
      setPort(serialPort);
      alert("Connected to Arduino!");
    } catch (error) {
      console.error("Error connecting: ", error);
      alert("Failed to connect: " + error.message);
    }
  };

  // ✅ Send data to Arduino
  const sendTextToArduino = async (reading) => {
    if (!port) return;

    try {
      const writer = port.writable.getWriter();
      const data = new TextEncoder().encode(`Reading: ${reading}\n`);
      await writer.write(data);
      writer.releaseLock();
    } catch (error) {
      console.error("Error sending data: ", error);
    }
  };

  // ✅ Submit initial reading to Firestore
  const handleSubmitReading = async () => {
    if (!initialReading) {
      alert("Please enter a valid reading!");
      return;
    }

    const user = auth.currentUser;
    if (!user || !userDetails) {
      alert("User not authenticated.");
      return;
    }

    try {
      const readingsRef = doc(db, "Readings", user.uid);

      const initialTimestamp = new Date().toISOString();

      await setDoc(readingsRef, {
        name: userDetails.firstName,
        email: user.email,
        consumerNumber: userDetails.consumerNumber,
        postNumber: userDetails.postNumber,
        initialReading: parseInt(initialReading),
        currentReading: parseInt(initialReading),
        timestamp: initialTimestamp,
        initialTimestamp: initialTimestamp,
        status: false, // Initially set status as false
      });

      setIsReadingEntered(true);
      setCurrentReading(parseInt(initialReading));
      alert("Initial reading submitted successfully!");
      sendTextToArduino(initialReading);

    } catch (error) {
      console.error("Error saving reading: ", error);
      alert("Error submitting reading. Please try again.");
    }
  };

  // ✅ Periodic reading update
  useEffect(() => {
    if (isReadingEntered) {
      const interval = setInterval(async () => {
        setCurrentReading((prevReading) => {
          const newReading = prevReading + 1;  // Increment reading by 1 each cycle
          const user = auth.currentUser;

          if (user) {
            const readingsRef = doc(db, "Readings", user.uid);

            // Update currentReading and timestamp in Firestore
            updateDoc(readingsRef, {
              currentReading: newReading,
              timestamp: new Date().toISOString(),
            });

            sendTextToArduino(newReading);  // Send the updated reading to Arduino
          }
          return newReading;
        });
      }, 5000);  // Increment every 5 seconds

      return () => clearInterval(interval);
    }
  }, [isReadingEntered]);

  // ✅ Check bill payment and update status field in Readings collection
  useEffect(() => {
    const checkBillStatus = async () => {
      const user = auth.currentUser;
      if (!user || !userDetails) return;

      // Check if bill has been paid for this consumer number
      const billQuery = query(
        collection(db, "Bill"),
        where("consumerNumber", "==", userDetails.consumerNumber),
        where("billStatus", "==", true)
      );

      const billSnapshot = await getDocs(billQuery);

      if (!billSnapshot.empty) {
        const readingRef = doc(db, "Readings", user.uid);

        // Update the status field to true when the bill is paid
        await updateDoc(readingRef, {
          status: true, // Update the status field to true
          initialReading: currentReading, // Set currentReading as new initialReading
          initialTimestamp: new Date().toISOString(), // Reset initialTimestamp
          timestamp: new Date().toISOString(), // Reset timestamp
        });

        alert("Bill has been paid. Status updated!");
      }
    };

    if (isReadingEntered && currentReading !== null) {
      checkBillStatus();
    }
  }, [userDetails, currentReading, isReadingEntered]);

  // ✅ Send current reading when it changes
  useEffect(() => {
    if (isReadingEntered && currentReading !== null) {
      sendTextToArduino(currentReading);
    }
  }, [currentReading, isReadingEntered]);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#6F8FAF",
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      <h1 style={{ fontSize: "36px", fontWeight: "bold", color: "#ecf0f1" }}>Ebill</h1>

      <div
        style={{
          maxWidth: "450px",
          backgroundColor: "#34495e",
          borderRadius: "20px",
          boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.15)",
          padding: "40px",
          textAlign: "center",
          border: "3px solid #89CFF0",
        }}
      >
        <h3 style={{ fontSize: "24px", fontWeight: "600", color: "#ecf0f1" }}>
          Electricity Meter Dashboard
        </h3>

        {!port ? (
          <button
            onClick={connectToArduino}
            style={{
              width: "100%",
              padding: "16px",
              fontSize: "18px",
              borderRadius: "12px",
              backgroundColor: "#89CFF0",
              color: "#fff",
              border: "none",
              cursor: "pointer",
              marginBottom: "20px",
            }}
          >
            Connect
          </button>
        ) : (
          <p style={{ color: "#fff", fontSize: "16px", fontWeight: "500" }}>Connected</p>
        )}

        {!isReadingEntered ? (
          <>
            <input
              type="number"
              placeholder="Enter Initial Reading"
              value={initialReading}
              onChange={(e) => setInitialReading(e.target.value)}
              disabled={isReadingEntered || isFieldDisabled}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "12px",
                border: "1px solid #ddd",
                fontSize: "16px",
                backgroundColor: "#2c3e50",
                color: "#fff",
                outline: "none",
                marginBottom: "20px",
              }}
            />
            <button
              onClick={handleSubmitReading}
              style={{
                width: "100%",
                padding: "16px",
                fontSize: "18px",
                borderRadius: "12px",
                backgroundColor: "#088F8F",
                color: "#fff",
                border: "none",
                cursor: "pointer",
              }}
            >
              Submit Reading
            </button>
          </>
        ) : (
          <h3 style={{ color: "#fff" }}>Current Reading: {currentReading}</h3>
        )}
      </div>

      <button onClick={() => navigate(-1)} style={{ padding: "10px 20px", backgroundColor: "#088F8F", color: "#fff", borderRadius: "8px", marginTop: "20px" }}>
        Go Back
      </button>
    </div>
  );
}

export default LCD;
