"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Info, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { PaymentMethods } from "@/components/checkout/payment-methods";
import {
	$cartItems,
	$shippingCost,
	$taxAmount,
	$discountAmount,
	$cartSubtotal,
	$cartTotal,
	$couponCode,
	clearCart,
	type CartItem,
} from "@/lib/cart-store";
import {
	useCheckoutStore,
	updateShipping,
	setPaymentMethod,
	clearCheckoutData,
	type ShippingData,
	type PaymentMethod,
} from "@/lib/checkout-store";
import { formatCurrency } from "@/lib/currency";
import { useStore } from "@nanostores/react";

type ShippingErrors = Partial<Record<keyof ShippingData, string>>;

const FREE_SHIPPING_THRESHOLD = 1500000;

function getPaymentLabel(payment: PaymentMethod | null): string {
	if (!payment) return "—";
	if (payment.type === "ewallet") {
		const labels: Record<string, string> = { gopay: "GoPay", ovo: "OVO", dana: "Dana" };
		return labels[payment.provider] ?? payment.provider;
	}
	if (payment.type === "bank") {
		const labels: Record<string, string> = {
			bca: "BCA",
			bni: "BNI",
			mandiri: "Mandiri",
			bri: "BRI",
		};
		return `Transfer ${labels[payment.provider] ?? payment.provider}`;
	}
	return "Kartu Kredit / Debit";
}

