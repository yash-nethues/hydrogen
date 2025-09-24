import {useEffect} from 'react';

export default function Modal({show, onClose, children, width = 'max-w-lg', headerContent, footerContent, headerClasses, footerClasses }) {
  useEffect(() => {
    if (show) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [show]);

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-lg shadow-lg py-2.5 flex flex-col ${width} max-h-[90vh] relative`}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="absolute hover:h-10 rounded-b-full p-px flex items-end justify-center top-0 right-2.5 w-5 h-j30 transition-all bg-blue" onClick={onClose}>
          <span className='text-sm w-4 h-4 bg-white text-blue flex rounded-full'>
              <span className='m-auto leading-none'>&times;</span>
          </span>  
        </button>
         {/* Header */}
        <div className={`modal-header px-6 pt-j30 pb-2.5 ${headerClasses}`}>
             {headerContent}            
        </div>
        {/* Body */}
        <div className="modal-content px-6 flex-grow overflow-auto">
            {children}
        </div>
        {/* Footer */}
        {footerContent && (
          <div className={`modal-footer p-6 ${footerClasses}`}>{footerContent}</div>
        )}
      </div>
    </div>
  );
}
