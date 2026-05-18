import { CRY_REASONS } from '$lib/cries';

const KNOWN = new Set<string>(CRY_REASONS.map((r) => r.value));

export type ParsedCry = {
	occurredAt: Date;
	durationSeconds: number | null;
	intensity: number;
	reason: string;
	trigger: string | null;
	soothedBy: string | null;
	location: string | null;
	hadTears: boolean;
	wasSoothed: boolean;
	notes: string | null;
};

export type CryParseResult =
	| { ok: true; data: ParsedCry }
	| { ok: false; error: string };

function s(value: FormDataEntryValue | null): string {
	return value == null ? '' : String(value).trim();
}

function nullableString(value: FormDataEntryValue | null, max: number): string | null {
	const v = s(value);
	if (!v) return null;
	return v.slice(0, max);
}

export function parseCryForm(data: FormData): CryParseResult {
	const occurredRaw = s(data.get('occurredAt'));
	if (!occurredRaw) return { ok: false, error: 'When did the cry happen?' };
	const occurredAt = new Date(occurredRaw);
	if (Number.isNaN(occurredAt.getTime())) {
		return { ok: false, error: 'Invalid date/time.' };
	}

	const intensityRaw = Number(s(data.get('intensity')));
	if (!Number.isInteger(intensityRaw) || intensityRaw < 1 || intensityRaw > 10) {
		return { ok: false, error: 'Intensity must be between 1 and 10.' };
	}

	const durRaw = s(data.get('durationMinutes'));
	let durationSeconds: number | null = null;
	if (durRaw) {
		const minutes = Number(durRaw);
		if (!Number.isFinite(minutes) || minutes < 0 || minutes > 24 * 60) {
			return { ok: false, error: 'Duration must be between 0 and 1440 minutes.' };
		}
		durationSeconds = Math.round(minutes * 60);
	}

	const reasonRaw = s(data.get('reason'));
	let reason: string;
	if (reasonRaw === 'other') {
		const custom = s(data.get('customReason')).slice(0, 40);
		if (!custom) return { ok: false, error: 'Add a custom reason or pick one above.' };
		reason = custom;
	} else if (KNOWN.has(reasonRaw)) {
		reason = reasonRaw;
	} else {
		return { ok: false, error: 'Pick a reason.' };
	}

	return {
		ok: true,
		data: {
			occurredAt,
			durationSeconds,
			intensity: intensityRaw,
			reason,
			trigger: nullableString(data.get('trigger'), 120),
			soothedBy: nullableString(data.get('soothedBy'), 120),
			location: nullableString(data.get('location'), 60),
			hadTears: !!data.get('hadTears'),
			wasSoothed: !!data.get('wasSoothed'),
			notes: nullableString(data.get('notes'), 2000)
		}
	};
}
