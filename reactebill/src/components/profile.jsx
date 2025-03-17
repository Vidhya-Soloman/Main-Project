import React, { useEffect, useState } from "react";
import { auth, db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

function Profile() {
  const [userDetails, setUserDetails] = useState(null);
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
        console.log("User is not logged in");
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error.message);
    }
  };

  const handleDisplay = () => {
    navigate("/lcd");
  };

  const handleMyBill = () => {
    navigate("/my-bill");
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
        backgroundImage: "url('/thunder1.jpg')",  // Background image from public folder
        backgroundSize: "cover", // Ensures the image covers the entire background
        backgroundPosition: "center", // Centers the image
        padding: "20px",
        fontFamily: "'Roboto', sans-serif",
      }}
    >
      <h1
        style={{
          fontSize: "36px",
          fontWeight: "700",
          color: "#ecf0f1",  // Lighter color for the header
          textAlign: "center",
          marginBottom: "20px",
          letterSpacing: "1px",
          textTransform: "uppercase",
        }}
      >
        HomePage
      </h1>

      {userDetails ? (
        <div
          style={{
            width: "90%",            // Adjusted width for the profile box
            maxWidth: "500px",       // Increased maxWidth to make it wider
            backgroundColor: "#ffffff",
            borderRadius: "15px",
            padding: "25px",
            boxShadow: "0 8px 20px rgba(0, 0, 0, 0.1)",
            textAlign: "center",
            transition: "all 0.3s ease",
            background: "linear-gradient(135deg, rgb(98, 52, 169), rgb(69, 123, 157))", // Darker gradient
            color: "#fff",
            border: "3px solid #ecf0f1", // Added border color, thickness, and style
          }}
        >
          <h3
            style={{
              fontSize: "22px",
              fontWeight: "600",
              marginBottom: "15px",
            }}
          >
            Welcome, {userDetails.firstName}!
          </h3>

          {/* Profile Button */}
          <button
            onClick={() => navigate("/my-profile")}
            style={{
              padding: "12px",
              backgroundColor: "#3498db",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              marginBottom: "15px",
              width: "100%",
              fontSize: "16px",
              transition: "background-color 0.3s, transform 0.3s",
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#2980b9";
              e.target.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "#3498db";
              e.target.style.transform = "scale(1)";
            }}
          >
            Show Profile
          </button>

          {/* Reading Button */}
          <div style={{ marginBottom: "15px" }}>
            <span
              style={{
                fontSize: "14px",
                color: "#f0f0f0",
                marginBottom: "8px",
                display: "block",
              }}
            >
              Please enter your initial reading:
            </span>
            <button
              onClick={handleDisplay}
              style={{
                padding: "12px",
                backgroundColor: "#27ae60",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                width: "100%",
                fontSize: "16px",
                transition: "background-color 0.3s, transform 0.3s",
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "#2ecc71";
                e.target.style.transform = "scale(1.05)";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "#27ae60";
                e.target.style.transform = "scale(1)";
              }}
            >
              Reading
            </button>
          </div>

          {/* My Bill Button */}
          <button
            onClick={handleMyBill}
            style={{
              padding: "12px",
              backgroundColor: "#f39c12",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              width: "100%",
              fontSize: "16px",
              transition: "background-color 0.3s, transform 0.3s",
              marginBottom: "15px",
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#e67e22";
              e.target.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "#f39c12";
              e.target.style.transform = "scale(1)";
            }}
          >
            My Bill
          </button>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            style={{
              padding: "12px",
              backgroundColor: "#e74c3c",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              width: "100%",
              fontSize: "16px",
              transition: "background-color 0.3s, transform 0.3s",
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#c0392b";
              e.target.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "#e74c3c";
              e.target.style.transform = "scale(1)";
            }}
          >
            Logout
          </button>
        </div>
      ) : (
        <p style={{ color: "#ecf0f1", fontSize: "18px" }}>Loading...</p>
      )}
    </div>
  );
}

export default Profile;
