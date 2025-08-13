# EcoJet Certificates – SAF Certificate Brokerage MVP

A full‑stack platform that simulates brokerage, issuance, and management of Sustainable Aviation Fuel (SAF) certificates. It helps airlines / enterprises estimate flight emissions, purchase SAF volume, generate certificate artifacts, and track environmental impact while providing admin analytics and embedded regulatory documentation.

## ✈️ Key Features
- User registration & authentication (JWT scaffolding)
- Flight emissions quote & recommended SAF volume calculation
- Order lifecycle (create → quote → pay (stub) → certificate issuance)
- PDF certificate generation with compliance markings
- Environmental impact metrics (CO₂ reduction, SAF volume aggregation)
- Admin dashboard (orders, revenue proxy, impact statistics)
- Documentation viewer (regulatory & pricing guidance markdown)
- Runtime configurable API base (no rebuild needed for URL change)

## 🧱 Architecture
```
Angular 20 (frontend)  <——>  Spring Boot 3 (REST API)  ——> In‑Memory H2
                                  │
                                  └─ PDFBox (certificate PDFs)
```
Runtime config: `frontend/public/env.js` injects `window.__env.API_BASE_URL` consumed by `src/app/config.ts`.

## 🛠 Tech Stack
| Layer | Tech |
|-------|------|
| Frontend | Angular 20, SCSS, RxJS |
| Backend | Spring Boot 3 (Web, Data JPA, Security, Validation, Mail) |
| DB (dev) | H2 in‑memory |
| Docs | Markdown served statically (loaded in frontend) |
| PDFs | Apache PDFBox |

## ✅ Prerequisites
Install before running:
- Java 17 (verify: `java -version`)
- Node.js 20+ & npm (verify: `node -v && npm -v`)
- Angular CLI: `npm install -g @angular/cli`
- Git

Optional: Stripe test key (future payments), HTTP client (Postman / curl).

## 🚀 Quick Start
Clone repository:
```bash
git clone https://github.com/ericflorence12/EcoJet-Certificates---Vibe-Coding-Hackathon.git
cd EcoJet-Certificates---Vibe-Coding-Hackathon
```
### 1. Backend (Spring Boot)
```bash
cd backend
./gradlew bootRun        # Windows: ./gradlew.bat bootRun
```
Backend defaults:
- Base URL: http://localhost:8080
- API root: http://localhost:8080/api
- H2 console: http://localhost:8080/h2-console (JDBC URL: jdbc:h2:mem:testdb user: sa pw: password)

Environment variable overrides (examples):
```bash
JWT_SECRET=myBetterSecret PRICING_CACHE_REFRESH=10 ./gradlew bootRun
```
### 2. Frontend (Angular)
Open a new terminal at repo root:
```bash
cd frontend
npm install
ng serve --port 4200
```
Visit: http://localhost:4200

### 3. API Base Configuration (Frontend)
File: `frontend/public/env.js` (loaded before Angular bootstraps)
```js
window.__env = { API_BASE_URL: 'http://localhost:8080/api' };
```
Change the URL for staging/production without rebuilding (on Netlify/other hosts you can inject / rewrite this file at deploy time).

## 🧪 Useful Commands
| Purpose | Command |
|---------|---------|
| Build backend JAR | `cd backend && ./gradlew build` |
| Run backend tests | `cd backend && ./gradlew test` |
| Dev serve frontend | `cd frontend && ng serve` |
| Production frontend build | `cd frontend && ng build` |

## 🔐 Security Notes (MVP)
- SecurityConfig currently permits most endpoints (JWT enforcement can be tightened later)
- CORS is permissive (wildcard + explicit annotations) — restrict before production
- Tokens & user snapshot stored in `localStorage` (`saf_token`, `saf_user`)

## 🧾 Data Persistence
- All data resides in an in‑memory H2 database (clears on restart)
- Swap to MySQL/Postgres by adjusting `application.properties` and adding driver

## 🌐 Free Deployment Suggestion
| Layer | Service | Notes |
|-------|---------|-------|
| Backend | Render (Java Web Service) | Build: `./gradlew build -x test`; Start: `java -Dserver.port=$PORT -jar build/libs/*.jar` |
| Frontend | Netlify (static) | Build: `npm ci && npm run build`; Publish: `dist/frontend/browser` |
Set Netlify env var: `API_BASE_URL=https://<render-service>.onrender.com/api`.

## 🛠 Troubleshooting
| Issue | Resolution |
|-------|------------|
| 404s from frontend | Confirm backend running & API_BASE_URL correct in env.js |
| CORS error | Backend not started or origin mismatch; during dev wildcard should allow |
| H2 console login fail | Ensure JDBC URL exactly `jdbc:h2:mem:testdb` |
| Angular cannot resolve modules | Remove `frontend/node_modules` then `npm install` |
| Port already in use | Change: `SERVER_PORT=8081 ./gradlew bootRun` and update `API_BASE_URL` |

## 🗺 Roadmap Ideas
- Persist data (MySQL/Postgres) & enable migrations (Flyway)
- Enforce JWT auth & role-based access
- Real payment integration (Stripe) + webhook security
- External SAF pricing feed adapters with caching
- Certificate registry hash / blockchain anchoring
- Multi-tenant / organization accounts

## 📄 License
Internal hackathon MVP (no license declared yet). Add a LICENSE file before external distribution.

---
Happy testing & contributing! 🌱✈️
