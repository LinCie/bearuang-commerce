import * as React from "react";
import {
	ChevronLeft,
	ChevronRight,
	Check,
	Minus,
	Plus,
	ShoppingCart,
	CheckCircle2,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useCartStore, addCartItem } from "@/lib/cart-store";

export type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

export interface ProductDetailImage {
	id: string;
	sortOrder?: number;
	media: {
		url: string;
		altText: string | null;
	};
}

export interface ProductDetailVariantImage {
	id: string;
	sortOrder?: number;
	media: {
		url: string;
		altText: string | null;
	};
}

export interface ProductDetailVariant {
	id: string;
	sku: string;
	name: string;
	price: number | null;
	stock: number;
	unit: string;
	attributes: Record<string, unknown> | null;
	isActive: boolean;
	images: ProductDetailVariantImage[];
}

export interface ProductDetailProps {
	product: {
		id: string;
		name: string;
		slug: string;
		description: string;
		category: {
			id: string;
			name: string;
			slug: string;
		};
		variants: ProductDetailVariant[];
		images: ProductDetailImage[];
	};
	onAddToCart?: (variantId: string, quantity: number) => void;
	onQuantityChange?: (variantId: string, quantity: number) => void;
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

function toTitleCase(str: string): string {
	return str
		.replace(/([A-Z])/g, " $1")
		.replace(/^./, (s) => s.toUpperCase())
		.trim();
}

function StockBadge({ status, count }: { status: StockStatus; count?: number }) {
	if (status === "out_of_stock") {
		return (
			<Badge variant="destructive" className="text-xs">
				Stok Habis
			</Badge>
		);
	}

	if (status === "low_stock" && count !== undefined) {
		return (
			<Badge variant="outline" className="border-warning/50 bg-warning/10 text-xs text-warning">
				Hanya {count} tersisa
			</Badge>
		);
	}

	return (
		<Badge variant="secondary" className="text-xs">
			Tersedia
		</Badge>
	);
}

interface QuantityStepperProps {
	value: number;
	onChange: (value: number) => void;
	min?: number;
	max?: number;
	disabled?: boolean;
}

function QuantityStepper({ value, onChange, min = 1, max = 99, disabled }: QuantityStepperProps) {
	return (
		<div className="flex items-center gap-2">
			<Button
				type="button"
				variant="outline"
				size="icon"
				className="size-9"
				onClick={() => onChange(Math.max(min, value - 1))}
				disabled={disabled || value <= min}
				aria-label="Kurangi jumlah"
			>
				<Minus className="size-4" />
			</Button>
			<Input
				type="number"
				value={value}
				onChange={(e) => {
					const newValue = parseInt(e.target.value, 10);
					if (!isNaN(newValue)) {
						onChange(Math.min(max, Math.max(min, newValue)));
					}
				}}
				min={min}
				max={max}
				disabled={disabled}
				className="w-14 [appearance:textfield] text-center [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
				aria-label="Jumlah"
			/>
			<Button
				type="button"
				variant="outline"
				size="icon"
				className="size-9"
				onClick={() => onChange(Math.min(max, value + 1))}
				disabled={disabled || value >= max}
				aria-label="Tambah jumlah"
			>
				<Plus className="size-4" />
			</Button>
		</div>
	);
}

interface ImageGalleryProps {
	images: ProductDetailImage[];
	productName: string;
}

function ImageGallery({ images, productName }: ImageGalleryProps) {
	const [currentIndex, setCurrentIndex] = React.useState(0);

	const goToPrevious = () => {
		setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
	};

	const goToNext = () => {
		setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
	};

	const safeIndex = Math.min(currentIndex, Math.max(images.length - 1, 0));

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "ArrowLeft") {
			goToPrevious();
		} else if (e.key === "ArrowRight") {
			goToNext();
		}
	};

	if (images.length === 0) {
		return (
			<div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
				<div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
					<span className="text-sm">Tidak ada gambar</span>
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-4" onKeyDown={handleKeyDown}>
			<div className="relative">
				<AspectRatio ratio={1}>
					<div className="relative size-full overflow-hidden rounded-lg bg-muted">
						<img
							src={images[safeIndex].media.url}
							alt={images[safeIndex].media.altText ?? `${productName} - Gambar ${safeIndex + 1}`}
							className="size-full object-cover"
						/>
					</div>
				</AspectRatio>

				{images.length > 1 && (
					<>
						<Button
							type="button"
							variant="secondary"
							size="icon"
							className="absolute top-1/2 left-3 z-10 size-8 -translate-y-1/2 rounded-full bg-background/95"
							onClick={goToPrevious}
							aria-label="Gambar sebelumnya"
						>
							<ChevronLeft className="size-4" />
						</Button>
						<Button
							type="button"
							variant="secondary"
							size="icon"
							className="absolute top-1/2 right-3 z-10 size-8 -translate-y-1/2 rounded-full bg-background/95"
							onClick={goToNext}
							aria-label="Gambar selanjutnya"
						>
							<ChevronRight className="size-4" />
						</Button>
					</>
				)}
			</div>

			{images.length > 1 && (
				<ScrollArea className="w-full" dir="ltr">
					<div className="flex gap-2 pb-1">
						{images.map((image, index) => (
							<button
								key={image.id}
								type="button"
								onClick={() => setCurrentIndex(index)}
								className={cn(
									"relative shrink-0 overflow-hidden rounded-md border-2 transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
									index === currentIndex
										? "border-primary"
										: "border-transparent hover:border-muted-foreground/30",
								)}
								aria-label={`Lihat gambar ${index + 1}`}
								aria-pressed={index === currentIndex}
							>
								<div className="size-16 overflow-hidden">
									<img
										src={image.media.url}
										alt=""
										className="size-full object-cover"
										loading="lazy"
									/>
								</div>
							</button>
						))}
					</div>
				</ScrollArea>
			)}

			<div className="flex justify-center gap-1.5">
				{images.map((_, index) => (
					<span
						key={index}
						className={cn(
							"h-1.5 rounded-full transition-all",
							index === currentIndex ? "w-4 bg-primary" : "w-1.5 bg-muted-foreground/30",
						)}
					/>
				))}
			</div>
		</div>
	);
}

