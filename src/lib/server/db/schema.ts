import { boolean, index, integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
	id: uuid('id').defaultRandom().primaryKey(),
	email: text('email').notNull().unique(),
	passwordHash: text('password_hash').notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});

export const profiles = pgTable('profiles', {
	id: uuid('id').defaultRandom().primaryKey(),
	userId: uuid('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	name: text('name').notNull(),
	avatarColor: text('avatar_color').notNull().default('preset-filled-primary-500'),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});

export const sessions = pgTable('sessions', {
	id: text('id').primaryKey(),
	userId: uuid('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	activeProfileId: uuid('active_profile_id').references(() => profiles.id, {
		onDelete: 'set null'
	}),
	expiresAt: timestamp('expires_at', { withTimezone: true }).notNull()
});

export const cryEvents = pgTable(
	'cry_events',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		profileId: uuid('profile_id')
			.notNull()
			.references(() => profiles.id, { onDelete: 'cascade' }),
		occurredAt: timestamp('occurred_at', { withTimezone: true }).defaultNow().notNull(),
		durationSeconds: integer('duration_seconds'),
		intensity: integer('intensity').notNull(),
		reason: text('reason').notNull(),
		trigger: text('trigger'),
		soothedBy: text('soothed_by'),
		location: text('location'),
		hadTears: boolean('had_tears').notNull().default(false),
		wasSoothed: boolean('was_soothed').notNull().default(true),
		notes: text('notes'),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
	},
	(t) => [index('cry_profile_occurred_idx').on(t.profileId, t.occurredAt)]
);

export const usersRelations = relations(users, ({ many }) => ({
	profiles: many(profiles),
	sessions: many(sessions)
}));

export const profilesRelations = relations(profiles, ({ one, many }) => ({
	user: one(users, { fields: [profiles.userId], references: [users.id] }),
	cryEvents: many(cryEvents)
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
	user: one(users, { fields: [sessions.userId], references: [users.id] }),
	activeProfile: one(profiles, { fields: [sessions.activeProfileId], references: [profiles.id] })
}));

export const cryEventsRelations = relations(cryEvents, ({ one }) => ({
	profile: one(profiles, { fields: [cryEvents.profileId], references: [profiles.id] })
}));

export type User = typeof users.$inferSelect;
export type Profile = typeof profiles.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type CryEvent = typeof cryEvents.$inferSelect;
export type NewCryEvent = typeof cryEvents.$inferInsert;