export function CheckoutPage() {
	const items = useStore($cartItems);
	const subtotal = useStore($cartSubtotal);
	const shipping = useStore($shippingCost);
	const tax = useStore($taxAmount);
	const discount = useStore($discountAmount);
	const totalPrice = useStore($cartTotal);
	const couponCode = useStore($couponCode);

	const { shipping: shippingData, payment } = useCheckoutStore();

	const [errors, setErrors] = useState<ShippingErrors>({});
	const [submitting, setSubmitting] = useState(false);
	const [successSubmitted, setSuccessSubmitted] = useState(false);
	const [cardNumber, setCardNumber] = useState("");
	const [cardExpiry, setCardExpiry] = useState("");
	const [cardCvc, setCardCvc] = useState("");
	const shippingRef = useRef<HTMLDivElement>(null);
	const paymentRef = useRef<HTMLDivElement>(null);
	const fullNameRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		fullNameRef.current?.focus();
	}, []);

	if (items.length === 0) {
		return null;
	}

	const validateShipping = (): boolean => {
		const e: ShippingErrors = {};
		if (!shippingData.fullName.trim()) e.fullName = "Nama lengkap wajib diisi";
		if (!shippingData.phone.trim()) e.phone = "Nomor telepon wajib diisi";
		else if (!/^[0-9+\-\s]{8,15}$/.test(shippingData.phone.trim()))
			e.phone = "Nomor telepon tidak valid";
		if (!shippingData.address.trim()) e.address = "Alamat wajib diisi";
		if (!shippingData.city.trim()) e.city = "Kota wajib diisi";
		if (!shippingData.postalCode.trim()) e.postalCode = "Kode pos wajib diisi";
		if (!shippingData.country) e.country = "Negara wajib dipilih";
		setErrors(e);
		return Object.keys(e).length === 0;
	};

	const scrollTo = (ref: React.RefObject<HTMLDivElement | null>) => {
		ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
	};

	const handleSubmit = () => {
		if (!validateShipping()) {
			scrollTo(shippingRef);
			return;
		}
		if (!payment) {
			scrollTo(paymentRef);
			return;
		}
		setSubmitting(true);
		setSuccessSubmitted(true);
		setTimeout(() => {
			window.location.href = "/checkout/success";
			clearCart();
			clearCheckoutData();
		}, 800);
	};

	const shippingValid =
		shippingData.fullName.trim() &&
		shippingData.phone.trim() &&
		shippingData.address.trim() &&
		shippingData.city.trim() &&
		shippingData.postalCode.trim() &&
		shippingData.country;
	const paymentValid = payment !== null;

	return (
		<div className="container mx-auto max-w-7xl px-4 py-6 md:py-8">
			{successSubmitted && (
				<div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-background/80 backdrop-blur-sm">
					<Loader2 className="size-10 animate-spin text-primary" />
					<p className="text-lg font-medium">Memproses pesanan Anda...</p>
				</div>
			)}
			<div className="mb-6 flex items-center gap-3 md:mb-8">
				<Button variant="ghost" size="icon" className="min-h-11 min-w-11 md:size-9" asChild>
					<a href="/cart" aria-label="Kembali ke keranjang">
						<ArrowLeft className="size-5" />
					</a>
				</Button>
				<div>
					<h1 className="text-2xl font-semibold md:text-3xl">Checkout</h1>
					<p className="text-sm text-muted-foreground md:text-base">
						{items.length} item dalam pesanan
					</p>
				</div>
			</div>

			<div className="grid gap-8 lg:grid-cols-[1fr_380px]">
				<div className="space-y-8">
					<section ref={shippingRef} className="rounded-lg border bg-card p-6">
						<h2 className="mb-4 text-lg font-semibold">Alamat Pengiriman</h2>
						<div className="space-y-4">
							<div className="grid gap-4 sm:grid-cols-2">
								<div>
									<Label htmlFor="fullName">
										Nama Lengkap <span className="text-destructive">*</span>
									</Label>
									<Input
										id="fullName"
										ref={fullNameRef}
										value={shippingData.fullName}
										onChange={(e) => {
											updateShipping({ fullName: e.target.value });
											if (errors.fullName) setErrors({ ...errors, fullName: undefined });
										}}
										placeholder="Nama lengkap"
										autoComplete="name"
										aria-invalid={!!errors.fullName}
										aria-describedby={errors.fullName ? "fullName-error" : undefined}
									/>
									{errors.fullName && (
										<p id="fullName-error" className="mt-1 text-xs text-destructive" role="alert">
											{errors.fullName}
										</p>
									)}
								</div>
								<div>
									<Label htmlFor="phone">
										Nomor Telepon <span className="text-destructive">*</span>
									</Label>
									<Input
										id="phone"
										type="tel"
										value={shippingData.phone}
										onChange={(e) => {
											updateShipping({ phone: e.target.value });
											if (errors.phone) setErrors({ ...errors, phone: undefined });
										}}
										placeholder="0812xxxxxxxx"
										autoComplete="tel"
										aria-invalid={!!errors.phone}
										aria-describedby={errors.phone ? "phone-error" : undefined}
									/>
									{errors.phone && (
										<p id="phone-error" className="mt-1 text-xs text-destructive" role="alert">
											{errors.phone}
										</p>
									)}
								</div>
							</div>
							<div>
								<Label htmlFor="address">
									Alamat Lengkap <span className="text-destructive">*</span>
								</Label>
								<Input
									id="address"
									value={shippingData.address}
									onChange={(e) => {
										updateShipping({ address: e.target.value });
										if (errors.address) setErrors({ ...errors, address: undefined });
									}}
									placeholder="Jl. Contoh No. 123, RT/RW, Kelurahan, Kecamatan"
									autoComplete="street-address"
									aria-invalid={!!errors.address}
									aria-describedby={errors.address ? "address-error" : undefined}
								/>
								{errors.address && (
									<p id="address-error" className="mt-1 text-xs text-destructive" role="alert">
										{errors.address}
									</p>
								)}
							</div>
							<div className="grid gap-4 sm:grid-cols-2">
								<div>
									<Label htmlFor="city">
										Kota <span className="text-destructive">*</span>
									</Label>
									<Input
										id="city"
										value={shippingData.city}
										onChange={(e) => {
											updateShipping({ city: e.target.value });
											if (errors.city) setErrors({ ...errors, city: undefined });
										}}
										placeholder="Jakarta"
										autoComplete="address-level2"
										aria-invalid={!!errors.city}
										aria-describedby={errors.city ? "city-error" : undefined}
									/>
									{errors.city && (
										<p id="city-error" className="mt-1 text-xs text-destructive" role="alert">
											{errors.city}
										</p>
									)}
								</div>
								<div>
									<Label htmlFor="postalCode">
										Kode Pos <span className="text-destructive">*</span>
									</Label>
									<Input
										id="postalCode"
										value={shippingData.postalCode}
										onChange={(e) => {
											updateShipping({ postalCode: e.target.value });
											if (errors.postalCode) setErrors({ ...errors, postalCode: undefined });
										}}
										placeholder="12345"
										autoComplete="postal-code"
										aria-invalid={!!errors.postalCode}
										aria-describedby={errors.postalCode ? "postalCode-error" : undefined}
									/>
									{errors.postalCode && (
										<p id="postalCode-error" className="mt-1 text-xs text-destructive" role="alert">
											{errors.postalCode}
										</p>
									)}
								</div>
							</div>
							<div>
								<Label htmlFor="country">
									Negara <span className="text-destructive">*</span>
								</Label>
								<Select
									value={shippingData.country}
									onValueChange={(val) => {
										updateShipping({ country: val });
										if (errors.country) setErrors({ ...errors, country: undefined });
									}}
								>
									<SelectTrigger
										id="country"
										className="w-full"
										aria-invalid={!!errors.country}
										aria-describedby={errors.country ? "country-error" : undefined}
									>
										<SelectValue placeholder="Pilih negara" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="ID">Indonesia</SelectItem>
										<SelectItem value="MY">Malaysia</SelectItem>
										<SelectItem value="SG">Singapura</SelectItem>
										<SelectItem value="TH">Thailand</SelectItem>
										<SelectItem value="PH">Filipina</SelectItem>
										<SelectItem value="VN">Vietnam</SelectItem>
										<SelectItem value="BN">Brunei</SelectItem>
										<SelectItem value="TL">Timor Leste</SelectItem>
									</SelectContent>
								</Select>
								{errors.country && (
									<p id="country-error" className="mt-1 text-xs text-destructive" role="alert">
										{errors.country}
									</p>
								)}
							</div>
						</div>
					</section>

					<section ref={paymentRef} className="rounded-lg border bg-card p-6">
						<h2 className="mb-4 text-lg font-semibold">Metode Pembayaran</h2>
						<PaymentMethods value={payment} onChange={setPaymentMethod} />
						{payment?.type === "card" && (
							<CardDetailFields
								cardNumber={cardNumber}
								cardExpiry={cardExpiry}
								cardCvc={cardCvc}
								onCardNumberChange={setCardNumber}
								onCardExpiryChange={setCardExpiry}
								onCardCvcChange={setCardCvc}
							/>
						)}
					</section>
				</div>

				<div className="hidden lg:block">
					<Sidebar
						subtotal={subtotal}
						shipping={shipping}
						tax={tax}
						discount={discount}
						totalPrice={totalPrice}
						couponCode={couponCode}
						submitting={submitting}
						onSubmit={handleSubmit}
					/>
				</div>
			</div>

			<div className="fixed inset-x-0 bottom-0 border-t bg-background p-4 lg:hidden">
				<div className="container mx-auto flex items-center justify-between gap-4">
					<div>
						<p className="text-xs text-muted-foreground">Total</p>
						<p className="text-lg font-semibold">{formatCurrency(totalPrice)}</p>
					</div>
					<Button size="lg" disabled={submitting} onClick={handleSubmit}>
						{submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
						{submitting ? "Memproses..." : "Buat Pesanan"}
					</Button>
				</div>
			</div>

			<div className="h-20 lg:hidden" />
		</div>
	);
}

