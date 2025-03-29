import { pgTable, text, serial, integer, boolean, timestamp, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  telegramId: text("telegram_id").notNull().unique(),
  username: text("username").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name"),
  photoUrl: text("photo_url"),
  level: integer("level").default(1).notNull(),
  xp: integer("xp").default(0).notNull(),
  coins: integer("coins").default(0).notNull(),
  referralCode: text("referral_code").notNull().unique(),
  referrerId: integer("referrer_id").references(() => users.id),
  dailyTapCount: integer("daily_tap_count").default(0).notNull(),
  lastTapDate: date("last_tap_date"),
  wolfRank: text("wolf_rank").default("Pup").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // daily, weekly, special, social
  icon: text("icon").notNull(),
  iconColor: text("icon_color").notNull(),
  target: integer("target").notNull(),
  reward: integer("reward").notNull(),
  socialLink: text("social_link"), // Optional link for social media tasks
  isActive: boolean("is_active").default(true).notNull(),
});

export const userTasks = pgTable("user_tasks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  taskId: integer("task_id").references(() => tasks.id).notNull(),
  progress: integer("progress").default(0).notNull(),
  isCompleted: boolean("is_completed").default(false).notNull(),
  claimedReward: boolean("claimed_reward").default(false).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const friends = pgTable("friends", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  friendId: integer("friend_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  amount: integer("amount").notNull(),
  type: text("type").notNull(), // withdraw, task_reward, referral_bonus, tap_reward, game_reward, social_reward
  description: text("description").notNull(),
  status: text("status").default("pending").notNull(), // pending, completed, rejected
  paymentInfo: text("payment_info"), // For storing payment details like UPI ID
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const games = pgTable("games", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // casual, tournament, challenge
  icon: text("icon").notNull(),
  iconColor: text("icon_color").notNull(),
  minReward: integer("min_reward").notNull(),
  maxReward: integer("max_reward").notNull(),
  xpReward: integer("xp_reward").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userGames = pgTable("user_games", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  gameId: integer("game_id").references(() => games.id).notNull(),
  score: integer("score").default(0).notNull(),
  coinsWon: integer("coins_won").default(0).notNull(),
  xpEarned: integer("xp_earned").default(0).notNull(),
  playedAt: timestamp("played_at").defaultNow().notNull(),
});

export const levels = pgTable("levels", {
  id: serial("id").primaryKey(),
  level: integer("level").notNull().unique(),
  wolfRank: text("wolf_rank").notNull(),
  xpRequired: integer("xp_required").notNull(),
  reward: integer("reward").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const socialMedia = pgTable("social_media", {
  id: serial("id").primaryKey(),
  platform: text("platform").notNull(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  icon: text("icon").notNull(),
  reward: integer("reward").default(100).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

export const userSocialMedia = pgTable("user_social_media", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  socialMediaId: integer("social_media_id").references(() => socialMedia.id).notNull(),
  isFollowed: boolean("is_followed").default(false).notNull(),
  rewardClaimed: boolean("reward_claimed").default(false).notNull(),
  claimedAt: timestamp("claimed_at"),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ 
  id: true,
  createdAt: true 
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true
});

export const insertUserTaskSchema = createInsertSchema(userTasks).omit({
  id: true,
  updatedAt: true
});

export const insertFriendSchema = createInsertSchema(friends).omit({
  id: true,
  createdAt: true
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true
});

export const insertGameSchema = createInsertSchema(games).omit({
  id: true,
  createdAt: true
});

export const insertUserGameSchema = createInsertSchema(userGames).omit({
  id: true,
  playedAt: true
});

export const insertLevelSchema = createInsertSchema(levels).omit({
  id: true,
  createdAt: true
});

export const insertSocialMediaSchema = createInsertSchema(socialMedia).omit({
  id: true
});

export const insertUserSocialMediaSchema = createInsertSchema(userSocialMedia).omit({
  id: true,
  claimedAt: true
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;

export type InsertUserTask = z.infer<typeof insertUserTaskSchema>;
export type UserTask = typeof userTasks.$inferSelect;

export type InsertFriend = z.infer<typeof insertFriendSchema>;
export type Friend = typeof friends.$inferSelect;

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

export type InsertGame = z.infer<typeof insertGameSchema>;
export type Game = typeof games.$inferSelect;

export type InsertUserGame = z.infer<typeof insertUserGameSchema>;
export type UserGame = typeof userGames.$inferSelect;

export type InsertLevel = z.infer<typeof insertLevelSchema>;
export type Level = typeof levels.$inferSelect;

export type InsertSocialMedia = z.infer<typeof insertSocialMediaSchema>;
export type SocialMedia = typeof socialMedia.$inferSelect;

export type InsertUserSocialMedia = z.infer<typeof insertUserSocialMediaSchema>;
export type UserSocialMedia = typeof userSocialMedia.$inferSelect;
