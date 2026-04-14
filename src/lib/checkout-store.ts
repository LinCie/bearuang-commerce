import { atom } from "nanostores";
import { useStore } from "@nanostores/react";

const STORAGE_KEY = "bearuang_checkout";

export interface ShippingData {
	fullName: string;
	phone: string;
	address: string;
	city: string;
	postalCode: string;
	country: string;
}

export type PaymentMethod =
	| { type: "ewallet"; provider: "gopay" | "ovo" | "dana" }
	| { type: "bank"; provider: "bca" | "bni" | "mandiri" | "bri" }
	| { type: "card" };

export interface CheckoutFormData {
	shipping: ShippingData;
	payment: PaymentMethod | null;
}

interface StoredCheckout extends CheckoutFormData {}

function emptyShipping(): ShippingData {
	return { fullName: "", phone: "", address: "", city: "", postalCode: "", country: "ID" };
}

function loadFromStorage(): StoredCheckout {
	if (typeof window === "undefined") {
		return { shipping: emptyShipping(), payment: null };
	}
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return { shipping: emptyShipping(), payment: null };
		const parsed = JSON.parse(raw) as StoredCheckout;
		return {
			shipping: { ...emptyShipping(), ...parsed.shipping },
			payment: parsed.payment ?? null,
		};
	} catch {
		return { shipping: emptyShipping(), payment: null };
	}
}

function saveToStorage(data: StoredCheckout) {
	if (typeof window === "undefined") return;
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
	} catch {
		// ignore
	}
}

const initial = loadFromStorage();

const $shipping = atom<ShippingData>(initial.shipping);
const $payment = atom<PaymentMethod | null>(initial.payment);

export function updateShipping(data: Partial<ShippingData>) {
	const next = { ...$shipping.get(), ...data };
	$shipping.set(next);
	saveToStorage({ shipping: next, payment: $payment.get() });
}

export function setPaymentMethod(method: PaymentMethod) {
	$payment.set(method);
	saveToStorage({ shipping: $shipping.get(), payment: method });
}

export function clearCheckoutData() {
	$shipping.set(emptyShipping());
	$payment.set(null);
	saveToStorage({ shipping: emptyShipping(), payment: null });
}

export function useCheckoutStore() {
	const shipping = useStore($shipping, { ssr: "initial" });
	const payment = useStore($payment, { ssr: "initial" });

	return { shipping, payment };
}
