import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "./firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { Line } from 'react-chartjs-2'; // Import the Line chart from react-chartjs-2
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

// Register necessary components for Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function CurrentConsumption() {
  const [consumptionData, setConsumptionData] = useState([]); // Store multiple consumption values
  const navigate = useNavigate();

  useEffect(() => {
    const fetchConsumptionData = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          // Fetch user details from the "Users" collection to get the consumerNumber
          const userRef = doc(db, "Users", user.uid); 
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const userDetails = userSnap.data();
            const consumerNumber = userDetails.consumerNumber;

            if (consumerNumber) {
              // Now, query the Bill collection using the consumerNumber
              const billsRef = collection(db, "Bill");
              const q = query(billsRef, where("consumerNumber", "==", consumerNumber));
              const billSnapshot = await getDocs(q);

              const data = [];
              billSnapshot.forEach((doc) => {
                data.push(doc.data().usage); // Assuming 'usage' is the field in the Bill collection
              });

              if (data.length > 0) {
                setConsumptionData(data);
              } else {
                console.log("No consumption data found");
                setConsumptionData([]);
              }
            } else {
              console.log("No consumer number available");
            }
          } else {
            console.log("No user data found");
          }
        } catch (error) {
          console.error("Error fetching consumption data:", error);
        }
      }
    };

    fetchConsumptionData();
  }, []);

  // Prepare the data for the chart
  const chartData = {
    labels: consumptionData.map((_, index) => `Bill ${index + 1}`), // Assuming each record corresponds to a bill
    datasets: [
      {
        label: 'Consumption (kWh)', // Label for the chart
        data: consumptionData, // Consumption data
        fill: false, // Don't fill the area below the line
        borderColor: 'rgb(75, 192, 192)', // Line color
        tension: 0.1, // Smoothness of the line
      },
    ],
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: (tooltipItem) => `${tooltipItem.raw} kWh`, // Format the tooltip value
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Bills',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Consumption (kWh)',
        },
      },
    },
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100vw",
        minHeight: "100vh",
        backgroundImage: "url('/2158.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        padding: "20px",
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      <h1
        style={{
          fontSize: "38px",
          fontWeight: "700",
          color: "#fff",
          textAlign: "center",
          marginBottom: "20px",
          letterSpacing: "1px",
          textTransform: "uppercase",
          textShadow: "2px 2px 10px rgba(0, 0, 0, 0.3)",
        }}
      >
        Current Consumption
      </h1>

      {consumptionData.length > 0 ? (
        <div
          style={{
            width: "90%",
            maxWidth: "700px",
            padding: "30px",
            borderRadius: "20px",
            background: "rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(10px)",
            border: "2px solid rgba(255, 255, 255, 0.2)",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
            textAlign: "center",
            color: "#fff",
          }}
        >
          <h3
            style={{
              fontSize: "24px",
              fontWeight: "700",
              marginBottom: "20px",
              letterSpacing: "1px",
            }}
          >
            Your Current Consumption (Graph)
          </h3>
          {/* Render the chart */}
          <Line data={chartData} options={chartOptions} />
        </div>
      ) : (
        <p style={{ color: "#fff", fontSize: "18px" }}>Loading consumption data...</p>
      )}
    </div>
  );
}

export default CurrentConsumption;
