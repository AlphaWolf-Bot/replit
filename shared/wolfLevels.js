/**
 * This file defines the 100 wolf rank levels with unique names.
 * Each level is progressively harder to achieve, requiring more XP.
 */

const wolfLevels = [
  // Levels 1-10: Beginner Wolves
  { level: 1, wolfRank: "Wolf Pup", xpRequired: 0, reward: 10 },
  { level: 2, wolfRank: "Curious Cub", xpRequired: 100, reward: 15 },
  { level: 3, wolfRank: "Playful Yearling", xpRequired: 250, reward: 20 },
  { level: 4, wolfRank: "Keen Scout", xpRequired: 450, reward: 25 },
  { level: 5, wolfRank: "Pack Follower", xpRequired: 700, reward: 30 },
  { level: 6, wolfRank: "Trail Hunter", xpRequired: 1000, reward: 35 },
  { level: 7, wolfRank: "Nimble Tracker", xpRequired: 1350, reward: 40 },
  { level: 8, wolfRank: "Lone Roamer", xpRequired: 1750, reward: 45 },
  { level: 9, wolfRank: "Night Wanderer", xpRequired: 2200, reward: 50 },
  { level: 10, wolfRank: "Howling Novice", xpRequired: 2700, reward: 100 },
  
  // Levels 11-20: Intermediate Wolves
  { level: 11, wolfRank: "Seasoned Hunter", xpRequired: 3300, reward: 60 },
  { level: 12, wolfRank: "Forest Stalker", xpRequired: 4000, reward: 65 },
  { level: 13, wolfRank: "Pack Contributor", xpRequired: 4800, reward: 70 },
  { level: 14, wolfRank: "Vigilant Sentry", xpRequired: 5700, reward: 75 },
  { level: 15, wolfRank: "Mountain Rover", xpRequired: 6700, reward: 80 },
  { level: 16, wolfRank: "Swift Hunter", xpRequired: 7800, reward: 85 },
  { level: 17, wolfRank: "Territorial Guard", xpRequired: 9000, reward: 90 },
  { level: 18, wolfRank: "Winter Survivor", xpRequired: 10300, reward: 95 },
  { level: 19, wolfRank: "Shadow Walker", xpRequired: 11700, reward: 100 },
  { level: 20, wolfRank: "Pack Defender", xpRequired: 13200, reward: 200 },
  
  // Levels 21-30: Advanced Wolves
  { level: 21, wolfRank: "Silent Tracker", xpRequired: 14800, reward: 110 },
  { level: 22, wolfRank: "Mighty Howler", xpRequired: 16500, reward: 115 },
  { level: 23, wolfRank: "Skilled Predator", xpRequired: 18300, reward: 120 },
  { level: 24, wolfRank: "Valley Watcher", xpRequired: 20200, reward: 125 },
  { level: 25, wolfRank: "Tundra Survivor", xpRequired: 22200, reward: 130 },
  { level: 26, wolfRank: "Bold Explorer", xpRequired: 24300, reward: 135 },
  { level: 27, wolfRank: "Wilderness Scout", xpRequired: 26500, reward: 140 },
  { level: 28, wolfRank: "Loyal Companion", xpRequired: 28800, reward: 145 },
  { level: 29, wolfRank: "Trusted Ally", xpRequired: 31200, reward: 150 },
  { level: 30, wolfRank: "Pack Lieutenant", xpRequired: 33700, reward: 300 },
  
  // Levels 31-40: Expert Wolves
  { level: 31, wolfRank: "Feared Hunter", xpRequired: 36300, reward: 160 },
  { level: 32, wolfRank: "Tactical Predator", xpRequired: 39000, reward: 165 },
  { level: 33, wolfRank: "Agile Pathfinder", xpRequired: 41800, reward: 170 },
  { level: 34, wolfRank: "Wise Tracker", xpRequired: 44700, reward: 175 },
  { level: 35, wolfRank: "Elite Scout", xpRequired: 47700, reward: 180 },
  { level: 36, wolfRank: "Respected Hunter", xpRequired: 50800, reward: 185 },
  { level: 37, wolfRank: "Veteran Wanderer", xpRequired: 54000, reward: 190 },
  { level: 38, wolfRank: "Strategic Prowler", xpRequired: 57300, reward: 195 },
  { level: 39, wolfRank: "Wise Veteran", xpRequired: 60700, reward: 200 },
  { level: 40, wolfRank: "Beta Wolf", xpRequired: 64200, reward: 400 },
  
  // Levels 41-50: Master Wolves
  { level: 41, wolfRank: "Fierce Protector", xpRequired: 67800, reward: 210 },
  { level: 42, wolfRank: "Honored Elder", xpRequired: 71500, reward: 215 },
  { level: 43, wolfRank: "Elite Hunter", xpRequired: 75300, reward: 220 },
  { level: 44, wolfRank: "Legendary Scout", xpRequired: 79200, reward: 225 },
  { level: 45, wolfRank: "Venerated Leader", xpRequired: 83200, reward: 230 },
  { level: 46, wolfRank: "Guardian of Trails", xpRequired: 87300, reward: 235 },
  { level: 47, wolfRank: "Mountain Master", xpRequired: 91500, reward: 240 },
  { level: 48, wolfRank: "Forest Sovereign", xpRequired: 95800, reward: 245 },
  { level: 49, wolfRank: "Respected Elder", xpRequired: 100200, reward: 250 },
  { level: 50, wolfRank: "Alpha Aspirant", xpRequired: 104700, reward: 500 },
  
  // Levels 51-60: Grand Wolves
  { level: 51, wolfRank: "Wilderness Monarch", xpRequired: 109300, reward: 260 },
  { level: 52, wolfRank: "Legendary Tracker", xpRequired: 114000, reward: 265 },
  { level: 53, wolfRank: "Elite Commander", xpRequired: 118800, reward: 270 },
  { level: 54, wolfRank: "Primal Instinct", xpRequired: 123700, reward: 275 },
  { level: 55, wolfRank: "Mystic Howler", xpRequired: 128700, reward: 280 },
  { level: 56, wolfRank: "Ancestral Guardian", xpRequired: 133800, reward: 285 },
  { level: 57, wolfRank: "Storm Walker", xpRequired: 139000, reward: 290 },
  { level: 58, wolfRank: "Tundra Master", xpRequired: 144300, reward: 295 },
  { level: 59, wolfRank: "Ancient Pathfinder", xpRequired: 149700, reward: 300 },
  { level: 60, wolfRank: "Alpha Contender", xpRequired: 155200, reward: 600 },
  
  // Levels 61-70: Epic Wolves
  { level: 61, wolfRank: "Wilderness Sovereign", xpRequired: 160800, reward: 310 },
  { level: 62, wolfRank: "Mountain Emperor", xpRequired: 166500, reward: 315 },
  { level: 63, wolfRank: "Legendary Guardian", xpRequired: 172300, reward: 320 },
  { level: 64, wolfRank: "Eternal Wanderer", xpRequired: 178200, reward: 325 },
  { level: 65, wolfRank: "Silver Fang", xpRequired: 184200, reward: 330 },
  { level: 66, wolfRank: "Mystic Guardian", xpRequired: 190300, reward: 335 },
  { level: 67, wolfRank: "Grand Protector", xpRequired: 196500, reward: 340 },
  { level: 68, wolfRank: "Supreme Tracker", xpRequired: 202800, reward: 345 },
  { level: 69, wolfRank: "Ancient Spirit", xpRequired: 209200, reward: 350 },
  { level: 70, wolfRank: "Junior Alpha", xpRequired: 215700, reward: 700 },
  
  // Levels 71-80: Legendary Wolves
  { level: 71, wolfRank: "Shadow Alpha", xpRequired: 222300, reward: 360 },
  { level: 72, wolfRank: "Ancestral Spirit", xpRequired: 229000, reward: 365 },
  { level: 73, wolfRank: "Winter's Guardian", xpRequired: 235800, reward: 370 },
  { level: 74, wolfRank: "Mystic Emperor", xpRequired: 242700, reward: 375 },
  { level: 75, wolfRank: "Ancient Alpha", xpRequired: 249700, reward: 380 },
  { level: 76, wolfRank: "Legendary Emperor", xpRequired: 256800, reward: 385 },
  { level: 77, wolfRank: "Eternal Guardian", xpRequired: 264000, reward: 390 },
  { level: 78, wolfRank: "Supreme Alpha", xpRequired: 271300, reward: 395 },
  { level: 79, wolfRank: "Wolf Deity", xpRequired: 278700, reward: 400 },
  { level: 80, wolfRank: "Alpha Elite", xpRequired: 286200, reward: 800 },
  
  // Levels 81-90: Mythic Wolves
  { level: 81, wolfRank: "Primal Alpha", xpRequired: 293800, reward: 410 },
  { level: 82, wolfRank: "Celestial Wolf", xpRequired: 301500, reward: 415 },
  { level: 83, wolfRank: "Mythic Howler", xpRequired: 309300, reward: 420 },
  { level: 84, wolfRank: "Astral Guardian", xpRequired: 317200, reward: 425 },
  { level: 85, wolfRank: "Phoenix Wolf", xpRequired: 325200, reward: 430 },
  { level: 86, wolfRank: "Ethereal Wanderer", xpRequired: 333300, reward: 435 },
  { level: 87, wolfRank: "Cosmic Alpha", xpRequired: 341500, reward: 440 },
  { level: 88, wolfRank: "Divine Protector", xpRequired: 349800, reward: 445 },
  { level: 89, wolfRank: "Transcendent Wolf", xpRequired: 358200, reward: 450 },
  { level: 90, wolfRank: "Alpha Immortal", xpRequired: 366700, reward: 900 },
  
  // Levels 91-100: Godly Wolves
  { level: 91, wolfRank: "Primal Deity", xpRequired: 375300, reward: 460 },
  { level: 92, wolfRank: "Wolf God", xpRequired: 384000, reward: 465 },
  { level: 93, wolfRank: "Celestial Alpha", xpRequired: 392800, reward: 470 },
  { level: 94, wolfRank: "Universal Guardian", xpRequired: 401700, reward: 475 },
  { level: 95, wolfRank: "Eternal Emperor", xpRequired: 410700, reward: 480 },
  { level: 96, wolfRank: "Godly Protector", xpRequired: 419800, reward: 485 },
  { level: 97, wolfRank: "Cosmic Deity", xpRequired: 429000, reward: 490 },
  { level: 98, wolfRank: "Supreme God", xpRequired: 438300, reward: 495 },
  { level: 99, wolfRank: "Transcendent Deity", xpRequired: 447700, reward: 500 },
  { level: 100, wolfRank: "Alpha Supreme", xpRequired: 457200, reward: 1000 }
];

export default wolfLevels;