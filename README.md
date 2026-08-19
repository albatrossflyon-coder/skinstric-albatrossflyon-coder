# Skinstric — AI Skin Analysis Flow

A 7-screen AI skin-analysis product flow, rebuilt frame-for-frame from a Figma spec as part of the [Frontend Simplified](https://frontendsimplified.com) internship program.

**Live**: [skinstric-albatrossflyon-coder.vercel.app](https://skinstric-albatrossflyon-coder.vercel.app)

---

## What it is

A pixel-accurate rebuild of Skinstric's AI-powered skin analysis product, wired to live backend APIs — not a static mockup. The flow takes a user from landing, through name/location entry, photo capture (upload or live camera), and into an animated demographics results view.

## Screens

- **Landing** — entry point matching the Figma spec
- **Code entry** — access flow
- **Intro** — sequential diamond click-to-type interaction pattern
- **Select analysis** — diamond-button selection UI
- **Upload** — photo upload with diamond nav
- **Camera** — live camera capture flow
- **Results** — 3-panel demographics view with animated confidence rings

## Tech Stack

- **Next.js 16** — app framework
- **TypeScript** — type safety
- **Tailwind CSS** — styling
- **GSAP** — confidence-ring and transition animations
- **react-icons** — iconography

Wired to live backend APIs for face/demographic analysis, with real request/response handling (not mocked data).

## Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

See `BUILDLOG.md` for session-by-session build history.

---

## Author

Chris Brown
[Portfolio](https://chrisbrown-dev.vercel.app)
