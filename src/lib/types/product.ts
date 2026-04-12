export interface Media {
	id: string;
	organizationId: string;
	key: string;
	filename: string;
	contentType: string;
	size: number;
	purpose: string | null;
	url: string;
	createdAt: string;
}

export interface ProductImage {
	id: string;
	productId: string;
	mediaId: string;
	altText: string | null;
	sortOrder: number;
	createdAt: string;
	media: Media;
}

export interface VariantImage {
	id: string;
	variantId: string;
	mediaId: string;
	altText: string | null;
	sortOrder: number;
	createdAt: string;
	media: Media;
}

export interface Variant {
	id: string;
	productId: string;
	organizationId: string;
	sku: string;
	name: string;
	price: number | null;
	stock: number;
	unit: string;
	attributes: Record<string, unknown> | null;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
	images: VariantImage[];
}

export interface Category {
	id: string;
	name: string;
	slug: string;
}

export interface Product {
	id: string;
	organizationId: string;
	categoryId: string;
	category: Category;
	name: string;
	slug: string;
	description: string;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
	variants: Variant[];
	images: ProductImage[];
}

export interface ProductsMeta {
	total: number;
	page: number;
	pageSize: number;
	totalPages: number;
	hasNext: boolean;
	hasPrev: boolean;
}

export interface ProductsResponse {
	data: Product[];
	meta: ProductsMeta;
}
