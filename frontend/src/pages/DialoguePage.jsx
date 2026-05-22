import { useEffect, useState } from "react";

function DialoguePage() {
  const [message, setMessage] = useState("Dialogue page works!");

  return (
    <div>
      <h1>Dialogue System</h1>

      <p>{message}</p>
    </div>
  );
}

export default DialoguePage;