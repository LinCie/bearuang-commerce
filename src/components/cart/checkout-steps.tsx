"use client";

import { useState } from "react";
import { Check, ChevronRight, MapPin, CreditCard, ClipboardCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/lib/cart-store";
import { formatCurrency } from "@/lib/currency";

interface CheckoutStepsProps {
	open: boolean;
	onClose: () => void;
}

type Step = "shipping" | "payment" | "review";

const steps: { id: Step; label: string; icon: typeof MapPin }[] = [
	{ id: "shipping", label: "Pengiriman", icon: MapPin },
	{ id: "payment", label: "Pembayaran", icon: CreditCard },
	{ id: "review", label: "Konfirmasi", icon: ClipboardCheck },
];

type ShippingErrors = Partial<
	Record<"fullName" | "address" | "city" | "postalCode" | "country", string>
>;
type PaymentErrors = Partial<Record<"cardNumber" | "expiry" | "cvc", string>>;

export function CheckoutSteps({ open, onClose }: CheckoutStepsProps) {
	const [currentStep, setCurrentStep] = useState<Step>("shipping");
	const [shippingData, setShippingData] = useState({
		fullName: "",
		address: "",
		city: "",
		postalCode: "",
		country: "",
	});
	const [shippingErrors, setShippingErrors] = useState<ShippingErrors>({});
	const [paymentData, setPaymentData] = useState({
		cardNumber: "",
		expiry: "",
		cvc: "",
	});
	const [paymentErrors, setPaymentErrors] = useState<PaymentErrors>({});

	const { items, subtotal, shipping, tax, discount, totalPrice } = useCartStore();

	const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

	const validateShipping = (): boolean => {
		const errors: ShippingErrors = {};
		if (!shippingData.fullName.trim()) errors.fullName = "Nama lengkap wajib diisi";
		if (!shippingData.address.trim()) errors.address = "Alamat wajib diisi";
		if (!shippingData.city.trim()) errors.city = "Kota wajib diisi";
		if (!shippingData.postalCode.trim()) errors.postalCode = "Kode pos wajib diisi";
		if (!shippingData.country.trim()) errors.country = "Negara wajib diisi";
		setShippingErrors(errors);
		return Object.keys(errors).length === 0;
	};

	const validatePayment = (): boolean => {
		const errors: PaymentErrors = {};
		if (!paymentData.cardNumber.trim()) errors.cardNumber = "Nomor kartu wajib diisi";
		else if (paymentData.cardNumber.replace(/\s/g, "").length < 13)
			errors.cardNumber = "Nomor kartu tidak valid";
		if (!paymentData.expiry.trim()) errors.expiry = "Tanggal kadaluarsa wajib diisi";
		else if (!/^\d{2}\/\d{2}$/.test(paymentData.expiry)) errors.expiry = "Gunakan format MM/YY";
		if (!paymentData.cvc.trim()) errors.cvc = "CVC wajib diisi";
		else if (!/^\d{3,4}$/.test(paymentData.cvc)) errors.cvc = "CVC tidak valid";
		setPaymentErrors(errors);
		return Object.keys(errors).length === 0;
	};

	const handleNext = () => {
		if (currentStep === "shipping" && !validateShipping()) return;
		if (currentStep === "payment" && !validatePayment()) return;
		const nextIndex = currentStepIndex + 1;
		if (nextIndex < steps.length) {
			setCurrentStep(steps[nextIndex].id);
		}
	};

	const handleBack = () => {
		const prevIndex = currentStepIndex - 1;
		if (prevIndex >= 0) {
			setCurrentStep(steps[prevIndex].id);
		}
	};

	const handlePlaceOrder = () => {
		onClose();
		setCurrentStep("shipping");
		setShippingData({ fullName: "", address: "", city: "", postalCode: "", country: "" });
		setPaymentData({ cardNumber: "", expiry: "", cvc: "" });
		setShippingErrors({});
		setPaymentErrors({});
	};

	const handleOpenChange = (isOpen: boolean) => {
		if (!isOpen) onClose();
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent
				className="max-h-[90vh] overflow-y-auto p-0 sm:max-w-2xl"
				showCloseButton={false}
			>
				<div className="p-6">
					<DialogHeader className="mb-6 flex flex-row items-center justify-between space-y-0">
						<div>
							<DialogTitle className="text-xl font-semibold">Pembayaran</DialogTitle>
							<DialogDescription className="sr-only">
								Proses pembayaran dengan langkah pengiriman, metode bayar, dan konfirmasi pesanan
							</DialogDescription>
						</div>
						<Button variant="ghost" size="icon" onClick={onClose} aria-label="Tutup">
							<X className="size-4" />
						</Button>
					</DialogHeader>

					<div className="mb-8 flex items-center justify-between">
						{steps.map((step, index) => {
							const Icon = step.icon;
							const isCompleted = index < currentStepIndex;
							const isCurrent = step.id === currentStep;

							return (
								<div key={step.id} className="flex items-center">
									<div
										className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
											isCompleted
												? "border-primary bg-primary text-primary-foreground"
												: isCurrent
													? "border-primary text-primary"
													: "border-muted-foreground text-muted-foreground"
										}`}
									>
										{isCompleted ? <Check className="size-5" /> : <Icon className="size-5" />}
									</div>
									<span
										className={`ml-2 text-sm font-medium ${
											isCurrent ? "text-foreground" : "text-muted-foreground"
										}`}
									>
										{step.label}
									</span>
									{index < steps.length - 1 && (
										<div
											className={`mx-3 h-0.5 w-12 ${
												index < currentStepIndex ? "bg-primary" : "bg-muted-foreground/30"
											}`}
										/>
									)}
								</div>
							);
						})}
					</div>

					{currentStep === "shipping" && (
						<div className="space-y-4">
							<h3 className="font-medium">Alamat Pengiriman</h3>
							<div className="space-y-3">
								<div>
									<Label htmlFor="fullName">
										Nama Lengkap <span className="text-destructive">*</span>
									</Label>
									<Input
										id="fullName"
										value={shippingData.fullName}
										onChange={(e) => {
											setShippingData({ ...shippingData, fullName: e.target.value });
											if (shippingErrors.fullName)
												setShippingErrors({ ...shippingErrors, fullName: undefined });
										}}
										placeholder="Nama lengkap"
										aria-invalid={!!shippingErrors.fullName}
										aria-describedby={shippingErrors.fullName ? "fullName-error" : undefined}
									/>
									{shippingErrors.fullName && (
										<p id="fullName-error" className="mt-1 text-xs text-destructive" role="alert">
											{shippingErrors.fullName}
										</p>
									)}
								</div>
								<div>
									<Label htmlFor="address">
										Alamat <span className="text-destructive">*</span>
									</Label>
									<Input
										id="address"
										value={shippingData.address}
										onChange={(e) => {
											setShippingData({ ...shippingData, address: e.target.value });
											if (shippingErrors.address)
												setShippingErrors({ ...shippingErrors, address: undefined });
										}}
										placeholder="Jl. Contoh No. 123"
										aria-invalid={!!shippingErrors.address}
										aria-describedby={shippingErrors.address ? "address-error" : undefined}
									/>
									{shippingErrors.address && (
										<p id="address-error" className="mt-1 text-xs text-destructive" role="alert">
											{shippingErrors.address}
										</p>
									)}
								</div>
								<div className="grid grid-cols-2 gap-3">
									<div>
										<Label htmlFor="city">
											Kota <span className="text-destructive">*</span>
										</Label>
										<Input
											id="city"
											value={shippingData.city}
											onChange={(e) => {
												setShippingData({ ...shippingData, city: e.target.value });
												if (shippingErrors.city)
													setShippingErrors({ ...shippingErrors, city: undefined });
											}}
											placeholder="Jakarta"
											aria-invalid={!!shippingErrors.city}
											aria-describedby={shippingErrors.city ? "city-error" : undefined}
										/>
										{shippingErrors.city && (
											<p id="city-error" className="mt-1 text-xs text-destructive" role="alert">
												{shippingErrors.city}
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
												setShippingData({ ...shippingData, postalCode: e.target.value });
												if (shippingErrors.postalCode)
													setShippingErrors({ ...shippingErrors, postalCode: undefined });
											}}
											placeholder="12345"
											aria-invalid={!!shippingErrors.postalCode}
											aria-describedby={shippingErrors.postalCode ? "postalCode-error" : undefined}
										/>
										{shippingErrors.postalCode && (
											<p
												id="postalCode-error"
												className="mt-1 text-xs text-destructive"
												role="alert"
											>
												{shippingErrors.postalCode}
											</p>
										)}
									</div>
								</div>
								<div>
									<Label htmlFor="country">
										Negara <span className="text-destructive">*</span>
									</Label>
									<Input
										id="country"
										value={shippingData.country}
										onChange={(e) => {
											setShippingData({ ...shippingData, country: e.target.value });
											if (shippingErrors.country)
												setShippingErrors({ ...shippingErrors, country: undefined });
										}}
										placeholder="Indonesia"
										aria-invalid={!!shippingErrors.country}
										aria-describedby={shippingErrors.country ? "country-error" : undefined}
									/>
									{shippingErrors.country && (
										<p id="country-error" className="mt-1 text-xs text-destructive" role="alert">
											{shippingErrors.country}
										</p>
									)}
								</div>
							</div>
						</div>
					)}

					{currentStep === "payment" && (
						<div className="space-y-4">
							<h3 className="font-medium">Metode Pembayaran</h3>
							<div className="space-y-3">
								<div>
									<Label htmlFor="cardNumber">
										Nomor Kartu <span className="text-destructive">*</span>
									</Label>
									<Input
										id="cardNumber"
										value={paymentData.cardNumber}
										onChange={(e) => {
											setPaymentData({ ...paymentData, cardNumber: e.target.value });
											if (paymentErrors.cardNumber)
												setPaymentErrors({ ...paymentErrors, cardNumber: undefined });
										}}
										placeholder="1234 5678 9012 3456"
										aria-invalid={!!paymentErrors.cardNumber}
										aria-describedby={paymentErrors.cardNumber ? "cardNumber-error" : undefined}
									/>
									{paymentErrors.cardNumber && (
										<p id="cardNumber-error" className="mt-1 text-xs text-destructive" role="alert">
											{paymentErrors.cardNumber}
										</p>
									)}
								</div>
								<div className="grid grid-cols-2 gap-3">
									<div>
										<Label htmlFor="expiry">
											Tanggal Kadaluarsa <span className="text-destructive">*</span>
										</Label>
										<Input
											id="expiry"
											value={paymentData.expiry}
											onChange={(e) => {
												setPaymentData({ ...paymentData, expiry: e.target.value });
												if (paymentErrors.expiry)
													setPaymentErrors({ ...paymentErrors, expiry: undefined });
											}}
											placeholder="MM/YY"
											aria-invalid={!!paymentErrors.expiry}
											aria-describedby={paymentErrors.expiry ? "expiry-error" : undefined}
										/>
										{paymentErrors.expiry && (
											<p id="expiry-error" className="mt-1 text-xs text-destructive" role="alert">
												{paymentErrors.expiry}
											</p>
										)}
									</div>
									<div>
										<Label htmlFor="cvc">
											CVC <span className="text-destructive">*</span>
										</Label>
										<Input
											id="cvc"
											value={paymentData.cvc}
											onChange={(e) => {
												setPaymentData({ ...paymentData, cvc: e.target.value });
												if (paymentErrors.cvc)
													setPaymentErrors({ ...paymentErrors, cvc: undefined });
											}}
											placeholder="123"
											aria-invalid={!!paymentErrors.cvc}
											aria-describedby={paymentErrors.cvc ? "cvc-error" : undefined}
										/>
										{paymentErrors.cvc && (
											<p id="cvc-error" className="mt-1 text-xs text-destructive" role="alert">
												{paymentErrors.cvc}
											</p>
										)}
									</div>
								</div>
							</div>
						</div>
					)}

					{currentStep === "review" && (
						<div className="space-y-4">
							<h3 className="font-medium">Konfirmasi Pesanan Anda</h3>

							<div className="space-y-3 rounded-lg border p-4">
								<div>
									<p className="text-sm text-muted-foreground">Dikirim ke:</p>
									<p className="font-medium">{shippingData.fullName || "—"}</p>
									<p className="text-sm">
										{shippingData.address || "—"}, {shippingData.city || "—"}{" "}
										{shippingData.postalCode || "—"}
									</p>
								</div>

								<Separator />

								<div>
									<p className="text-sm text-muted-foreground">Pembayaran:</p>
									<p className="font-medium">
										{paymentData.cardNumber
											? `**** **** **** ${paymentData.cardNumber.replace(/\s/g, "").slice(-4)}`
											: "—"}
									</p>
								</div>

								<Separator />

								<div className="space-y-1 text-sm">
									<div className="flex justify-between">
										<span>Subtotal</span>
										<span>{formatCurrency(subtotal)}</span>
									</div>
									<div className="flex justify-between">
										<span>Pengiriman</span>
										<span>
											{shipping === 0 && subtotal > 0 ? "Gratis" : formatCurrency(shipping)}
										</span>
									</div>
									<div className="flex justify-between">
										<span>Pajak</span>
										<span>{formatCurrency(tax)}</span>
									</div>
									{discount > 0 && (
										<div className="flex justify-between text-success">
											<span>Diskon</span>
											<span>-{formatCurrency(discount)}</span>
										</div>
									)}
									<Separator />
									<div className="flex justify-between text-base font-semibold">
										<span>Total</span>
										<span>{formatCurrency(totalPrice)}</span>
									</div>
								</div>
							</div>

							<div>
								<p className="mb-2 text-sm text-muted-foreground">
									{items.length} item dalam pesanan Anda
								</p>
								<div className="space-y-2">
									{items.map((item) => (
										<div key={item.variantId} className="flex justify-between text-sm">
											<span>
												{item.productName} × {item.quantity}
											</span>
											<span>{formatCurrency(item.price * item.quantity)}</span>
										</div>
									))}
								</div>
							</div>
						</div>
					)}
				</div>

				<div className="flex justify-between border-t p-6">
					<Button variant="outline" onClick={currentStep === "shipping" ? onClose : handleBack}>
						{currentStep === "shipping" ? "Batal" : "Kembali"}
					</Button>

					{currentStep === "review" ? (
						<Button onClick={handlePlaceOrder}>Buat Pesanan</Button>
					) : (
						<Button onClick={handleNext}>
							Lanjut
							<ChevronRight className="ml-1 size-4" />
						</Button>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
