import OpenAI from "openai";
import { LRUCache } from "lru-cache";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const rateLimit = new LRUCache<string, number>({
  max: 500,
  ttl: 60 * 1000, // 1 minute window
});

function getIP(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
}

function sanitizeString(str: unknown, maxLen = 200) {
  return String(str || "").replace(/[<>{}]/g, "").slice(0, maxLen).trim();
}

export async function POST(req: Request) {
  try {
    // Rate limiting
    const ip = getIP(req);
    const hits = (rateLimit.get(ip) || 0) + 1;
    rateLimit.set(ip, hits);
    if (hits > 3) {
      return Response.json({ error: "Rate limit: max 3 generations per minute. Please wait." }, { status: 429 });
    }

    const body = await req.json();
    const { prayerTimes, wakeup, sleep, tasks, daysToSchedule, midWeekNote, model } = body;

    // Whitelist allowed models
    const ALLOWED_MODELS = ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo"];
    const chosenModel = ALLOWED_MODELS.includes(model) ? model : "gpt-4o";

    // Validate
    if (!Array.isArray(tasks) || tasks.length === 0) {
      return Response.json({ error: "No tasks provided." }, { status: 400 });
    }

    if (tasks.length > 20) {
      return Response.json({ error: "Max 20 tasks allowed." }, { status: 400 });
    }

    // Sanitize and build task list string
    const taskList = tasks.map(t => {
      const name = sanitizeString(t.name, 150);
      const mins = Math.min(Math.max(parseInt(t.mins) || 30, 5), 480);
      const timesPerWeek = Math.min(Math.max(parseInt(t.timesPerWeek) || 3, 1), 7);
      const category = sanitizeString(t.category, 30);
      const must = t.must ? "yes" : "no";
      return `- "${name}" | ${mins} min | ${timesPerWeek}x per week | category: ${category} | must-do: ${must}`;
    }).join("\n");

    // Build prompt
    const prompt = `You are a strict weekly scheduler for Arhum, a Pakistani CS student and AI automation freelance builder.

FIXED DAILY BLOCKS (every single day, never move or skip these):
- Fajr prayer: ${sanitizeString(prayerTimes?.fajr || "5:30 AM", 20)} (10 min)
- Dhuhr prayer: ${sanitizeString(prayerTimes?.dhuhr || "1:30 PM", 20)} (10 min)
- Asr prayer: ${sanitizeString(prayerTimes?.asr || "5:00 PM", 20)} (10 min)
- Maghrib prayer: ${sanitizeString(prayerTimes?.maghrib || "6:23 PM", 20)} (10 min)
- Isha prayer: ${sanitizeString(prayerTimes?.isha || "8:00 PM", 20)} (10 min)

FIXED WEEKDAY BLOCKS (Monday to Friday only):
- University classes: 8:00 AM – 2:00 PM (Dhuhr prayer at its set time happens inside this block — still include it)

WAKE UP: ${sanitizeString(wakeup || "5:00 AM", 20)}
SLEEP BY: ${sanitizeString(sleep || "12:00 AM", 20)}

DAYS TO SCHEDULE: ${(daysToSchedule || ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"]).join(", ")}

TASK POOL:
${taskList}

MID-WEEK NOTE (if any): ${sanitizeString(midWeekNote || "None", 300)}

SCHEDULING RULES:
1. Prayers are non-negotiable fixed blocks every day — never skip, never move
2. Classes block Mon–Fri 8 AM–2 PM completely
3. SATURDAY IS OVERFLOW DAY — no university classes. Reserve Saturday for:
   a) Any tasks that were skipped or could not fit Mon–Fri (pull from skipped arrays)
   b) Big or long-duration tasks (tasks over 90 mins) — schedule these primarily on Saturday
   c) Tasks with low timesPerWeek (1–2x) — prefer placing them on Saturday
   d) Keep Saturday mornings for Quran journal, prayers, and personal growth
   e) Do NOT overload Saturday — it should feel open and calm, not rushed
4. SUNDAY IS A COMPLETE HOLIDAY — absolutely no work tasks, no outreach, no learning, no assignments.
   Sunday must only contain: prayers (all 5), Quran journal after Fajr, breakfast, dinner, and free/rest time.
   Do NOT schedule any task from the task pool on Sunday. If a task says must-do, skip it on Sunday only.
   Sunday is sacred rest time. Treat it like a day completely off.
5. Spread each task across the week (Mon–Sat only) based on its timesPerWeek value — distribute evenly
6. Must-do tasks appear every day EXCEPT Sunday
7. Add 10–15 min transition buffers between blocks
8. Add breakfast (20 min) in the morning and dinner (20 min) in the evening every day
9. Quran journal always goes immediately after Fajr prayer
10. English speaking practice goes 7:00–7:30 AM on weekdays before classes
11. Place heavy cognitive tasks (learning, university work) in morning or early afternoon slots
12. Place outreach and social media tasks in afternoon or evening slots
13. If a task truly cannot fit on a given day add it to that day's skipped array
14. For mid-week re-plan: only output the days listed in DAYS TO SCHEDULE — do not reference or modify locked days
15. Be realistic — a human needs rest. Do not pack every single minute.
16. Weekdays (Mon–Fri) should be focused and structured. Saturday is the catch-up day. Sunday is pure rest — protect it.

RETURN ONLY valid JSON. No markdown, no explanation, no backticks. Exactly this structure:
{
  "week": {
    "Monday": {
      "blocks": [
        {
          "time": "5:00 AM",
          "duration": "30 min",
          "title": "Block title",
          "category": "prayer",
          "notes": "Optional short tip"
        }
      ],
      "skipped": ["task name if skipped"],
      "productive_hours": 7.5
    },
    "Tuesday": { ... },
    "Wednesday": { ... },
    "Thursday": { ... },
    "Friday": { ... },
    "Saturday": { ... },
    "Sunday": { ... }
  }
}`;

    const response = await client.chat.completions.create({
      model: chosenModel,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 8000,
      response_format: { type: "json_object" },
    });

    const raw = response.choices[0].message.content || "{}";
    let result;
    try {
      result = JSON.parse(raw);
    } catch {
      console.error("Failed to parse GPT response:", raw.slice(0, 500));
      return Response.json({ error: "AI returned invalid JSON. Try generating again." }, { status: 500 });
    }

    return Response.json(result);
  } catch (err: unknown) {
    console.error("API error:", err);

    // Surface specific OpenAI errors to help with debugging
    if (err && typeof err === "object") {
      const e = err as Record<string, unknown>;

      // API key missing or invalid
      if (e.status === 401 || String(e.message || "").includes("API key")) {
        return Response.json(
          { error: "Invalid or missing OpenAI API key. Check your .env.local file." },
          { status: 500 }
        );
      }

      // Quota / billing exceeded
      if (e.status === 429 || String(e.message || "").includes("quota")) {
        return Response.json(
          { error: "OpenAI quota exceeded. Check your billing at platform.openai.com." },
          { status: 500 }
        );
      }

      // Generic OpenAI error with message
      if (e.message) {
        return Response.json(
          { error: `OpenAI error: ${String(e.message).slice(0, 200)}` },
          { status: 500 }
        );
      }
    }

    return Response.json({ error: "AI generation failed. Try again." }, { status: 500 });
  }
}
