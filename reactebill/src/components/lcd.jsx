import React, { useState } from "react";

function LCD() {
  const [port, setPort] = useState(null);
  const [text, setText] = useState("");

  const connectToArduino = async () => {
    try {
      const serialPort = await navigator.serial.requestPort();
      await serialPort.open({ baudRate: 9600 });
      setPort(serialPort);
      alert("Connected to Arduino!");
    } catch (error) {
      alert("Error connecting to Arduino: " + error.message);
    }
  };

  const sendTextToArduino = async () => {
    if (!port) {
      alert("Connect to Arduino first!");
      return;
    }

    const writer = port.writable.getWriter();
    const data = new TextEncoder().encode(text + "\n"); // Encode text
    await writer.write(data);
    writer.releaseLock();
    alert("Text sent to Arduino!");
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>React to Arduino LCD</h1>
      <button onClick={connectToArduino}>Connect to Arduino</button>
      <br />
      <input
        type="text"
        placeholder="Enter text"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button onClick={sendTextToArduino}>Send to LCD</button>
    </div>
  );
}

export default LCD;
