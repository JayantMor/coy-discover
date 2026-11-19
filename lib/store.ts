
import { readFile, writeFile } from "fs/promises";
import path from "path";

import { profiles, type Profile } from "../data/profile";

type Swipe = {
  profileId: number;
  action: "like" | "pass";
};

type Database = {
  swipes: Swipe[];
  matches: number[];
};

export type PublicProfile = Omit<Profile, "likedYou">;

const databasePath = path.join(process.cwd(), "data", "db.json");

async function readDatabase(): Promise<Database> {
  try {
    const content = await readFile(databasePath, "utf-8");
    return JSON.parse(content) as Database;
  } catch {
    const initialDatabase: Database = {
      swipes: [],
      matches: [],
    };

    await writeDatabase(initialDatabase);
    return initialDatabase;
  }
}

async function writeDatabase(database: Database): Promise<void> {
  await writeFile(
    databasePath,
    JSON.stringify(database, null, 2),
    "utf-8"
  );
}

function getPublicProfile(profile: Profile): PublicProfile {
  const { likedYou, ...publicProfile } = profile;
  return publicProfile;
}

export async function getFeed(): Promise<PublicProfile[]> {
  const database = await readDatabase();

  const swipedIds = new Set(
    database.swipes.map((swipe) => swipe.profileId)
  );

  return profiles
    .filter((profile) => !swipedIds.has(profile.id))
    .map(getPublicProfile);
}

export async function recordSwipe(
  profileId: number,
  action: "like" | "pass"
) {
  const database = await readDatabase();

  const profile = profiles.find((item) => item.id === profileId);

  if (!profile) {
    return { success: false, message: "Profile not found." };
  }

  const alreadySwiped = database.swipes.some(
    (swipe) => swipe.profileId === profileId
  );

  if (alreadySwiped) {
    return { success: false, message: "Profile already swiped." };
  }

  database.swipes.push({ profileId, action });

  const isMatch = action === "like" && profile.likedYou === true;

  if (isMatch) {
    database.matches.push(profileId);
  }

  await writeDatabase(database);

  return {
    success: true,
    isMatch,
    match: isMatch ? getPublicProfile(profile) : null,
  };
}

export async function getMatches(): Promise<PublicProfile[]> {
  const database = await readDatabase();

  return database.matches
    .map((id) => profiles.find((profile) => profile.id === id))
    .filter((profile): profile is Profile => profile !== undefined)
    .map(getPublicProfile);
}
