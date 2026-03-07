# NewsPiston Content API — Openclaw Agent Guide

You are posting intelligence digest content to **news.pistonsolutions.ai**. Never edit JSON files in git. Use the API below.

## Auth

Every request needs this header:
```
X-API-Key: piston-sera-2026
```

## Base URL

```
http://news.pistonsolutions.ai/api
```

---

## Core Rules

1. **NEVER replace an entire day's digest.** Always append to sections.
2. **NEVER use `PUT /api/content/<date>`.** Use `POST` to merge/append.
3. **Always use the section-specific endpoint** to add items to one section at a time.
4. **Validate your JSON payload** before sending. Malformed JSON will be rejected.
5. **Use today's date** in `YYYY-MM-DD` format (Eastern Time).

---

## Endpoints

### List available dates
```bash
curl -H "X-API-Key: piston-sera-2026" \
  http://news.pistonsolutions.ai/api/content/dates
```

### Read a day's digest
```bash
curl -H "X-API-Key: piston-sera-2026" \
  http://news.pistonsolutions.ai/api/content/2026-03-06
```
**Always read the current digest before writing** so you know what's already there. Do not add duplicates.

### Append items to a section
```bash
curl -X POST \
  http://news.pistonsolutions.ai/api/content/YYYY-MM-DD/SECTION_NAME \
  -H "X-API-Key: piston-sera-2026" \
  -H "Content-Type: application/json" \
  -d '[ARRAY_OF_ITEMS]'
```

**Valid section names:**
- `highlights`
- `tech_research`
- `events`
- `business_opportunities`
- `research_montreal`

### Update summary + append across sections
```bash
curl -X POST \
  http://news.pistonsolutions.ai/api/content/YYYY-MM-DD \
  -H "X-API-Key: piston-sera-2026" \
  -H "Content-Type: application/json" \
  -d '{
    "summary": "New summary text here...",
    "tech_research": [{ ... }],
    "events": [{ ... }]
  }'
```
This **merges**: updates the summary, **appends** items to sections. It does NOT replace existing items.

### Clear a section (use sparingly)
```bash
curl -X DELETE \
  http://news.pistonsolutions.ai/api/content/YYYY-MM-DD/SECTION_NAME \
  -H "X-API-Key: piston-sera-2026"
```

---

## Item Schemas

### highlights
```json
{
  "category": "tech|events|business|research|Launch|Security",
  "title": "Short headline",
  "summary": "One paragraph explaining why this matters.",
  "url": "https://source-url.com/article",
  "source": "Source Name",
  "priority": "critical|high|medium|low",
  "relevance": "Why this matters to Piston Solutions."
}
```

### tech_research
```json
{
  "title": "Descriptive title of the item",
  "summary": "1-3 sentence summary with key facts and numbers.",
  "source": "Source Name (e.g. OpenAI, arXiv, TechCrunch)",
  "url": "https://direct-link-to-source.com",
  "priority": "critical|high|medium|low",
  "relevance": "How this connects to Piston Solutions' work."
}
```

### events
```json
{
  "title": "Event Name",
  "summary": "What the event is about.",
  "source": "Organizer or discovery source",
  "url": "https://event-page.com",
  "date": "YYYY-MM-DD",
  "time": "9:00 AM EST",
  "location": "City, Venue",
  "cost": "Free | $599 early bird",
  "registration_url": "https://register.example.com",
  "agenda_url": "https://event.com/agenda",
  "decision_deadline": "March 15, 2026",
  "action": "Register before early bird deadline.",
  "priority": "critical|high|medium|low",
  "relevance": "Why Piston should attend."
}
```
Not all fields are required. At minimum include: `title`, `summary`, `date`, `priority`.

### business_opportunities
```json
{
  "title": "Opportunity headline",
  "summary": "What the opportunity is. Include dollar amounts.",
  "source": "Source Name",
  "url": "https://source-url.com",
  "size": "$50K+ | $1M+ | Enterprise",
  "priority": "critical|high|medium|low",
  "relevance": "Why this is a fit for Piston."
}
```
**Only add opportunities $50K+.** Quality over quantity.

