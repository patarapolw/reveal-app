declare global {
  interface Window {
    fetchJSON(url: string, data?: any, method?: string): Promise<Response>
  }
}

const fetchJSON = (url: string, data?: any, method: string = "POST") => fetch(url, {
  method,
  headers: {
    "Content-Type": "application/json"
  },
  body: data ? JSON.stringify(data) : undefined
});

window.fetchJSON = fetchJSON;

export { fetchJSON };
