import React, { useEffect } from "react";
import "./Popup.css";

const Popup = ({ message, visible, onClose }) => {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onClose();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <div className="popup">
      <p>{message}</p>
    </div>
  );
};

export default Popup;