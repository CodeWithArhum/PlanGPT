<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js">
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/OpenAI-GPT--4o-412991?style=for-the-badge&logo=openai&logoColor=white" alt="OpenAI">
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind">
</p>

<h1 align="center">PlanGPT - AI Weekly Scheduler</h1>

<p align="center">
  <strong>An AI-powered weekly planner that generates optimized schedules around your fixed commitments.</strong>
</p>

<p align="center">
  Tell it your prayers, classes, tasks, and goals - GPT builds a realistic week that respects every constraint.
</p>

---

## The Problem

Manually scheduling a productive week is painful. You have fixed commitments (classes, prayers, meetings) scattered across the day, a pile of tasks with different frequencies, and limited energy windows. Most planners make you do the puzzle yourself.

## The Solution

PlanGPT sends your full context - fixed blocks, task pool, frequencies, energy patterns - to GPT-4o, which returns an optimized 7-day schedule. You review, drag-and-drop to adjust, lock what you like, and regenerate the rest.

---

## Features

| Feature | Description |
|---|---|
| **AI Schedule Generation** | GPT-4o builds a full week in one shot, respecting all constraints |
| **Smart Constraints** | Fixed prayer times, class blocks, wake/sleep windows, transition buffers |
| **Frequency Distribution** | Tasks spread across the week (e.g., "5x/week" gets placed on 5 different days) |
| **Drag & Drop** | Reorder blocks within any day - times auto-recalculate |
| **Day Locking** | Lock completed days so mid-week regeneration only touches unlocked ones |
| **Completion Tracking** | Check off blocks as you go, with daily progress bars |
| **In-Place Editing** | Click any block title to rename it |
| **Weekly History** | Archives up to 8 previous weeks with completion data |
| **Sunday = Rest** | Enforced rest day - only prayers, Quran, and relaxation |
| **Local Persistence** | Everything stored in localStorage - no account needed |

---

## How It Works

```
Setup Mode  -->  GPT-4o API  -->  Week View
                                              
Define tasks     200-line prompt    7-column calendar
Set frequencies  with constraints   Drag & drop
Fixed blocks     Returns JSON       Track completion
```

1. **Setup** - Add your tasks with duration, frequency, and category
2. **Generate** - One click sends everything to GPT-4o with detailed scheduling rules
3. **Review** - See your full week laid out with color-coded categories
4. **Adjust** - Drag blocks, edit titles, lock days you're happy with
5. **Track** - Check off completed blocks throughout the week

---

## Task Categories

| Category | Color | Examples |
|---|---|---|
| Prayer | Lime | Fajr, Dhuhr, Asr, Maghrib, Isha |
| Class | Blue | University lectures (Mon-Fri) |
| Growth | Purple | Quran journal, English practice, reading |
| Outreach | Cyan | LinkedIn, cold outreach, content creation |
| Work | Orange | Client projects, freelance tasks |
| Break | Gray | Meals, rest, transition buffers |

---

## Quick Start

### Prerequisites
- Node.js 18+
- OpenAI API key

### Setup

```bash
git clone https://github.com/CodeWithArhum/TimeTable-AI.git
cd TimeTable-AI
npm install
```

Create `.env.local`:
```env
OPENAI_API_KEY=your_openai_api_key
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 3.4 |
| AI | OpenAI SDK (GPT-4o, GPT-4 Turbo, GPT-3.5) |
| Drag & Drop | dnd-kit |
| Icons | Lucide React |
| Storage | localStorage (no backend DB) |
| Rate Limiting | LRU Cache (3 req/min per IP) |

---

## Project Structure

```
TimeTable-AI/
├── src/app/
│   ├── page.tsx              # Main app (setup + week view, 930 lines)
│   ├── layout.tsx            # Root layout with metadata
│   ├── globals.css           # Tailwind + custom animations
│   ├── api/generate/
│   │   └── route.ts          # OpenAI API handler + prompt engineering
│   └── fonts/                # Geist font files
├── tailwind.config.ts        # Extended color palette
├── next.config.mjs           # Security headers (CSP, X-Frame-Options)
└── package.json
```

---

## Security

- Rate limited to 3 generations per minute per IP
- CSP headers configured in `next.config.mjs`
- API key stays server-side (never exposed to client)
- Input validation on task count and model selection

---

<p align="center">
  Built by <a href="https://github.com/CodeWithArhum"><strong>@CodeWithArhum</strong></a>
</p>
