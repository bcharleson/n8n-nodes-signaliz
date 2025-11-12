# Signaliz API Enhancement Suggestions

## Missing Endpoints for n8n Integration

Hey Josh! 👋

We're building an n8n community node for Signaliz and discovered two critical missing endpoints that would make the integration much more powerful. Since Signaliz is built on Manus, these should be straightforward to implement by proxying to the Manus API.

---

## 🎯 Required Endpoints

### 1. **Check Task Status** (Polling Endpoint)

**Endpoint:** `GET /v1/tasks/{task_id}/status`

**Purpose:** Allow users to poll the status of async operations (Deep Research, Agentic Research, Multipass Research)

**Why It's Needed:**
- n8n workflows often need to **wait for async operations** to complete
- Not all users can/want to set up webhooks
- Enables "Wait for Completion" patterns in workflows
- Provides progress updates for long-running tasks

**Request:**
```bash
GET https://api.signaliz.com/functions/v1/tasks/{task_id}/status
Authorization: Bearer YOUR_WORKSPACE_API_KEY
```

**Response Example:**
```json
{
  "success": true,
  "task_id": "task_abc123xyz",
  "job_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "running",
  "progress": {
    "companies_found": 12,
    "target_count": 25,
    "percentage": 48
  },
  "created_at": "2025-01-15T10:30:00Z",
  "updated_at": "2025-01-15T10:32:15Z",
  "estimated_completion": "2025-01-15T10:35:00Z"
}
```

**Status Values:**
- `scheduled` - Task queued but not started
- `running` - Task in progress
- `completed` - Task finished successfully
- `failed` - Task encountered an error

**Implementation (Proxy to Manus):**
```javascript
// Signaliz backend - proxy to Manus API
GET https://api.manus.ai/v1/tasks/{task_id}
Headers: { 'API_KEY': MANUS_API_KEY }

// Transform Manus response to Signaliz format
{
  status: manusResponse.status, // pending|running|completed|failed
  progress: extractProgressFromOutput(manusResponse.output),
  // ... map other fields
}
```

---

### 2. **Get Task Results** (Retrieve Completed Data)

**Endpoint:** `GET /v1/tasks/{task_id}/results`

**Purpose:** Retrieve the full results of a completed task

**Why It's Needed:**
- Users who don't use webhooks need a way to get results
- Enables "poll until complete, then fetch results" pattern
- Allows re-fetching results without re-running the task
- Useful for debugging and manual inspection

**Request:**
```bash
GET https://api.signaliz.com/functions/v1/tasks/{task_id}/results
Authorization: Bearer YOUR_WORKSPACE_API_KEY
```

**Response Example (Deep Research):**
```json
{
  "success": true,
  "task_id": "task_abc123xyz",
  "job_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "completed",
  "companies_found": 25,
  "results": {
    "companies": [
      {
        "name": "Example Tech Inc",
        "domain": "exampletech.com",
        "website": "https://exampletech.com",
        "linkedin_url": "https://linkedin.com/company/exampletech",
        "description": "B2B SaaS platform for data analytics",
        "industry": "B2B SaaS",
        "employees": "50-100",
        "headquarters": "Amsterdam, Netherlands",
        "reasoning": "Posted 5 data engineer roles in last 30 days...",
        "sources": [
          {
            "description": "Senior Data Engineer job posting",
            "url": "https://linkedin.com/jobs/view/..."
          }
        ]
      }
      // ... more companies
    ]
  },
  "metadata": {
    "execution_time_seconds": 145,
    "credits_consumed": 145,
    "model_used": "anthropic/claude-sonnet-4.5",
    "created_at": "2025-01-15T10:30:00Z",
    "completed_at": "2025-01-15T10:32:25Z"
  }
}
```

**Error Handling:**
```json
// Task not found
{
  "success": false,
  "error": "Task not found",
  "task_id": "task_invalid"
}

// Task still running
{
  "success": false,
  "error": "Task not completed yet",
  "status": "running",
  "message": "Use /tasks/{task_id}/status to check progress"
}

// Task failed
{
  "success": false,
  "status": "failed",
  "error": "Research task failed",
  "details": "Insufficient credits or API timeout"
}
```

---

## 🔧 Implementation Guide

### Manus API Endpoints to Use

**Get Task Status & Results:**
```bash
GET https://api.manus.ai/v1/tasks/{task_id}
Headers: { 'API_KEY': YOUR_MANUS_API_KEY }
```

**Manus Response Structure:**
```json
{
  "id": "task_abc123xyz",
  "status": "completed",  // pending|running|completed|failed
  "output": [
    {
      "role": "assistant",
      "content": [
        {
          "type": "output_text",
          "text": "Research results here..."
        }
      ]
    }
  ],
  "credit_usage": 145,
  "created_at": 1736938200,
  "updated_at": 1736938345
}
```

### Suggested Implementation

1. **Create Signaliz wrapper endpoints** that proxy to Manus
2. **Transform Manus responses** to match Signaliz API format
3. **Add workspace validation** - ensure task belongs to requesting workspace
4. **Parse output field** - extract company data from Manus output text
5. **Cache results** - store in Signaliz DB for faster retrieval

---

## 📊 Use Cases in n8n

### Pattern 1: Poll Until Complete
```
[Trigger] → [Start Deep Research] → [Wait 30s] → [Check Status] 
  → If running: loop back to Wait
  → If completed: [Get Results] → [Process Companies]
```

### Pattern 2: Webhook + Fallback
```
[Start Research with Webhook] → [Wait for Webhook (5 min timeout)]
  → If timeout: [Get Results via API]
  → Process results
```

---

## 🎁 Bonus Suggestions

### 3. List Tasks (Optional but Useful)
```
GET /v1/tasks?status=running&limit=10
```
Returns recent tasks for the workspace - useful for debugging

### 4. Cancel Task (Optional)
```
DELETE /v1/tasks/{task_id}
```
Stop a running task to save credits

---

## 🚀 Priority

**HIGH PRIORITY:**
1. ✅ `GET /v1/tasks/{task_id}/status` - Critical for polling
2. ✅ `GET /v1/tasks/{task_id}/results` - Critical for retrieving data

**MEDIUM PRIORITY:**
3. `GET /v1/tasks` - Nice to have for task management
4. `DELETE /v1/tasks/{task_id}` - Nice to have for cost control

---

## 📝 Notes

- Both endpoints should use the same Bearer token authentication as existing endpoints
- Rate limit: Same as other endpoints (10 req/min for research endpoints)
- These endpoints are **read-only** - no credit charges
- Results should be cached in Signaliz DB for performance
- Consider adding pagination for large result sets (100+ companies)

---

Let me know if you need any clarification or want to discuss the implementation! This will make the n8n integration much more powerful and user-friendly. 🎉

— Brandon (building the n8n-nodes-signaliz integration)

