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
          fontSize: "40px",
          fontWeight: "700",
          color: "#0277BD", // Darker blue color for the header
          textAlign: "center",
          marginBottom: "40px",
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
            maxWidth: "600px",
            backgroundColor: "#a0fae7", // New light gray background for the card
            borderRadius: "12px",
            padding: "30px",
            boxShadow: "0 6px 20px rgba(0, 0, 0, 0.1)",
            textAlign: "left",
            border: "1px solid #B3E5FC", // Light blue border for the profile card
            transition: "all 0.3s ease",
          }}
        >
          {/* Profile Name */}
          <h3
            style={{
              color: "#0288D1", // Bright blue color for the name
              textAlign: "center",
              marginBottom: "30px",
              fontSize: "24px",
              fontWeight: "600",
            }}
          >
            {userDetails.firstName} {userDetails.lastName}
          </h3>

          {/* Full Details */}
          <div style={{ padding: "10px", color: "#555", fontSize: "16px" }}>
            <p style={{ marginBottom: "12px" }}>
              <strong>Email:</strong> {userDetails.email}
            </p>
            <p style={{ marginBottom: "12px" }}>
              <strong>Phone:</strong> {userDetails.phone}
            </p>
            <p style={{ marginBottom: "12px" }}>
              <strong>Consumer Number:</strong> {userDetails.consumerNumber}
            </p>
            <p style={{ marginBottom: "12px" }}>
              <strong>Post Number:</strong> {userDetails.postNumber}
            </p>
            <p style={{ marginBottom: "12px" }}>
              <strong>Address:</strong> {userDetails.address}
            </p>
            <p style={{ marginBottom: "12px" }}>
              <strong>Pincode:</strong> {userDetails.pincode}
            </p>
            <p style={{ marginBottom: "12px" }}>
              <strong>User Type:</strong> {userDetails.userType}
            </p>
          </div>

          {/* Back Button */}
          <div style={{ marginTop: "30px", textAlign: "center" }}>
            <button
              onClick={() => navigate(-1)}
              style={{
                padding: "14px 20px",
                backgroundColor: "#00796B", // Teal color for the button
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                width: "100%",
                fontSize: "16px",
                transition: "background-color 0.3s, transform 0.3s",
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
