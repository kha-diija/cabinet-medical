import React from "react";

export default function CustomAlert({ message, onClose }) {
  return (
    <div className="fixed top-5 right-5 bg-blue-600 text-white px-4 py-3 rounded-lg shadow-lg z-50 flex items-center justify-between">
      <span>{message}</span>
      <button onClick={onClose} className="ml-4 font-bold">X</button>
    </div>
  );
}