function Sidebar({
	subtotal,
	shipping,
	tax,
	discount,
	totalPrice,
	couponCode,
	submitting,
	onSubmit,
}: {
	subtotal: number;
	shipping: number;
	tax: number;
	discount: number;
	totalPrice: number;
	couponCode: string | null;
	submitting: boolean;
	onSubmit: () => void;
}) {
	return (
		<div className="sticky top-4 rounded-lg border bg-card p-6">
			<h2 className="mb-4 text-lg font-semibold">Ringkasan Pesanan</h2>
			<div className="space-y-3 text-sm">
				<div className="flex justify-between">
					<span className="text-muted-foreground">Subtotal</span>
					<span>{formatCurrency(subtotal)}</span>
				</div>
				<div className="flex justify-between">
					<span className="text-muted-foreground">Pengiriman</span>
					<span>
						{shipping === 0 && subtotal > 0
							? "Gratis"
							: shipping === 0
								? "—"
								: formatCurrency(shipping)}
					</span>
				</div>
				<div className="flex justify-between">
					<span className="text-muted-foreground">Estimasi Pajak</span>
					<span>{formatCurrency(tax)}</span>
				</div>
				{discount > 0 && (
					<div className="flex justify-between text-success">
						<span>Diskon {couponCode && `(${couponCode})`}</span>
						<span>-{formatCurrency(discount)}</span>
					</div>
				)}
			</div>
			<Separator className="my-4" />
			<div className="flex justify-between text-lg font-semibold">
				<span>Total</span>
				<span>{formatCurrency(totalPrice)}</span>
			</div>
			<Button className="mt-4 w-full" size="lg" disabled={submitting} onClick={onSubmit}>
				{submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
				{submitting ? "Memproses..." : "Buat Pesanan"}
			</Button>
			{subtotal > 0 && subtotal < FREE_SHIPPING_THRESHOLD && (
				<p className="mt-4 text-sm text-muted-foreground">
					Tambah {formatCurrency(FREE_SHIPPING_THRESHOLD - subtotal)} untuk gratis ongkir
				</p>
			)}
			{subtotal >= FREE_SHIPPING_THRESHOLD && (
				<p className="mt-4 text-sm font-medium text-primary">Gratis ongkir!</p>
			)}
		</div>
	);
}

function CardDetailFields({
	cardNumber,
	cardExpiry,
	cardCvc,
	onCardNumberChange,
	onCardExpiryChange,
	onCardCvcChange,
}: {
	cardNumber: string;
	cardExpiry: string;
	cardCvc: string;
	onCardNumberChange: (value: string) => void;
	onCardExpiryChange: (value: string) => void;
	onCardCvcChange: (value: string) => void;
}) {
	return (
		<div className="mt-6 space-y-4 rounded-md border bg-muted/20 p-4">
			<div>
				<Label htmlFor="cardNumber">Nomor Kartu</Label>
				<Input
					id="cardNumber"
					value={cardNumber}
					onChange={(e) => onCardNumberChange(e.target.value)}
					placeholder="1234 5678 9012 3456"
					inputMode="numeric"
					autoComplete="cc-number"
					maxLength={19}
				/>
			</div>
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<div>
					<Label htmlFor="cardExpiry">Masa Berlaku</Label>
					<Input
						id="cardExpiry"
						value={cardExpiry}
						onChange={(e) => onCardExpiryChange(e.target.value)}
						placeholder="MM/YY"
						inputMode="numeric"
						autoComplete="cc-exp"
						maxLength={5}
					/>
				</div>
				<div>
					<div className="flex items-center gap-1">
						<Label htmlFor="cardCvc">CVC / CVV</Label>
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger asChild>
									<button
										type="button"
										className="inline-flex size-4 items-center justify-center rounded-full text-muted-foreground hover:text-foreground"
										aria-label="Informasi CVC"
									>
										<Info className="size-3.5" />
									</button>
								</TooltipTrigger>
								<TooltipContent side="top" className="max-w-[220px] text-center">
									3 digit di belakang kartu Anda. Untuk Amex, 4 digit di depan.
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					</div>
					<Input
						id="cardCvc"
						value={cardCvc}
						onChange={(e) => onCardCvcChange(e.target.value)}
						placeholder="123"
						inputMode="numeric"
						autoComplete="cc-csc"
						maxLength={4}
					/>
				</div>
			</div>
			<p className="text-xs text-muted-foreground">
				Data kartu Anda dienkripsi dan aman. Kami tidak menyimpan informasi kartu.
			</p>
		</div>
	);
}

export function CheckoutPageSkeleton() {
	return (
		<div className="container mx-auto px-4 py-8">
			<div className="mb-8 flex items-center gap-4">
				<Skeleton className="size-10 rounded-md" />
				<div className="space-y-2">
					<Skeleton className="h-8 w-32" />
					<Skeleton className="h-4 w-24" />
				</div>
			</div>
			<div className="grid gap-8 lg:grid-cols-[1fr_380px]">
				<div className="space-y-8">
					{[1, 2, 3].map((i) => (
						<div key={i} className="rounded-lg border p-6">
							<Skeleton className="mb-4 h-6 w-40" />
							<div className="space-y-3">
								<Skeleton className="h-10 w-full" />
								<Skeleton className="h-10 w-full" />
								<div className="grid grid-cols-2 gap-3">
									<Skeleton className="h-10 w-full" />
									<Skeleton className="h-10 w-full" />
								</div>
							</div>
						</div>
					))}
				</div>
				<div className="hidden space-y-4 rounded-lg border p-6 lg:block">
					<Skeleton className="h-6 w-36" />
					{[1, 2, 3].map((i) => (
						<Skeleton key={i} className="h-4 w-full" />
					))}
					<Skeleton className="h-px w-full" />
					<Skeleton className="h-8 w-full" />
					<Skeleton className="h-10 w-full" />
				</div>
			</div>
		</div>
	);
}
