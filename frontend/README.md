# EcoJet Certificates

A full‑stack Sustainable Aviation Fuel (SAF) certificate brokerage MVP. It lets users:
- Register / login and create SAF orders from flight data
- Generate quotes (emissions, recommended SAF volume, pricing + carbon reduction)
- Purchase / manage orders & view environmental impact metrics
- Receive issued SAF certificates (PDF metadata, registry style details)
- Admin dashboard for platform metrics (orders, revenue, impact)
- Documentation viewer for regulatory + pricing knowledge base

Tech Stack
- Frontend: Angular 20 (standalone components, SCSS)
- Backend: Spring Boot 3 (Java 17, Spring Web/Data/Security, H2 in‑memory DB, PDFBox, JWT scaffolding)
- Storage (dev): In‑memory + generated PDFs

---
## 1. Prerequisites
Install the following before starting:
- Java 17 (confirm with: `java -version`)
- Node.js 20+ & npm (confirm with: `node -v && npm -v`)
- Angular CLI globally: `npm install -g @angular/cli`
- Git (to clone the repository)

Optional (nice to have):
- cURL or HTTP client (testing APIs)
- Stripe test key (future payment integration)

---
## 2. Clone the Repository
```bash
git clone https://github.com/ericflorence12/EcoJet-Certificates---Vibe-Coding-Hackathon.git
cd EcoJet-Certificates---Vibe-Coding-Hackathon
```

Project structure (simplified):
```
backend/        # Spring Boot API
frontend/       # Angular web app
backend/docs/   # Regulatory & domain markdown docs
```

---
## 3. Run the Backend (Spring Boot)
From the project root:
```bash
cd backend
./gradlew bootRun
```
If on Windows PowerShell use: `./gradlew.bat bootRun`

Backend defaults:
- Runs on: http://localhost:8080
- H2 Console: http://localhost:8080/h2-console (JDBC URL: jdbc:h2:mem:testdb, user: sa, pw: password)
- Base API path: /api (e.g. http://localhost:8080/api/orders)

Environment variables (optional overrides):
```
JWT_SECRET=changeMeLongSecret
PRICING_CACHE_REFRESH=15
PRICING_FALLBACK_ENABLED=true
```
Run with overrides (example macOS/Linux):
```bash
JWT_SECRET=myBetterSecret ./gradlew bootRun
```

---
## 4. Run the Frontend (Angular)
Open a new terminal (keep backend running):
```bash
cd frontend
npm install
ng serve --port 4200
```
Then visit: http://localhost:4200

The frontend calls the backend at `http://localhost:8080/api` via a runtime config (`public/env.js`). For local dev no change needed. If your backend runs on a different port edit `frontend/public/env.js`.

---
## 5. Common Development Tasks
| Task | Command |
|------|---------|
| Build backend JAR | `./gradlew build` |
| Run backend tests | `./gradlew test` |
| Start Angular dev server | `ng serve` |
| Production Angular build | `ng build` |

---
## 6. Authentication & Storage Notes
- JWT wiring scaffolded; current security config permits most endpoints (tighten before production)
- User/session stored in localStorage (`saf_token`, `saf_user`)
- Database is in‑memory (data resets on restart)

---
## 7. Adjusting API Base URL
At runtime the Angular app loads `/env.js`:
```js
window.__env = { API_BASE_URL: 'http://localhost:8080/api' };
```
For deployment just rewrite that value (Netlify, etc.).

---
## 8. Troubleshooting
| Issue | Fix |
|-------|-----|
| Backend port in use | Change with `SERVER_PORT=8081 ./gradlew bootRun` and update env.js |
| CORS errors | Ensure backend running & not blocked; current config allows all origins except two controllers explicitly | 
| Modules not found (Angular) | Delete `node_modules` then `npm install` |
| H2 console cannot login | Verify JDBC URL exactly: `jdbc:h2:mem:testdb` |

---
## 9. Next Steps / Hardening Ideas
- Replace wildcard CORS with explicit allowed origin
- Persist data in MySQL / Postgres (remove H2)
- Enforce JWT on protected endpoints
- Integrate real pricing feeds & Stripe live mode

---
## 10. License
Internal hackathon MVP (no open source license declared yet).

---
Happy building ✈️🌱
