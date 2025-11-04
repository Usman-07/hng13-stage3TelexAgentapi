import express from 'express';
import dotenv from 'dotenv';
import { plannerAgent } from './agent.js';

dotenv.config();

const app = express();
app.use(express.json());

// A2A Protocol Endpoint (Telex calls this)
app.post('/a2a/agent/plannerAgent', async (req, res) => {
  try {
    console.log(' Received request:', JSON.stringify(req.body, null, 2));
    
    const { message, userId, channelId } = req.body;
    
    // Validate request
    if (!message) {
      return res.status(400).json({
        error: 'Missing message in request body'
      });
    }
    
    // Generate response using the agent
    const response = await plannerAgent.generate(message, {
      userId: userId || 'default-user',
      channelId: channelId || 'default-channel'
    });
    
    console.log(' Sending response:', response.text.substring(0, 100) + '...');
    
    // A2A Response Format
    res.json({
      response: response.text,
      metadata: {
        agentName: 'Weekly Goal Planner',
        timestamp: new Date().toISOString(),
        userId: userId
      }
    });
    
  } catch (error) {
    console.error(' Agent error:', error);
    res.status(500).json({
      error: 'Failed to process request',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    agent: 'plannerAgent',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {7
  res.json({
    name: 'Weekly Goal Planner Agent',
    description: 'Helps you break down weekly goals into daily tasks',
    endpoints: {
      a2a: '/a2a/agent/plannerAgent',
      health: '/health'
    }
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('========================================');
  console.log(`   Weekly Goal Planner Agent`);
  console.log('========================================');
  console.log(`Server running on port ${PORT}`);
  console.log(`A2A endpoint: http://localhost:${PORT}/a2a/agent/plannerAgent`);
  console.log(` Health check: http://localhost:${PORT}/health`);
  console.log(' ========================================');
});