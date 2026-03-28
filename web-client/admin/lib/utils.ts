import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { API_DOMAIN } from "./configs"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getImageUrl(path?: string) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${API_DOMAIN}${path}`;
}

export function getAvatarUrl(path?: string) {
  if (!path) return undefined;
  return getImageUrl(path);
}
