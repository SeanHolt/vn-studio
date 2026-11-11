# VN Studio — Multi-Genre Visual Novel & Sandbox Game Creation Platform

**VN Studio** is a no-code, browser-based game creation platform built with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, **Prisma 7 (SQLite)**, **Zustand**, **Auth.js**, and **Stripe**. Designed for both first-time young creators and experienced storytellers, it pairs a kid-friendly drag-and-drop block editor with a 2D node-graph canvas, variables, inventory, point-and-click sandbox rooms, escape-room keypad locks, 2D top-down RPG maps, turn-based battles, community remixing, and an instant playable runtime.

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
  - Color-coded animated wires automatically render for **Choices** (indigo), **Conditional Choices** (amber), **`IF / ELSE` Branches** (emerald/rose), **Sandbox Doorways** (sky blue), **Keypad Unlock/Lockout Routes** (emerald/dashed rose), **2D Map Doors & NPCs** (teal), **Battle Victory/Defeat Outcomes** (emerald/dashed rose), and **Countdown Timeouts** (dashed orange).
  - Dragging a wire between two scene nodes automatically generates a linked choice option.
  - Node `(x, y)` coordinates persist directly to SQLite.
- **Live Stage Preview:** An embedded 16:9 mini-stage inside the editor updates in real time as blocks are selected, edited, or reordered—displaying active backgrounds, staged character sprites, emotions, themes, and dashed sandbox hotspot bounding boxes.
- **Multi-Genre Scene Management:** Create new scenes, rename scenes, switch scene types (`TITLE`, `DIALOGUE`, `HOTSPOT`, `TOPDOWN`, `BATTLE`, `ENDING`), and delete scenes with a minimum one-scene safety guard.

### 2. Multi-Genre Playable Block System
Every scene is composed of strongly typed blocks validated with **Zod** (`src/lib/vn-schema.ts`):

#### Visual Novel & Narrative Blocks
- **`DIALOGUE`:** Displays speaker nameplates and story text with animated typewriter reveal and `{{variable}}` interpolation.
- **`BACKGROUND`:** Changes the stage backdrop with built-in CSS/HTML art or custom uploaded images.
- **`CHARACTER`:** Stages characters at `left`, `center`, or `right` positions with `enter`/`exit` actions, **5 expressions** (`neutral`, `happy`, `angry`, `shocked`, `sad`), and **5 stage animations** (`none`, `slide-in`, `bounce`, `shake`, `pulse`).
- **`CHOICE`:** Presents branching player decisions with optional **variable condition rules** (`==`, `!=`, `>`, `<`, `>=`, `<=`) and **required inventory item** locks.
- **`INPUT_TEXT`:** Prompts the player to type their name or a secret password and saves their response directly into a game variable.
- **`QUIZ_CHALLENGE` (Trivia & Riddle Trials):** Embeds a multi-question multiple-choice quiz or riddle challenge with instant answer explanations, synth audio feedback, score tracking (`quizScore`), Pass/Fail scene routing, and a built-in **20-question preset bank** covering **Sci-Fi Movies**, **Fantasy Movies**, **Sci-Fi & Fantasy TV**, and **Classic Riddles**.

#### Interactive Game Genres & Mini-Games
- **`HOTSPOT_ROOM` (Point-and-Click Sandbox):** Turns a scene into an interactive exploration room with percentage-positioned clickable zones (`x`, `y`, `width`, `height`). Clicking a hotspot can show inspection text, grant an item, set a variable, jump to another room/scene, or require a specific key item to unlock.
- **`KEYPAD_PUZZLE` (Escape Room PIN & Safe Lock):** Embeds an interactive 0–9 digital safe keypad or secret password terminal with optional clue hints, configurable attempt limits (unlimited or lockout), shake feedback, synth chime/alert audio, and separate Unlock and Fail destination scenes.
- **`TOPDOWN_ROOM` (2D Top-Down RPG / Adventure Map):** Embeds a playable 12×8 tile grid with 4 environment themes (**Forest Meadow**, **Stone Dungeon**, **Royal Hall**, **Starship Deck**), customizable player avatars, paintable walls/obstacles, and interactive **NPCs**, **Treasure Chests**, **Doors**, and **Signs**. Supports Arrow keys, WASD, and on-screen D-Pad controls.
- **`BATTLE_ENCOUNTER` (Turn-Based RPG Combat):** Launches a JRPG-style encounter with customizable enemy sprites, HP/Attack stats, player stats, special skills (with cooldowns), and Backpack healing item consumption. Routes automatically to Victory or Defeat scenes and syncs `playerHP` into global variables.

