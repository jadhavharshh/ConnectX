export const HOST = import.meta.env.BACKEND_URL;
export const AUTH_API = "api/auth";
export const SIGNUP_API = `${AUTH_API}/sign-up`;
export const LOGIN_API = `${AUTH_API}/sign-in`;
export const GET_USER_INFO = `${AUTH_API}/get-user-info`;
export const VERIFY_OTP_API = `${AUTH_API}/verify-otp`;
export const SEND_OTP_API = `${AUTH_API}/send-otp`;
export const LOGOUT_API = `${AUTH_API}/log-out`;
export const RESET_PASSWORD_API = `${AUTH_API}/reset-password`;

export const IG_API = "api/ig/v1";
export const ADD_INSTAGRAM_PROFILE = `${IG_API}/add-ig-account`;
export const GET_INSTAGRAM_PROFILES = `${IG_API}/get-ig-accounts`;
export const SCRAPE_API = `${IG_API}/scrape-profiles`;