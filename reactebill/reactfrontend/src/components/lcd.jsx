import React, { useState, useEffect } from "react";
import { auth, db } from "./firebase"; // Assuming firebase setup is correct
import { doc, setDoc, getDoc, updateDoc, collection, getDocs } from "firebase/firestore"; 
import { useNavigate } from "react-router-dom";

function LCD() {
  const [port, setPort] = useState(null); // Store port object
  const [initialReading, setInitialReading] = useState("");
  const [currentReading, setCurrentReading] = useState(null); // Incremented current reading
  const [isReadingEntered, setIsReadingEntered] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [isFieldDisabled, setIsFieldDisabled] = useState(false);
  const navigate = useNavigate();

  // Get user data on load
  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, "Users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUserDetails(userSnap.data());

          // Check if the user has already entered the reading
          const readingsRef = collection(db, "Readings");
          const userReadingsQuery = await getDocs(readingsRef);
          let hasReading = false;
          userReadingsQuery.forEach((doc) => {
            if (doc.data().email === user.email) {
              hasReading = true;
            }
          });

          setIsReadingEntered(hasReading);

          if (hasReading) {
            const readingRef = doc(db, "Readings", user.uid);
            const readingSnap = await getDoc(readingRef);
            if (readingSnap.exists()) {
              const fetchedReading = readingSnap.data().currentReading;
              setCurrentReading(fetchedReading); // Set the current reading from Firestore
              sendTextToArduino(fetchedReading); // Send current reading to Arduino
            }
          }
        } else {
          console.error("User data not found in Firestore");
        }
      } else {
        navigate("/login"); // Redirect to login if no user is logged in
      }
    };

    fetchUserData();
  }, [navigate]);

  // Connect to Arduino via Web Serial API
  const connectToArduino = async () => {
    if (port && port.readable) {
      alert("Serial port is already connected!");
      return;
    }

    try {
      console.log("Attempting to connect to Arduino...");
      const serialPort = await navigator.serial.requestPort();
      await serialPort.open({ baudRate: 9600 });
      setPort(serialPort);
      console.log("Connected to Arduino!");
      alert("Connected!");
    } catch (error) {
      alert("Error connecting: " + error.message);
      console.error(error);
    }
  };

  // Send data to Arduino
  const sendTextToArduino = async (current) => {
    if (!port) return;

    try {
      const writer = port.writable.getWriter();
      const data = new TextEncoder().encode(`Reading: ${current}\n`);
      await writer.write(data); // Send the reading data to Arduino
      writer.releaseLock();
      console.log("Data successfully sent!");
    } catch (error) {
      console.error("Error sending data: ", error);
    }
  };

  // Submit initial reading to Firestore
  const handleSubmitReading = async () => {
    if (!initialReading) {
      alert("Please enter a reading first!");
      return;
    }

    const user = auth.currentUser;
    if (user && userDetails) {
      try {
        const readingsRef = collection(db, "Readings");
        
        // Store initial timestamp
        const initialTimestamp = new Date().toISOString();

        await setDoc(doc(readingsRef, user.uid), {
          name: userDetails.firstName,
          email: user.email,
          consumerNumber: userDetails.consumerNumber,
          postNumber: userDetails.postNumber,
          initialReading: initialReading,
          currentReading: parseInt(initialReading),
          timestamp: initialTimestamp, // Store timestamp
          initialTimestamp: initialTimestamp, // Store initial timestamp
        });

        setIsReadingEntered(true);
        setCurrentReading(parseInt(initialReading));
        alert("Initial reading submitted successfully!");
        sendTextToArduino(initialReading); // Send initial reading to Arduino
      } catch (error) {
        console.error("Error saving reading: ", error);
        alert("Error submitting reading. Please try again.");
      }
    } else {
      alert("User data is missing or not logged in.");
    }
  };

  // Update current reading periodically
  useEffect(() => {
    if (isReadingEntered) {
      const interval = setInterval(async () => {
        setCurrentReading((prevReading) => {
          const newReading = prevReading + 1;
          const user = auth.currentUser;
          if (user) {
            const readingsRef = doc(db, "Readings", user.uid);

            // Update the current reading and timestamp
            updateDoc(readingsRef, {
              currentReading: newReading,
              timestamp: new Date().toISOString(), // Update timestamp to the current time
            });

            sendTextToArduino(newReading); // Send updated reading to Arduino
          }
          return newReading;
        });
      }, 5000);

      return () => clearInterval(interval); // Cleanup interval on unmount
    }
  }, [isReadingEntered]);

  // Send current reading to Arduino when currentReading changes
  useEffect(() => {
    if (isReadingEntered && currentReading !== null) {
      // Send the current reading to Arduino each time it's updated or on page revisit
      sendTextToArduino(currentReading);
    }
  }, [currentReading, isReadingEntered]); // Trigger when currentReading or isReadingEntered changes

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#6F8FAF", // Darker background for contrast
        margin: "0",
        padding: "0",
        fontFamily: "'Poppins', sans-serif", // Added font for consistency
      }}
    >
      {/* Ebill Heading */}
      <h1
        style={{
          fontSize: "36px",
          fontWeight: "bold",
          color: "#ecf0f1", // Lighter font color
          marginBottom: "25px",
          letterSpacing: "2px",
          textTransform: "uppercase",
          textShadow: "2px 2px 4px rgba(0, 0, 0, 0.3)", // Slight shadow for better readability
        }}
      >
        Ebill
      </h1>

      <div
        style={{
          maxWidth: "450px",
          width: "100%",
          backgroundColor: "#34495e",
          borderRadius: "20px", // Rounded corners for a soft and modern look
          boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.15)", // Deep shadow for depth
          padding: "40px",
          textAlign: "center",
          border: "3px solid #89CFF0", // Green border for a clean accent
          transition: "all 0.3s ease", // Smooth transition
        }}
      >
        <h3
          style={{
            fontSize: "24px",
            fontWeight: "600",
            color: "#ecf0f1", // Matching text color with heading
            marginBottom: "20px",
            textShadow: "1px 1px 2px rgba(0, 0, 0, 0.2)", // Text shadow for readability
          }}
        >
          Electricity Meter Dashboard
        </h3>

        {/* Connect Button */}
        {!port ? (
          <button
            onClick={connectToArduino}
            style={{
              width: "100%",
              padding: "16px 24px",
              fontSize: "18px",
              borderRadius: "12px",
              backgroundColor: "#89CFF0",
              color: "#fff",
              border: "none",
              cursor: "pointer",
              transition: "background-color 0.3s ease",
              boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.2)", // Elevated shadow effect
              marginBottom: "20px",
            }}
          >
            Connect
          </button>
        ) : (
          <p style={{ color: "#fff", fontSize: "16px", fontWeight: "500" }}>Connected</p>
        )}

        <br />

        {/* Input for Initial Reading */}
        {!isReadingEntered ? (
          <div>
            <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#fff", marginBottom: "10px" }}>
              Enter Your Initial Reading
            </h3>
            <input
              type="number"
              placeholder="Initial Reading"
              value={initialReading}
              onChange={(e) => setInitialReading(e.target.value)}
              disabled={isReadingEntered || isFieldDisabled}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "12px",
                border: "1px solid #ddd",
                fontSize: "16px",
                color: "#fff",
                backgroundColor: "#2c3e50",
                outline: "none",
                transition: "all 0.3s ease",
                marginBottom: "20px",
              }}
            />
            <button
              onClick={handleSubmitReading}
              style={{
                width: "100%",
                padding: "16px 24px",
                fontSize: "18px",
                borderRadius: "12px",
                backgroundColor: "#088F8F",
                color: "#fff",
                border: "none",
                cursor: "pointer",
                transition: "background-color 0.3s ease",
                marginTop: "20px",
                boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.2)",
              }}
            >
              Submit Reading
            </button>
          </div>
        ) : (
          <div>
            <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#fff" }}>
              Your current reading: {currentReading}
            </h3>
          </div>
        )}
      </div>

      {/* Go Back Button at the end */}
      <button
        onClick={() => navigate(-1)}
        style={{
          padding: "10px 20px",
          backgroundColor: "#088F8F",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          marginTop: "20px",
          fontSize: "16px",
          cursor: "pointer",
          transition: "background-color 0.3s ease",
          boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.2)",
        }}
      >
        Go Back
      </button>
    </div>
  );
}

export default LCD;
