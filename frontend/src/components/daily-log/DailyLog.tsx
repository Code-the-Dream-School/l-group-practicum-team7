import { useState } from "react";
import DailyLogForm from "./DailyLogForm";

function DailyLog() {
  const [isOpen, setIsOpen] = useState(false);

  const handleSave = async (data: any) => {
    try {
      console.log("Send to backend:", data);
      const response = await fetch("http://localhost:8080/api/entries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();

      // Check if the response is not OK and throw an error with the message from the backend
      if (!response.ok) {
        throw new Error(result.message || "Failed to save daily log");
      }
      console.log("Response from backend:", result);
      return result;
    } catch (error) {
      console.error("Error sending data to backend:", error);
      // Optionally, you can show an error message to the user here
      throw error;
    }
  };

  return (
    <div>
      <button onClick={() => setIsOpen(true)}>Open Daily Log</button>

      {isOpen && (
        <DailyLogForm onSave={handleSave} onClose={() => setIsOpen(false)} />
      )}
    </div>
  );
}

export default DailyLog;
