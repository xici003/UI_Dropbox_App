import { useEffect, useState } from "react";

function Toast({ message, duration = 3000, onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setVisible(true);

      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(() => {
          if (onClose) onClose();
        }, 300); // delay cho animation biến mất
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div
      className={`fixed top-6 right-6 z-50 transition-all duration-300 ease-in-out transform ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
      }`}
    >
      <div className="alert alert-success shadow-lg">
        <span>{message}</span>
      </div>
    </div>
  );
}

export default Toast;
