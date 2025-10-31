import React from 'react';

const Deactivate = ({ isOpen, onClose, onConfirm, user, isLoading }) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    
    if (e.target === e.currentTarget && !isLoading) onClose && onClose();
  };

  return (
    <div onClick={handleOverlayClick} className='fixed inset-0 bg-gray-300/60 flex items-center justify-center z-50'>
     <div className="bg-white p-4 sm:p-6 rounded-xl w-full max-w-lg">
        <h2 className="text-xl font-semibold mb-4">Deactivate User</h2>
        <p>
          {user ? (
            <>Are you sure you want to deactivate <strong>{user.name}</strong> ({user.email})?</>
          ) : (
            'This action will disable the user account and they will no longer be able to access it.'
          )}
        </p>
        <div className="mt-4 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded border hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`px-4 py-2 rounded bg-[#125A67] text-white hover:bg-teal-800 transition ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              {isLoading ? 'Deactivating...' : 'Confirm'}
            </button>
        </div>
     </div>
    </div>
  );
}

export default Deactivate;
