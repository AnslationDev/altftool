const STORAGE_KEY = "mobile_voting_polls";
const SESSION_KEY = "mobile_voting_session";

export const loadPolls = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const savePolls = (polls) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(polls));
};

export const loadSession = () => {
  try {
    const stored = localStorage.getItem(SESSION_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

export const saveSession = (session) => {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
};
