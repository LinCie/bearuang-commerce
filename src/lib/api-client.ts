import ky from "ky";

export const apiClient = ky.create({
	prefix: import.meta.env.BEARUANG_BASE_URL ?? "https://bearuangapi.lincie.me",
	hooks: {
		beforeRequest: [
			({ request }) => {
				const apiKey = import.meta.env.BEARUANG_API_KEY;
				if (apiKey) {
					request.headers.set("x-api-key", apiKey);
				}
			},
		],
	},
});

export const localClient = ky.create({
	prefix: import.meta.env.PUBLIC_BASE_URL ?? "http://localhost:4321/api",
});
