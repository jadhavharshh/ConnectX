export const HOST = import.meta.env.VITE_BACKEND_URL;
export const AUTH_API = "api/auth";

export const SEND_SIGNUP_DATA = `${AUTH_API}/send-signup-data`;

export const DATA_API = "api/data";
export const FETCH_USER_INFO = `${DATA_API}/fetch-user-info`;
export const CREATE_ANNOUCEMENT = `${DATA_API}/create-announcement`;