# n8n Node - New Operations to Add

## Overview

Once Josh implements the status and results endpoints, we'll add two new operations to each async resource in the Signaliz n8n node.

---

## 🎯 Operations to Add

### **Resource: Deep Research**

#### Current Operations:
1. ✅ Find Companies (existing)

#### New Operations to Add:
2. **Check Status** - Poll task status
3. **Get Results** - Retrieve completed results

---

### **Resource: Agentic Company Research**

#### Current Operations:
1. ✅ Research Company (existing)

#### New Operations to Add:
2. **Check Status** - Poll task status
3. **Get Results** - Retrieve completed results

---

### **Resource: Multipass Company Research**

#### Current Operations:
1. ✅ Find Companies (existing)

#### New Operations to Add:
2. **Check Status** - Poll task status
3. **Get Results** - Retrieve completed results

---

## 📋 Operation Specifications

### Operation: Check Status

**Display Name:** "Check Status"  
**Description:** "Check the status of a running research task"

**Parameters:**
- `task_id` (string, required) - The task ID returned from the initial request
  - Display Name: "Task ID"
  - Description: "The task_id from the initial research request"
  - Placeholder: "task_abc123xyz"

**API Call:**
```
GET /v1/tasks/{task_id}/status
```

**Output:**
```json
{
  "task_id": "task_abc123xyz",
  "status": "running",
  "progress": {
    "companies_found": 12,
    "target_count": 25,
    "percentage": 48
  },
  "created_at": "2025-01-15T10:30:00Z",
  "estimated_completion": "2025-01-15T10:35:00Z"
}
```

---

### Operation: Get Results

**Display Name:** "Get Results"  
**Description:** "Retrieve the results of a completed research task"

**Parameters:**
- `task_id` (string, required) - The task ID returned from the initial request
  - Display Name: "Task ID"
  - Description: "The task_id from the completed research request"
  - Placeholder: "task_abc123xyz"

**API Call:**
```
GET /v1/tasks/{task_id}/results
```

**Output (Deep Research):**
```json
{
  "task_id": "task_abc123xyz",
  "status": "completed",
  "companies_found": 25,
  "results": {
    "companies": [
      {
        "name": "Example Tech Inc",
        "domain": "exampletech.com",
        "linkedin_url": "https://linkedin.com/company/exampletech",
        "description": "B2B SaaS platform",
        "industry": "B2B SaaS",
        "employees": "50-100",
        "reasoning": "...",
        "sources": [...]
      }
    ]
  },
  "metadata": {
    "execution_time_seconds": 145,
    "credits_consumed": 145
  }
}
```

---

## 🔄 Workflow Patterns

### Pattern 1: Simple Poll & Get
```
┌─────────────────────┐
│ Start Deep Research │
│ (Get task_id)       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Wait 30 seconds     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Check Status        │
│ (Use task_id)       │
└──────────┬──────────┘
           │
           ▼
    ┌──────────────┐
    │ If completed?│
    └──┬────────┬──┘
       │ No     │ Yes
       │        │
       ▼        ▼
    [Loop]  ┌─────────────────────┐
            │ Get Results         │
            │ (Use task_id)       │
            └──────────┬──────────┘
                       │
                       ▼
            ┌─────────────────────┐
            │ Process Companies   │
            └─────────────────────┘
```

### Pattern 2: Wait Until Complete (n8n Loop)
```
1. Start Deep Research → Get task_id
2. Loop Node:
   - Check Status
   - If status != "completed": Wait 30s, continue loop
   - If status == "completed": Exit loop
3. Get Results with task_id
4. Process companies
```

---

## 💡 Implementation Notes

### Error Handling

**Check Status:**
- Task not found → Return error with helpful message
- Task failed → Return status="failed" with error details

**Get Results:**
- Task not found → Return error
- Task still running → Return error: "Task not completed yet, use Check Status"
- Task failed → Return error with failure details

### User Experience

**Auto-polling Option:**
Add an optional parameter to the initial operations:
- `wait_for_completion` (boolean, default: false)
  - If true: Automatically poll until complete and return results
  - If false: Return task_id immediately (current behavior)

This gives users two options:
1. **Simple mode:** Set `wait_for_completion=true`, get results directly
2. **Advanced mode:** Get task_id, manually poll/get results for more control

---

## 🎨 UI Improvements

### Task ID Field
Add a "Task ID" field type that:
- Accepts manual input
- Can reference output from previous node: `{{ $json.task_id }}`
- Shows validation (format: `task_*`)

### Status Display
When checking status, show visual indicator:
- 🟡 Pending
- 🔵 Running (with progress %)
- 🟢 Completed
- 🔴 Failed

---

## 📦 Code Structure

```
nodes/Signaliz/
├── operations/
│   ├── deepResearch/
│   │   ├── findCompanies.operation.ts (existing)
│   │   ├── checkStatus.operation.ts (NEW)
│   │   └── getResults.operation.ts (NEW)
│   ├── agenticResearch/
│   │   ├── researchCompany.operation.ts (existing)
│   │   ├── checkStatus.operation.ts (NEW)
│   │   └── getResults.operation.ts (NEW)
│   └── multipassResearch/
│       ├── findCompanies.operation.ts (existing)
│       ├── checkStatus.operation.ts (NEW)
│       └── getResults.operation.ts (NEW)
```

---

## ✅ Testing Checklist

Once endpoints are available:

- [ ] Test Check Status with running task
- [ ] Test Check Status with completed task
- [ ] Test Check Status with failed task
- [ ] Test Check Status with invalid task_id
- [ ] Test Get Results with completed task
- [ ] Test Get Results with running task (should error)
- [ ] Test Get Results with invalid task_id
- [ ] Test polling loop pattern in n8n workflow
- [ ] Test auto-polling with `wait_for_completion=true`
- [ ] Verify error messages are user-friendly

---

## 🚀 Next Steps

1. **Wait for Josh** to implement the endpoints
2. **Add the new operations** to the n8n node
3. **Test thoroughly** with real workflows
4. **Update documentation** with polling examples
5. **Publish updated version** to npm

---

This will make the Signaliz n8n node **much more powerful** and user-friendly! 🎉

