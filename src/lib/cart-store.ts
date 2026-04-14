import { atom, computed } from "nanostores";
import { useStore } from "@nanostores/react";

const STORAGE_KEY = "bearuang_cart";

export interface CartItem {
	variantId: string;
	productId: string;
	productName: string;
	variantName: string;
	price: number;
	quantity: number;
	sku: string | null;
	image?: {
		url: string;
		altText: string | null;
	};
}

interface StoredCart {
	items: CartItem[];
	couponCode: string | null;
	couponPercent: number;
}

function loadFromStorage(): StoredCart {
	if (typeof window === "undefined") {
		return { items: [], couponCode: null, couponPercent: 0 };
	}
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return { items: [], couponCode: null, couponPercent: 0 };
		const parsed = JSON.parse(raw) as StoredCart & { couponDiscount?: number };
		if (parsed.couponPercent === undefined && parsed.couponDiscount !== undefined) {
			parsed.couponPercent = parsed.couponDiscount;
		}
		return {
			items: parsed.items ?? [],
			couponCode: parsed.couponCode ?? null,
			couponPercent: parsed.couponPercent ?? 0,
		};
	} catch {
		return { items: [], couponCode: null, couponPercent: 0 };
	}
}

function saveToStorage(data: StoredCart) {
	if (typeof window === "undefined") return;
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
	} catch {
		// ignore
	}
}

const initial = loadFromStorage();

export const $cartItems = atom<CartItem[]>(initial.items);
export const $couponCode = atom<string | null>(initial.couponCode);
const $couponPercent = atom<number>(initial.couponPercent);

function persistItems(items: CartItem[]) {
	saveToStorage({ items, couponCode: $couponCode.get(), couponPercent: $couponPercent.get() });
}

function persistCoupon(code: string | null, percent: number) {
	saveToStorage({ items: $cartItems.get(), couponCode: code, couponPercent: percent });
}

export const $cartItemCount = computed($cartItems, (items) =>
	items.reduce((sum, i) => sum + i.quantity, 0),
);

export const $cartSubtotal = computed($cartItems, (items) =>
	items.reduce((sum, i) => sum + i.price * i.quantity, 0),
);

export const $shippingCost = computed($cartSubtotal, (subtotal) =>
	subtotal > 1500000 ? 0 : subtotal > 0 ? 150000 : 0,
);

export const $taxAmount = computed($cartSubtotal, (subtotal) => subtotal * 0.08);

export const $discountAmount = computed(
	[$cartSubtotal, $couponPercent],
	(subtotal, percent) => subtotal * (percent / 100),
);

export const $cartTotal = computed(
	[$cartSubtotal, $shippingCost, $taxAmount, $discountAmount],
	(subtotal, shipping, tax, discount) => subtotal + shipping + tax - discount,
);

export function addCartItem(item: Omit<CartItem, "quantity">, quantity = 1) {
	const current = $cartItems.get();
	const existing = current.find((i) => i.variantId === item.variantId);
	let next: CartItem[];
	if (existing) {
		next = current.map((i) =>
			i.variantId === item.variantId ? { ...i, quantity: i.quantity + quantity } : i,
		);
	} else {
		next = [...current, { ...item, quantity }];
	}
	$cartItems.set(next);
	persistItems(next);
}

export function removeCartItem(variantId: string) {
	const next = $cartItems.get().filter((i) => i.variantId !== variantId);
	$cartItems.set(next);
	persistItems(next);
}

export function updateCartQuantity(variantId: string, quantity: number) {
	let next: CartItem[];
	if (quantity <= 0) {
		next = $cartItems.get().filter((i) => i.variantId !== variantId);
	} else {
		next = $cartItems.get().map((i) => (i.variantId === variantId ? { ...i, quantity } : i));
	}
	$cartItems.set(next);
	persistItems(next);
}

export function clearCart() {
	$cartItems.set([]);
	persistItems([]);
}

export function applyCoupon(code: string, percent: number) {
	$couponCode.set(code);
	$couponPercent.set(percent);
	persistCoupon(code, percent);
}

export function removeCoupon() {
	$couponCode.set(null);
	$couponPercent.set(0);
	persistCoupon(null, 0);
}

export function useCartStore() {
	const items = useStore($cartItems, { ssr: "initial" });
	const itemCount = useStore($cartItemCount, { ssr: "initial" });
	const subtotal = useStore($cartSubtotal, { ssr: "initial" });
	const shipping = useStore($shippingCost, { ssr: "initial" });
	const tax = useStore($taxAmount, { ssr: "initial" });
	const discount = useStore($discountAmount, { ssr: "initial" });
	const totalPrice = useStore($cartTotal, { ssr: "initial" });
	const couponCode = useStore($couponCode, { ssr: "initial" });

	return { items, itemCount, subtotal, shipping, tax, discount, totalPrice, couponCode };
}
