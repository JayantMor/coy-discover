
import { createClient } from "@supabase/supabase-js";
import { profiles, type Profile } from "../data/profile";

type Swipe = {
  profileId: number;
  action: "like" | "pass";
};

type PublicProfile = Omit<Profile, "likedYou">;

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseSecretKey) {
  throw new Error("Supabase environment variables are missing.");
}

const supabase = createClient(supabaseUrl, supabaseSecretKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

function getPublicProfile(profile: Profile): PublicProfile {
  const { likedYou, ...publicProfile } = profile;
  return publicProfile;
}

export async function getFeed(): Promise<PublicProfile[]> {
  const { data, error } = await supabase
    .from("swipes")
    .select("profile_id");

  if (error) throw error;

  const swipedIds = new Set(
    (data ?? []).map((swipe) => swipe.profile_id)
  );

  return profiles
    .filter((profile) => !swipedIds.has(profile.id))
    .map(getPublicProfile);
}

export async function recordSwipe(
  profileId: number,
  action: "like" | "pass"
) {
  const profile = profiles.find((item) => item.id === profileId);

  if (!profile) {
    return { success: false, message: "Profile not found." };
  }

  const { data: existingSwipe, error: checkError } = await supabase
    .from("swipes")
    .select("profile_id")
    .eq("profile_id", profileId)
    .maybeSingle();

  if (checkError) throw checkError;

  if (existingSwipe) {
    return { success: false, message: "Profile already swiped." };
  }

  const { error: swipeError } = await supabase
    .from("swipes")
    .insert({
      profile_id: profileId,
      action,
    });

  if (swipeError) throw swipeError;

  const isMatch = action === "like" && profile.likedYou === true;

  if (isMatch) {
    const { error: matchError } = await supabase
      .from("matches")
      .insert({ profile_id: profileId });

    if (matchError) throw matchError;
  }

  return {
    success: true,
    isMatch,
    match: isMatch ? getPublicProfile(profile) : null,
  };
}

export async function getMatches(): Promise<PublicProfile[]> {
  const { data, error } = await supabase
    .from("matches")
    .select("profile_id");

  if (error) throw error;

  const matchedIds = new Set(
    (data ?? []).map((match) => match.profile_id)
  );

  return profiles
    .filter((profile) => matchedIds.has(profile.id))
    .map(getPublicProfile);
}
