# Telex - Goal Planner Agent

## Overview
**Telex Goal Planner** is an AI-powered productivity assistant built with the [Mastra] framework.  
It helps users break down their **weekly goals** into **daily actionable tasks**, providing clarity and structure throughout the week.

It integrates directly with **Telex.im** using the A2A (Agent-to-Agent) protocol.

---

## Features
- Accepts a user’s weekly goal and creates a structured daily plan.
- Sends concise, helpful responses formatted for Telex.
- Can be extended to send reminders or integrate with real AI APIs later.
- Lightweight and runs on any Node.js environment.

---

## Endpoints

// A2A Protocol Endpoint (Telex calls this)
POST: baseUrl + ('/a2a/agent/plannerAgent') 

// Health check endpoint
GET: baseUrl + ('/health') 

// Root endpoint
GET: baseUrl + ('/',) 