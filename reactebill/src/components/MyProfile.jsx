import React, { useEffect, useState } from "react";
import { auth, db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

function MyProfile() {
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const docRef = doc(db, "Users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUserDetails(docSnap.data());
          } else {
            console.log("No user data found");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        console.log("User not authenticated");
        navigate("/login"); // Redirect to login if not authenticated
      }
      setLoading(false);
    };

    fetchUserData();
  }, [navigate]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100vw",
        minHeight: "100vh",
        background: "linear-gradient(to bottom, #E1F5FE, #80D8FF)", // Soft gradient background
        padding: "20px",
        fontFamily: "'Roboto', sans-serif",
      }}
    >
      <h1
        style={{
          fontSize: "36px",
          fontWeight: "700",
          color: "#0277BD", // Dark blue header
          textAlign: "center",
          marginBottom: "30px",
          letterSpacing: "1px",
          textTransform: "uppercase",
        }}
      >
        My Profile
      </h1>

      {loading ? (
        <p style={{ color: "#0277BD", fontSize: "18px" }}>Loading...</p>
      ) : userDetails ? (
        <div
          style={{
            width: "90%",
            maxWidth: "500px",
            backgroundColor: "#bdfbf6", // Light blue background
            borderRadius: "12px",
            padding: "25px",
            boxShadow: "0 6px 20px rgba(0, 0, 0, 0.1)",
            textAlign: "left",
            border: "1px solid #B3E5FC", // Light blue border
            transition: "all 0.3s ease",
          }}
        >
          {/* Profile Name */}
          <h3
            style={{
              color: "#0288D1", // Bright blue for name
              textAlign: "center",
              marginBottom: "20px",
              fontSize: "22px",
              fontWeight: "600",
            }}
          >
            {userDetails.firstName} {userDetails.lastName}
          </h3>

          {/* Full Details */}
          <div style={{ padding: "10px", color: "#555", fontSize: "16px" }}>
            <p>
              <strong>Email:</strong> {userDetails.email}
            </p>
            <p>
              <strong>Phone:</strong> {userDetails.phone}
            </p>
            <p>
              <strong>Consumer Number:</strong> {userDetails.consumerNumber}
            </p>
            <p>
              <strong>Post Number:</strong> {userDetails.postNumber}
            </p>
            <p>
              <strong>Address:</strong> {userDetails.address}
            </p>
            <p>
              <strong>Pincode:</strong> {userDetails.pincode}
            </p>
            <p>
              <strong>User Type:</strong> {userDetails.userType}
            </p>
          </div>

          {/* Back Button - Smaller Size */}
          <div style={{ marginTop: "20px", textAlign: "center" }}>
            <button
              onClick={() => navigate(-1)}
              style={{
                padding: "8px 14px", // Smaller size
                backgroundColor: "#00796B", // Teal color
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "600",
                transition: "background-color 0.3s, transform 0.3s",
                width: "auto", // Adjusts to text size
                minWidth: "100px", // Ensures button isn't too small
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "#004D40"; // Darker teal on hover
                e.target.style.transform = "scale(1.05)";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "#00796B"; // Original teal color
                e.target.style.transform = "scale(1)";
              }}
            >
              Go Back
            </button>
          </div>
        </div>
      ) : (
        <p style={{ color: "#0277BD", fontSize: "18px" }}>No profile data available.</p>
      )}
    </div>
  );
}

export default MyProfile;
