# ClipArt AI — Android App

AI-powered clipart generator that transforms portrait photos into 5 unique art styles, generated in parallel.

## Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Expo managed (React Native) | Fastest Android build path under 24h constraint |
| Language | TypeScript (strict) | Type safety across service/UI boundary |
| Navigation | React Navigation v7 | Native-stack, well-tested on Android |
| State | Zustand | Minimal boilerplate, granular selectors |
| HTTP | Axios | Interceptors, timeout, typed responses |
| Animation | Reanimated 3 | Skeleton loaders, smooth transitions |
| Storage | AsyncStorage | Offline result caching |
| Image | expo-image-picker + expo-image-manipulator | Permission-safe, automatic compression |
| Share/Download | expo-sharing + expo-media-library | Native Android share sheet + gallery save |

## Security

- **OpenAI API keys are never in this codebase.** All AI calls go through a backend proxy.
- `.env` contains only non-secret client config (`BACKEND_URL`, `API_TIMEOUT`, etc.)
- `.env` is `.gitignore`d — see `.env.example` for the template.

## Setup

### Prerequisites

- Node.js ≥ 18
- Expo CLI: `npm install -g expo-cli`
- Android Studio + Android SDK (for physical device builds)

### Install

```bash
cd ClipArtAI
npm install
npx expo install        # ensures Expo-compatible peer deps
```

### Configure environment

```bash
cp .env.example .env
# Edit .env and set BACKEND_URL to your backend proxy
```

### Run on Android

```bash
# Start Metro dev server
npm start

# Build and run on connected device / emulator
npm run android
```

### Type check + lint

```bash
npm run typecheck
npm run lint
```

## Project Structure

```
ClipArtAI/
├── App.tsx                        ← Root component
├── app.config.ts                  ← Expo config (builds extras from env)
├── src/
│   ├── services/
│   │   ├── aiService.ts           ← Step 2: generation engine, retry, polling
│   │   ├── imageService.ts        ← Pick, validate, compress
│   │   ├── storageService.ts      ← AsyncStorage result cache
│   │   └── shareService.ts        ← Gallery save + native share
│   ├── hooks/
│   │   ├── useImageGeneration.ts  ← Orchestrates generation flow
│   │   ├── useImageUpload.ts      ← Pick + process lifecycle
│   │   └── useLocalStorage.ts     ← Typed AsyncStorage wrapper
│   ├── context/AppContext.tsx     ← Zustand store
│   ├── navigation/RootNavigator.tsx
│   ├── screens/                   ← HomeScreen, Upload, Generation, Results, Settings
│   ├── components/                ← ImageUpload, StyleSelector, GenerationLoader, ResultsGrid, DownloadShare, ErrorBoundary
│   ├── utils/
│   │   ├── constants.ts           ← App/API/UI config constants
│   │   ├── prompts.ts             ← Style metadata + AI prompt templates
│   │   ├── helpers.ts             ← Formatting, logging, ID utils
│   │   └── validators.ts          ← Input validation
│   ├── styles/
│   │   ├── tokens.ts              ← Colors, spacing, radius, typography, shadows
│   │   ├── theme.ts               ← Composed theme object
│   │   └── globalStyles.ts        ← Shared StyleSheet
│   └── types/index.ts             ← All shared TypeScript interfaces
```

## Tradeoffs

| Decision | Tradeoff |
|---|---|
| Expo managed workflow | Faster setup; limited to Expo-compatible native modules |
| Async job polling model | Adds complexity; handles slow AI generation cleanly without blocking UI |
| Client sends prompts to backend | Backend can override/enrich; gives flexibility to iterate on prompts without app release |
| Zustand over Redux | Less ceremony; sufficient for this app's complexity |
| No expo-router | React Navigation v7 is more predictable for a non-router-centric flow |

## APK

_Link will be added here once the build is complete._

## Screen Recording

_Link will be added here once the recording is complete._

## Steps

- [x] Step 1: Project setup, folder structure, design system
- [x] Step 2: AI service layer, backend proxy contract, style prompts
- [ ] Step 3: Image processing completion
- [ ] Step 4: Full screen implementations
- [ ] Step 5: APK build + submission assets
