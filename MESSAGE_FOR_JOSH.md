# Message for Josh - Async Operations Implementation

Hey Josh! 👋

Great news - the n8n integration is working perfectly for the synchronous Company Signal Enrichment endpoint! 🎉

However, I've discovered a critical gap for the async operations (Deep Research, Agentic Research, and Multipass Research). Currently, there's no way to:
1. **Check task status** - Is it still running or completed?
2. **Retrieve results** - Get the company data after completion

This is a blocker for n8n users who need "wait for completion" patterns in their workflows.

---

## What I Need

**Two new endpoints** that proxy to the Manus API:

### 1. `GET /v1/tasks/{task_id}/status`
Check if a task is pending, running, completed, or failed.

**Returns:**
```json
{
  "success": true,
  "task_id": "TjyEVFNxIeUmsUYb4f2lpb",
  "status": "completed",
  "companies_found": 25,
  "credits_consumed": 145
}
```

### 2. `GET /v1/tasks/{task_id}/results`
Retrieve the full company data from a completed task.

**Returns:**
```json
{
  "success": true,
  "task_id": "TjyEVFNxIeUmsUYb4f2lpb",
  "status": "completed",
  "results": {
    "companies": [
      {
        "name": "Example Corp",
        "domain": "example.com",
        "website": "https://example.com",
        "linkedin_url": "https://linkedin.com/company/example",
        "description": "B2B SaaS platform",
        "industry": "B2B SaaS",
        "employees": "50-100",
        "headquarters": "Amsterdam, Netherlands"
      }
    ]
  }
}
```

---

## Implementation Guide

I've created a **complete implementation guide** with:

✅ **Exact endpoint specifications** with request/response examples  
✅ **Implementation code** showing how to proxy to Manus API  
✅ **Field mapping** between Manus and Signaliz formats  
✅ **Error handling** for all edge cases  
✅ **Caching strategy** to reduce Manus API calls  
✅ **Testing scenarios** to ensure robustness  

**Full guide here:**
https://github.com/bcharleson/n8n-nodes-signaliz/blob/main/ASYNC_OPERATIONS_GUIDE.md

---

## Why This Matters

**Current State:**
```
Start Research → Get task_id → ❌ Can't check status or get results
                                   (Must use webhook or nothing)
```

**With New Endpoints:**
```
Start Research → Get task_id → Poll Status → Get Results → Process Data
                                    ↓
                              (Loop until complete)
```

This enables n8n users to:
- **Poll for completion** instead of guessing wait times
- **Handle errors gracefully** with retry logic
- **Build reliable workflows** without webhooks
- **Process results immediately** when tasks complete

---

## What I'll Do Next

Once these endpoints are live, I'll:

1. ✅ Add "Tasks" resource to the n8n node
2. ✅ Implement "Get Status" and "Get Results" operations
3. ✅ Create example workflows showing polling patterns
4. ✅ Document best practices for users
5. ✅ Publish updated version to npm

---

## Technical Details

Since Signaliz is built on Manus, these should be straightforward to implement:

**Manus API Endpoint:**
```
GET https://api.manus.ai/v1/tasks/{task_id}
```

**Manus Response:**
```json
{
  "id": "TjyEVFNxIeUmsUYb4f2lpb",
  "status": "completed",
  "created_at": 1736938200,
  "updated_at": 1736938267,
  "credit_usage": 67,
  "model": "anthropic/claude-sonnet-4.5",
  "output": [
    {
      "role": "assistant",
      "content": [
        {
          "type": "output_text",
          "text": "{\"companies\": [...]}"
        }
      ]
    }
  ]
}
```

You just need to:
1. Validate the API key and workspace
2. Verify the task belongs to the workspace
3. Call the Manus API
4. Transform the response to Signaliz format
5. Cache results in your database (for the results endpoint)

**Full implementation code is in the guide!**

---

## Questions?

Let me know if you have any questions or want to discuss the implementation! I'm happy to help however I can. 🚀

The integration is already functional for the synchronous Company Signal Enrichment endpoint, so users can start using that immediately. The async endpoints just need these additions to be fully usable in n8n.

---

**Brandon**

P.S. The guide includes:
- Complete endpoint specs with all status codes
- JavaScript implementation examples
- Database schema recommendations
- Credit charging logic
- Testing checklist
- n8n workflow patterns

Everything you need is documented! 📚

