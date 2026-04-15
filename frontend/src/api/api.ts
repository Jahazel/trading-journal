import {
  LoginCredentials,
  AuthResponse,
  SignupData,
  SignupResponse,
} from "../types/auth.types";
import axios from "axios";
import {
  CreateTradeEntryData,
  Stats,
  TradeEntry,
} from "../types/tradeEntry.types";
import {
  CreateNoTradeEntryData,
  NoTradeEntry,
} from "../types/noTradeEntry.types";
import { Message } from "../types/common.types";

const api = axios.create({
  baseURL: "http://localhost:3000/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) config.headers.Authorization = `Bearer ${token}`;

  return config;
});

export const login = async (
  credentials: LoginCredentials,
): Promise<AuthResponse> => {
  try {
    const response = await api.post("/auth/login", credentials);

    return response.data;
  } catch (error) {
    console.error("Error logging in:", error);
    throw error;
  }
};

export const signup = async (userData: SignupData): Promise<SignupResponse> => {
  try {
    const response = await api.post("/auth/signup", userData);

    return response.data;
  } catch (error) {
    console.error("Error signing up:", error);
    throw error;
  }
};

export const getTradeEntries = async (): Promise<TradeEntry[]> => {
  try {
    const response = await api.get("/trades-entry");

    return response.data;
  } catch (error) {
    console.error("Error fetching jountal entries:", error);
    throw error;
  }
};

export const getTradeEntry = async (id: string): Promise<TradeEntry> => {
  try {
    const response = await api.get(`/trades-entry/${id}`);

    return response.data;
  } catch (error) {
    console.error("Error fetching jountal entry:", error);
    throw error;
  }
};

export const createTradeEntry = async (
  tradeData: CreateTradeEntryData,
): Promise<TradeEntry> => {
  try {
    const response = await api.post("/trades-entry", tradeData);

    return response.data;
  } catch (error) {
    console.error("Error saving jountal entry:", error);
    throw error;
  }
};

export const updateTradeEntry = async ({
  id,
  ...fields
}: { id: string } & Partial<CreateTradeEntryData>): Promise<TradeEntry> => {
  try {
    const response = await api.patch(`/trades-entry/${id}`, fields);

    return response.data;
  } catch (error) {
    console.error("Error updating trade entry:", error);
    throw error;
  }
};

export const deleteTradeEntry = async (id: string): Promise<Message> => {
  try {
    const response = await api.delete(`/trades-entry/${id}`);

    return response.data;
  } catch (error) {
    console.error("Error deleting trade entry:", error);
    throw error;
  }
};

export const getStats = async (): Promise<Stats> => {
  try {
    const response = await api.get(`/trades-entry/stats`);

    return response.data;
  } catch (error) {
    console.error("Error fetching trading stats:", error);
    throw error;
  }
};

export const getNoTradeEntries = async (): Promise<NoTradeEntry[]> => {
  try {
    const response = await api.get(`/no-trade-entries`);

    return response.data;
  } catch (error) {
    console.error("Error fetching jountal entries:", error);
    throw error;
  }
};

export const getNoTradeEntry = async (id: string): Promise<NoTradeEntry> => {
  try {
    const response = await api.get(`/no-trade-entries/${id}`);

    return response.data;
  } catch (error) {
    console.error("Error fetching jountal entry:", error);
    throw error;
  }
};

export const createNoTradeEntry = async (
  entryData: CreateNoTradeEntryData,
): Promise<NoTradeEntry> => {
  try {
    const response = await api.post(`/no-trade-entries`, entryData);

    return response.data;
  } catch (error) {
    console.error("Error saving jountal entry:", error);
    throw error;
  }
};

export const updateNoTradeEntry = async ({
  id,
  ...fields
}: { id: string } & Partial<CreateNoTradeEntryData>): Promise<NoTradeEntry> => {
  try {
    const response = await api.patch(`/no-trade-entries/${id}`, fields);

    return response.data;
  } catch (error) {
    console.error("Error updating journal entry:", error);
    throw error;
  }
};

export const deleteNoTradeEntry = async (id: string): Promise<Message> => {
  try {
    const response = await api.delete(`/no-trade-entries/${id}`);

    return response.data;
  } catch (error) {
    console.error("Error deleting journal entry:", error);
    throw error;
  }
};
