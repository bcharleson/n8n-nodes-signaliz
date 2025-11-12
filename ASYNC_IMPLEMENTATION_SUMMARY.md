# Async Operations Implementation - Quick Summary

## Problem

Signaliz's async operations (Deep Research, Agentic Research, Multipass Research) return a `task_id` but provide no way to:
1. Check if the task is complete
2. Retrieve the results without webhooks

This blocks n8n users from building reliable workflows.

---

## Solution

Add two new endpoints that proxy to the Manus API:

### 1. Status Endpoint
**`GET /v1/tasks/{task_id}/status`**

Returns current task status: `pending`, `running`, `completed`, or `failed`

### 2. Results Endpoint
**`GET /v1/tasks/{task_id}/results`**

Returns full company data when task is complete

---

## Documents Created

### 📄 ASYNC_OPERATIONS_GUIDE.md (1,610 lines)
**Complete technical implementation guide for Josh**

**Contents:**
1. **Async Operation Flow** - Complete lifecycle with real response examples
2. **Status Endpoint Spec** - Request/response formats, error handling
3. **Results Endpoint Spec** - Different formats for each operation type
4. **n8n Workflow Patterns** - 4 polling patterns with configurations
5. **Technical Details** - Manus field mapping, parsing logic, credit charging
6. **Quick Reference** - Implementation checklist and testing scenarios
7. **n8n Node Implementation** - Code examples for new operations

**Key Features:**
- ✅ Real API responses from your screenshots
- ✅ Complete JavaScript implementation code
- ✅ Manus API proxy examples
- ✅ Database caching strategy
- ✅ Error handling for all edge cases
- ✅ Testing scenarios and checklist

### 📄 MESSAGE_FOR_JOSH.md
**WhatsApp-ready message explaining the need**

**Contents:**
- Problem statement
- What you need (2 endpoints)
- Why it matters
- Link to full implementation guide
- What you'll do next
- Technical overview

### 📄 N8N_NEW_OPERATIONS.md (from previous work)
**Plan for adding 6 new operations to n8n node**

**Operations to Add:**
- Deep Research: Check Status + Get Results
- Agentic Research: Check Status + Get Results  
- Multipass Research: Check Status + Get Results

---

## Key Insights from Screenshots

### Company Signal Enrichment (Synchronous)
```json
{
  "success": true,
  "company_id": "eb21ba39-32cf-41e8-9525-2c436fb1023d",
  "company_name": "Snowflake",
  "status": "completed",
  "signals_found": 8,
  "signals": [...]
}
```
✅ **Works perfectly** - returns results immediately

### Deep Research (Async)
```json
{
  "success": true,
  "data": {
    "task_id": "OqcfMHgQWr0M-RuuU8cHdK",
    "task_url": "https://manus.im/app/OqcfMHgQWr0M-RuuU8cHdK",
    "status": "processing",
    "message": "Task created successfully. Credits will be charged when task completes.",
    "webhook_configured": false
  }
}
```
❌ **No way to check status or get results**

### Agentic Research (Async)
```json
{
  "job_id": "1bd585f1-4dd6-47a8-b987-a84d5aae8104",
  "task_id": "TjyEVFNxIeUmsUYb4f2lpb",
  "status": "in_progress",
  "message": "Agentic research task started (targeting 1 company). Credits will be charged when task completes (1 credit per second).",
  "target_count": 1,
  "research_mode": "single-company",
  "estimated_time": "30-90 seconds"
}
```
❌ **No way to check status or get results**

### Multipass Research (Async)
```json
{
  "job_id": "e8e7c4E7-624a-4f54-ab3b-5834d9f4b7ef",
  "status": "started",
  "message": "Multipass research task started (targeting 10 companies). Credits will be charged when task completes (1 credit per second).",
  "target_count": 10,
  "max_allowed": 500,
  "research_mode": "bulk-discovery",
  "estimated_time": "20-40 seconds"
}
```
❌ **No way to check status or get results**

---

## Implementation Checklist for Josh

### Status Endpoint
- [ ] Add route: `GET /v1/tasks/{task_id}/status`
- [ ] Validate API key and workspace
- [ ] Call Manus: `GET https://api.manus.ai/v1/tasks/{task_id}`
- [ ] Map status: pending/running/completed/failed
- [ ] Extract progress info (companies_found, elapsed_seconds)
- [ ] Return formatted response
- [ ] Handle errors (404, 401, 403)

### Results Endpoint
- [ ] Add route: `GET /v1/tasks/{task_id}/results`
- [ ] Validate API key and workspace
- [ ] Check cache in Signaliz DB
- [ ] If not cached, call Manus API
- [ ] Parse Manus output array
- [ ] Extract company data from assistant messages
- [ ] Transform to operation-specific format
- [ ] Cache results in DB
- [ ] Return formatted results
- [ ] Handle errors (400 if not complete, 404, 401, 403)

---

## n8n Workflow Patterns

### Pattern 1: Simple Wait
```
Start Research → Wait 60s → Get Results
```
**Use case:** Single company with known completion time

### Pattern 2: Polling Loop
```
Start Research → Loop (Check Status → Wait 5s) → Get Results
```
**Use case:** Bulk research with unknown completion time

### Pattern 3: Webhook (Future)
```
Start Research (with webhook_url) → Wait for Webhook → Process Results
```
**Use case:** Long-running tasks (requires webhook support)

---

## Recommended Polling Intervals

| Task Type | Estimated Time | Poll Interval | Max Iterations |
|-----------|----------------|---------------|----------------|
| Single Company (Agentic) | 30-90s | 5s | 30 (2.5 min) |
| Single Company (Multipass) | 20-60s | 5s | 20 (1.7 min) |
| Bulk Discovery (10) | 20-40s | 5s | 15 (1.25 min) |
| Bulk Discovery (25) | 60-120s | 10s | 20 (3.3 min) |
| Deep Research (25) | 120-180s | 10s | 30 (5 min) |

---

## Next Steps

1. **Send message to Josh** (MESSAGE_FOR_JOSH.md)
2. **Wait for endpoints** to be implemented
3. **Add Tasks resource** to n8n node
4. **Implement operations** (Get Status, Get Results)
5. **Create example workflows** for users
6. **Test thoroughly** with all operation types
7. **Update documentation** with polling patterns
8. **Publish to npm** 🚀

---

## Files in Repository

```
n8n-nodes-signaliz/
├── ASYNC_OPERATIONS_GUIDE.md       ← Complete implementation guide (1,610 lines)
├── MESSAGE_FOR_JOSH.md             ← WhatsApp message for Josh
├── ASYNC_IMPLEMENTATION_SUMMARY.md ← This file
├── N8N_NEW_OPERATIONS.md           ← Plan for 6 new operations
├── SIGNALIZ_API_SUGGESTIONS.md     ← Original API suggestions
├── README.md                       ← User documentation
├── DEVELOPMENT.md                  ← Developer guide
└── nodes/Signaliz/                 ← Current implementation
    ├── Signaliz.node.ts
    └── operations/
        ├── companySignalEnrichment/
        ├── deepResearch/
        ├── agenticResearch/
        └── multipassResearch/
```

---

## Credit Charging

**Important:** Status checks and results retrieval are **FREE** (0 credits)

Credits are only charged during task execution (1 credit/second).

| Operation | Credit Charge |
|-----------|---------------|
| Start async task | 0 credits |
| Task execution | 1 credit/second |
| Check status | 0 credits |
| Get results | 0 credits |

Results are cached in Signaliz DB, so subsequent retrievals are instant and free.

---

**Ready to send to Josh!** 🎉

