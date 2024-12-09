import React, { useState } from "react";
import "../pages/SecretSantaChat.css";

const Message = ({ message }) => {
  const [showDelete, setShowDelete] = useState(false);

  const deleteMessage = () => {
    console.log("Deleting message: ", message.content);
  };

  return (
    <div
      className={`message ${message.from === "Me" ? "sent" : "received"}`}
      onContextMenu={() => setShowDelete(true)}
      onMouseLeave={() => setShowDelete(false)}
    >
      <span className="message-text">{message.content}</span>
      {showDelete && (
        <button className="delete-message" onClick={deleteMessage}>
          🗑️
        </button>
      )}
    </div>
  );
};

export default Message;
