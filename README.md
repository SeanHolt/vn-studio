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
- **Live Stage Preview & Visual Hotspot Drawing:** An embedded 16:9 mini-stage inside the editor updates in real time as blocks are selected, edited, or reordered—displaying active backgrounds, weather particles, staged character sprites, themes, and interactive `HOTSPOT_ROOM` boxes that creators can **click and drag directly on the stage** to draw or reposition.
- **Multi-Genre Scene Management:** Create new scenes, rename scenes, switch scene types (`TITLE`, `DIALOGUE`, `HOTSPOT`, `TOPDOWN`, `BATTLE`, `ENDING`), and delete scenes with a minimum one-scene safety guard.
- **Dead-End & Broken-Link Validator (`Validate`):** Scans every scene and block across the project to detect missing destination scene IDs, empty choices, non-ending dead-end scenes, and unreachable orphan scenes—with one-click jump-to-fix navigation.

### 2. Multi-Genre Playable Block System

Every scene is composed of strongly typed blocks validated with **Zod** (`src/lib/vn-schema.ts`):

#### Visual Novel & Narrative Blocks

- **`DIALOGUE`:** Displays speaker nameplates and story text with animated typewriter reveal and `{{variable}}` interpolation.
- **`BACKGROUND`:** Changes the stage backdrop with built-in CSS/HTML art or custom uploaded images.
- **`CHARACTER`:** Stages characters at `left`, `center`, or `right` positions with `enter`/`exit` actions, **5 expressions** (`neutral`, `happy`, `angry`, `shocked`, `sad`), and **5 stage animations** (`none`, `slide-in`, `bounce`, `shake`, `pulse`).
- **`CHOICE`:** Presents branching player decisions with optional **variable condition rules** (`==`, `!=`, `>`, `<`, `>=`, `<=`) and **required inventory item** locks.
- **`INPUT_TEXT`:** Prompts the player to type their name or a secret password and saves their response directly into a game variable.
- **`QUIZ_CHALLENGE` (Trivia & Riddle Trials):** Embeds a multi-question multiple-choice quiz or riddle challenge with instant answer explanations, synth audio feedback, score tracking (`quizScore`), Pass/Fail scene routing, and a built-in **20-question preset bank** covering **Sci-Fi Movies**, **Fantasy Movies**, **Sci-Fi & Fantasy TV**, and **Classic Riddles**.
- **`CARD_DUEL` (Card Duel & Elemental Showdown):** Launches a multi-round tactical card battle with 3 selectable deck themes (**Elemental Magic**, **Sci-Fi Systems**, and **Royal Arena**), live score tracking, synth audio feedback, and Victory/Defeat scene routing. - First Version - Expect much more later!

#### Interactive Game Genres & Mini-Games

