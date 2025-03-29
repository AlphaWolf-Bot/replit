import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { authenticateTelegram } from "./middlewares/auth.js";
import authRoutes from "./routes/auth.js";
import walletRoutes from "./routes/wallet.js";
import referralRoutes from "./routes/referrals.js";
import coinRoutes, { setWebSocketServer } from "./routes/coin.js";
import adminRoutes from "./routes/admin.js";
import leaderboardRoutes from "./routes/leaderboard.js";
import badgeRoutes from "./routes/badges.js";
import { db } from "./db";
import * as schema from "../shared/schema";
import { eq, desc } from "drizzle-orm";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes
  const apiRouter = express.Router();
  
  // Public routes - no authentication required
  apiRouter.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" });
  });
  
  // Set up auth routes correctly to avoid duplicate processing
  // Login route - no authentication
  apiRouter.post("/auth/login", (req, res) => {
    authRoutes.handle(req, res);
  });
  
  // Me route - requires authentication
  apiRouter.get("/auth/me", authenticateTelegram, (req, res) => {
    authRoutes.handle(req, res);
  });
  
  // Other protected routes
  apiRouter.use("/wallet", authenticateTelegram, walletRoutes);
  apiRouter.use("/referrals", authenticateTelegram, referralRoutes);
  apiRouter.use("/coin", authenticateTelegram, coinRoutes);
  apiRouter.use("/admin", adminRoutes);
  apiRouter.use("/leaderboard", leaderboardRoutes);
  apiRouter.use("/badges", badgeRoutes);
  
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
  
  // Setup WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Pass WebSocket server to coin routes for leaderboard broadcasting
  setWebSocketServer(wss);
  
  // Function to fetch leaderboard data
  async function getLeaderboardData(limit = 10) {
    return await db
      .select({
        id: schema.users.id,
        username: schema.users.username,
        firstName: schema.users.firstName,
        lastName: schema.users.lastName,
        photoUrl: schema.users.photoUrl,
        level: schema.users.level,
        wolfRank: schema.users.wolfRank,
        coins: schema.users.coins
      })
      .from(schema.users)
      .orderBy(desc(schema.users.coins))
      .limit(limit);
  }
  
  // Function to broadcast leaderboard to all connected clients
  async function broadcastLeaderboard() {
    const leaderboard = await getLeaderboardData();
    const data = JSON.stringify({
      type: 'leaderboard_update',
      data: leaderboard
    });
    
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  }
  
  // Handle WebSocket connections
  wss.on('connection', (ws) => {
    console.log('Client connected to WebSocket');
    
    // Send initial leaderboard data
    getLeaderboardData().then(leaderboard => {
      ws.send(JSON.stringify({
        type: 'leaderboard_update',
        data: leaderboard
      }));
    });
    
    // Handle messages from clients
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log('Received WebSocket message:', data);
        
        // Handle different message types
        if (data.type === 'request_leaderboard') {
          getLeaderboardData(data.limit || 10).then(leaderboard => {
            ws.send(JSON.stringify({
              type: 'leaderboard_update',
              data: leaderboard
            }));
          });
        }
      } catch (error) {
        console.error('Error handling WebSocket message:', error);
      }
    });
    
    // Handle disconnections
    ws.on('close', () => {
      console.log('Client disconnected from WebSocket');
    });
  });
  
  // Setup interval to broadcast leaderboard updates every 30 seconds
  setInterval(broadcastLeaderboard, 30000);
  
  return httpServer;
}
