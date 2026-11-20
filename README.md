# Résumé

**Drop your resume. Defend it out loud. Ship a truth-grounded ATS CV.**

Résumé is an AI Resume Defense & Job Tailoring Studio built with Next.js and Gemini (`gemini-2.5-flash` + Gemini Multimodal Live API `gemini-2.5-flash-native-audio-latest`).

## Core Features

1. **Drop / Import Any CV (PDF or Photo)**
   - Drag and drop a PDF or image of your resume onto the canvas (`/api/ai/import`). Gemini extracts your structured profile and runs an initial **Truth Linter** pass across every bullet.
2. **Truth Linter & 1-Click "Sharpen with AI"**
   - Flags passive openers, duty-only descriptions, vague scope modifiers, and unquantified claims directly on the sheet with bullet-specific critiques and a 1-click **Sharpen with AI** inline diff rewrite.
3. **Live Voice "Defend Your Resume" Mock Interviewer**
   - Real-time bidirectional voice interview powered by Gemini Live (`/api/ai/live-token` + WebSocket PCM audio streaming) with 4 interviewer personas (`Aoede`, `Puck`, `Kore`, `Fenrir`).
   - **Real-Time Section Highlight & Smooth Scroll:** As the interviewer asks about a role or summary, the CV dims surrounding sections and smoothly scrolls (via Lenis) to the exact section being questioned.
   - **Truth-Grounded Live Diffs:** When your spoken answer reveals real metrics, tools, or outcomes, Gemini proposes grounded inline diff cards without fabricating numbers.
4. **Tailor to Job Description**
   - Paste any job description into the bottom bar (`/api/ai/tailor`) to get an honest ATS match score, matched vs. missing keywords, and non-destructive surgical inline diffs.
5. **3 High-Signal ATS Templates + Export PDF**
   - Switch live between **WSO / Harvard Serif**, **LaTeX Academic / Engineering**, and **Full-Stack Tech ATS**, tweak any text inline with `Ctrl+Z` / `Ctrl+Y` undo/redo, and export a clean PDF.

## Getting Started

1. Add your Gemini API key to `.env.local`:
   ```bash
   GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here
   ```
2. Install dependencies and start the development server:
   ```bash
   npm install
   npm run dev
   ```
3. Open `http://localhost:3000`.
