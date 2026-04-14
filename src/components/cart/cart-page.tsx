"use client";

import { ArrowLeft, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CartItemRow } from "@/components/cart/cart-item-row";
import { OrderSummary } from "@/components/cart/order-summary";
import { useCartStore } from "@/lib/cart-store";

export function CartPage() {
	const { items, itemCount } = useCartStore();

	const isEmpty = items.length === 0;

	if (isEmpty) {
		return (
			<div className="container mx-auto flex min-h-screen max-w-7xl px-4">
				<div className="m-auto flex flex-col items-center justify-center text-center">
					<div className="mb-6 rounded-full bg-muted p-6">
						<ShoppingCart className="size-12 text-muted-foreground" />
					</div>
					<h1 className="mb-2 text-2xl font-semibold">Keranjang Anda kosong</h1>
					<p className="mb-6 max-w-sm text-muted-foreground">
						Belum ada barang di keranjang. Mulai belanja untuk menemukan produk yang Anda sukai.
					</p>
					<Button asChild>
						<a href="/">Lanjut Belanja</a>
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto max-w-7xl px-4 py-8">
			<div className="mb-8 flex items-center gap-4">
				<Button variant="ghost" size="icon" asChild>
					<a href="/">
						<ArrowLeft className="size-5" />
					</a>
				</Button>
				<div>
					<h1 className="text-3xl font-semibold">Keranjang Belanja</h1>
					<p className="text-muted-foreground">{itemCount} barang</p>
				</div>
			</div>

			<div className="grid gap-8 lg:grid-cols-[1fr_380px]">
				<div className="rounded-lg border bg-card">
					<div className="p-6">
						<div className="hidden gap-4 border-b pb-3 text-sm font-medium text-muted-foreground md:grid md:grid-cols-[1fr_120px_100px_100px]">
							<span>Produk</span>
							<span className="text-center">Jumlah</span>
							<span className="text-right">Harga</span>
							<span className="text-right">Total</span>
						</div>

						<div className="divide-y">
							{items.map((item) => (
								<CartItemRow key={item.variantId} item={item} />
							))}
						</div>
					</div>

					<div className="border-t bg-muted/30 px-6 py-3">
						<p className="text-xs text-muted-foreground">
							Ongkir dihitung berdasarkan lokasi pengiriman
						</p>
					</div>
				</div>

				<div>
					<OrderSummary />
				</div>
			</div>
		</div>
	);
}

export function CartPageSkeleton() {
	return (
		<div className="container mx-auto px-4 py-8">
			<div className="mb-8 flex items-center gap-4">
				<Skeleton className="h-10 w-10 rounded-md" />
				<div className="space-y-2">
					<Skeleton className="h-8 w-48" />
					<Skeleton className="h-4 w-24" />
				</div>
			</div>

			<div className="grid gap-8 lg:grid-cols-[1fr_380px]">
				<div className="rounded-lg border bg-card p-6">
					{[1, 2, 3].map((i) => (
						<div key={i} className="flex items-center gap-4 border-b py-4 last:border-0">
							<Skeleton className="size-20 shrink-0 rounded-md" />
							<div className="flex-1 space-y-2">
								<Skeleton className="h-4 w-3/4" />
								<Skeleton className="h-3 w-1/2" />
							</div>
							<Skeleton className="h-8 w-20" />
							<Skeleton className="h-4 w-16" />
							<Skeleton className="h-4 w-20" />
						</div>
					))}
				</div>

				<div className="space-y-4 rounded-lg border bg-card p-6">
					<Skeleton className="h-6 w-32" />
					<div className="space-y-3">
						<Skeleton className="h-4 w-full" />
						<Skeleton className="h-4 w-full" />
						<Skeleton className="h-4 w-3/4" />
					</div>
					<Skeleton className="h-10 w-full" />
				</div>
			</div>
		</div>
	);
}
