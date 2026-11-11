# VN Studio — Interactive Visual Novel & Sandbox Game Creation Platform

**VN Studio** is a no-code, browser-based game creation platform built with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, **Prisma 7 (SQLite)**, **Zustand**, **Auth.js**, and **Stripe**. Designed for both first-time young creators and experienced storytellers, it pairs a kid-friendly drag-and-drop block editor with a 2D node-graph canvas, variables, inventory, point-and-click sandbox rooms, and an instant playable runtime.

---

## Core Architecture & Tech Stack

- **Framework:** Next.js 16 (App Router with `<Suspense>` streaming & Cache Components compatibility)
- **Language:** Strict TypeScript
- **Database & ORM:** SQLite via Prisma 7 (`@prisma/adapter-better-sqlite3`)
- **State Management:** Zustand (`useEditorStore.ts`) + `@dnd-kit` drag-and-drop sorting
- **Node Graph Canvas:** `@xyflow/react` (React Flow)
- **Authentication:** Auth.js (`next-auth@beta`) with Prisma Adapter & Credentials sign-in
- **Monetization:** Stripe Checkout & Webhooks for one-time project packs and recurring Pro plans
- **Styling:** Tailwind CSS + Lucide Icons

---

## Complete Feature Breakdown

### 1. Dual-Mode Studio Editor (`/editor/[projectId]`)
Creators can toggle seamlessly between two synchronized editing views at any time:
- **Simple Mode (Drag-and-Drop Timeline):** Snap together ordered scene blocks (`DIALOGUE`, `BACKGROUND`, `CHARACTER`, `CHOICE`, etc.) using drag-and-drop reordering and edit properties in a dedicated Inspector panel.
- **Advanced Mode (2D Node Graph Canvas):** Visualize every scene as an interactive node on an infinite 2D canvas powered by `@xyflow/react`.
  - Color-coded animated wires automatically render for **Choices** (indigo), **Conditional Choices** (amber), **`IF / ELSE` Branches** (emerald/rose), **Sandbox Doorways** (sky blue), and **Countdown Timeouts** (dashed orange).
  - Dragging a wire between two scene nodes automatically generates a linked choice option.
  - Node `(x, y)` coordinates persist directly to SQLite.
- **Live Stage Preview:** An embedded 16:9 mini-stage inside the editor updates in real time as blocks are selected, edited, or reordered—displaying active backgrounds, staged character sprites, emotions, themes, and dashed sandbox hotspot bounding boxes.
- **Scene Management:** Create new scenes, rename scenes, switch scene types (`TITLE`, `DIALOGUE`, `HOTSPOT`, `ENDING`), and delete scenes with a minimum one-scene safety guard.

### 2. Interactive Story & Sandbox Block System
Every scene is composed of strongly typed blocks validated with **Zod** (`src/lib/vn-schema.ts`):
- **`DIALOGUE`:** Displays speaker nameplates and story text with animated typewriter reveal and `{{variable}}` interpolation.
- **`BACKGROUND`:** Changes the stage backdrop with built-in CSS/HTML art or custom uploaded images.
- **`CHARACTER`:** Stages characters at `left`, `center`, or `right` positions with `enter`/`exit` actions, **5 expressions** (`neutral`, `happy`, `angry`, `shocked`, `sad`), and **5 stage animations** (`none`, `slide-in`, `bounce`, `shake`, `pulse`).
- **`CHOICE`:** Presents branching player decisions with optional **variable condition rules** (`==`, `!=`, `>`, `<`, `>=`, `<=`) and **required inventory item** locks.
- **`HOTSPOT_ROOM` (Point-and-Click Sandbox):** Turns a scene into an interactive exploration room with percentage-positioned clickable zones (`x`, `y`, `width`, `height`). Clicking a hotspot can show inspection text, grant an item, set a variable, jump to another room/scene, or require a specific key item to unlock.
- **`SET_VARIABLE`:** Modifies global project variables (`boolean`, `number`, `string`) using `set`, `add`, or `subtract` operations.
- **`BRANCH` (`IF / ELSE`):** Evaluates either a global variable comparison or an inventory item check (`HAS_ITEM`) and automatically routes the player to a `True` or `False` scene without needing a manual choice.
- **`INVENTORY`:** Adds (`give`) or removes (`remove`) items from the player's in-game backpack.
- **`AFFINITY`:** Adjusts character relationship scores (`+` or `-`), syncs `affinity_<CharacterName>` into global variables, and triggers an animated floating heart/bond toast notification on stage.
- **`TIMER`:** Starts or stops a live countdown bar at the top of the stage that automatically jumps to a designated timeout scene if time expires.
- **`ADVANCE_TIME`:** Steps the optional Day & Time-of-Day clock forward (`MORNING` → `AFTERNOON` → `EVENING` → `NIGHT`) or jumps to an exact time and day.
- **`PLAY_AUDIO`:** Plays or stops Sound Effects (`SFX`) or looping Background Music (`BGM`) using built-in zero-dependency Web Audio synthesizer presets or uploaded `.mp3`/`.wav`/`.ogg` files.
- **`INPUT_TEXT`:** Prompts the player to type their name or a secret password and saves their response directly into a game variable.
- **`UNLOCK_ACHIEVEMENT`:** Unlocks a custom trophy badge with an emoji icon, title, and description, displaying a celebratory toast and persisting progress to `localStorage`.

