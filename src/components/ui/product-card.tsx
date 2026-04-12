import * as React from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

export interface ProductCardProps extends React.HTMLAttributes<HTMLDivElement> {
	imageUrl: string;
	productName: string;
	description?: string;
	price: number;
	originalPrice?: number;
	stock?: StockStatus;
	stockCount?: number;
	onAddToCart?: () => void;
	onWishlist?: () => void;
	onNotifyMe?: () => void;
	isWishlistActive?: boolean;
	isLoading?: boolean;
	isAdded?: boolean;
	href?: string;
}

function formatPrice(price: number): string {
	return new Intl.NumberFormat("id-ID", {
		style: "currency",
		currency: "IDR",
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	})
		.format(price)
		.replace("Rp", "Rp.");
}

function StockBadge({ status, count }: { status: StockStatus; count?: number }) {
	if (status === "out_of_stock") {
		return <span className="text-xs font-medium text-destructive">Stok Habis</span>;
	}

	if (status === "low_stock" && count !== undefined) {
		return <span className="text-xs font-medium text-amber-700">Hanya {count} tersisa</span>;
	}

	return <span className="text-xs font-medium text-muted-foreground">Tersedia</span>;
}

export const ProductCard = React.forwardRef<HTMLDivElement, ProductCardProps>(
	(
		{
			className,
			imageUrl,
			productName,
			description,
			price,
			originalPrice,
			stock = "in_stock",
			stockCount,
			onAddToCart,
			onWishlist,
			onNotifyMe,
			isWishlistActive = false,
			isLoading = false,
			isAdded = false,
			href,
			...props
		},
		ref,
	) => {
		const isOutOfStock = stock === "out_of_stock";

		const isClickable = href && !isOutOfStock;

		return (
			<Card
				ref={ref}
				className={cn(
					"group/product-card relative flex flex-col gap-0 overflow-hidden rounded-xl py-0 transition-all duration-200 hover:border-foreground/20 hover:shadow-sm",
					!isClickable && "cursor-default",
					className,
				)}
				{...props}
			>
				<a
					href={isClickable ? href : undefined}
					aria-label={productName}
					aria-disabled={!isClickable}
					className={cn(
						"absolute inset-0 z-10",
						!isClickable && "pointer-events-none cursor-default",
					)}
					tabIndex={isClickable ? 0 : -1}
				>
					<span className="sr-only">Lihat detail {productName}</span>
				</a>

				<div className="relative aspect-square shrink-0 overflow-hidden bg-muted">
					<img
						src={imageUrl}
						alt={productName}
						loading="lazy"
						className={cn(
							"h-full w-full object-cover transition-transform duration-300 will-change-transform",
							isClickable && "group-hover/product-card:scale-105",
						)}
					/>

					<button
						type="button"
						onClick={(e) => {
							e.preventDefault();
							e.stopPropagation();
							onWishlist?.();
						}}
						className={cn(
							"absolute top-3 right-3 z-20 flex size-8 items-center justify-center rounded-full bg-background/80 opacity-0 backdrop-blur-sm transition-all group-hover/product-card:opacity-100 hover:bg-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
							isWishlistActive ? "text-destructive" : "text-foreground/60",
						)}
						aria-label={isWishlistActive ? "Hapus dari wishlist" : "Tambah ke wishlist"}
						title={isWishlistActive ? "Hapus dari wishlist" : "Tambah ke wishlist"}
					>
						<svg
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill={isWishlistActive ? "currentColor" : "none"}
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
						</svg>
					</button>
				</div>

				<CardHeader className="gap-0 px-4 py-0 pt-3">
					<div className="flex flex-col gap-1">
						<CardTitle className="line-clamp-2 leading-tight">{productName}</CardTitle>
						<StockBadge status={stock} count={stockCount} />
					</div>
				</CardHeader>

				<CardContent className="flex flex-1 flex-col gap-0 p-4">
					{description && (
						<p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
							{description}
						</p>
					)}

					<div className="mt-auto flex flex-col gap-2">
						<div className="flex flex-col gap-0.5">
							<span className="text-xs font-medium text-muted-foreground">Harga</span>
							<div className="flex items-baseline gap-2">
								<span className="text-base font-semibold text-foreground">
									{formatPrice(price)}
								</span>
								{originalPrice && originalPrice > price && (
									<span className="text-xs text-muted-foreground line-through">
										{formatPrice(originalPrice)}
									</span>
								)}
							</div>
						</div>

						<Button
							type="button"
							onClick={(e) => {
								e.preventDefault();
								e.stopPropagation();
								if (isOutOfStock) {
									onNotifyMe?.();
								} else if (!isLoading) {
									onAddToCart?.();
								}
							}}
							disabled={isLoading || (isOutOfStock ? !onNotifyMe : !onAddToCart)}
							className="w-full"
							size="default"
							variant={isOutOfStock ? "outline" : "default"}
						>
							{isLoading ? (
								<span className="flex items-center gap-1.5">
									<span className="size-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
									Menambahkan...
								</span>
							) : isOutOfStock ? (
								onNotifyMe ? (
									"Izinkan saya tahu"
								) : (
									"Stok Habis"
								)
							) : isAdded ? (
								<span className="flex items-center gap-1.5">
									<svg
										width="14"
										height="14"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2.5"
										strokeLinecap="round"
										strokeLinejoin="round"
									>
										<polyline points="20 6 9 17 4 12" />
									</svg>
									Berhasil!
								</span>
							) : (
								"Tambah ke Keranjang"
							)}
						</Button>
						{isOutOfStock && onNotifyMe && (
							<button
								type="button"
								onClick={(e) => {
									e.preventDefault();
									e.stopPropagation();
									onNotifyMe?.();
								}}
								className="text-xs text-muted-foreground underline underline-offset-2 transition-colors hover:text-foreground"
							>
								Atau hubungi kami
							</button>
						)}
					</div>
				</CardContent>
			</Card>
		);
	},
);

ProductCard.displayName = "ProductCard";

export { ProductCard as default };
