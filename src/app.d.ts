import type { Profile, User } from '$lib/server/db/schema';

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user: User | null;
			profile: Profile | null;
			sessionId: string | null;
		}
		interface PageData {
			user: { id: string; email: string } | null;
			activeProfile: { id: string; name: string; avatarColor: string } | null;
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
