import axiosRoot from "axios";

// Use backend URL from environment
const baseUrl = import.meta.env.VITE_BACKEND_URL;

export const axios = axiosRoot.create({
  baseURL: baseUrl,
});

// Function to set auth token for authentication
export const setAuthToken = (token: string | null) => {
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common["Authorization"];
  }
};

// Generic fetcher function for SWR
export const fetcher = async (url: string) => {
  const { data } = await axios.get(url);
  return data;
};

// Generic fetcher for getting all items (assuming pagination or specific structure)
// Adjust if your API returns items differently
export const fetchAll = async (url: string) => {
  const { data } = await axios.get(url);
  // Assuming the API returns an object with an 'items' array or just the array directly
  return Array.isArray(data) ? data : data.items || [];
};

// Generic fetcher for getting a single item by ID
export const fetchById = async (url: string) => {
  const { data } = await axios.get(url);
  return data;
};

// Generic function for POST requests
export const post = async <T, R = T>(url: string, body: T): Promise<R> => {
  const { data } = await axios.post<R>(url, body);
  return data;
};

// Generic function for PUT requests
export const put = async <T extends { id: number | string }, R = T>(
  url: string,
  body: T
): Promise<R> => {
  const { id, ...values } = body;
  const { data } = await axios.put<R>(`${url}/${id}`, values);
  return data;
};

// Generic function for DELETE requests
export const remove = async (
  url: string,
  id: number | string
): Promise<void> => {
  await axios.delete(`${url}/${id}`);
};

// Generic save function (handles POST or PUT)
export const save = async <T extends { id?: number | string }, R = T>(
  url: string,
  body: T
): Promise<R> => {
  const { id, ...values } = body;
  const response = await axios<R>({
    method: id ? "PUT" : "POST",
    url: `${url}/${id ?? ""}`,
    data: values,
  });
  return response.data;
};
