# 🚀 Blazzic

**Turn your work into visibility — automatically.**

Blazzic is a full-stack platform that transforms developer achievements into **resume bullets, LinkedIn posts, Twitter threads, and portfolio updates**, then **publishes them for you** via an async job queue.

> Build. Ship. Merge.  
> **Blazzic makes sure people see it.**

---

## ✨ What Problem Does This Solve?

Developers do meaningful work every day:
- Open-source contributions
- Bug fixes
- Performance improvements
- Feature launches

But that work often:
- Never makes it to Twitter
- Stays vague on resumes
- Goes unnoticed on LinkedIn
- Never gets documented consistently

**Blazzic fixes the visibility gap** by automatically turning real work into polished, platform-ready content — and posting it.

---

## 🧠 What Blazzic Does

1. **Connect GitHub**
   - Detects achievements from real activity (PRs, commits, repos)

2. **Generate Multi-Format Content (AI)**
   - Resume bullets (quantified, concise)
   - LinkedIn posts (professional narrative)
   - Twitter threads (3–5 tweets, optimized)

3. **Async Social Posting**
   - Post immediately or schedule for later
   - Database-backed job queue (no Redis, no BullMQ)
   - Vercel Cron processes jobs every minute

4. **Portfolio Sync**
   - Public portfolio page
   - Shows recent achievements and published tweets

---

## 🏗️ Architecture Overview

```
User Browser
     ↓
Next.js 14 (App Router)
     ↓
API Routes + Cron Jobs
     ↓
Vercel Postgres (Job Queue)
     ↓
Twitter API / Claude API
```

---

## 🧩 Tech Stack

### Frontend & Backend
- Next.js 14 (App Router)
- TypeScript
- Vercel

### Database
- Vercel Postgres
- Database-backed job queue (`scheduled_posts`)

### Auth
- NextAuth.js
- OAuth: GitHub, Twitter

### AI
- Anthropic Claude (Haiku)
- Platform-optimized prompt templates

### Social APIs
- Twitter API v2 (Free tier)

---

## ⏱️ Job Queue Design

- Jobs stored in `scheduled_posts`
- Cron runs every minute
- Processes pending jobs (`scheduled_for <= now()`)
- Updates status: `pending → processing → published | failed`
- Retry with exponential backoff
- Durable, inspectable, production-safe

---

## 🔄 Core User Flow

```
Achievement
   ↓
AI Generation
   ↓
Preview & Edit
   ↓
Post Now / Schedule
   ↓
Cron Job
   ↓
Published + Portfolio Update
```

---

## 🔐 Security & Reliability

- OAuth tokens stored securely
- Cron endpoint protected via secret
- Rate limit handling
- Idempotent job execution
- Graceful failure & retry

---


## 🎯 Why Blazzic

Most tools stop at content generation.

**Blazzic closes the loop**:
Work → Content → Visibility → Proof

It doesn’t just write — it ships.

---

## 🚧 Roadmap

- LinkedIn posting
- Notifications
- Analytics
- Team support
- Advanced scheduling

---

## 🏁 TL;DR

Blazzic ensures your work gets seen.

**Never let your work disappear again.**
