"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CartItem } from "@/lib/cart-store";
import { addCartItem, removeCartItem, updateCartQuantity } from "@/lib/cart-store";
import { formatCurrency } from "@/lib/currency";

interface CartItemRowProps {
	item: CartItem;
}

const SWIPE_THRESHOLD = 80;
const MAX_SWIPE = 120;

export function CartItemRow({ item }: CartItemRowProps) {
	const lineTotal = item.price * item.quantity;
	const [isSwiping, setIsSwiping] = useState(false);
	const [translateX, setTranslateX] = useState(0);
	const [isDragging, setIsDragging] = useState(false);
	const touchStartX = useRef(0);
	const currentTranslateX = useRef(0);
	const rowRef = useRef<HTMLDivElement>(null);

	const handleQuantityChange = (newQuantity: number) => {
		if (newQuantity < 1) return;
		updateCartQuantity(item.variantId, newQuantity);
	};

	const handleRemove = useCallback(() => {
		const itemCopy = { ...item };
		removeCartItem(item.variantId);
		toast.success(`${item.productName} dihapus dari keranjang`, {
			action: {
				label: "Undo",
				onClick: () => {
					addCartItem(
						{
							variantId: itemCopy.variantId,
							productId: itemCopy.productId,
							productName: itemCopy.productName,
							variantName: itemCopy.variantName,
							price: itemCopy.price,
							sku: itemCopy.sku,
							image: itemCopy.image,
						},
						itemCopy.quantity,
					);
				},
			},
		});
	}, [item]);

	const handleTouchStart = useCallback((e: React.TouchEvent) => {
		const touch = e.touches[0];
		touchStartX.current = touch.clientX;
		setIsDragging(true);
	}, []);

	const handleTouchMove = useCallback(
		(e: React.TouchEvent) => {
			if (!isDragging) return;
			const touch = e.touches[0];
			const diff = touchStartX.current - touch.clientX;

			if (diff > 0) {
				const newTranslate = Math.min(diff, MAX_SWIPE);
				currentTranslateX.current = newTranslate;
				setTranslateX(newTranslate);
			} else {
				currentTranslateX.current = 0;
				setTranslateX(0);
			}
		},
		[isDragging],
	);

	const handleTouchEnd = useCallback(() => {
		setIsDragging(false);
		if (currentTranslateX.current > SWIPE_THRESHOLD) {
			setTranslateX(MAX_SWIPE);
			setIsSwiping(true);
		} else {
			setTranslateX(0);
			setIsSwiping(false);
		}
	}, []);

	const handleSwipeDelete = useCallback(() => {
		setTranslateX(0);
		setIsSwiping(false);
		handleRemove();
	}, [handleRemove]);

	const handleCancelSwipe = useCallback(() => {
		setTranslateX(0);
		setIsSwiping(false);
	}, []);

	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (rowRef.current && !rowRef.current.contains(e.target as Node)) {
				if (isSwiping) {
					handleCancelSwipe();
				}
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [isSwiping, handleCancelSwipe]);

	const imageEl = (
		<div className="relative size-16 shrink-0 overflow-hidden rounded-md bg-muted md:size-20">
			{item.image ? (
				<img
					src={item.image.url}
					alt={item.image.altText || item.productName}
					className="absolute inset-0 h-full w-full object-cover"
				/>
			) : (
				<div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
					Tidak ada gambar
				</div>
			)}
		</div>
	);

	const productInfo = (
		<div className="min-w-0 space-y-1">
			<h3 className="truncate leading-tight font-medium">{item.productName}</h3>
			<p className="truncate text-sm text-muted-foreground">{item.variantName}</p>
			{item.sku && (
				<Badge variant="outline" className="text-xs">
					{item.sku}
				</Badge>
			)}
		</div>
	);

	const quantityControls = (
		<div className="flex items-center gap-2">
			<Button
				variant="outline"
				size="icon"
				onClick={() => handleQuantityChange(item.quantity - 1)}
				disabled={item.quantity <= 1}
				aria-label="Kurangi jumlah"
				className="min-h-8 min-w-8 shrink-0"
			>
				<Minus className="size-4" />
			</Button>
			<Input
				type="number"
				min={1}
				step={1}
				value={item.quantity}
				onChange={(e) => {
					const val = parseInt(e.target.value, 10);
					if (Number.isNaN(val)) return;
					handleQuantityChange(Math.max(1, val));
				}}
				aria-label={`Jumlah ${item.productName}`}
				className="h-11 w-16 text-center text-base md:h-8 md:w-14"
			/>
			<Button
				variant="outline"
				size="icon"
				onClick={() => handleQuantityChange(item.quantity + 1)}
				aria-label="Tambah jumlah"
				className="min-h-8 min-w-8 shrink-0"
			>
				<Plus className="size-4" />
			</Button>
		</div>
	);

	return (
		<div className="relative overflow-hidden border-b border-border py-4 last:border-0">
			{/* Swipe delete action - mobile only */}
			<div className="absolute inset-y-0 right-0 flex w-[120px] items-center justify-end pr-4 md:hidden">
				<Button variant="destructive" size="lg" onClick={handleSwipeDelete} className="h-11 w-full">
					<Trash2 className="mr-2 size-4" />
					Hapus
				</Button>
			</div>

			{/* Main row content */}
			<div
				ref={rowRef}
				onTouchStart={handleTouchStart}
				onTouchMove={handleTouchMove}
				onTouchEnd={handleTouchEnd}
				style={{
					transform: `translateX(-${translateX}px)`,
					transition: isDragging ? "none" : "transform 0.2s ease-out",
				}}
				className="relative z-10 bg-background md:transform-none"
			>
				{/* Desktop: grid aligned with column headers */}
				<div className="hidden items-center gap-4 md:grid md:grid-cols-[1fr_120px_100px_100px]">
					<div className="flex items-center gap-4">
						{imageEl}
						<div className="flex min-w-0 flex-1 items-center justify-between gap-2">
							{productInfo}
							<Button
								variant="ghost"
								size="icon-sm"
								className="shrink-0 text-muted-foreground hover:text-destructive"
								onClick={handleRemove}
								aria-label={`Hapus ${item.productName}`}
							>
								<Trash2 className="size-4" />
							</Button>
						</div>
					</div>
					<div className="flex justify-center">{quantityControls}</div>
					<div className="text-right text-sm">{formatCurrency(item.price)}</div>
					<div className="text-right font-medium">{formatCurrency(lineTotal)}</div>
				</div>

				{/* Mobile: stacked flex layout */}
				<div className="flex gap-4 md:hidden">
					{imageEl}
					<div className="flex min-w-0 flex-1 flex-col justify-between">
						<div className="flex items-start justify-between gap-2">{productInfo}</div>
						<div className="flex items-center justify-between pt-3">
							{quantityControls}
							<p className="text-base font-medium">{formatCurrency(lineTotal)}</p>
						</div>
						{isSwiping && (
							<p className="mt-1 text-xs text-muted-foreground">
								Geser lebih lanjut atau ketuk tombol hapus
							</p>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
