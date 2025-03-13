import React, { useState, useEffect } from "react";
import { auth, db } from "./firebase";  // Assuming firebase setup is correct
import { doc, setDoc, getDoc, updateDoc, collection, getDocs } from "firebase/firestore"; 
import { useNavigate } from "react-router-dom";

function LCD() {
  const [port, setPort] = useState(null);  // State for storing port object
  const [initialReading, setInitialReading] = useState("");
  const [currentReading, setCurrentReading] = useState(null); // Current incremented reading
  const [isReadingEntered, setIsReadingEntered] = useState(false);  // Check if reading is entered
  const [userDetails, setUserDetails] = useState(null);
  const [isFieldDisabled, setIsFieldDisabled] = useState(false);  // Disable field after reading
  const [isErrorIgnored, setIsErrorIgnored] = useState(false);  // Track if error is ignored
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
              setCurrentReading(readingSnap.data().currentReading);
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
    try {
      console.log("Attempting to connect to Arduino...");
      const serialPort = await navigator.serial.requestPort();
      await serialPort.open({ baudRate: 9600 });

      // Only update the state if the connection is successful
      setPort(serialPort);  // Update the port state with the serial port
      console.log("Connected to Arduino!");
      alert("Connected to Arduino!");
    } catch (error) {
      alert("Error connecting to Arduino: " + error.message);
      console.error(error);
    }
  };

  // Send data to Arduino
  const sendTextToArduino = async (initial, current) => {
    if (!port) {
      //alert("Connect to Arduino first!");
      return;
    }

    try {
      const writer = port.writable.getWriter();
      // Send both initial and current readings to Arduino
      const data = new TextEncoder().encode(`Initial: ${initial}\nReading: ${current}\n`);
      await writer.write(data);
      writer.releaseLock();  // Release lock after writing

      // Log successful sending to Arduino
      console.log("Data successfully sent to Arduino!");
    } catch (error) {
      if (isErrorIgnored) {
        console.log("Error ignored: " + error.message);
      } else {
        console.error("Error sending data to Arduino: ", error);
        //alert("Error sending data to Arduino.");
      }
    }
  };

  // Submit initial reading to Firestore
  const handleSubmitReading = async () => {
    if (!initialReading) {
      alert("Please enter a reading first!");
      return;
    }

    // Store the reading in Firestore
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

        setIsReadingEntered(true);  // Disable input after submitting
        setCurrentReading(parseInt(initialReading)); // Set current reading

        alert("Initial reading submitted successfully!");

        // Send the initial reading to Arduino
        sendTextToArduino(initialReading, initialReading);
      } catch (error) {
        console.error("Error saving reading: ", error);
        alert("Error submitting reading. Please try again.");
      }
    } else {
      alert("User data is missing or not logged in.");
    }
  };

  // Simulate usage: Increment the current reading periodically
  useEffect(() => {
    if (isReadingEntered) {
      const interval = setInterval(async () => {
        setCurrentReading((prevReading) => {
          const newReading = prevReading + 1;  // Increment the reading by 1
          
          // Update the Firestore with the new current reading
          const user = auth.currentUser;
          if (user) {
            const readingsRef = doc(db, "Readings", user.uid);
            updateDoc(readingsRef, {
              currentReading: newReading,
            });

            sendTextToArduino(initialReading, newReading);  // Send both readings to Arduino
          }
          return newReading;
        });
      }, 5000);  // Update every 5 seconds (you can adjust this)
      
      return () => clearInterval(interval);  // Cleanup interval on unmount
    }
  }, [isReadingEntered, initialReading]);

  // Ignore error pop-up when clicked
  const handleIgnoreError = () => {
    setIsErrorIgnored(true);
    console.log("Error alerts are now ignored.");
  };

  // Add useEffect to ensure port is set before trying to send data
  useEffect(() => {
    if (port) {
      console.log("Arduino port connected:", port);
    }
  }, [port]);

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
            disabled={isReadingEntered || isFieldDisabled}  // Disable input after reading is entered
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
