import { useToastStore } from "../stores/toast";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
export type BodyT = string | number | boolean | null | BodyT[] | { [key: string]: BodyT };

/**
 * A wrapper around fetch that handles errors and alerts the messages to the user.
 *
 * @param url The url to fetch from
 * @param method The HTTP method to use
 * @param options.query The query parameters to add to the url
 * @param options.body The body to send
 * @param options.alert Whether to alert the user of the response message (default: true)
 * @returns The response body
 * @throws An error if the response is not ok
 */
export async function fetchy(
  url: string,
  method: HttpMethod,
  options?: {
    query?: Record<string, string>;
    body?: BodyT;
    alert?: boolean;
  },
) {
  options = options ?? {};
  options.alert = options.alert ?? true;

  // Build query string
  const queryString = new URLSearchParams(options.query).toString();
  const fullUrl = `${url}?${queryString}`;

  if ((method === "GET" || method === "DELETE") && options.body) {
    throw new Error(`Cannot have a body with a ${method} request`);
  }

  // Set up fetch options
  const fetchOptions: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      credentials: "same-origin",
    },
  };

  // // Handle the body
  // if (options.body instanceof FormData) {
  //   fetchOptions.body = options.body;
  //   // Do not set the Content-Type header; the browser will handle it for FormData
  // } else if (options.body) {
  //   fetchOptions.body = JSON.stringify(options.body);
  //   fetchOptions.headers!["Content-Type"] = "application/json";
  // }

  if (options.body) {
    fetchOptions.body = JSON.stringify(options.body);
  }

  // Perform fetch request
  const response = await fetch(fullUrl, fetchOptions);
  const result = await response.json();

  // Display toast message if enabled
  if (options.alert && result.msg) {
    useToastStore().showToast({ message: result.msg, style: response.ok ? "success" : "error" });
  }

  // Throw an error if the response is not ok
  if (!response.ok) {
    throw new Error(result.msg ?? "Something went wrong");
  }

  return result;
}
