export const CRY_REASONS = [
	{ value: 'hunger', label: 'Hunger' },
	{ value: 'sleepy', label: 'Sleepy' },
	{ value: 'diaper', label: 'Diaper' },
	{ value: 'discomfort', label: 'Discomfort' },
	{ value: 'pain', label: 'Pain' },
	{ value: 'overstimulated', label: 'Overstimulated' },
	{ value: 'attention', label: 'Wants attention' },
	{ value: 'frustrated', label: 'Frustrated' },
	{ value: 'scared', label: 'Scared' },
	{ value: 'sick', label: 'Sick' },
	{ value: 'bored', label: 'Bored' },
	{ value: 'unknown', label: 'Unknown' }
] as const;

export const REASON_LABELS = new Map<string, string>(CRY_REASONS.map((r) => [r.value, r.label]));

export function reasonLabel(value: string): string {
	return REASON_LABELS.get(value) ?? value.charAt(0).toUpperCase() + value.slice(1);
}

export function intensityLabel(intensity: number): string {
	if (intensity <= 2) return 'Whimper';
	if (intensity <= 4) return 'Fuss';
	if (intensity <= 6) return 'Cry';
	if (intensity <= 8) return 'Wail';
	return 'Meltdown';
}

export function formatDuration(seconds: number | null | undefined): string {
	if (seconds == null) return '—';
	if (seconds < 60) return `${seconds}s`;
	const m = Math.floor(seconds / 60);
	const s = seconds % 60;
	if (m < 60) return s ? `${m}m ${s}s` : `${m}m`;
	const h = Math.floor(m / 60);
	const mm = m % 60;
	return mm ? `${h}h ${mm}m` : `${h}h`;
}

export function relativeTime(date: Date | string): string {
	const d = typeof date === 'string' ? new Date(date) : date;
	const diff = Date.now() - d.getTime();
	const sec = Math.round(diff / 1000);
	if (sec < 5) return 'just now';
	if (sec < 60) return `${sec}s ago`;
	const min = Math.round(sec / 60);
	if (min < 60) return `${min}m ago`;
	const hr = Math.round(min / 60);
	if (hr < 24) return `${hr}h ago`;
	const day = Math.round(hr / 24);
	if (day < 14) return `${day}d ago`;
	return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(d);
}

export function formatDateTime(date: Date | string): string {
	const d = typeof date === 'string' ? new Date(date) : date;
	return new Intl.DateTimeFormat(undefined, {
		month: 'short',
		day: 'numeric',
		hour: 'numeric',
		minute: '2-digit'
	}).format(d);
}

export function toDateTimeLocal(date: Date | string): string {
	const d = typeof date === 'string' ? new Date(date) : date;
	const pad = (n: number) => String(n).padStart(2, '0');
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
