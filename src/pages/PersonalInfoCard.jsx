import React, { useState } from "react";

const PersonalInfoCard = ({ user, form, onChange, onSave, onCancel, saving = false }) => {
    const [isEditing, setIsEditing] = useState(false);

    const handleEditClick = () => setIsEditing(true);
    const handleCancelClick = () => {
        onCancel();
        setIsEditing(false);
    };
    const handleSaveClick = async () => {
        await onSave();
        setIsEditing(false);
    };

    return (
        <div className="bg-white rounded-lg shadow border border-gray-100">
            <div className="font border-b border-gray-200 p-4">
                Personal Information
            </div>

            {!isEditing ? (
                <div className="p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <div className="text-gray-500  mb-3">First Name</div>
                            <p>{user.firstName}</p>
                        </div>
                        <div>
                            <div className="text-gray-500 mb-3">Last Name</div>
                            <p>{user.lastName}</p>
                        </div>
                        <div>
                            <div className="text-gray-500 mb-3">Role</div>
                            <p>{user.role}</p>
                        </div>
                        <div>
                            <div className="text-gray-500 mb-3">Email Address</div>
                            <p>{user.email}</p>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-6">
                        <button
                            className="bg-teal-700 text-white px-5 py-2 rounded hover:bg-teal-800 transition"
                            onClick={handleEditClick}
                        >
                            Edit
                        </button>
                    </div>
                </div>
            ) : (
                /* Edit Mode */
                <div className="p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <div className="text-gray-500  mb-3">First Name</div>
                            <input
                                type="text"
                                name="firstName"
                                value={form.firstName}
                                onChange={onChange}
                                className="w-full border border-gray-300 rounded px-3 py-2  
                  focus:outline-none focus:ring-2 focus:ring-teal-500"
                            />
                        </div>
                        <div>
                            <div className="text-gray-500  mb-3">Last Name</div>
                            <input
                                type="text"
                                name="lastName"
                                value={form.lastName}
                                onChange={onChange}
                                className="w-full border border-gray-300 rounded px-3 py-2  
                  focus:outline-none focus:ring-2 focus:ring-teal-500"
                            />
                        </div>
                        <div>
                            <div className="text-gray-500  mb-3">Role</div>
                            <p className=" text-gray-700">{user.role}</p>
                        </div>
                        <div>
                            <div className="text-gray-500  mb-3">Email Address</div>
                            <p className=" text-gray-700">{user.email}</p>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-6">
                        <button
                            className="bg-gray-100 text-gray-700 px-5 py-2 rounded hover:bg-gray-200 transition"
                            onClick={handleCancelClick}
                        >
                            Cancel
                        </button>
                        <button
                            className="bg-teal-700 text-white px-5 py-2 rounded hover:bg-teal-800 transition disabled:opacity-60"
                            onClick={handleSaveClick}
                            disabled={saving}
                        >
                            {saving ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PersonalInfoCard;
