import { Agent } from '@mastra/core';
import { groq } from '@ai-sdk/groq';

// Simple in-memory storage
const userPlans = new Map();

export const plannerAgent = new Agent({
  name: 'plannerAgent',
  
  instructions: `You are a productivity assistant that helps users plan their week.

When a user shares their weekly goals:
1. Listen carefully to what they want to achieve
2. Break down each goal into specific, actionable daily tasks
3. Distribute tasks evenly across the week (Monday to Sunday)
4. Call the saveWeeklyPlan tool to save the plan
5. Confirm the plan was saved

When asked about today's tasks:
1. Call the getTodayTasks tool first
2. Present the tasks in a friendly, encouraging way

Always be friendly, supportive, and clear.`,

  // Correct model configuration for Mastra
  model: groq('llama-3.3-70b-versatile', {
    apiKey: process.env.GROQ_API_KEY
  }),

  tools: [
    {
      name: 'saveWeeklyPlan',
      description: 'Saves a user\'s weekly plan with daily tasks',
      parameters: {
        type: 'object',
        properties: {
          userId: { 
            type: 'string',
            description: 'The user ID'
          },
          plan: {
            type: 'object',
            description: 'Daily tasks for each day',
            properties: {
              monday: { type: 'array', items: { type: 'string' } },
              tuesday: { type: 'array', items: { type: 'string' } },
              wednesday: { type: 'array', items: { type: 'string' } },
              thursday: { type: 'array', items: { type: 'string' } },
              friday: { type: 'array', items: { type: 'string' } },
              saturday: { type: 'array', items: { type: 'string' } },
              sunday: { type: 'array', items: { type: 'string' } }
            }
          }
        },
        required: ['userId', 'plan']
      },
      execute: async ({ userId, plan }) => {
        userPlans.set(userId, {
          tasks: plan,
          createdAt: new Date().toISOString()
        });
        console.log(` Saved plan for user ${userId}`);
        console.log('Plan:', JSON.stringify(plan, null, 2));
        return { 
          success: true, 
          message: 'Your weekly plan has been saved! I\'ll help you stay on track.' 
        };
      }
    },
    {
      name: 'getTodayTasks',
      description: 'Gets today\'s tasks for a user',
      parameters: {
        type: 'object',
        properties: {
          userId: { 
            type: 'string',
            description: 'The user ID'
          }
        },
        required: ['userId']
      },
      execute: async ({ userId }) => {
        const plan = userPlans.get(userId);
        
        if (!plan) {
          return { 
            success: false,
            tasks: [], 
            message: 'No plan found. Share your weekly goals to get started!' 
          };
        }
        
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const today = days[new Date().getDay()];
        const tasks = plan.tasks[today] || [];
        
        console.log(`Getting tasks for ${today}:`, tasks);
        
        return {
          success: true,
          day: today,
          tasks: tasks,
          message: tasks.length > 0 
            ? `Here are your tasks for ${today}` 
            : `No tasks scheduled for ${today}. Enjoy your day!`
        };
      }
    },
    {
      name: 'getFullPlan',
      description: 'Gets the entire weekly plan for a user',
      parameters: {
        type: 'object',
        properties: {
          userId: { type: 'string' }
        },
        required: ['userId']
      },
      execute: async ({ userId }) => {
        const plan = userPlans.get(userId);
        
        if (!plan) {
          return { 
            success: false,
            message: 'No plan found.' 
          };
        }
        
        return {
          success: true,
          plan: plan.tasks,
          createdAt: plan.createdAt
        };
      }
    }
  ]
});