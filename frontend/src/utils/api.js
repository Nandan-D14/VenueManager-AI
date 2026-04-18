const API_BASE = 'http://localhost:8000/api';

export const login = async (payload) => {
  const res = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Login failed');
  }
  return res.json();
};

export const register = async (payload) => {
  const res = await fetch(`${API_BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Registration failed');
  }
  return res.json();
};

export const createSession = async () => {
  const res = await fetch(`${API_BASE}/session/create`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to create session');
  const data = await res.json();
  return data.session_id;
};

export const getSessionId = async () => {
  let sessionId = localStorage.getItem('session_id');
  if (!sessionId) {
    sessionId = await createSession();
    localStorage.setItem('session_id', sessionId);
  }
  return sessionId;
};

export const generateBlueprint = async (sessionId, payload) => {
  const res = await fetch(`${API_BASE}/blueprint/generate/${sessionId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to generate blueprint');
  return res.json();
};

export const validateBlueprint = async (sessionId, approved) => {
  const res = await fetch(`${API_BASE}/blueprint/validate/${sessionId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ approved })
  });
  if (!res.ok) throw new Error('Failed to validate blueprint');
  return res.json();
};

export const getState = async (sessionId) => {
  const res = await fetch(`${API_BASE}/state/${sessionId}`);
  if (res.status === 404) {
    localStorage.removeItem('session_id');
    window.location.reload(); // Force refresh to get a new session
    return;
  }
  if (!res.ok) throw new Error('Failed to get state');
  return res.json();
};

export const failTask = async (sessionId, taskId) => {
  const res = await fetch(`${API_BASE}/tasks/${sessionId}/${taskId}/fail`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to report issue');
  return res.json();
};

export const chat = async (message, sessionId = null) => {
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, session_id: sessionId })
  });
  if (!res.ok) throw new Error('Failed to send message');
  return res.json();
};

export const adminChat = async (sessionId, message, imageBase64) => {
  const res = await fetch(`${API_BASE}/admin/chat/${sessionId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, image_base64: imageBase64, session_id: sessionId })
  });
  if (!res.ok) throw new Error('Failed to send message');
  return res.json();
};
