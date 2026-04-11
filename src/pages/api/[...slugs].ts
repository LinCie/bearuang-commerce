import { Hono } from "hono";

const app = new Hono().basePath("/api");

app.get("/", (c) => c.text("hi"));

app.post("/", async (c) => {
	const body = await c.req.json();
	return c.json(body);
});

export const GET = app.fetch;
export const POST = app.fetch;
