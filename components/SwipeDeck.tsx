
"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, X, Sparkles, Loader2, Users } from "lucide-react";

import ProfileCard from "./ProfileCard";
import type { Profile } from "../data/profile";

type MatchProfile = Omit<Profile, "likedYou">;

export default function SwipeDeck() {
  const [availableProfiles, setAvailableProfiles] = useState<MatchProfile[]>([]);
  const [matchedProfile, setMatchedProfile] = useState<MatchProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    async function loadFeed() {
      try {
        setLoading(true);
        const response = await fetch("/api/feed");
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Unable to load profiles.");
        }

        setAvailableProfiles(result.profiles);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Something went wrong."
        );
      } finally {
        setLoading(false);
      }
    }

    loadFeed();
  }, []);

  const currentProfile = availableProfiles[0];

  async function handleSwipe(
    action: "like" | "pass",
    profileId: number
  ) {
    if (processing) return;

    setProcessing(true);
    setError("");

    try {
      const response = await fetch("/api/swipe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ profileId, action }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to save your swipe.");
      }

      setAvailableProfiles((current) =>
        current.filter((profile) => profile.id !== profileId)
      );

      if (result.isMatch && result.match) {
        setMatchedProfile(result.match);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to save your swipe."
      );

      // Reload the feed to recover if the card was already animated away.
      try {
        const response = await fetch("/api/feed");
        const result = await response.json();

        if (response.ok && result.success) {
          setAvailableProfiles(result.profiles);
        }
      } catch {
        // Keep the original error visible.
      }
    } finally {
      setProcessing(false);
    }
  }

  function handleButtonSwipe(action: "like" | "pass") {
    if (!currentProfile || processing) return;
    handleSwipe(action, currentProfile.id);
  }

  if (loading) {
    return (
      <div className="flex min-h-[520px] flex-col items-center justify-center">
        <Loader2 className="animate-spin text-pink-500" size={36} />
        <p className="mt-4 text-sm text-gray-500">
          Finding people around you...
        </p>
      </div>
    );
  }

  if (error && availableProfiles.length === 0) {
    return (
      <div className="flex min-h-[520px] flex-col items-center justify-center px-6 text-center">
        <p className="text-lg font-bold text-gray-900">
          Something went wrong
        </p>
        <p className="mt-2 text-sm text-red-500">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-5 rounded-full bg-gray-900 px-6 py-3 text-sm font-semibold text-white"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!currentProfile) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex min-h-[520px] flex-col items-center justify-center px-6 text-center"
      >
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-pink-100">
          <Sparkles size={36} className="text-pink-600" />
        </div>

        <h2 className="text-2xl font-bold text-gray-900">
          You&apos;re all caught up!
        </h2>

        <p className="mt-3 max-w-xs text-sm leading-6 text-gray-500">
          You&apos;ve explored everyone available. New connections may appear
          when more profiles are added.
        </p>

        <p className="mt-5 text-xs text-gray-400">
          Your previous decisions have been saved.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center">
      <div className="mb-5 flex w-full items-center justify-between px-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-gray-400">
            Discover
          </p>
          <h2 className="mt-1 text-xl font-bold text-gray-900">
            Find your connection.
          </h2>
        </div>

        <div className="rounded-full bg-pink-50 px-4 py-2 text-sm font-semibold text-pink-600">
          {availableProfiles.length} left
        </div>
      </div>

      {error && (
        <p className="mb-3 w-full rounded-xl bg-red-50 p-3 text-center text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="relative aspect-[3/4] max-h-[620px] w-full">
        <div className="absolute inset-x-4 top-3 h-full rounded-3xl bg-gray-200/70 shadow-sm" />
        <div className="absolute inset-x-2 top-1.5 h-full rounded-3xl bg-gray-100 shadow-sm" />

        <AnimatePresence mode="popLayout">
          <motion.div
            key={currentProfile.id}
            initial={{ opacity: 0, y: 35, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.92 }}
            transition={{ duration: 0.28 }}
            className="relative z-10 h-full w-full"
          >
            <ProfileCard
              profile={currentProfile as Profile}
              onSwipe={handleSwipe}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-7 flex items-center justify-center gap-7">
        <button
          onClick={() => handleButtonSwipe("pass")}
          disabled={processing}
          aria-label="Pass profile"
          className="flex h-16 w-16 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-lg transition duration-200 hover:scale-110 hover:border-red-200 hover:text-red-500 active:scale-95 disabled:opacity-50"
        >
          <X size={30} strokeWidth={2.5} />
        </button>

        <button
          onClick={() => handleButtonSwipe("like")}
          disabled={processing}
          aria-label="Like profile"
          className="flex h-[76px] w-[76px] items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-rose-600 text-white shadow-xl shadow-pink-200 transition duration-200 hover:scale-110 active:scale-95 disabled:opacity-50"
        >
          {processing ? (
            <Loader2 size={30} className="animate-spin" />
          ) : (
            <Heart size={34} fill="white" strokeWidth={1.8} />
          )}
        </button>
      </div>

      <p className="mt-4 text-xs text-gray-400">
        Swipe right to like · Swipe left to pass
      </p>

      {/* Mutual match popup */}
      <AnimatePresence>
        {matchedProfile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-5 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.75, y: 35 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ type: "spring", stiffness: 220, damping: 20 }}
              className="w-full max-w-sm overflow-hidden rounded-[32px] bg-white p-8 text-center shadow-2xl"
            >
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-pink-100">
                <Heart size={40} fill="#ec4899" className="text-pink-500" />
              </div>

              <p className="text-xs font-bold uppercase tracking-[0.25em] text-pink-500">
                Mutual connection
              </p>

              <h2 className="mt-3 text-4xl font-black tracking-tight text-gray-900">
                It&apos;s a match!
              </h2>

              <p className="mt-3 text-sm leading-6 text-gray-500">
                You and {matchedProfile.name} liked each other.
              </p>

              <div className="mt-6 flex items-center justify-center gap-3 rounded-2xl bg-pink-50 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-pink-200">
                  <Users className="text-pink-600" size={23} />
                </div>
                <div className="text-left">
                  <p className="font-bold text-gray-900">
                    {matchedProfile.name}, {matchedProfile.age}
                  </p>
                  <p className="text-xs text-gray-500">
                    {matchedProfile.college}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setMatchedProfile(null)}
                className="mt-7 w-full rounded-full bg-gradient-to-r from-pink-500 to-rose-600 py-4 font-bold text-white shadow-lg shadow-pink-200 transition hover:scale-[1.02]"
              >
                Continue Discovering
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