### 3. Playable Runtime (`VNPlayer` at `/play/[projectId]`)
- **Typewriter Text Engine:** Reveals dialogue character-by-character; clicking once finishes the current sentence immediately and clicking again advances to the next block.
- **Custom Visual Themes & Typography:** Supports 4 built-in UI themes (**Modern Studio**, **Sci-Fi Terminal**, **Fantasy Parchment**, and **8-Bit Arcade**) that style dialogue boxes, speaker tags, choice buttons, and fonts.
- **Toggleable Day & Time-of-Day Clock:** When enabled by the author, displays a live `Day X • Morning/Afternoon/Evening/Night` HUD badge and applies smooth atmospheric lighting tints across the stage.
- **Interactive HUD Drawers & Modals:**
  - **Backpack (`Bag`):** Inspect collected items anytime during gameplay.
  - **Character Bonds (`Bonds`):** View relationship progress bars for every character met so far.
  - **Achievements & Endings Gallery (`Gallery`):** Tracks discovered `ENDING` scenes and unlocked trophy badges across replays in `localStorage`.
  - **Scrollable Dialogue Backlog (`Log`):** Review a chronological history of every spoken dialogue line and choice made during the current playthrough.
  - **Audio Mute Toggle & Instant Restart:** One-click mute/unmute for BGM/SFX and full state reset.

### 4. Built-In Art, Synth Audio & Custom Asset Manager
- **Zero-Setup Starter Artwork:** Pure HTML/CSS gradient and polygon backgrounds (*Starry Night*, *Sunset Coast*, *Emerald Woods*) and character sprites (*Explorer*, *Keeper*) render instantly with zero external dependencies and full immunity to browser extension SVG injection.
- **Built-In Web Audio Synthesizer:** Generates retro chimes, pickup sounds, mystery alerts, and ambient loops in-browser with no audio files required.
- **Project Asset Manager (`/api/upload`):** Creators can upload custom images (`PNG`, `JPG`, `WebP`, `GIF`) and audio (`MP3`, `WAV`, `OGG`) up to 5MB, rename assets inline, preview audio tracks, and reuse uploaded files across every scene in their project.

### 5. User Accounts, Dashboard, Publishing & Monetization
- **Landing Page (`/`):** Showcases platform highlights alongside live playable cards for the unowned public demo and community-published games.
- **Creator Dashboard (`/dashboard`):** Authenticated creators can create new projects from a **Blank Canvas** or **2-Scene Starter Template**, monitor their project slot usage bar, and delete old projects.
- **Owner-Protected Editor & Publish Toggle:** `/editor/[projectId]` and `saveProjectScenes` enforce server-side ownership verification while keeping `/editor/demo` open for public experimentation. Creators can toggle their games between **Private** and **Published** right from the editor header.
- **Free Tier & Stripe Upgrades (`/pricing`):**
  - **Starter (Free):** Up to **3** game projects per account.
  - **+10 Project Slots (\$9 One-Time):** Permanently increments a user's `maxProjects` quota via Stripe Checkout + Webhook.
  - **Pro Creator (\$12/month):** Unlocks unlimited game projects (`maxProjects: 999`).

---

## Local Setup & Commands

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables in `.env`:**
   ```env
   DATABASE_URL="file:./dev.db"
   AUTH_SECRET="your-random-32-char-secret"
   STRIPE_SECRET_KEY="sk_test_..."
   STRIPE_WEBHOOK_SECRET="whsec_..."
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

3. **Initialize SQLite database & seed the 6-scene interactive demo:**
   ```bash
   npx prisma db push
   npx prisma generate
   npx prisma db seed
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   - **Homepage:** `http://localhost:3000`
   - **Playable Demo:** `http://localhost:3000/play/demo`
   - **Open Demo Editor:** `http://localhost:3000/editor/demo`
   - **Creator Dashboard:** `http://localhost:3000/dashboard`
