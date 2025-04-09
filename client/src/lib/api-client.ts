import { HOST } from "@/utils/constants";
import axios from "axios";


export const apiClient = axios.create({
    baseURL: HOST,
});

export const pyApiClient = axios.create({
    baseURL: `/pyapi`, // Use the proxy defined in vite.config.ts
});