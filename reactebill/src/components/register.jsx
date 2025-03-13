import { createUserWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import { auth, db } from "./firebase"; // Ensure Firestore is initialized
import { setDoc, doc } from "firebase/firestore";
import { toast } from "react-toastify";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [phone, setPhone] = useState("");
  const [consumerNumber, setConsumerNumber] = useState("");
  const [postNumber, setPostNumber] = useState("");
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");
  const [userType, setUserType] = useState(""); // Default to empty
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();

    // Validation checks
    if (!/^\d{10}$/.test(phone)) {
      toast.error("Phone number must be exactly 10 digits", { position: "bottom-center" });
      return;
    }
    if (!/^\d{13}$/.test(consumerNumber)) {
      toast.error("Consumer number must be exactly 13 digits", { position: "bottom-center" });
      return;
    }
    if (userType === "") {
      toast.error("Please select a user type", { position: "bottom-center" });
      return;
    }

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (user) {
        await setDoc(doc(db, "Users", user.uid), {
          email: user.email,
          firstName: fname,
          lastName: lname,
          phone: phone,
          consumerNumber: consumerNumber,
          postNumber: postNumber,
          address: address,
          pincode: pincode,
          userType: userType,
          photo: "",
        });

        toast.success("User Registered Successfully!!", { position: "top-center" });
        window.location.href = "/login"; // Redirect after success
      }
    } catch (error) {
      toast.error(error.message, { position: "bottom-center" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        width: "100vw",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#2c3e50",
        padding: "20px",
      }}
    >
      {/* Ebill Heading */}
      <h1
        style={{
          fontSize: "42px",
          fontWeight: "bold",
          fontFamily: "'Poppins', sans-serif",
          color: "#fff",
          marginBottom: "30px",
          letterSpacing: "1px",
          textTransform: "uppercase",
          textAlign: "center",
        }}
      >
        Ebill
      </h1>

      <form
        onSubmit={handleRegister}
        style={{
          width: "100%",
          maxWidth: "450px",
          backgroundColor: "#34495e",
          borderRadius: "10px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
          padding: "30px",
          textAlign: "center",
        }}
      >
        <h3 style={{ fontSize: "24px", fontWeight: "600", color: "#fff", marginBottom: "20px" }}>
          Sign Up
        </h3>

        {/* Input fields */}
        {[
          { label: "First Name", value: fname, setter: setFname, type: "text" },
          { label: "Last Name", value: lname, setter: setLname, type: "text" },
          { label: "Email Address", value: email, setter: setEmail, type: "email" },
          { label: "Password", value: password, setter: setPassword, type: "password" },
          { label: "Phone Number (10 digits)", value: phone, setter: setPhone, type: "tel" },
          { label: "Consumer Number (13 digits)", value: consumerNumber, setter: setConsumerNumber, type: "text" },
          { label: "Post Number", value: postNumber, setter: setPostNumber, type: "text" },
          { label: "Address", value: address, setter: setAddress, type: "text" },
          { label: "Pincode", value: pincode, setter: setPincode, type: "text" },
        ].map((field, index) => (
          <div className="mb-3" key={index} style={{ marginBottom: "15px" }}>
            <label
              style={{
                display: "block",
                textAlign: "left",
                fontWeight: "500",
                color: "#fff",
                marginBottom: "5px",
              }}
            >
              {field.label}
            </label>
            <input
              type={field.type}
              className="form-control"
              placeholder={field.label}
              value={field.value}
              onChange={(e) => field.setter(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #ddd",
                fontSize: "14px",
                color: "#fff",
                backgroundColor: "#2c3e50",
                outline: "none",
              }}
            />
          </div>
        ))}

        {/* Dropdown for User Type */}
        <div className="mb-3" style={{ marginBottom: "15px" }}>
          <label
            style={{
              display: "block",
              textAlign: "left",
              fontWeight: "500",
              color: "#fff",
              marginBottom: "5px",
            }}
          >
            User Type
          </label>
          <select
            className="form-control"
            value={userType}
            onChange={(e) => setUserType(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #ddd",
              fontSize: "14px",
              color: "#fff",
              backgroundColor: "#2c3e50",
              outline: "none",
              cursor: "pointer",
            }}
          >
            <option value="">Select User Type</option>
            <option value="Residential">Residential</option>
            <option value="Commercial">Commercial</option>
          </select>
        </div>

        {/* Submit Button */}
        <div className="d-grid mb-3" style={{ marginBottom: "20px" }}>
          <button
            type="submit"
            className="btn btn-primary"
            style={{
              width: "100%",
              padding: "12px 20px",
              fontSize: "16px",
              borderRadius: "8px",
              backgroundColor: "#27ae60",
              color: "#fff",
              border: "none",
              cursor: "pointer",
            }}
            disabled={loading}
          >
            {loading ? "Registering..." : "Sign Up"}
          </button>
        </div>

        <p style={{ color: "#fff", fontSize: "14px" }}>
          Already registered?{" "}
          <a href="/login" style={{ color: "#27ae60", fontWeight: "600" }}>
            Login
          </a>
        </p>
      </form>
    </div>
  );
}

export default Register;