#### Logic, Progression & World Systems
- **`SET_VARIABLE`:** Modifies global project variables (`boolean`, `number`, `string`) using `set`, `add`, or `subtract` operations.
- **`BRANCH` (`IF / ELSE`):** Evaluates either a global variable comparison or an inventory item check (`HAS_ITEM`) and automatically routes the player to a `True` or `False` scene without needing a manual choice.
- **`INVENTORY`:** Adds (`give`) or removes (`remove`) items from the player's in-game backpack.
- **`AFFINITY`:** Adjusts character relationship scores (`+` or `-`), syncs `affinity_<CharacterName>` into global variables, and triggers an animated floating heart/bond toast notification on stage.
- **`TIMER`:** Starts or stops a live countdown bar at the top of the stage that automatically jumps to a designated timeout scene if time expires.
- **`ADVANCE_TIME`:** Steps the optional Day & Time-of-Day clock forward (`MORNING` → `AFTERNOON` → `EVENING` → `NIGHT`) or jumps to an exact time and day.
- **`PLAY_AUDIO`:** Plays or stops Sound Effects (`SFX`) or looping Background Music (`BGM`) using built-in zero-dependency Web Audio synthesizer presets or uploaded `.mp3`/`.wav`/`.ogg` files.
- **`UNLOCK_ACHIEVEMENT`:** Unlocks a custom trophy badge with an emoji icon, title, and description, displaying a celebratory toast and persisting progress to `localStorage`.

### 3. Playable Runtime (`VNPlayer` at `/play/[projectId]`)
- **Typewriter Text Engine:** Reveals dialogue character-by-character; clicking once finishes the current sentence immediately and clicking again advances to the next block.
- **In-Game Save/Load Slots & Auto-Save (`Save / Load`):** Persists full playthrough snapshots (active scene, block position, variables, inventory, relationship scores, clock state, staged characters, and dialogue history) to `localStorage` across **3 manual save slots** plus an automatic scene-transition **Auto-Save** checkpoint.
- **Custom Visual Themes & Typography:** Supports 4 built-in UI themes (**Modern Studio**, **Sci-Fi Terminal**, **Fantasy Parchment**, and **8-Bit Arcade**) that style dialogue boxes, speaker tags, choice buttons, and fonts.
- **Toggleable Day & Time-of-Day Clock:** When enabled by the author, displays a live `Day X • Morning/Afternoon/Evening/Night` HUD badge and applies smooth atmospheric lighting tints across the stage.
- **Interactive HUD Drawers & Modals:**
  - **Backpack (`Bag`):** Inspect collected items anytime during gameplay (used for locked doors, hotspots, chests, and battle healing).
  - **Character Bonds (`Bonds`):** View relationship progress bars for every character met so far.
  - **Achievements & Endings Gallery (`Gallery`):** Tracks discovered `ENDING` scenes and unlocked trophy badges across replays in `localStorage`.
  - **Scrollable Dialogue Backlog (`Log`):** Review a chronological history of every spoken dialogue line and choice made during the current playthrough.
  - **Audio Mute Toggle & Instant Restart:** One-click mute/unmute for BGM/SFX and full state reset.

### 4. Built-In Art, Synth Audio & Custom Asset Manager
- **Zero-Setup Starter Artwork:** Pure HTML/CSS gradient and polygon backgrounds (*Starry Night*, *Sunset Coast*, *Emerald Woods*) and character sprites (*Explorer*, *Keeper*) render instantly with zero external dependencies and full immunity to browser extension SVG injection.
- **Built-In Web Audio Synthesizer:** Generates retro chimes, pickup sounds, mystery alerts, and ambient loops in-browser with no audio files required.
- **Project Asset Manager (`/api/upload`):** Creators can upload custom images (`PNG`, `JPG`, `WebP`, `GIF`) and audio (`MP3`, `WAV`, `OGG`) up to 5MB, rename assets inline, preview audio tracks, and reuse uploaded files across every scene in their project.

