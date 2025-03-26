import React, { useEffect, useState } from "react";
import { auth, db } from "./firebase";
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

function MyProfile() {
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const docRef = doc(db, "Users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const userData = docSnap.data();
            setUserDetails(userData);
            setFormData(userData);
          } else {
            console.log("No user data found");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        console.log("User not authenticated");
        navigate("/login");
      }
      setLoading(false);
    };

    fetchUserData();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        const userRef = doc(db, "Users", user.uid);
        await updateDoc(userRef, formData);

        const readingsQuery = query(collection(db, "Readings"), where("consumerNumber", "==", formData.consumerNumber));
        const querySnapshot = await getDocs(readingsQuery);

        querySnapshot.forEach(async (docSnap) => {
          const readingRef = doc(db, "Readings", docSnap.id);
          await updateDoc(readingRef, formData);
        });

        alert("Profile updated successfully!");
        setUserDetails(formData);
        setIsEditing(false);
      } catch (error) {
        console.error("Error updating profile:", error);
        alert("Failed to update profile.");
      }
    }
  };

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>Ebill</h1>

      {loading ? (
        <p style={{ fontSize: "20px", color: "#2C3E50" }}>Loading...</p>
      ) : userDetails ? (
        <div style={profileBoxStyle}>
          <h2 style={profileNameStyle}>{`${userDetails.firstName} ${userDetails.lastName}`}</h2>

          <p style={infoTextStyle}>
            <strong>User Type:</strong> {userDetails.userType || "N/A"}
          </p>

          {isEditing ? (
            <div style={formStyle}>
              <label>First Name:</label>
              <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} style={inputStyle} />

              <label>Last Name:</label>
              <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} style={inputStyle} />

              <label>User Type:</label>
              <input type="text" name="userType" value={formData.userType || ""} onChange={handleChange} style={inputStyle} />

              <label>Email:</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} style={inputStyle} />

              <label>Phone:</label>
              <input type="text" name="phone" value={formData.phone} onChange={handleChange} style={inputStyle} />

              <label>Consumer Number:</label>
              <input type="text" name="consumerNumber" value={formData.consumerNumber} onChange={handleChange} style={inputStyle} />

              <label>Post Number:</label>
              <input type="text" name="postNumber" value={formData.postNumber} onChange={handleChange} style={inputStyle} />

              <label>Address:</label>
              <input type="text" name="address" value={formData.address} onChange={handleChange} style={inputStyle} />

              <label>Pincode:</label>
              <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} style={inputStyle} />
            </div>
          ) : (
            <div style={infoBoxStyle}>
              <p><strong>Email:</strong> {userDetails.email}</p>
              <p><strong>Phone:</strong> {userDetails.phone}</p>
              <p><strong>Consumer Number:</strong> {userDetails.consumerNumber}</p>
              <p><strong>Post Number:</strong> {userDetails.postNumber}</p>
              <p><strong>Address:</strong> {userDetails.address}</p>
              <p><strong>Pincode:</strong> {userDetails.pincode}</p>
            </div>
          )}

          <div style={buttonContainerStyle}>
            {isEditing ? (
              <button onClick={handleSave} style={saveButtonStyle}>Save</button>
            ) : (
              <button onClick={() => setIsEditing(true)} style={editButtonStyle}>Edit</button>
            )}

            <button onClick={() => navigate(-1)} style={goBackButtonStyle}>
              Go Back
            </button>
          </div>
        </div>
      ) : (
        <p style={{ fontSize: "20px", color: "#2C3E50" }}>No profile data available.</p>
      )}
    </div>
  );
}

// Styling
const containerStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "100vh",
  width: "100vw",
  background: "linear-gradient(135deg, #D4E8F3, #A3C8D9)",
  color: "#333",
  fontFamily: "'Roboto', sans-serif",
  padding: "40px 20px",
};

const titleStyle = {
  fontSize: "36px",
  fontWeight: "600",
  color: "#2C3E50",
  marginBottom: "20px",
  textAlign: "center",
};

const profileBoxStyle = {
  background: "linear-gradient(135deg, #A4D7E6, #79B9CC)",
  borderRadius: "16px",
  boxShadow: "0 8px 20px rgba(0, 0, 0, 0.1)",
  padding: "30px",
  width: "90%",
  maxWidth: "500px",
  transition: "transform 0.3s, box-shadow 0.3s",
  backdropFilter: "blur(6px)",
  color: "#2C3E50",
  textAlign: "center",
};

const profileNameStyle = {
  fontSize: "26px",
  fontWeight: "700",
  color: "#2C3E50",
  marginBottom: "15px",
};

const infoTextStyle = {
  fontSize: "18px",
  color: "#555",
  marginBottom: "15px",
};

const inputStyle = {
  width: "100%",
  padding: "12px",
  margin: "8px 0",
  borderRadius: "8px",
  border: "1px solid #B3C2C8",
  fontSize: "16px",
};

const saveButtonStyle = {
  padding: "12px 30px",
  fontSize: "16px",
  color: "#fff",
  background: "linear-gradient(135deg, #4CAF50, #388E3C)",
  border: "none",
  borderRadius: "25px",
  cursor: "pointer",
};

const editButtonStyle = {
  padding: "12px 30px",
  fontSize: "16px",
  color: "#fff",
  background: "linear-gradient(135deg, #FFC107, #FFA000)",
  border: "none",
  borderRadius: "25px",
  cursor: "pointer",
};

const goBackButtonStyle = {
  padding: "12px 30px",
  fontSize: "16px",
  color: "#fff",
  background: "linear-gradient(135deg, #FF6F61, #D32F2F)",
  border: "none",
  borderRadius: "25px",
  cursor: "pointer",
};

const buttonContainerStyle = {
  display: "flex",
  justifyContent: "space-between",
  marginTop: "30px",
};

const formStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "15px",
};

const infoBoxStyle = {
  display: "block",
  textAlign: "left",
  fontSize: "18px",
  marginBottom: "20px",
};

export default MyProfile;