- **`HOTSPOT_ROOM` (Point-and-Click Sandbox):** Turns a scene into an interactive exploration room with percentage-positioned clickable zones (`x`, `y`, `width`, `height`). Clicking a hotspot can show inspection text, grant an item, set a variable, jump to another room/scene, or require a specific key item to unlock.
- **`KEYPAD_PUZZLE` (Escape Room PIN & Safe Lock):** Embeds an interactive 0–9 digital safe keypad or secret password terminal with optional clue hints, configurable attempt limits (unlimited or lockout), shake feedback, synth chime/alert audio, and separate Unlock and Fail destination scenes.
- **`TOPDOWN_ROOM` (2D Tile-Grid RPG Map):** Renders a playable 12×8 top-down adventure grid (**Emerald Grassland**, **Stone Dungeon**, or **Starship Deck**) with WASD/Arrow/D-Pad movement, **Key-Locked Doors**, **Floor Pressure Switches** that open barrier walls, **Patrolling Enemies**, NPCs, and treasure chests.
- **`BATTLE_ENCOUNTER` (Turn-Based RPG Battle):** Runs turn-based JRPG combat with **Elemental Weaknesses** (`Fire`, `Ice`, `Lightning` dealing **1.5× Super Effective** damage), **Status Effects** (`Burn` damage-over-time and `Freeze` turn skips), **Multi-Enemy Waves**, Skill Points (`SP`), Guarding, and Backpack healing items.
- **`QTE_ACTION` (Quick-Time Reaction Bar):** Presents an animated reflex timing bar with adjustable speed (`SLOW`, `NORMAL`, `FAST`) and target zone size. Players press `Space` or click inside the target window to trigger Success or Miss scene routes.
- **`EVIDENCE_CHECK` (Dialogue Interrogation & "Present Evidence"):** Challenges players to inspect a witness's testimony and present the matching contradictory item from their Backpack—complete with strike counters, clue hints, synth feedback, and branching confession/failure routes.
- **`CIRCUIT_PUZZLE` (Wire-Connecting Circuit Puzzle):** Embeds an interactive 4×4, 5×5, 6×6, or 7×7 rotatable wire/pipe grid with live Breadth-First Search power flow, 3 visual themes (**Sci-Fi Neon Circuit**, **Steampunk Brass Pipes**, **Arcane Mana Channels**), optional move limits, and a one-click **Generate Solvable Board** builder.
- **`IDLE_TYCOON` (Idle / Incremental Tycoon):** Embeds a cookie-clicker/tycoon generator game with unlimited upgrade tiers (`+X/sec` auto-generators and `+X/click` power boosters), `1x / 10x / MAX` geometric bulk-buy controls, **Prestige Rebirth Star Shards (`+25%` permanent multiplier)**, **floating 10× Golden Frenzy Orbs**, big-number formatting (`K`, `M`, `B`, `T`, `Qa`), 3 deep 10-tier preset packs, and optional story goal milestones.
- **`SLIDING_PUZZLE` (Sliding Image & Rune Tile Puzzle):** Slices any built-in or uploaded artwork into a scrambled 3×3, 4×4, or 5×5 sliding tile puzzle—or switches to **Elder Arcane Runes**, **Numbers**, or **Cyber Glyphs**—with guaranteed-solvable shuffling, hold-to-peek goal preview, and optional move limits.
- **`CRAFTING_PUZZLE` (Alchemy & Potion Mixing Lab):** Lets players select ingredients from an apothecary shelf, drop them into a cauldron, and brew secret 2-to-4 ingredient formulas—automatically adding the crafted item to their Backpack upon success and routing to Pass/Fail scenes.
- **`CIPHER_PUZZLE` (Word Cipher & Decryption Terminal):** Challenges players to decode secret words or phrases letter-by-letter using an on-screen QWERTY keyboard or physical keys, complete with clue prompts, integrity attempt counters, 3 visual themes, and one-click cipher presets.

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

- **Typewriter Text & Keyboard Fast-Forward Engine:** Reveals dialogue character-by-character; clicking or pressing `Space`/`Enter` finishes the current sentence or advances to the next block, while holding `Ctrl` fast-forwards through dialogue sequences until a choice or mini-game appears.
- **In-Game Save/Load Slots & Auto-Save (`Save / Load`):** Persists full playthrough snapshots (active scene, block position, variables, inventory, relationship scores, clock state, staged characters, and dialogue history) to `localStorage` across **3 manual save slots** plus an automatic scene-transition **Auto-Save** checkpoint.
- **Custom Visual Themes & Typography:** Supports 4 built-in UI themes (**Modern Studio**, **Sci-Fi Terminal**, **Fantasy Parchment**, and **8-Bit Arcade**) that style dialogue boxes, speaker tags, choice buttons, and fonts.
- **Toggleable Day & Time-of-Day Clock:** When enabled by the author, displays a live `Day X • Morning/Afternoon/Evening/Night` HUD badge and applies smooth atmospheric lighting tints across the stage.
- **Interactive HUD Drawers & Modals:**
  - **Backpack (`Bag`):** Inspect collected items anytime during gameplay (used for locked doors, hotspots, chests, and battle healing).
  - **Character Bonds (`Bonds`):** View relationship progress bars for every character met so far.
  - **Achievements & Endings Gallery (`Gallery`):** Tracks discovered `ENDING` scenes and unlocked trophy badges across replays in `localStorage`.
  - **Scrollable Dialogue Backlog (`Log`):** Review a chronological history of every spoken dialogue line and choice made during the current playthrough.
  - **Audio Mute Toggle & Instant Restart:** One-click mute/unmute for BGM/SFX and full state reset.
