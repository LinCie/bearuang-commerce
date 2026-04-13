import { atom, computed } from "nanostores";
import { useStore } from "@nanostores/react";

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

const $cartItems = atom<CartItem[]>([]);

export const $cartItemCount = computed($cartItems, (items) =>
	items.reduce((sum, i) => sum + i.quantity, 0),
);

export const $cartTotal = computed($cartItems, (items) =>
	items.reduce((sum, i) => sum + i.price * i.quantity, 0),
);

export function addCartItem(item: Omit<CartItem, "quantity">, quantity = 1) {
	const current = $cartItems.get();
	const existing = current.find((i) => i.variantId === item.variantId);
	if (existing) {
		$cartItems.set(
			current.map((i) =>
				i.variantId === item.variantId ? { ...i, quantity: i.quantity + quantity } : i,
			),
		);
	} else {
		$cartItems.set([...current, { ...item, quantity }]);
	}
}

export function removeCartItem(variantId: string) {
	$cartItems.set($cartItems.get().filter((i) => i.variantId !== variantId));
}

export function updateCartQuantity(variantId: string, quantity: number) {
	if (quantity <= 0) {
		removeCartItem(variantId);
	} else {
		$cartItems.set(
			$cartItems.get().map((i) => (i.variantId === variantId ? { ...i, quantity } : i)),
		);
	}
}

export function clearCart() {
	$cartItems.set([]);
}

export function useCartStore() {
	const items = useStore($cartItems, { ssr: "initial" });
	const itemCount = useStore($cartItemCount, { ssr: "initial" });
	const totalPrice = useStore($cartTotal, { ssr: "initial" });

	return { items, itemCount, totalPrice };
}
