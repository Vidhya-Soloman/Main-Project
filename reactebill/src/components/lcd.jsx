import React, { useState, useEffect } from "react";
import { auth, db } from "./firebase";  // Assuming firebase setup is correct
import { doc, setDoc, getDoc, updateDoc, collection, getDocs } from "firebase/firestore"; 
import { useNavigate } from "react-router-dom";

function LCD() {
  const [port, setPort] = useState(null);  // Store port object
  const [initialReading, setInitialReading] = useState("");
  const [currentReading, setCurrentReading] = useState(null); // Incremented current reading
  const [isReadingEntered, setIsReadingEntered] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [isFieldDisabled, setIsFieldDisabled] = useState(false);
  const [isErrorIgnored, setIsErrorIgnored] = useState(false);
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
              setCurrentReading(fetchedReading);  // Set the current reading from Firestore
              sendTextToArduino(fetchedReading);  // Send current reading to Arduino
            }
          }
        } else {
          console.error("User data not found in Firestore");
        }
      } else {
        navigate("/login");  // Redirect to login if no user is logged in
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
      alert("Connected to Arduino!");
    } catch (error) {
      alert("Error connecting to Arduino: " + error.message);
      console.error(error);
    }
  };

  // Send data to Arduino
  const sendTextToArduino = async (current) => {
    if (!port) return;

    try {
      const writer = port.writable.getWriter();
      const data = new TextEncoder().encode(`Reading: ${current}\n`);
      await writer.write(data);  // Send the reading data to Arduino
      writer.releaseLock();
      console.log("Data successfully sent to Arduino!");
    } catch (error) {
      console.error("Error sending data to Arduino: ", error);
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
        await setDoc(doc(readingsRef, user.uid), {
          name: userDetails.firstName,
          email: user.email,
          consumerNumber: userDetails.consumerNumber,
          postNumber: userDetails.postNumber,
          initialReading: initialReading,
          currentReading: parseInt(initialReading),
          timestamp: new Date(),
        });

        setIsReadingEntered(true);
        setCurrentReading(parseInt(initialReading));
        alert("Initial reading submitted successfully!");
        sendTextToArduino(initialReading);  // Send initial reading to Arduino
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
            updateDoc(readingsRef, { currentReading: newReading });
            sendTextToArduino(newReading);  // Send updated reading to Arduino
          }
          return newReading;
        });
      }, 5000);

      return () => clearInterval(interval);  // Cleanup interval on unmount
    }
  }, [isReadingEntered]);

  // Send current reading to Arduino when currentReading changes
  useEffect(() => {
    if (isReadingEntered && currentReading !== null) {
      // Send the current reading to Arduino each time it's updated or on page revisit
      sendTextToArduino(currentReading);
    }
  }, [currentReading, isReadingEntered]);  // Trigger when currentReading or isReadingEntered changes

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>React to Arduino LCD</h1>
      {!port ? (
        <button onClick={connectToArduino}>Connect to Arduino</button>
      ) : (
        <p>Arduino connected</p>
      )}
      <br />

      {!isReadingEntered ? (
        <div>
          <h3>Enter Your Initial Reading</h3>
          <input
            type="number"
            placeholder="Initial Reading"
            value={initialReading}
            onChange={(e) => setInitialReading(e.target.value)}
            disabled={isReadingEntered || isFieldDisabled}
          />
          <button onClick={handleSubmitReading}>Submit Reading</button>
        </div>
      ) : (
        <div>
          <h3>Your current reading: {currentReading}</h3>
          <p>Reading is updated every 5 seconds.</p>
        </div>
      )}
    </div>
  );
}

export default LCD;
