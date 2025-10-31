import http from './http';

export async function registerCustomer(payload) {
  console.log('Registering customer with payload:', payload);
  console.log("payload", payload)

  const form = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    form.append(key, value);
  });

  return await http.post('/mfc/register-customer', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}


export function serializeCustomerPayload(answers) {
  const payload = { ...answers };
  if (typeof payload.dob === 'string') {
    const m = payload.dob.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (m) {
      const [, dd, mm, yyyy] = m;
      payload.dob = `${yyyy}-${mm}-${dd}`;
    }
  }
  if (typeof payload.pain_scale === 'string' && payload.pain_scale !== '') {
    const n = Number(payload.pain_scale);
    if (!Number.isNaN(n)) payload.pain_scale = n;
  }
  if (typeof payload.rate_experience === 'string' && payload.rate_experience !== '') {
    const n = Number(payload.rate_experience);
    if (!Number.isNaN(n)) payload.rate_experience = n;
  }


  if (Array.isArray(payload.files) && payload.files.length === 0) {
    delete payload.files;
  }


  Object.keys(payload).forEach((key) => {
    if (payload[key] === '') delete payload[key];
  });

  return payload;
}

// Login user
export async function loginUser(payload, useForm = true) {
  if (useForm) {
    const formBody = new URLSearchParams();
    formBody.append('username', payload.username);
    formBody.append('password', payload.password);
    return await http.post('/auth/login', formBody, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
  }
  return await http.post('/auth/login', payload);
}

// Get current authenticated user
export async function getMe() {
  return await http.get('/auth/me');
}


// Upload avatar (profile picture)
export async function uploadAvatar(file) {
  const formData = new FormData();
  formData.append("file", file); // <-- backend expects "file"
  return await http.patch('/auth/update-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
}

// Update first and last name for the current user
export async function updateName({ firstName, lastName }) {
  return await http.patch('/auth/update-name', {
    first_name: firstName,
    last_name: lastName,
  });
}

//Change password
export const changePassword = async (newPassword) => {
  return await http.patch('/auth/change-password', { new_password: newPassword });
};

// Get AllUsers data
export const getUsers = async () => {
  const data = await http.get('/auth/my-created-users');
  return data.map((user) => ({
    id: user.id,
    name: `${user.first_name} ${user.last_name}`,
    email: user.username,
    role: user.role,
    status: "Active",
  }));
};

// Add new user
export const addUser = async (form) => {
  const payload = {
    username: form.email,
    password: form.password,
    first_name: form.firstName,
    last_name: form.lastName,
    role: form.role,
  };

  const user = await http.post('/auth/create-staff-user', payload);
  // The backend may not echo all submitted fields immediately; use fallbacks
  const firstName = user.first_name ?? form.firstName ?? '';
  const lastName = user.last_name ?? form.lastName ?? '';
  const username = user.username ?? form.email ?? '';
  const role = user.role ?? form.role ?? '';

  return {
    id: user.id,
    name: `${firstName} ${lastName}`.trim(),
    email: username,
    role,
    status: "Active",
  };
};

// Update user API
export const updateUser = async (userData) => {
  return await http.put('/auth/update-staff-user', userData);
};

// Logout 
export function logout() {
  try {
    localStorage.removeItem('token');
  } catch (e) {
    console.error('Failed to remove token from localStorage', e);
  }
}

// Delete user API
export const deleteUser = async (userId) => {
  return await http.delete(`/auth/delete-staff-user/${userId}`);
};

// get all data form triage board 
export const getTriageBoard = async () => {
  return await http.get('/dashboard/triage-board');
};

// get all data form triage board By ID
export const getTriageBoardByID = async (referral_id) => {
  return await http.get(`/dashboard/referral/${referral_id}`);
};

// get all data form dashboard analytics
export const getDashboardAnalytics = async () => {
  return await http.get('/dashboard/analytics');
};

// get all data form dashboard settings
export const getDashboardSettings = async () => {
  return await http.get('/dashboard/settings');
};

// get all data form dashboard export
export const getDashboardExport = async () => {
  return await http.get('/dashboard/export');
};

// perform quick action from dashboard
export const performQuickAction = async (actionData) => {
  const data = await http.post('/dashboard/quick-action', actionData);
  console.log('Quick action performed:', data);
  return data;
};

// patch customer files
export const patchCustomerFiles = async (customerId, filesData) => {
  const data = await http.patch(`/dashboard/customers/${customerId}/files`, filesData);
  console.log('Files updated:', data);
  return data;
};

// patch customer notes
export const patchCustomerNotes = async (customerId, notesData) => {
  const data = await http.patch(`/dashboard/customers/${customerId}/notes`, notesData);
  console.log('Notes updated:', data);
  return data;
};



// fetch customer notes
export const getCustomerNotes = async (customerId) => {
  try {
    const response = await http.get(`/dashboard/customers/${customerId}/notes`);
    // depending on http wrapper this may be the axios response or already data; try to normalize
    console.log('Fetched notes (raw):', response?.data ?? response);
    return response?.data ?? response;
  } catch (error) {
    console.error('Error fetching notes:', error.response?.data || error.message);
    throw error;
  }
};


// update customer status
export const updateCustomerStatus = async (customerId, status) => {
  const data = await http.patch(`/dashboard/customers/${customerId}/status`, { status });
  console.log('Status updated:', data);
  return data;
};


