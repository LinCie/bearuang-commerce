import { Hono } from "hono";
import { apiClient } from "@/lib/api-client";
import type { ProductsResponse } from "@/lib/types/product";
import type { APIRoute } from "astro";

const app = new Hono().basePath("/api");

app.get("/products", async (c) => {
	const page = c.req.query("page");
	const pageSize = c.req.query("pageSize");
	const sortBy = c.req.query("sortBy");
	const sortOrder = c.req.query("sortOrder");
	const search = c.req.query("search");
	const categoryId = c.req.query("categoryId");

	const searchParams: Record<string, string> = {};
	if (page) searchParams.page = page;
	if (pageSize) searchParams.pageSize = pageSize;
	if (sortBy) searchParams.sortBy = sortBy;
	if (sortOrder) searchParams.sortOrder = sortOrder;
	if (search) searchParams.search = search;
	if (categoryId) searchParams.categoryId = categoryId;

	const response = await apiClient.get<ProductsResponse>("products", { searchParams }).json();

	return c.json(response);
});

export const ALL: APIRoute = (context) => app.fetch(context.request);
