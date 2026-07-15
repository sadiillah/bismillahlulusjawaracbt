import axios from "axios";

const baseURL = import.meta.env.VITE_SANCTUM_BASE_URL || "http://localhost:8000";

const csrfClient = axios.create({
  baseURL,
  withCredentials: true,
  withXSRFToken: true,
});

export default csrfClient;