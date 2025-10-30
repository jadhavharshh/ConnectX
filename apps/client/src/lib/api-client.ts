import { HOST } from "@/utils/constants";
import axios from "axios";


export const apiClient = axios.create({
    baseURL: HOST,
});

// Use an environment variable for the Python backend URL
const PYTHON_API_URL = import.meta.env.VITE_PYTHON_API_URL || "/pyapi";

export const pyApiClient = axios.create({
    baseURL: PYTHON_API_URL,
    withCredentials: true
});