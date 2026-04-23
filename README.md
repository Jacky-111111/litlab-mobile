# LitLab Mobile

**LitLab Mobile** is a companion app for [**LitLab**](https://github.com/Jacky-111111/litlab)—the beginner-friendly research assistant with a web frontend, FastAPI backend, and Supabase auth/data. This repository is **not** a full copy of that project; it exposes a **focused subset** of LitLab for **phones and tablets**, built with **Expo** so you can develop and ship iOS and Android from one codebase.

If you use LitLab on the web, the mobile app lets you sign in with the **same account**, browse your **library and collections**, open **project** guidance, manage **collection sharing** (link + QR + visibility), and open **shared collections** via link—without replacing the full dashboard experience.

## Relationship to the main LitLab repo

| | [litlab (main)](https://github.com/Jacky-111111/litlab) | **litlab-mobile (this repo)** |
|---|--------------------------------------------------------|-------------------------------|
| **Role** | Full product: projects, library, AI actions, PDFs, dashboard, etc. | Mobile-friendly **read-oriented** access plus **collection sharing** tools |
| **UI** | Vanilla HTML/CSS/JS frontend | **Expo Router** + React Native |
| **API** | Same backend contract (`/api/...`) | Calls the same deployed API (see `lib/config.ts`) |
| **Auth** | Supabase | Same Supabase session (email/password in-app) |

Anything not listed under [What’s in the app](#whats-in-the-app) should still be done on the **web app** (create papers/projects beyond what the API allows from mobile, heavy AI flows, full PDF workflow, etc.).

## Tech stack

- **Expo SDK 54** — managed workflow, `expo start`, EAS-friendly native builds  
- **expo-router** — file-based navigation (`app/`)  
- **React Native** + **TypeScript**  
- **Supabase JS** — session persistence (e.g. AsyncStorage)  
- **Same LitLab API** as production (configurable base URL in `lib/config.ts`)

## What’s in the app

- **Sign in** — LitLab account via Supabase (aligned with the main stack described in the [main README](https://github.com/Jacky-111111/litlab#readme)).  
- **Library** — all papers and **collections**; paper rows; **paper detail** (metadata, abstract, citations, open source URL in browser).  
- **Projects** — list projects; **framework guidance** and papers attached to a project.  
- **Account** — profile summary and sign out.  
- **Collections** — open a collection’s papers; **Share** screen for owners: visibility, invite list, copy canonical web link, fetch **QR PNG** from the API, regenerate share slug (same behavior as the web dashboard’s sharing model).  
- **Shared collections** — open `…/shared-collection.html?slug=…` (and in-app route) for read-only shared views; optional auth when the link requires it.  
- **Deep linking** — iOS Associated Domains / Android intent filters toward the deployed web host (see `app.json`); Universal Links need a valid `apple-app-site-association` on that host.

For API shapes and historical v1 scope notes, see **`IOS_APP_SPEC.md`** in this repo (ported from the monorepo spec).

## What’s intentionally limited

The mobile app does **not** try to replicate every LitLab web feature. Examples: no in-app PDF reader, no full AI action suite from the dashboard, no replacing the web UI for complex authoring. Use **[Jacky-111111/litlab](https://github.com/Jacky-111111/litlab)** for the complete workflow; use **this app** when you want quick mobile access to library, projects, and sharing.

## Prerequisites

- Node.js (see Expo 54 docs for supported versions)  
- **npm** or **yarn**  
- For device builds: Xcode (iOS), Android Studio (Android), or **EAS Build**

## Getting started

1. **Clone** this repo (it is separate from the main LitLab tree).

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure** `lib/config.ts` if you need a different API, Supabase project, or web origin than the checked-in defaults (must match a working LitLab deployment).

4. **Start Expo**

   ```bash
   npx expo start
   ```

   Then open in **iOS Simulator**, **Android Emulator**, a **development build**, or [Expo Go](https://expo.dev/go) where compatible.

5. **Scripts**

   - `npm run ios` / `npm run android` — run native projects after prebuild, if you use them  
   - `npm run lint` — ESLint via Expo

## Documentation

- [Expo documentation](https://docs.expo.dev/)  
- [LitLab (main project)](https://github.com/Jacky-111111/litlab)  
- Deployed example referenced in config: [litlab-delta.vercel.app](https://litlab-delta.vercel.app) (from the main repo’s setup)
