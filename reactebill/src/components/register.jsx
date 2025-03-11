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
  const [loading, setLoading] = useState(false); // For loading state

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (user) {
        await setDoc(doc(db, "Users", user.uid), {
          email: user.email,
          firstName: fname,
          lastName: lname,
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
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#2c3e50", // Dark background for contrast
        margin: "0",
        padding: "0",
      }}
    >
      {/* Ebill Heading */}
      <h1
        style={{
          fontSize: "36px",
          fontWeight: "bold",
          fontFamily: "'Poppins', sans-serif",
          color: "#fff",
          marginBottom: "25px",
          letterSpacing: "1px",
          textTransform: "uppercase",
        }}
      >
        Ebill
      </h1>

      <form
        onSubmit={handleRegister}
        style={{
          maxWidth: "450px",
          width: "100%",
          backgroundColor: "#34495e",
          borderRadius: "10px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
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
                color: "#fff", // White text while typing
                backgroundColor: "#2c3e50", // Dark input background
                outline: "none",
                transition: "all 0.3s ease",
              }}
            />
          </div>
        ))}

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
              transition: "background-color 0.3s ease",
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
