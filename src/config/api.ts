const API_BASE_URL = "https://localhost:3000" //import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  console.warn("⚠️ VITE_API_BASE_URL is not defined");
}

export default API_BASE_URL;
