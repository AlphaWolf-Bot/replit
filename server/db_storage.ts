import {
  users, tasks, userTasks, transactions, friends,
  type User, type InsertUser, type Task, type InsertTask,
  type UserTask, type InsertUserTask, type Transaction, 
  type InsertTransaction, type Friend, type InsertFriend
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";
import { randomBytes } from "crypto";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByTelegramId(telegramId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined>;
  
  // Task operations
  getTasks(isDaily?: boolean): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  getUserTasks(userId: number): Promise<(UserTask & { task: Task })[]>;
  assignTaskToUser(data: InsertUserTask): Promise<UserTask>;
  updateUserTask(userId: number, taskId: number, progress: number): Promise<UserTask | undefined>;
  completeUserTask(userId: number, taskId: number): Promise<UserTask | undefined>;
  
  // Transaction operations
  getUserTransactions(userId: number, limit?: number): Promise<Transaction[]>;
  createTransaction(data: InsertTransaction): Promise<Transaction>;
  
  // Friend operations
  getUserFriends(userId: number): Promise<(Friend & { friend: User })[]>;
  addFriend(data: InsertFriend): Promise<Friend>;
  
  // Referral operations
  generateReferralCode(): Promise<string>;
  getUserByReferralCode(code: string): Promise<User | undefined>;
  getReferrals(userId: number): Promise<{ count: number, earnings: number }>;
  
  // Leaderboard
  getLeaderboard(limit?: number): Promise<User[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByTelegramId(telegramId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.telegramId, telegramId));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Generate a referral code if not provided
    if (!insertUser.referralCode) {
      insertUser.referralCode = await this.generateReferralCode();
    }

    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
  
  async updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return updatedUser || undefined;
  }
  
  async getTasks(isDaily?: boolean): Promise<Task[]> {
    if (isDaily !== undefined) {
      return db.select().from(tasks).where(eq(tasks.type, isDaily ? "daily" : "weekly"));
    }
    return db.select().from(tasks);
  }
  
  async getTask(id: number): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task || undefined;
  }
  
  async getUserTasks(userId: number): Promise<(UserTask & { task: Task })[]> {
    const results = await db
      .select()
      .from(userTasks)
      .innerJoin(tasks, eq(userTasks.taskId, tasks.id))
      .where(eq(userTasks.userId, userId));
    
    return results.map(row => ({
      ...row.user_tasks,
      task: row.tasks
    }));
  }
  
  async assignTaskToUser(data: InsertUserTask): Promise<UserTask> {
    const [userTask] = await db
      .insert(userTasks)
      .values(data)
      .returning();
    return userTask;
  }
  
  async updateUserTask(userId: number, taskId: number, progress: number): Promise<UserTask | undefined> {
    const task = await this.getTask(taskId);
    if (!task) return undefined;
    
    // Check if task is completed
    const isCompleted = progress >= task.target;
    
    const [updatedUserTask] = await db
      .update(userTasks)
      .set({ 
        progress,
        isCompleted,
        updatedAt: new Date()
      })
      .where(
        and(
          eq(userTasks.userId, userId),
          eq(userTasks.taskId, taskId)
        )
      )
      .returning();
    
    if (!updatedUserTask) return undefined;
    
    // If task was completed and reward not claimed, update user's coins
    if (isCompleted && !updatedUserTask.claimedReward) {
      const user = await this.getUser(userId);
      if (user) {
        await this.updateUser(userId, { coins: user.coins + task.reward });
        
        // Mark reward as claimed
        await db
          .update(userTasks)
          .set({ claimedReward: true })
          .where(
            and(
              eq(userTasks.userId, userId),
              eq(userTasks.taskId, taskId)
            )
          );
        
        // Add transaction record
        await this.createTransaction({
          userId,
          amount: task.reward,
          type: 'task_reward',
          description: `Completed task: ${task.title}`
        });
      }
    }
    
    return updatedUserTask;
  }
  
  async completeUserTask(userId: number, taskId: number): Promise<UserTask | undefined> {
    const task = await this.getTask(taskId);
    if (!task) return undefined;
    
    return this.updateUserTask(userId, taskId, task.target);
  }
  
  async getUserTransactions(userId: number, limit: number = 20): Promise<Transaction[]> {
    return db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt))
      .limit(limit);
  }
  
  async createTransaction(data: InsertTransaction): Promise<Transaction> {
    const [transaction] = await db
      .insert(transactions)
      .values(data)
      .returning();
    return transaction;
  }
  
  async getUserFriends(userId: number): Promise<(Friend & { friend: User })[]> {
    const results = await db
      .select()
      .from(friends)
      .innerJoin(users, eq(friends.friendId, users.id))
      .where(eq(friends.userId, userId));
    
    return results.map(row => ({
      ...row.friends,
      friend: row.users
    }));
  }
  
  async addFriend(data: InsertFriend): Promise<Friend> {
    const [friend] = await db
      .insert(friends)
      .values(data)
      .returning();
    return friend;
  }
  
  async generateReferralCode(): Promise<string> {
    // Generate a random 8-character alphanumeric code
    const code = randomBytes(4).toString('hex');
    
    // Check if code already exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.referralCode, code));
    
    // If code already exists, generate another one
    if (existingUser) {
      return this.generateReferralCode();
    }
    
    return code;
  }
  
  async getUserByReferralCode(code: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.referralCode, code));
    return user || undefined;
  }
  
  async getReferrals(userId: number): Promise<{ count: number, earnings: number }> {
    // Count users who have this user as their referrer
    const referrals = await db
      .select()
      .from(users)
      .where(eq(users.referrerId, userId));
    
    // Sum earnings from referral transactions
    const [result] = await db
      .select({
        sum: sql<number>`COALESCE(SUM(${transactions.amount}), 0)`
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          eq(transactions.type, 'referral_bonus')
        )
      );
    
    const earnings = result?.sum || 0;
    
    return {
      count: referrals.length,
      earnings
    };
  }
  
  async getLeaderboard(limit: number = 10): Promise<User[]> {
    return db
      .select()
      .from(users)
      .orderBy(desc(users.coins))
      .limit(limit);
  }
}

export const storage = new DatabaseStorage();