- **Creator Story Debugger (`Debug`):** Available to project owners during playtesting; allows warping straight to any scene or block index, editing global variables live, spawning or removing Backpack items, and adjusting character affinity scores on the fly.
- **Text-to-Speech (TTS) Voice Narration (`Voice On/Off`):** Uses the browser's built-in `speechSynthesis` API to read dialogue aloud with automatic speaker-aware pitch and pacing presets (`Auto`, `Narrator`, `Hero`, `Mystic`, `Robot`) and zero external API costs.
- **Cinematic Screen Transitions (`BACKGROUND`):** Supports 5 selectable scene transition effects (**Smooth Fade In**, **Fade Through Black Curtain**, **Cinematic Wipe Left**, **Dreamy Blur Dissolve**, and **Instant Hard Cut**) rendered via 60fps CSS animations.

### 4. Built-In Art, Synth Audio & Custom Asset Manager

- **Zero-Setup Starter Artwork (18 Built-In Assets):** Includes **10 pure HTML/CSS backgrounds** (_Starry Night_, _Sunset Coast_, _Emerald Woods_, _Neon Cyber Grid_, _Starship Deck_, _Magma Cavern_, _Crystal Lagoon_, _Royal Hall_, _Stormy Moor_, _Potion Study_) and **8 character sprites** (_Explorer_, _Mystic Keeper_, _Cyber Android_, _Solar Knight_, _Shadow Wraith_, _Alchemist_, _Star Captain_, _Forest Slime_) that render offline with zero external dependencies.
- **Built-In Web Audio Synthesizer:** Generates retro chimes, pickup sounds, mystery alerts, and ambient loops in-browser with no audio files required.
- **Project Asset Manager (`/api/upload`):** Creators can upload custom images (`PNG`, `JPG`, `WebP`, `GIF`) and audio (`MP3`, `WAV`, `OGG`) up to 5MB, rename assets inline, preview audio tracks, and reuse uploaded files across every scene in their project.
- **In-Browser 16×16 Pixel & Doodle Sprite Pad (`Draw Sprite`):** Built right into the Asset Picker so creators can draw custom characters, props, or tiles with Pencil, Fill Bucket, and Eraser tools and export them directly as crisp PNG files into their Project Assets.

### 5. Community Arcade, Remixing, Creator Storefront & Monetization

- **Landing Page (`/`):** Showcases platform highlights alongside live playable cards for the unowned public demo and community-published games.
- **Public Arcade & Explore Gallery (`/explore`):** Searchable, filterable community showcase displaying all published games with automatic genre badges (`VISUAL NOVEL`, `SANDBOX`, `TOPDOWN`, `BATTLE`, `QUIZ`), live **Play Counts**, interactive **Like & Dislike Counters**, pricing badges, and creator names.
- **Creator Distribution & Remix Controls:** Inside the Studio Editor, creators can toggle whether other users are permitted to **Remix** their game (`allowRemix`) and optionally set a one-time **Price to Play** (`$0.00` for free or custom USD pricing via Stripe Checkout + Webhook).
- **One-Click "Remix This Game":** When enabled by the author, authenticated users can clone the public demo or any published community game into their own Dashboard (respecting their `maxProjects` limit) with all scene IDs, branching wires, and assets cleanly remapped.
- **Creator Dashboard & Analytics (`/dashboard`):** Authenticated creators can create new projects from a **Blank Canvas** or **2-Scene Starter Template**, monitor their project slot usage bar, inspect a real-time **Creator Analytics & Earnings Summary** (total views, approval rating, game passes sold, and revenue breakdown), and delete old projects.
- **Owner-Protected Editor & Publish Toggle:** `/editor/[projectId]` and `saveProjectScenes` enforce server-side ownership verification while keeping `/editor/demo` open for public experimentation. Creators can toggle their games between **Private** and **Published** right from the editor header.
- **Free Tier & Stripe Upgrades (`/pricing`):**
  - **Starter (Free):** Up to **3** game projects per account.
  - **+10 Project Slots (\$9 One-Time):** Permanently increments a user's `maxProjects` quota via Stripe Checkout + Webhook.
  - **Pro Creator (\$12/month):** Unlocks unlimited game projects (`maxProjects: 999`).

