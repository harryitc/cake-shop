import { httpClient } from "@/lib/http";
import { ICreateOrderPayload, IOrderDTO } from "./types";

export const orderApi = {
  create: (payload: ICreateOrderPayload) => 
    httpClient<{ order: IOrderDTO }>("/orders", { method: "POST", body: JSON.stringify(payload) }),
  getAll: () => 
    httpClient<{ items: IOrderDTO[] }>("/orders", { method: "GET" }),
};
