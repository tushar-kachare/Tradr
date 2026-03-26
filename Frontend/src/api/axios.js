import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:3000/api", // your backend
  withCredentials: true, // important for auth
});

export default API;