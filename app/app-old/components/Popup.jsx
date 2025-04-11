    import React from 'react';
function Popup({ isOpen, closePopup, content, iframeContent }) {
  if (!isOpen) return null; // If the popup is not open, render nothing

  return (
    <div className="popup-overlay">
         <button onClick={closePopup} className="close-btn">X</button>
      <div className="popup-content">
       
        <div>{iframeContent}

        </div>
      </div>
    </div>
  );
}

export default Popup;