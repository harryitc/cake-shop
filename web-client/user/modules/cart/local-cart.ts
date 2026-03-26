import { ICartItemDTO, ICartResponse } from "./types";
import { cakeApi } from "../cakes/api";

const LOCAL_CART_KEY = "guest_cart";

export const getLocalCart = (): ICartResponse => {
  if (typeof window === "undefined") return { items: [], total: 0 };
  const data = localStorage.getItem(LOCAL_CART_KEY);
  if (!data) return { items: [], total: 0 };
  try {
    return JSON.parse(data);
  } catch {
    return { items: [], total: 0 };
  }
};

export const saveLocalCart = (cart: ICartResponse) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(cart));
};

export const addToLocalCart = async (cakeId: string, quantity: number = 1) => {
  const cart = getLocalCart();
  const existingItemIndex = cart.items.findIndex((item) => item.cake._id === cakeId);

  if (existingItemIndex > -1) {
    // Update quantity
    cart.items[existingItemIndex].quantity += quantity;
    cart.items[existingItemIndex].subtotal = 
      cart.items[existingItemIndex].quantity * cart.items[existingItemIndex].cake.price;
  } else {
    // Add new item - need to fetch cake info
    const cake = await cakeApi.getById(cakeId);
    const newItem: ICartItemDTO = {
      id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      cake: cake,
      quantity: quantity,
      subtotal: cake.price * quantity,
    };
    cart.items.push(newItem);
  }

  // Recalculate total
  cart.total = cart.items.reduce((sum, item) => sum + item.subtotal, 0);
  saveLocalCart(cart);
  return cart;
};

export const updateLocalCartItemQuantity = (itemId: string, quantity: number) => {
  const cart = getLocalCart();
  const itemIndex = cart.items.findIndex((item) => item.id === itemId);
  if (itemIndex > -1) {
    cart.items[itemIndex].quantity = quantity;
    cart.items[itemIndex].subtotal = quantity * cart.items[itemIndex].cake.price;
    cart.total = cart.items.reduce((sum, item) => sum + item.subtotal, 0);
    saveLocalCart(cart);
  }
  return cart;
};

export const removeFromLocalCart = (itemId: string) => {
  const cart = getLocalCart();
  cart.items = cart.items.filter((item) => item.id !== itemId);
  cart.total = cart.items.reduce((sum, item) => sum + item.subtotal, 0);
  saveLocalCart(cart);
  return cart;
};

export const clearLocalCart = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(LOCAL_CART_KEY);
};
