# May I Help You — AI-Powered Resume vs JD Match Scorer

**May I Help You** is a modern, full-stack application designed to analyze candidate resumes against Job Descriptions (JDs) using Google's Gemini AI. It calculates an accurate Applicant Tracking System (ATS) match score, uncovers missing keywords and skill gaps, offers formatting and optimization recommendations, and incorporates weekly-synced live tech industry trends.

---

## Tech Stack

- **Frontend**: React.js 18, Tailwind CSS, Lucide Icons, Axios, React Router v6, Vite
- **Backend**: Java 21, Spring Boot 3.3.4 (Spring Web, Spring Security, Spring Data MongoDB, Spring Scheduler)
- **Database**: MongoDB (Local or MongoDB Atlas)
- **AI Engine**: Google Gemini API (`gemini-2.0-flash` / `gemini-1.5-flash`)
- **Document Parsing**: Apache PDFBox 3.x (for PDF resumes), Apache POI 5.x (for DOCX resumes)
- **Authentication**: Stateless JWT (JSON Web Tokens) with BCrypt password encryption

---

## Key Features

1. **User Authentication & Session Management**:
   - Register & Login with encrypted credentials (BCrypt).
   - JWT token generation & verification filter.
   - Protected API routes and client-side route guards.

2. **Multi-Format Resume & Job Description Parsing**:
   - Upload **PDF**, **Word (DOCX/DOC)**, **PowerPoint (PPT/PPTX)**, or **Plain Text (TXT/RTF/MD)** documents for both Resume and Job Description inputs.
   - High-precision text extraction with Apache PDFBox 3.x and Apache POI 5.x.
   - Live character count and extracted text previews.
   - Flexible dual input modes: File Upload (drag & drop) or direct text paste for both sections.

3. **Gemini AI ATS Match Scoring**:
   - Evaluates resume text against job description requirements.
   - Computes an ATS Match Score (0–100%).
   - Detects Missing Keywords present in the JD.
   - Categorizes skills into **Present**, **Partial**, and **Missing** competency states.
   - Generates ATS formatting tips and high-impact actionable suggestions.
   - Output schema strictly enforced in JSON with automatic retries and fallback handling.

4. **Live Market Trend Integration**:
   - Maintains MongoDB `role_trends` collection for 10 tech domains (Backend, Frontend, Full Stack, DevOps, Cloud Architect, Data/ML, Mobile, QA, Product).
   - `@Scheduled` Spring job automatically queries Gemini every Monday at 3:00 AM to refresh in-demand skills and ATS keywords.
   - Manual admin endpoint (`POST /admin/refresh-trends`) for on-demand refreshes.
   - Market trends are automatically injected as context into match analysis prompts.

5. **Dashboard, History & Export**:
   - Interactive SVG progress score gauge with color tiers (Green, Amber, Red).
   - Filterable & searchable Skill Gap table and Keyword Chips.
   - Stores full analysis history per user in MongoDB.
   - One-click print / PDF export report functionality.

---

## Project Structure

```
May I Help You/
├── backend/
│   ├── pom.xml
│   └── src/
│       ├── main/
│       │   ├── java/com/mayihelpyou/
│       │   │   ├── MayIHelpYouApplication.java
│       │   │   ├── config/          # Security, CORS, App beans
│       │   │   ├── controller/      # Auth, Resume, Analysis, Admin, RoleTrend
│       │   │   ├── dto/             # Request/Response models & Gemini payloads
│       │   │   ├── exception/       # ControllerAdvice & custom exceptions
│       │   │   ├── model/           # User, Resume, ResumeAnalysis, RoleTrend
│       │   │   ├── repository/      # Mongo repositories
│       │   │   ├── scheduler/       # TrendScheduler (cron: Mon 3 AM)
│       │   │   ├── security/        # JWT service, filter, principal
│       │   │   └── service/         # Business logic, PDFBox/POI, Gemini REST
│       │   └── resources/
│       │       └── application.properties
│       └── test/                    # Unit and integration tests
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── src/
│       ├── api/client.js            # Axios client with JWT interceptor
│       ├── context/AuthContext.jsx   # Global session state
│       ├── components/              # ScoreGauge, SkillGapTable, KeywordGapList, etc.
│       └── pages/                   # Login, Register, Dashboard, Results, History, Trends
└── README.md
```

