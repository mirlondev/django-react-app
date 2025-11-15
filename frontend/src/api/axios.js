import axios from "axios";

/*const instance = axios.create({
  baseURL: "http://127.0.0.1:8000/api/", // backend Django
  headers: {
    "Content-Type": "application/json",
  },
});*/
const instance = axios.create({
  baseURL: "https://backend-support-production.up.railway.app/api/", 
  headers: {
    "Content-Type": "application/json",
  },
});

// Ajouter token si présent
instance.interceptors.request.use(config => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
instance.interceptors.request.use((config) => {
  if (config.url && !config.url.endsWith('/')) {
    config.url += '/';
  }
  return config;
});
export default instance;
