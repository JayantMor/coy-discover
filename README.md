# Coy Discover

Coy Discover is a simple, mobile-first discovery experience where users can explore profiles, express interest, and connect through mutual likes.

The idea behind this project is straightforward: **a match should happen only when both people have liked each other.** A one-sided like is never shown as a match.

## Features

- **Discover Feed:** Browse one profile at a time with profile details, interests, college, and city.
- **Swipe Interaction:** Swipe right to like and left to pass. Desktop users can also use the Like and Pass buttons.
- **Mutual Matching:** A match is created only when both users have liked each other.
- **Matches:** View profiles where mutual interest exists.
- **Persistent Swipes:** Liked and passed profiles are removed from the feed and remain saved after refreshing the page.
- **Empty State:** A simple screen is shown when there are no more profiles to discover.
- **Responsive UI:** Designed with a mobile-first layout while supporting desktop screens.

## Tech Stack

- **Frontend:** Next.js, React, TypeScript, Tailwind CSS
- **Animations & Gestures:** Framer Motion
- **Icons:** Lucide React
- **Backend:** Next.js API Routes
- **Data Storage:** JSON file-based storage

## API Routes

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/feed` | Returns profiles that have not been swiped yet |
| POST | `/api/swipe` | Records a like or pass and checks for a mutual match |
| GET | `/api/matches` | Returns profiles with mutual matches |

## Matching Logic

Each profile has a seeded `likedYou` value for demonstration purposes.

When the user likes a profile:
- If that profile has already liked the user, a mutual match is created.
- Otherwise, the like is recorded without revealing it as a match.
- Passing a profile simply records the pass.
- Once a profile has been swiped, it does not appear in the feed again.

The `likedYou` field is used internally for matching and is not included in the public feed API response.

## Getting Started

### Prerequisites
- Node.js
- npm

### Installation

Clone the repository:

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

Move into the project directory:

```bash
cd coy-discover
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

To check the production build:

```bash
npm run build
```

## Demo Data

The project includes 30 mock profiles with sample names, ages, bios, locations, colleges, interests, and placeholder photos. Some profiles are pre-seeded with likes to demonstrate the mutual matching flow.

Swipe and match data is stored locally in `data/db.json` for this single-user demo.

**Note:** This project uses local JSON file storage for demonstration. It is intended to run locally and is not configured for persistent multi-user or serverless deployment.

## Project Structure

```text
coy-discover/
├── app/
│   ├── api/
│   │   ├── feed/
│   │   │   └── route.ts
│   │   ├── matches/
│   │   │   └── route.ts
│   │   └── swipe/
│   │       └── route.ts
│   ├── page.tsx
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ProfileCard.tsx
│   └── SwipeDeck.tsx
├── data/
│   ├── profile.ts
│   └── db.json
├── lib/
│   └── store.ts
└── package.json
```

---

Built as a standalone project for the Coy Discover assignment.