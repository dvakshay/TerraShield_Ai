import axios from "axios";

export const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

export async function getMonitoring(locationId: string) {
  const response = await api.get(`/monitoring/${locationId}`);
  return response.data;
}

export async function getLocations() {
  const response = await api.get("/locations");
  return response.data;
}

export async function getLocation(locationId: string) {
  const response = await api.get(`/locations/${locationId}`);
  return response.data;
}