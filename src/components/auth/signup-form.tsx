"use client";

import * as React from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";

interface SignupFormProps {
	className?: string;
}

export function SignupForm({ className }: SignupFormProps) {
	const [name, setName] = React.useState("");
	const [email, setEmail] = React.useState("");
	const [password, setPassword] = React.useState("");
	const [showPassword, setShowPassword] = React.useState(false);
	const [error, setError] = React.useState("");
	const [loading, setLoading] = React.useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");

		if (!name) {
			setError("Nama wajib diisi");
			return;
		}
		if (!email) {
			setError("Email wajib diisi");
			return;
		}
		if (!password) {
			setError("Kata sandi wajib diisi");
			return;
		}

		setLoading(true);

		authClient.signUp.email(
			{
				email,
				password,
				name,
			},
			{
				onSuccess: () => {
					window.location.href = "/";
				},
				onError: (ctx) => {
					setError(ctx.error.message || "Gagal membuat akun");
					setLoading(false);
				},
			},
		);
	};

	return (
		<form onSubmit={handleSubmit} className={className}>
			<div className="space-y-4">
				{error && (
					<div
						role="alert"
						aria-live="polite"
						className="flex items-center gap-2 rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive"
					>
						<AlertCircle className="h-4 w-4 shrink-0" />
						<span>{error}</span>
					</div>
				)}

				<div className="space-y-2">
					<Label htmlFor="name">Nama</Label>
					<Input
						id="name"
						type="text"
						placeholder="Nama lengkap"
						value={name}
						onChange={(e) => setName(e.target.value)}
						disabled={loading}
						autoComplete="name"
						required
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="email">Email</Label>
					<Input
						id="email"
						type="email"
						placeholder="nama@email.com"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						disabled={loading}
						autoComplete="email"
						required
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="password">Kata sandi</Label>
					<div className="relative">
						<Input
							id="password"
							type={showPassword ? "text" : "password"}
							placeholder="Minimal 8 karakter"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							disabled={loading}
							autoComplete="new-password"
							required
							className="pr-10"
						/>
						<button
							type="button"
							onClick={() => setShowPassword(!showPassword)}
							className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
							tabIndex={-1}
						>
							{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
						</button>
					</div>
					<p className="text-xs text-muted-foreground">
						Minimal 8 karakter, menggunakan huruf besar, huruf kecil, dan angka
					</p>
				</div>

				<Button type="submit" className="w-full" disabled={loading}>
					{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
					{loading ? "Memuat..." : "Daftar"}
				</Button>
			</div>
		</form>
	);
}
