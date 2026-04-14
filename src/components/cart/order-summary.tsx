"use client";

import { useState } from "react";
import { Package, Tag, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { applyCoupon, removeCoupon, useCartStore } from "@/lib/cart-store";
import { formatCurrency } from "@/lib/currency";

const FREE_SHIPPING_THRESHOLD = 1500000;

export function OrderSummary() {
	const [couponInput, setCouponInput] = useState("");
	const [showCouponInput, setShowCouponInput] = useState(false);
	const { subtotal, shipping, tax, discount, totalPrice, couponCode } = useCartStore();

	const handleApplyCoupon = () => {
		const code = couponInput.trim();
		if (!code) {
			toast.error("Masukkan kode promo terlebih dahulu");
			return;
		}
		if (code.length < 3) {
			toast.error("Kode promo terlalu pendek — minimal 3 karakter");
			return;
		}
		if (!/^[A-Z0-9]+$/.test(code)) {
			toast.error("Kode promo hanya boleh berisi huruf dan angka");
			return;
		}
		applyCoupon(code.toUpperCase(), 10);
		toast.success(`Kode ${code.toUpperCase()} diterapkan — diskon 10%`);
		setCouponInput("");
		setShowCouponInput(false);
	};

	const handleRemoveCoupon = () => {
		removeCoupon();
		setShowCouponInput(false);
	};

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
						<span>Diskon</span>
						<span>-{formatCurrency(discount)}</span>
					</div>
				)}
			</div>

			<Separator className="my-4" />

			<div className="flex justify-between text-lg font-semibold">
				<span>Total</span>
				<span>{formatCurrency(totalPrice)}</span>
			</div>

			{subtotal > 0 && subtotal < FREE_SHIPPING_THRESHOLD && (
				<div className="mt-4 rounded-md border bg-muted/30 p-3">
					<div className="mb-1.5 flex items-center gap-2 text-sm">
						<Package className="size-4 text-muted-foreground" />
						<span>
							Tambah{" "}
							<span className="font-medium">
								{formatCurrency(FREE_SHIPPING_THRESHOLD - subtotal)}
							</span>{" "}
							untuk gratis ongkir!
						</span>
					</div>
					<div className="h-1.5 overflow-hidden rounded-full bg-muted">
						<div
							className="h-full rounded-full bg-primary transition-all duration-500"
							style={{ width: `${Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100)}%` }}
						/>
					</div>
				</div>
			)}
			{subtotal >= FREE_SHIPPING_THRESHOLD && (
				<div className="mt-4 flex items-center gap-2 rounded-md border border-primary/20 bg-primary/5 px-3 py-2 text-sm text-primary">
					<Package className="size-4" />
					<span className="font-medium">Anda mendapatkan gratis ongkir!</span>
				</div>
			)}

			<Separator className="my-4" />

			{showCouponInput ? (
				<div className="space-y-2">
					<div className="flex gap-2">
						<Input
							placeholder="Masukkan kode promo"
							value={couponInput}
							onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
							onKeyDown={(e) => {
								if (e.key === "Enter") handleApplyCoupon();
							}}
							className="flex-1"
						/>
						<Button variant="outline" onClick={handleApplyCoupon}>
							Pakai
						</Button>
					</div>
					<Button
						variant="ghost"
						size="sm"
						className="w-full text-muted-foreground"
						onClick={() => setShowCouponInput(false)}
					>
						Batal
					</Button>
				</div>
			) : couponCode ? (
				<div className="flex items-center justify-between rounded-md bg-success-muted px-3 py-2">
					<span className="text-sm text-success">Kode {couponCode} diterapkan</span>
					<Button
						variant="ghost"
						size="icon-xs"
						className="text-success hover:text-success/80"
						aria-label="Hapus kode promo"
						onClick={handleRemoveCoupon}
					>
						<X className="size-3" />
					</Button>
				</div>
			) : (
				<Button
					variant="outline"
					size="sm"
					className="w-full gap-2"
					onClick={() => setShowCouponInput(true)}
				>
					<Tag className="size-3" />
					Tambah kode promo
				</Button>
			)}

			<Button className="mt-4 w-full" size="lg" asChild>
				<a href="/checkout">Lanjut ke Pembayaran</a>
			</Button>
		</div>
	);
}