interface VariantSelectorProps {
	variants: Array<{
		id: string;
		name: string;
		price: number | null;
		stock: number;
		isActive: boolean;
		attributes: Record<string, unknown> | null;
	}>;
	selectedVariantId: string | null;
	onSelect: (variantId: string) => void;
}

function VariantSelector({ variants, selectedVariantId, onSelect }: VariantSelectorProps) {
	const activeVariants = variants.filter((v) => v.isActive);

	if (activeVariants.length <= 1) {
		return null;
	}

	return (
		<div className="space-y-3">
			<div className="flex items-center justify-between">
				<span className="text-sm font-medium">Varian</span>
				{selectedVariantId && (
					<span className="text-sm text-muted-foreground">
						{activeVariants.find((v) => v.id === selectedVariantId)?.name}
					</span>
				)}
			</div>
			<div className="flex flex-wrap gap-2">
				{variants.map((variant) => {
					const isSelected = variant.id === selectedVariantId;
					const isActive = variant.isActive;
					const isOutOfStock = variant.stock === 0;

					const button = (
						<button
							key={variant.id}
							type="button"
							onClick={() => isActive && !isOutOfStock && onSelect(variant.id)}
							disabled={!isActive || isOutOfStock}
							className={cn(
								"rounded-md border px-3 py-1.5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
								isSelected
									? "border-primary bg-primary text-primary-foreground"
									: !isActive || isOutOfStock
										? "border-border bg-muted text-muted-foreground opacity-50"
										: "border-border hover:border-muted-foreground/50",
							)}
							aria-pressed={isSelected}
							aria-disabled={!isActive || isOutOfStock}
							title={!isActive ? "Varian tidak tersedia" : isOutOfStock ? "Stok habis" : undefined}
						>
							{variant.name}
						</button>
					);

					if (!isActive) {
						return (
							<Tooltip key={variant.id}>
								<TooltipTrigger asChild>{button}</TooltipTrigger>
								<TooltipContent>
									<p>Varian tidak tersedia</p>
								</TooltipContent>
							</Tooltip>
						);
					}

					return button;
				})}
			</div>
		</div>
	);
}

