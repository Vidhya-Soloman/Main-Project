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
        backgroundColor: "#f4f4f4",
        padding: "20px",
      }}
    >
      <h1 style={{ fontSize: "32px", fontWeight: "bold", color: "#2c3e50", textAlign: "center", marginBottom: "20px" }}>
        My Profile
      </h1>

      {loading ? (
        <p style={{ color: "#2c3e50", fontSize: "18px" }}>Loading...</p>
      ) : userDetails ? (
        <div
          style={{
            width: "90%",
            maxWidth: "500px",
            backgroundColor: "#ffffff",
            borderRadius: "10px",
            padding: "20px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
            textAlign: "left",
          }}
        >
          {/* Profile Picture */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "15px" }}>
            <img
              src={userDetails.photo || "https://via.placeholder.com/150"}
              alt="Profile"
              width={"120px"}
              height={"120px"}
              style={{ borderRadius: "50%", objectFit: "cover" }}
            />
          </div>

          <h3 style={{ color: "#2c3e50", textAlign: "center" }}>
            {userDetails.firstName} {userDetails.lastName}
          </h3>

          {/* Full Details */}
          <div style={{ padding: "10px", color: "#333" }}>
            <p><strong>Email:</strong> {userDetails.email}</p>
            <p><strong>Phone:</strong> {userDetails.phone}</p>
            <p><strong>Consumer Number:</strong> {userDetails.consumerNumber}</p>
            <p><strong>Post Number:</strong> {userDetails.postNumber}</p>
            <p><strong>Address:</strong> {userDetails.address}</p>
            <p><strong>Pincode:</strong> {userDetails.pincode}</p>
            <p><strong>User Type:</strong> {userDetails.userType}</p>
          </div>

          {/* Back Button */}
          <div style={{ marginTop: "15px", textAlign: "center" }}>
            <button
              onClick={() => navigate(-1)}
              style={{
                padding: "10px",
                backgroundColor: "#3498db",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                width: "100%",
              }}
            >
              Back
            </button>
          </div>
        </div>
      ) : (
        <p style={{ color: "#2c3e50", fontSize: "18px" }}>No profile data available.</p>
      )}
    </div>
  );
}

export default MyProfile;
