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
        HomePage
      </h1>

      {userDetails ? (
        <div
          style={{
            width: "90%",
            maxWidth: "500px",
            padding: "30px",
            borderRadius: "20px",
            background: "rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(10px)",
            border: "2px solid rgba(255, 255, 255, 0.2)",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
            textAlign: "center",
            transition: "transform 0.3s ease",
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
            Welcome, {userDetails.firstName}!
          </h3>

          {/* Buttons Section */}
          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            <Button onClick={() => navigate("/my-profile")} color1="#4B0082" color2="#8A2BE2">
              Show Profile
            </Button>

            {/* Added Text Above "Enter Reading" Button */}
            <p style={{ color: "#fff", fontSize: "16px", fontWeight: "500", marginBottom: "5px" }}>
              Enter your initial reading
            </p>
            <Button onClick={() => navigate("/lcd")} color1="#008000" color2="#00FF7F">
              Enter Reading
            </Button>

            <Button onClick={() => navigate("/my-bill")} color1="#FF4500" color2="#FF6347">
              My Bill
            </Button>

            <Button onClick={handleLogout} color1="#DC143C" color2="#FF0000">
              Logout
            </Button>
          </div>
        </div>
      ) : (
        <p style={{ color: "#fff", fontSize: "18px" }}>Loading...</p>
      )}
    </div>
  );
}

// Custom Button Component with Hover Effect
const Button = ({ onClick, color1, color2, children }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        padding: "12px",
        background: `linear-gradient(135deg, ${color1}, ${color2})`,
        color: "white",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        width: "100%",
        fontSize: "16px",
        fontWeight: "600",
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
        textTransform: "uppercase",
        letterSpacing: "0.5px",
        outline: "none",
        display: "inline-block",
        textAlign: "center",
        textDecoration: "none",
        margin: "0 auto",
        transform: isHovered ? "scale(1.08)" : "scale(1)",
        boxShadow: isHovered ? "0 6px 15px rgba(0, 0, 0, 0.3)" : "0 4px 10px rgba(0, 0, 0, 0.2)",
      }}
    >
      {children}
    </button>
  );
};

export default Profile;
