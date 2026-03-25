import { httpClient } from "@/lib/http";
import { ICreateOrderPayload } from "./types";

export const orderApi = {
  create: (payload: ICreateOrderPayload) => 
    httpClient("/orders", { method: "POST", body: JSON.stringify(payload) }),
  getAll: () => 
    httpClient<{ items: any[] }>("/orders", { method: "GET" }),
};