### 5. Community Arcade, Remixing, Creator Storefront & Monetization
- **Landing Page (`/`):** Showcases platform highlights alongside live playable cards for the unowned public demo and community-published games.
- **Public Arcade & Explore Gallery (`/explore`):** Searchable, filterable community showcase displaying all published games with automatic genre badges (`VISUAL NOVEL`, `SANDBOX`, `TOPDOWN`, `BATTLE`, `QUIZ`), live **Play Counts**, interactive **Like & Dislike Counters**, pricing badges, and creator names.
- **Creator Distribution & Remix Controls:** Inside the Studio Editor, creators can toggle whether other users are permitted to **Remix** their game (`allowRemix`) and optionally set a one-time **Price to Play** (`$0.00` for free or custom USD pricing via Stripe Checkout + Webhook).
- **One-Click "Remix This Game":** When enabled by the author, authenticated users can clone the public demo or any published community game into their own Dashboard (respecting their `maxProjects` limit) with all scene IDs, branching wires, and assets cleanly remapped.
- **Creator Dashboard (`/dashboard`):** Authenticated creators can create new projects from a **Blank Canvas** or **2-Scene Starter Template**, monitor their project slot usage bar, and delete old projects.
- **Owner-Protected Editor & Publish Toggle:** `/editor/[projectId]` and `saveProjectScenes` enforce server-side ownership verification while keeping `/editor/demo` open for public experimentation. Creators can toggle their games between **Private** and **Published** right from the editor header.
- **Free Tier & Stripe Upgrades (`/pricing`):**
  - **Starter (Free):** Up to **3** game projects per account.
  - **+10 Project Slots (\$9 One-Time):** Permanently increments a user's `maxProjects` quota via Stripe Checkout + Webhook.
  - **Pro Creator (\$12/month):** Unlocks unlimited game projects (`maxProjects: 999`).


### 6. Built-In Playable Sample Games (`prisma/seed.ts`)
Running `npx prisma db seed` populates the Homepage and Public Arcade (`/explore`) with **3 complete, remixable example projects** showcasing every genre and system:
1. **The Clockwork Lighthouse (Mystery & Point-and-Click Sandbox):** Demonstrates custom player name entry (`INPUT_TEXT`), character expressions & animations, relationship heart toasts (`AFFINITY`), a point-and-click forest sandbox (`HOTSPOT_ROOM`), inventory checks, and multiple endings.
2. **Starship Orion: Escape Protocol (Sci-Fi Escape Room & Trivia):** Uses the **Sci-Fi Terminal** theme alongside a live 30-second reactor countdown (`TIMER`), a 4-digit airlock safe keypad (`KEYPAD_PUZZLE`), and a 5-question Sci-Fi Cinema trivia trial (`QUIZ_CHALLENGE`).
3. **Chronicles of Eldoria: The Sunstone (2D Top-Down RPG & Turn-Based Battle):** Uses the **Fantasy Parchment** theme and **Day/Time-of-Day Clock** across a walkable 12×8 tile meadow (`TOPDOWN_ROOM`) with NPCs, treasure chests, and a turn-based RPG boss battle (`BATTLE_ENCOUNTER`).

---

## Local Setup & Commands

1. **Install dependencies:**
   `npm install`

2. **Configure environment variables in `.env`:**
   - `DATABASE_URL="file:./dev.db"`
   - `AUTH_SECRET="your-random-32-char-secret"`
   - `STRIPE_SECRET_KEY="sk_test_..."`
   - `STRIPE_WEBHOOK_SECRET="whsec_..."`
   - `NEXT_PUBLIC_APP_URL="http://localhost:3000"`

3. **Initialize SQLite database & seed the 6-scene interactive demo:**
   - `npx prisma db push`
   - `npx prisma generate`
   - `npx prisma db seed`

4. **Start the development server:**
   - `npm run dev`
   - **Homepage:** `http://localhost:3000`
   - **Public Arcade:** `http://localhost:3000/explore`
   - **Playable Demo:** `http://localhost:3000/play/demo`
   - **Open Demo Editor:** `http://localhost:3000/editor/demo`
   - **Creator Dashboard:** `http://localhost:3000/dashboard`