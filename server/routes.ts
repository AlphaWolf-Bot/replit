import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { authenticateTelegram } from "./middlewares/auth.js";
import authRoutes from "./routes/auth.js";
import walletRoutes from "./routes/wallet.js";
import referralRoutes from "./routes/referrals.js";
import coinRoutes from "./routes/coin.js";
import adminRoutes from "./routes/admin.js";
import { db } from "./db";
import * as schema from "../shared/schema";
import { eq } from "drizzle-orm";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes
  const apiRouter = express.Router();
  
  // Public routes - no authentication required
  apiRouter.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" });
  });
  
  // Protected routes - Telegram authentication required
  apiRouter.use("/auth", authRoutes);
  apiRouter.use("/wallet", authenticateTelegram, walletRoutes);
  apiRouter.use("/referrals", authenticateTelegram, referralRoutes);
  apiRouter.use("/coin", coinRoutes);
  apiRouter.use("/admin", adminRoutes);
  
  // Tasks API
  apiRouter.get("/tasks", authenticateTelegram, async (req, res) => {
    try {
      const telegramUser = req.telegramUser;
      
      if (!telegramUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const [user] = await db
        .select({ id: schema.users.id })
        .from(schema.users)
        .where(eq(schema.users.telegramId, telegramUser.id.toString()));
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get all active tasks
      const activeTasks = await db
        .select()
        .from(schema.tasks)
        .where(eq(schema.tasks.isActive, true));
      
      // Get user's progress on tasks
      const userTasks = await db
        .select()
        .from(schema.userTasks)
        .where(eq(schema.userTasks.userId, user.id));
      
      // Combine task data with user progress
      const tasksWithProgress = activeTasks.map(task => {
        const userTask = userTasks.find(ut => ut.taskId === task.id);
        return {
          ...task,
          progress: userTask?.progress || 0,
          isCompleted: userTask?.isCompleted || false,
          claimedReward: userTask?.claimedReward || false
        };
      });
      
      res.status(200).json(tasksWithProgress);
    } catch (error) {
      console.error("Get tasks error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Progress tracking - Update task progress
  apiRouter.post("/tasks/progress", authenticateTelegram, async (req, res) => {
    try {
      const telegramUser = req.telegramUser;
      const { taskId, progress } = req.body;
      
      if (!telegramUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      if (!taskId || typeof progress !== "number") {
        return res.status(400).json({ message: "Invalid request data" });
      }
      
      const [user] = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.telegramId, telegramUser.id.toString()));
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get the task
      const [task] = await db
        .select()
        .from(schema.tasks)
        .where(eq(schema.tasks.id, taskId));
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      // Get user's current progress
      const [userTask] = await db
        .select()
        .from(schema.userTasks)
        .where(eq(schema.userTasks.userId, user.id))
        .where(eq(schema.userTasks.taskId, taskId));
      
      // If user has no progress record for this task, create one
      if (!userTask) {
        await db.insert(schema.userTasks).values({
          userId: user.id,
          taskId: taskId,
          progress: progress,
          isCompleted: progress >= task.target,
          claimedReward: false
        });
      } else {
        // Update existing progress
        const newProgress = Math.min(progress, task.target);
        const isCompleted = newProgress >= task.target;
        
        await db
          .update(schema.userTasks)
          .set({
            progress: newProgress,
            isCompleted: isCompleted
          })
          .where(eq(schema.userTasks.id, userTask.id));
      }
      
      res.status(200).json({ message: "Progress updated successfully" });
    } catch (error) {
      console.error("Update task progress error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Claim task reward
  apiRouter.post("/tasks/claim", authenticateTelegram, async (req, res) => {
    try {
      const telegramUser = req.telegramUser;
      const { taskId } = req.body;
      
      if (!telegramUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      if (!taskId) {
        return res.status(400).json({ message: "Task ID is required" });
      }
      
      const [user] = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.telegramId, telegramUser.id.toString()));
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get the task
      const [task] = await db
        .select()
        .from(schema.tasks)
        .where(eq(schema.tasks.id, taskId));
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      // Get user's progress
      const [userTask] = await db
        .select()
        .from(schema.userTasks)
        .where(eq(schema.userTasks.userId, user.id))
        .where(eq(schema.userTasks.taskId, taskId));
      
      if (!userTask) {
        return res.status(404).json({ message: "Task progress not found" });
      }
      
      if (!userTask.isCompleted) {
        return res.status(400).json({ message: "Task not completed yet" });
      }
      
      if (userTask.claimedReward) {
        return res.status(400).json({ message: "Reward already claimed" });
      }
      
      // Mark reward as claimed
      await db
        .update(schema.userTasks)
        .set({ claimedReward: true })
        .where(eq(schema.userTasks.id, userTask.id));
      
      // Create transaction for reward
      await db.insert(schema.transactions).values({
        userId: user.id,
        amount: task.reward,
        type: "task_reward",
        description: `Reward for completing task: ${task.title}`
      });
      
      // Update user coins
      await db
        .update(schema.users)
        .set({ coins: user.coins + task.reward })
        .where(eq(schema.users.id, user.id));
      
      res.status(200).json({
        message: "Reward claimed successfully",
        reward: task.reward
      });
    } catch (error) {
      console.error("Claim task reward error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Mount all API routes under /api prefix
  app.use("/api", apiRouter);
  
  const httpServer = createServer(app);
  return httpServer;
}
