import { signInWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import { auth } from "./firebase";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("User logged in successfully", { position: "top-center" });
      navigate("/profile");
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
        backgroundColor: "#2c3e50", // Dark background like Register page
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
        onSubmit={handleSubmit}
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
          Login
        </h3>

        {/* Input fields */}
        {[
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
            {loading ? "Logging in..." : "Login"}
          </button>
        </div>

        <p style={{ color: "#fff", fontSize: "14px" }}>
          New user?{" "}
          <a href="/register" style={{ color: "#27ae60", fontWeight: "600" }}>
            Register Here
          </a>
        </p>
      </form>
    </div>
  );
}

export default Login;