### 6. Built-In Playable Sample Games (`prisma/seed.ts`)

Running `npx prisma db seed` populates the Homepage and Public Arcade (`/explore`) with **7 complete, remixable example projects** showcasing every genre and feature:

1. **The Clockwork Lighthouse (Mystery & Point-and-Click Sandbox):** Demonstrates custom player name entry (`INPUT_TEXT`), character expressions & animations, relationship heart toasts (`AFFINITY`), a point-and-click forest sandbox (`HOTSPOT_ROOM`), inventory checks, and multiple endings.
2. **Starship Orion: Escape Protocol (Sci-Fi Escape Room & Trivia):** Uses the **Sci-Fi Terminal** theme alongside a live 30-second reactor countdown (`TIMER`), a 4-digit airlock safe keypad (`KEYPAD_PUZZLE`), and a 5-question Sci-Fi Cinema trivia trial (`QUIZ_CHALLENGE`).
3. **Chronicles of Eldoria: The Sunstone (2D Top-Down RPG & Turn-Based Battle):** Uses the **Fantasy Parchment** theme and **Day/Time-of-Day Clock** across a walkable 12×8 tile meadow (`TOPDOWN_ROOM`) with NPCs, treasure chests, and a turn-based RPG boss battle (`BATTLE_ENCOUNTER`).
4. **Arcane Duelists: Academy of Cards (Card Duel & Riddles):** Uses the **8-Bit Arcade** theme to showcase a multi-round **Elemental Card Showdown (`CARD_DUEL`)** paired with the **5-Riddle Sphinx Trial (`QUIZ_CHALLENGE`)**.
5. **Cyber Heist: Neon Vault (Quick-Time Reflex & Password Heist):** Combines a sweeping laser **Quick-Time Reaction Bar (`QTE_ACTION`)**, a secret password lock (`KEYPAD_PUZZLE`), and a live firewall trace timer (`TIMER`).
6. **Aether Core: Circuit Breach (5×5 Wire Circuit & Interrogation):** Combines a rotatable **5×5 Neon Circuit Puzzle (`CIRCUIT_PUZZLE`)** with a **Present Evidence Cross-Examination (`EVIDENCE_CHECK`)** and TTS voice narration presets.
7. **Asteroid Belt Tycoon: 10-Tier Idle (Idle / Incremental Tycoon):** Showcases the **10-Tier Space Mining Idle Tycoon (`IDLE_TYCOON`)** with `1x / 10x / MAX` bulk-buying, passive per-second income, and a 10,000 Star Credit goal milestone.
8. **The Sunken Temple: Rune Vault (Sliding Image & Rune Puzzle):** Uses the **Fantasy Parchment** theme to challenge players with both a 3×3 **Image Slice Mosaic (`SLIDING_PUZZLE`)** and an **Elder Arcane Rune** tile lock.
9. **The Alchemist's Apprentice: Potion Trial (Alchemy & Potion Mixing Lab):** Uses the **Fantasy Parchment** theme to challenge players to decipher a grimoire riddle, combine ingredients in the **Alchemy Cauldron (`CRAFTING_PUZZLE`)** to brew the _Elixir of True Sight_, and reveal a hidden doorway.
10. **Signal Zero: Deep Space Cipher (Word Cipher & Decryption):** Uses the **Sci-Fi Terminal** theme to task players with decrypting an encrypted colony distress beacon on the **Quantum Decryptor (`CIPHER_PUZZLE`)**.

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
