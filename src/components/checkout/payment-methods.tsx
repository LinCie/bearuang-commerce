"use client";

import { cn } from "@/lib/utils";
import type { PaymentMethod } from "@/lib/checkout-store";

interface PaymentMethodsProps {
	value: PaymentMethod | null;
	onChange: (method: PaymentMethod) => void;
}

const ewalletOptions: { provider: "gopay" | "ovo" | "dana"; label: string }[] = [
	{ provider: "gopay", label: "GoPay" },
	{ provider: "ovo", label: "OVO" },
	{ provider: "dana", label: "Dana" },
];

const bankOptions: { provider: "bca" | "bni" | "mandiri" | "bri"; label: string }[] = [
	{ provider: "bca", label: "BCA" },
	{ provider: "bni", label: "BNI" },
	{ provider: "mandiri", label: "Mandiri" },
	{ provider: "bri", label: "BRI" },
];

function MethodCard({
	selected,
	onClick,
	label,
	sublabel,
}: {
	selected: boolean;
	onClick: () => void;
	label: string;
	sublabel?: string;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			aria-pressed={selected}
			className={cn(
				"flex min-h-11 w-full touch-manipulation items-center gap-3 rounded-md border px-4 py-3 text-left text-sm transition-colors",
				selected
					? "border-primary bg-primary/5 ring-1 ring-primary"
					: "border-input hover:bg-muted active:bg-muted",
			)}
		>
			<div
				className={cn(
					"flex size-4 shrink-0 items-center justify-center rounded-full border",
					selected ? "border-primary bg-primary" : "border-muted-foreground",
				)}
			>
				{selected && <div className="size-1.5 rounded-full bg-primary-foreground" />}
			</div>
			<div>
				<span className="font-medium">{label}</span>
				{sublabel && <p className="text-xs text-muted-foreground">{sublabel}</p>}
			</div>
		</button>
	);
}

export function PaymentMethods({ value, onChange }: PaymentMethodsProps) {
	const isEwallet = (p: string) => value?.type === "ewallet" && value.provider === p;
	const isBank = (p: string) => value?.type === "bank" && value.provider === p;
	const isCard = value?.type === "card";

	return (
		<fieldset>
			<legend className="mb-3 text-sm font-medium">Pilih metode pembayaran</legend>
			<div className="space-y-6">
				<div>
					<p className="mb-2 text-xs font-medium tracking-wider text-muted-foreground uppercase">
						E-Wallet
					</p>
					<div className="space-y-2">
						{ewalletOptions.map((opt) => (
							<MethodCard
								key={opt.provider}
								label={opt.label}
								selected={isEwallet(opt.provider)}
								onClick={() => onChange({ type: "ewallet", provider: opt.provider })}
							/>
						))}
					</div>
				</div>

				<div>
					<p className="mb-2 text-xs font-medium tracking-wider text-muted-foreground uppercase">
						Transfer Bank
					</p>
					<div className="space-y-2">
						{bankOptions.map((opt) => (
							<MethodCard
								key={opt.provider}
								label={opt.label}
								sublabel="Virtual Account"
								selected={isBank(opt.provider)}
								onClick={() => onChange({ type: "bank", provider: opt.provider })}
							/>
						))}
					</div>
				</div>

				<div>
					<p className="mb-2 text-xs font-medium tracking-wider text-muted-foreground uppercase">
						Kartu Kredit / Debit
					</p>
					<div className="space-y-2">
						<MethodCard
							label="Visa, Mastercard"
							selected={isCard}
							onClick={() => onChange({ type: "card" })}
						/>
					</div>
				</div>
			</div>
		</fieldset>
	);
}
