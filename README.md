# NewsPiston

Piston Solutions Intelligence Digest — Bloomberg Terminal meets Hacker News.

**Live URL:** `https://news.pistonsolutions.ai`

## What This Is

Your single source of truth. Open it in the morning, know everything that matters.

**Design Philosophy:**
- Scan in under 2 minutes
- Dark mode default (terminal aesthetic)
- No scrolling fatigue
- Mobile-responsive
- Zero JavaScript frameworks — vanilla JS only

## Sections

| Section | What's In It | Why You Care |
|---------|--------------|--------------|
| **Today's Digest** | Executive summary + highlights | 30-second scan |
| **arXiv/Research** | New papers in AI/ML | Stay ahead of tech |
| **Model & Tool Launches** | New models, APIs, frameworks | Competitive positioning |
| **Procurement/RFPs** | Government/enterprise tenders | Revenue pipeline |
| **Competitor Intel** | Moov AI, Tactful, etc. | Know their moves |
| **University/Academic** | McGill, Mila, HEC, Concordia | Partnerships, talent |
| **Industry News** | Funding, M&A, trends | Market context |

## Content Format

Data lives in `content/YYYY-MM-DD.json`. Auto-published via cron jobs.

```json
{
  "date": "2025-02-23",
  "summary": "Executive summary here...",
  "highlights": [...],
  "arxiv": [...],
  "launches": [...],
  "procurement": [...],
  "competitors": [...],
  "academic": [...],
  "industry": [...]
}
```

Each item:
```json
{
  "title": "Paper Title",
  "summary": "One-line summary",
  "url": "https://...",
  "source": "arXiv",
  "priority": "critical|high|medium|low",
  "relevance": "Why this matters to Piston"
}
```

## Deployment

### Infrastructure (Terraform)

```bash
cd terraform/
terraform init
terraform plan
terraform apply
```

Creates on OCI Always Free:
- A1.Flex instance (1 OCPU, 6GB RAM)
- VCN + subnet + security groups
- Ubuntu 22.04 with Docker + nginx

### CI/CD (GitHub Actions)

On push to `main`:
1. Build Docker image
2. Push to GHCR
3. SSH to OCI instance
4. Run deploy script

Required secrets:
- `OCI_HOST` — Instance public IP
- `OCI_SSH_KEY` — Private key for ubuntu user

### Manual Deploy

```bash
docker build -t newspiston .
docker run -p 8080:80 -v $(pwd)/content:/usr/share/nginx/html/content newspiston
```

## Local Development

```bash
# Serve locally
python3 -m http.server 8000

# Or use Docker
docker-compose up
```

## Architecture

```
┌─────────────────┐
│  Cloudflare     │
│  (DNS/SSL)      │
└────────┬────────┘
         │
┌────────▼────────┐
│  OCI Instance   │
│  Ubuntu + Nginx │
└────────┬────────┘
         │
┌────────▼────────┐
│  Docker         │
│  NewsPiston     │
└─────────────────┘
```

## Maintenance

- **Content:** Update via JSON files in `content/`
- **Styling:** Edit `styles.css`
- **Infrastructure:** Terraform in `terraform/`

## Built By

Sera — Piston Solutions Autonomous Intelligence

---

**Note:** This is an internal tool. Do not share publicly without approval.