---

## Environment Variables

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | Google Gemini API Key | *(Leave empty for offline fallback mode or provide key)* |
| `MONGODB_URI` | MongoDB Connection URI | `mongodb://localhost:27017/may_i_help_you` or Atlas URI |
| `JWT_SECRET` | 256-bit secret string for signing JWTs | `404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970` |
| `JWT_EXPIRATION` | Token expiration in milliseconds | `86400000` (24 hours) |
| `server.port` | Backend HTTP port | `8080` |

---

## Setup & Running Guide

### Prerequisites
- **Java 21** or later
- **Maven 3.8+**
- **Node.js 18+** & **npm**
- **MongoDB** (Local MongoDB instance or MongoDB Atlas cluster)
- **Google Gemini API Key** (from [Google AI Studio](https://aistudio.google.com/))

---

### Step 1: MongoDB Setup (Atlas or Local)

#### Option A: MongoDB Atlas (Cloud)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free cluster.
2. Under **Security > Database Access**, create a user with read/write privileges.
3. Under **Security > Network Access**, whitelist your IP address (or `0.0.0.0/0` for development).
4. Click **Connect > Drivers** and copy the connection string:
   ```bash
   mongodb+srv://<username>:<password>@cluster0.mongodb.net/may_i_help_you?retryWrites=true&w=majority
   ```
5. Export it as an environment variable:
   ```bash
   export MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.mongodb.net/may_i_help_you?retryWrites=true&w=majority"
   ```

#### Option B: Local MongoDB
If running MongoDB locally on port 27017, no extra configuration is required.

---

### Step 2: Configure Gemini API Key

Export your Gemini API key:
```bash
export GEMINI_API_KEY="AIzaSyYourGeminiApiKeyHere"
```
*(Note: If no key is set, the backend operates in offline heuristic mode so you can test all features without interruption).*

---

### Step 3: Run the Spring Boot Backend

```bash
cd backend

# Compile & run tests
mvn clean test

# Start the Spring Boot application
mvn spring-boot:run
```
The backend will start at `http://localhost:8080`.

---

### Step 4: Run the React Frontend

```bash
cd ../frontend

# Install dependencies (if not already installed)
npm install

# Start Vite development server
npm run dev
```
The frontend application will start at `http://localhost:5173`.

---

## API Endpoints Reference

### Authentication
- `POST /api/auth/register` — Register new user account.
- `POST /api/auth/login` — Authenticate and receive JWT token.
- `GET /api/auth/me` — Get current logged-in user profile.

### Resume & Match Analysis
- `POST /api/resume/upload` — Upload PDF/DOCX file and extract text (`multipart/form-data`).
- `POST /api/analyze` — Trigger AI match evaluation (`resumeId`, `jdText`, `targetRole`).
- `GET /api/analyze/history` — Fetch user's previous analysis history.
- `GET /api/analyze/{id}` — Fetch detailed report of an analysis.

### Market Trends
- `GET /api/trends` — Retrieve trending skills, tools, and keywords across all supported job roles.
- `POST /admin/refresh-trends` — On-demand AI trigger to re-scrape market trends for all roles.

---

## Testing & Quality Assurance

To execute the backend unit test suite:
```bash
cd backend
mvn test
```
Tested components include:
- `GeminiServiceTest`: Schema parsing, markdown fence stripping, and offline heuristic analysis.
- `ResumeParserServiceTest`: PDF generation & text stripping, whitespace normalization, extension validation.
- `JwtServiceTest`: JWT token generation, signature validation, and claims extraction.
