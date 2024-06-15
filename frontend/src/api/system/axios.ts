import axios, { AxiosRequestConfig } from "axios";

const baseURL = process.env.NEXT_PUBLIC_APP_URL;

const ai = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

interface MakeRequestConfig extends AxiosRequestConfig {
  method: "GET" | "POST" | "PATCH" | "DELETE";
}

/**
 * Default implementation of HTTP request.
 */
export const makeRequest = <D>(config: MakeRequestConfig) => ai<D>(config);

/**
 * Makes request with auto-resolving data.
 */
makeRequest.auto = <D>(config: MakeRequestConfig): Promise<D> =>
  makeRequest<D>(config).then((response) => response.data);