export function ProductDetail({ product, onAddToCart, onQuantityChange }: ProductDetailProps) {
	useCartStore();
	const [selectedVariantId, setSelectedVariantId] = React.useState<string | null>(
		product.variants.find((v) => v.isActive)?.id ?? null,
	);
	const [quantity, setQuantity] = React.useState(1);
	const [isAdding, setIsAdding] = React.useState(false);
	const [isAdded, setIsAdded] = React.useState(false);

	const selectedVariant = product.variants.find((v) => v.id === selectedVariantId);
	const stock = selectedVariant?.stock ?? 0;
	const stockStatus: StockStatus =
		stock === 0 ? "out_of_stock" : stock <= 5 ? "low_stock" : "in_stock";
	const isOutOfStock = stockStatus === "out_of_stock";

	const handleAddToCart = async () => {
		if (!selectedVariantId || isOutOfStock || isAdding || isAdded) return;

		setIsAdding(true);
		try {
			if (selectedVariant) {
				addCartItem(
					{
						variantId: selectedVariant.id,
						productId: product.id,
						productName: product.name,
						variantName: selectedVariant.name,
						price: selectedVariant.price ?? 0,
						sku: selectedVariant.sku,
						image: selectedVariant.images?.[0]?.media
							? {
									url: selectedVariant.images[0].media.url,
									altText: selectedVariant.images[0].media.altText,
								}
							: product.images?.[0]?.media
								? {
										url: product.images[0].media.url,
										altText: product.images[0].media.altText,
									}
								: undefined,
					},
					quantity,
				);
			}
			await onAddToCart?.(selectedVariantId, quantity);
			setIsAdded(true);
			setTimeout(() => setIsAdded(false), 3000);
		} catch {
			setIsAdded(false);
		} finally {
			setIsAdding(false);
		}
	};

	const handleQuantityChange = (newQuantity: number) => {
		setQuantity(newQuantity);
		if (selectedVariantId) {
			onQuantityChange?.(selectedVariantId, newQuantity);
		}
	};

	const handleVariantSelect = (variantId: string) => {
		setSelectedVariantId(variantId);
		setQuantity(1);
	};

	const allImages =
		selectedVariant?.images && selectedVariant.images.length > 0
			? selectedVariant.images
			: product.images;

	return (
		<div className="w-full">
			<Breadcrumb className="mb-6">
				<BreadcrumbList>
					<BreadcrumbItem>
						<BreadcrumbLink href="/">Beranda</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator />
					<BreadcrumbItem>
						<BreadcrumbLink href={`/category/${product.category.slug}`}>
							{product.category.name}
						</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator />
					<BreadcrumbItem>
						<BreadcrumbPage>{product.name}</BreadcrumbPage>
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>

			<div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
				<ImageGallery key={selectedVariantId} images={allImages} productName={product.name} />

				<div className="flex flex-col gap-6">
					<div className="space-y-4">
						<h1 className="text-2xl font-semibold tracking-tight lg:text-3xl">{product.name}</h1>

						<div className="flex flex-wrap items-center gap-3">
							<StockBadge status={stockStatus} count={stock} />
							{selectedVariant?.sku && (
								<span className="text-sm text-muted-foreground">SKU: {selectedVariant.sku}</span>
							)}
						</div>
					</div>

					<Separator />

					<div className="space-y-2">
						<div className="flex items-baseline gap-2">
							<span className="text-3xl font-bold tracking-tight">
								{formatPrice(selectedVariant?.price ?? 0)}
							</span>
							{selectedVariant?.unit && (
								<span className="text-sm text-muted-foreground">/ {selectedVariant.unit}</span>
							)}
						</div>
					</div>

					<Separator />

					<VariantSelector
						variants={product.variants}
						selectedVariantId={selectedVariantId}
						onSelect={handleVariantSelect}
					/>

					{!isOutOfStock && (
						<div className="space-y-3">
							<div className="flex items-center justify-between">
								<span className="text-sm font-medium">Jumlah</span>
								<span className="text-sm text-muted-foreground">Maksimal: {stock}</span>
							</div>
							<QuantityStepper
								value={quantity}
								onChange={handleQuantityChange}
								min={1}
								max={stock}
							/>
						</div>
					)}

					<Button
						type="button"
						size="lg"
						className="w-full gap-2"
						onClick={handleAddToCart}
						disabled={isOutOfStock || isAdding}
					>
						{isAdding ? (
							<>
								<span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
								Menambahkan...
							</>
						) : isAdded ? (
							<>
								<CheckCircle2 className="size-4" />
								Berhasil Ditambahkan!
							</>
						) : isOutOfStock ? (
							"Stok Habis"
						) : (
							<>
								<ShoppingCart className="size-4" />
								Tambah ke Keranjang
							</>
						)}
					</Button>
					{isAdded && (
						<a
							href="/cart"
							className="flex items-center justify-center gap-2 text-sm text-primary hover:underline"
						>
							<Check className="size-4" />
							Lihat Keranjang
						</a>
					)}
				</div>
			</div>

			<div className="mt-12">
				<Tabs defaultValue="description">
					<TabsList>
						<TabsTrigger value="description">Deskripsi</TabsTrigger>
						<TabsTrigger value="specifications">Spesifikasi</TabsTrigger>
					</TabsList>
					<TabsContent value="description" className="mt-4">
						<MarkdownRenderer
							content={product.description || "Tidak ada deskripsi produk."}
							className="text-muted-foreground"
						/>
					</TabsContent>
					<TabsContent value="specifications" className="mt-4">
						<Accordion type="single" collapsible defaultValue="product-info">
							<AccordionItem value="product-info">
								<AccordionTrigger>Informasi Produk</AccordionTrigger>
								<AccordionContent>
									<dl className="grid gap-2 text-sm">
										<div className="grid grid-cols-2 gap-4">
											<dt className="text-muted-foreground">Kategori</dt>
											<dd>{product.category.name}</dd>
										</div>
										{selectedVariant?.sku && (
											<>
												<div className="grid grid-cols-2 gap-4">
													<dt className="text-muted-foreground">SKU</dt>
													<dd>{selectedVariant.sku}</dd>
												</div>
											</>
										)}
										{selectedVariant?.unit && (
											<>
												<div className="grid grid-cols-2 gap-4">
													<dt className="text-muted-foreground">Unit</dt>
													<dd>{selectedVariant.unit}</dd>
												</div>
											</>
										)}
									</dl>
								</AccordionContent>
							</AccordionItem>
							{selectedVariant?.attributes &&
								Object.keys(selectedVariant.attributes).length > 0 && (
									<AccordionItem value="variant-attributes">
										<AccordionTrigger>Atribut Varian</AccordionTrigger>
										<AccordionContent>
											<dl className="grid gap-2 text-sm">
												{Object.entries(selectedVariant.attributes).map(([key, value]) => (
													<div key={key} className="grid grid-cols-2 gap-4">
														<dt className="text-muted-foreground">{toTitleCase(key)}</dt>
														<dd>{String(value)}</dd>
													</div>
												))}
											</dl>
										</AccordionContent>
									</AccordionItem>
								)}
						</Accordion>
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}

export default ProductDetail;
