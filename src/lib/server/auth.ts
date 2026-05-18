import { hash, verify } from '@node-rs/argon2';
import { sha256 } from '@oslojs/crypto/sha2';
import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from '@oslojs/encoding';
import { eq } from 'drizzle-orm';
import type { RequestEvent } from '@sveltejs/kit';
import { db } from './db';
import { sessions, users, profiles, type Profile, type User } from './db/schema';

const SESSION_COOKIE = 'session';
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 30;
const SESSION_RENEW_THRESHOLD_MS = 1000 * 60 * 60 * 24 * 15;

const ARGON_OPTS = {
	memoryCost: 19456,
	timeCost: 2,
	outputLen: 32,
	parallelism: 1
};

export async function hashPassword(password: string): Promise<string> {
	return hash(password, ARGON_OPTS);
}

export async function verifyPassword(hashStr: string, password: string): Promise<boolean> {
	return verify(hashStr, password, ARGON_OPTS);
}

function generateSessionToken(): string {
	const bytes = new Uint8Array(20);
	crypto.getRandomValues(bytes);
	return encodeBase32LowerCaseNoPadding(bytes);
}

function hashSessionToken(token: string): string {
	return encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
}

export async function createSession(userId: string): Promise<{ token: string; expiresAt: Date }> {
	const token = generateSessionToken();
	const sessionId = hashSessionToken(token);
	const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
	await db.insert(sessions).values({ id: sessionId, userId, expiresAt });
	return { token, expiresAt };
}

export type SessionValidation =
	| { session: null; user: null; profile: null }
	| { session: { id: string; expiresAt: Date }; user: User; profile: Profile | null };

export async function validateSessionToken(token: string): Promise<SessionValidation> {
	const sessionId = hashSessionToken(token);
	const rows = await db
		.select({ session: sessions, user: users, profile: profiles })
		.from(sessions)
		.innerJoin(users, eq(sessions.userId, users.id))
		.leftJoin(profiles, eq(sessions.activeProfileId, profiles.id))
		.where(eq(sessions.id, sessionId));
	const row = rows[0];
	if (!row) return { session: null, user: null, profile: null };
	const now = Date.now();
	if (now >= row.session.expiresAt.getTime()) {
		await db.delete(sessions).where(eq(sessions.id, sessionId));
		return { session: null, user: null, profile: null };
	}
	if (now >= row.session.expiresAt.getTime() - SESSION_RENEW_THRESHOLD_MS) {
		const newExpiresAt = new Date(now + SESSION_DURATION_MS);
		await db.update(sessions).set({ expiresAt: newExpiresAt }).where(eq(sessions.id, sessionId));
		row.session.expiresAt = newExpiresAt;
	}
	return {
		session: { id: row.session.id, expiresAt: row.session.expiresAt },
		user: row.user,
		profile: row.profile
	};
}

export async function invalidateSession(sessionId: string): Promise<void> {
	await db.delete(sessions).where(eq(sessions.id, sessionId));
}

export async function setActiveProfile(sessionId: string, profileId: string | null): Promise<void> {
	await db.update(sessions).set({ activeProfileId: profileId }).where(eq(sessions.id, sessionId));
}

export function setSessionCookie(event: RequestEvent, token: string, expiresAt: Date): void {
	event.cookies.set(SESSION_COOKIE, token, {
		httpOnly: true,
		sameSite: 'lax',
		path: '/',
		secure: !import.meta.env.DEV,
		expires: expiresAt
	});
}

export function clearSessionCookie(event: RequestEvent): void {
	event.cookies.delete(SESSION_COOKIE, { path: '/' });
}

export function readSessionCookie(event: RequestEvent): string | undefined {
	return event.cookies.get(SESSION_COOKIE);
}