### research_montreal
```json
{
  "name": "Dr. First Last",
  "title": "Professor / Researcher Title",
  "affiliation": "University, Lab (e.g. McGill, Mila, Concordia)",
  "research": "What they work on and why it's relevant.",
  "url": "https://profile-or-lab-page.com",
  "action": "Email for collaboration.",
  "priority": "critical|high|medium|low",
  "relevance": "Connection to Piston's capabilities."
}
```

---

## Workflow: Daily Digest

Follow this exact sequence every day:

### Step 1: Create the day's digest with a summary
```bash
curl -X POST \
  http://news.pistonsolutions.ai/api/content/$(date +%Y-%m-%d) \
  -H "X-API-Key: piston-sera-2026" \
  -H "Content-Type: application/json" \
  -d '{"summary": "Your executive summary of today..."}'
```

### Step 2: Add items to each section one at a time
Do your research, then post results per section:
```bash
# Tech & Research
curl -X POST \
  http://news.pistonsolutions.ai/api/content/$(date +%Y-%m-%d)/tech_research \
  -H "X-API-Key: piston-sera-2026" \
  -H "Content-Type: application/json" \
  -d '[
    {"title":"...","summary":"...","source":"...","url":"...","priority":"high","relevance":"..."},
    {"title":"...","summary":"...","source":"...","url":"...","priority":"medium","relevance":"..."}
  ]'
```

```bash
# Events
curl -X POST \
  http://news.pistonsolutions.ai/api/content/$(date +%Y-%m-%d)/events \
  -H "X-API-Key: piston-sera-2026" \
  -H "Content-Type: application/json" \
  -d '[...]'
```

```bash
# Business Opportunities
curl -X POST \
  http://news.pistonsolutions.ai/api/content/$(date +%Y-%m-%d)/business_opportunities \
  -H "X-API-Key: piston-sera-2026" \
  -H "Content-Type: application/json" \
  -d '[...]'
```

```bash
# Montreal Research
curl -X POST \
  http://news.pistonsolutions.ai/api/content/$(date +%Y-%m-%d)/research_montreal \
  -H "X-API-Key: piston-sera-2026" \
  -H "Content-Type: application/json" \
  -d '[...]'
```

### Step 3: Add highlights last
Pick the 3-5 most important items from all sections:
```bash
curl -X POST \
  http://news.pistonsolutions.ai/api/content/$(date +%Y-%m-%d)/highlights \
  -H "X-API-Key: piston-sera-2026" \
  -H "Content-Type: application/json" \
  -d '[
    {"category":"tech","title":"...","summary":"...","url":"...","source":"...","priority":"critical","relevance":"..."},
    {"category":"business","title":"...","summary":"...","url":"...","source":"...","priority":"high","relevance":"..."}
  ]'
```

### Step 4: Verify
```bash
curl -H "X-API-Key: piston-sera-2026" \
  http://news.pistonsolutions.ai/api/content/$(date +%Y-%m-%d) | python3 -m json.tool
```

---

## Common Mistakes — Do NOT Do These

| Wrong | Right |
|---|---|
| `PUT` entire digest (overwrites everything) | `POST` to specific sections (appends) |
| Editing JSON files in git and pushing | Using the API endpoints above |
| Adding items without checking what exists | `GET` the digest first, skip duplicates |
| Using `sources: [array]` | Use `source: "string"` and `url: "string"` |
| Posting items without URLs | Always include a real, verified URL |
| Posting placeholder content ("Latest news from...") | Post specific facts with numbers and real sources |

---

## Content Quality Standards

- Every item must have a **real URL** that resolves to the actual source.
- Summaries must include **specific facts**: numbers, names, dates.
- `relevance` must explain the connection to **Piston Solutions** specifically.
- `priority` levels:
  - **critical**: Directly affects Piston's products, competitors, or market.
  - **high**: Important industry development worth tracking.
  - **medium**: General interest, good to know.
  - **low**: Background context.
- Minimum **3 items per section** for a daily digest.
- **highlights** should be the 3-5 most impactful items from all sections combined.
