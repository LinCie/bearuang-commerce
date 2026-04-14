"use client";

import { CheckCircle, MapPin, CreditCard, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const ORDER_NUMBER = "BRG-20260414-7842";

const mockItems = [
	{ name: "Sepatu Sneakers Classic", variant: "Hitam - 42", qty: 1, price: 899000 },
	{ name: "Kaos Oversize Premium", variant: "Putih - L", qty: 2, price: 249000 },
];

const mockTotal = mockItems.reduce((s, i) => s + i.price * i.qty, 0);

function formatCurrency(amount: number) {
	return new Intl.NumberFormat("id-ID", {
		style: "currency",
		currency: "IDR",
		minimumFractionDigits: 0,
	}).format(amount);
}

const steps = [
	{ label: "Pesanan Dibuat", done: true },
	{ label: "Menunggu Pembayaran", done: true },
	{ label: "Pembayaran Dikonfirmasi", done: false },
	{ label: "Sedang Dikirim", done: false },
	{ label: "Selesai", done: false },
];

export function CheckoutSuccess() {
	return (
		<div className="container mx-auto max-w-7xl px-4 py-16">
			<div className="mx-auto max-w-lg">
				<div className="mb-8 text-center">
					<div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10">
						<CheckCircle className="size-8 text-primary" />
					</div>
					<h1 className="mb-2 text-2xl font-semibold">Pesanan Berhasil Dibuat</h1>
					<p className="text-muted-foreground">
						Terima kasih! Detail pesanan telah dikirim ke email Anda.
					</p>
				</div>

				<div className="rounded-lg border bg-card p-6">
					<div className="space-y-3 text-sm">
						<div className="flex justify-between">
							<span className="text-muted-foreground">Nomor Pesanan</span>
							<span className="font-mono font-medium">{ORDER_NUMBER}</span>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">Tanggal</span>
							<span>14 April 2026</span>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">Status</span>
							<span className="font-medium text-primary">Menunggu Pembayaran</span>
						</div>
					</div>

					<Separator className="my-4" />

					<div className="mb-4">
						<div className="mb-3 flex items-center gap-2 text-sm font-medium">
							<ArrowRight className="size-4 text-muted-foreground" />
							Tracking Pesanan
						</div>
						<div className="flex items-center gap-1">
							{steps.map((step, i) => (
								<div key={step.label} className="flex items-center">
									<div className="group flex flex-col items-center">
										<div
											className={`size-3 rounded-full ${step.done ? "bg-primary" : "bg-muted-foreground/30"}`}
											aria-label={step.label}
										/>
										<span className="mt-1 max-w-[72px] text-center text-[10px] leading-tight text-muted-foreground">
											{step.label}
										</span>
									</div>
									{i < steps.length - 1 && (
										<div
											className={`mx-0.5 h-px w-4 ${step.done ? "bg-primary" : "bg-muted-foreground/20"} -mt-4`}
										/>
									)}
								</div>
							))}
						</div>
					</div>

					<Separator className="my-4" />

					<div className="space-y-3 text-sm">
						<div className="flex items-start gap-2">
							<MapPin className="mt-0.5 size-4 text-muted-foreground" />
							<div>
								<p className="font-medium">Dikirim ke</p>
								<p className="text-muted-foreground">John Doe</p>
								<p className="text-muted-foreground">Jl. Sudirman No. 45, Jakarta Selatan 12190</p>
							</div>
						</div>
						<div className="flex items-start gap-2">
							<CreditCard className="mt-0.5 size-4 text-muted-foreground" />
							<div>
								<p className="font-medium">Pembayaran</p>
								<p className="text-muted-foreground">Transfer BCA</p>
							</div>
						</div>
					</div>

					<Separator className="my-4" />

					<div>
						<p className="mb-2 text-sm font-medium">
							{mockItems.reduce((s, i) => s + i.qty, 0)} item
						</p>
						<div className="space-y-2">
							{mockItems.map((item) => (
								<div key={item.name} className="flex items-center justify-between text-sm">
									<div>
										<p>{item.name}</p>
										<p className="text-xs text-muted-foreground">
											{item.variant} × {item.qty}
										</p>
									</div>
									<span>{formatCurrency(item.price * item.qty)}</span>
								</div>
							))}
							<Separator className="my-2" />
							<div className="flex justify-between font-medium">
								<span>Total Pembayaran</span>
								<span>{formatCurrency(mockTotal + 150000 + mockTotal * 0.08)}</span>
							</div>
						</div>
					</div>

					<Separator className="my-4" />

					<div className="rounded-md bg-muted/40 p-3">
						<div className="flex items-start gap-2">
							<Clock className="mt-0.5 size-4 text-muted-foreground" />
							<p className="text-sm text-muted-foreground">
								Silakan lakukan pembayaran dalam{" "}
								<span className="font-medium text-foreground">24 jam</span>. Pesanan akan diproses
								setelah pembayaran dikonfirmasi.
							</p>
						</div>
					</div>
				</div>

				<div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
					<Button asChild size="lg">
						<a href="/">Kembali Belanja</a>
					</Button>
					<Button variant="outline" size="lg" asChild>
						<a href="/cart">Lihat Keranjang</a>
					</Button>
				</div>
			</div>
		</div>
	);
}
