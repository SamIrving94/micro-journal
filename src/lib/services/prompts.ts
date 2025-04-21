import { logger } from '../logger';

// Define prompt templates by category
const PROMPT_TEMPLATES: Record<string, string[]> = {
  gratitude: [
    "What are three things you're grateful for today?",
    "Who is someone that made a positive impact on your life recently?",
    "What small joy did you experience today that you might normally overlook?",
    "What aspect of your health are you most grateful for right now?",
    "What's something beautiful you noticed in your environment today?"
  ],
  reflection: [
    "What was the most meaningful part of your day?",
    "What's one thing you learned today?",
    "How did you take care of yourself today?",
    "What would you do differently if you could repeat today?",
    "What's something you accomplished today that you're proud of?"
  ],
  learning: [
    "What new skill would you like to develop in the next month?",
    "What's something you learned recently that surprised you?",
    "What book, article, or conversation taught you something valuable lately?",
    "What mistake did you make recently, and what did you learn from it?",
    "What's one area of your life where you'd like to gain more knowledge?"
  ],
  emotions: [
    "How would you describe your emotional state today?",
    "What triggered strong emotions for you today, and how did you respond?",
    "What's one emotion you experienced today that you'd like to understand better?",
    "How did you manage a difficult emotion today?",
    "What brought you joy or peace today?"
  ],
  future: [
    "What's one thing you're looking forward to in the coming week?",
    "What's a small step you could take tomorrow toward an important goal?",
    "How do you want to feel at the end of this month?",
    "What's one habit you'd like to build in the near future?",
    "Visualize your ideal day one year from now. What does it look like?"
  ]
};

/**
 * Generate a random prompt from specified categories
 * @param categories Array of prompt categories to choose from
 * @returns A random prompt
 */
export async function generatePrompt(categories: string[]): Promise<string> {
  try {
    // Filter to only include valid categories
    const validCategories = categories.filter(cat => cat in PROMPT_TEMPLATES);
    
    // If no valid categories, default to reflection
    if (validCategories.length === 0) {
      logger.warn('No valid prompt categories provided, defaulting to reflection', { categories });
      validCategories.push('reflection');
    }
    
    // Randomly select a category
    const randomCategory = validCategories[Math.floor(Math.random() * validCategories.length)];
    
    // Randomly select a prompt from that category
    const prompts = PROMPT_TEMPLATES[randomCategory];
    const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
    
    return randomPrompt;
  } catch (error) {
    logger.error('Error generating prompt', { error, categories });
    return "What's one thing you're grateful for today?"; // Fallback prompt
  }
}

/**
 * Gets all available prompt categories with their descriptions
 * @returns Object with category IDs and descriptions
 */
export function getPromptCategories(): Record<string, string> {
  return {
    gratitude: "Prompts to reflect on things you're thankful for",
    reflection: "Prompts to reflect on your day and experiences",
    learning: "Prompts focused on growth and knowledge acquisition",
    emotions: "Prompts to explore your emotional landscape",
    future: "Prompts for goal-setting and future planning"
  };
} 