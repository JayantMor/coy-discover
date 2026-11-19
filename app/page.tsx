
"use client";

import { useEffect, useState } from "react";
import { Heart, Compass, Users } from "lucide-react";
import SwipeDeck from "../components/SwipeDeck";

type Tab = "home" | "discover" | "matches";

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("discover");
  const [matches, setMatches] = useState<any[]>([]);
  const [matchesLoading, setMatchesLoading] = useState(false);

  useEffect(() => {
    if (activeTab !== "matches") return;

    async function loadMatches() {
      try {
        setMatchesLoading(true);

        const response = await fetch("/api/matches");
        const result = await response.json();

        if (response.ok && result.success) {
          setMatches(result.matches);
        }
      } catch (error) {
        console.error("Unable to load matches:", error);
      } finally {
        setMatchesLoading(false);
      }
    }

    loadMatches();
  }, [activeTab]);

  const tabs = [
    { id: "home" as Tab, label: "Home", icon: Compass },
    { id: "discover" as Tab, label: "Discover", icon: Compass },
    { id: "matches" as Tab, label: "Matches", icon: Users },
  ];

  return (
    <main className="min-h-screen bg-[#faf8fb] text-gray-900">
      <header className="sticky top-0 z-30 border-b border-gray-100 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[68px] max-w-6xl items-center justify-between px-5">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 text-white">
              <Heart size={19} fill="white" />
            </div>
            <span className="text-xl font-extrabold tracking-tight">
              coy<span className="text-pink-500">.</span>
            </span>
          </div>

          <span className="rounded-full bg-pink-50 px-3 py-1.5 text-xs font-semibold text-pink-600">
            Discover something new
          </span>
        </div>
      </header>

      <div className="mx-auto min-h-[calc(100vh-140px)] max-w-6xl px-4 py-8 sm:px-6">
        {activeTab === "home" && <section />}

        {activeTab === "discover" && (
          <section className="py-2">
            <SwipeDeck />
          </section>
        )}

        {activeTab === "matches" && (
          <section className="mx-auto max-w-3xl py-6">
            <div className="mb-8">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pink-500">
                Your connections
              </p>
              <h1 className="mt-2 text-3xl font-bold text-gray-900">
                Your matches
              </h1>
              <p className="mt-2 text-sm text-gray-500">
                People who liked you back. Every connection is mutual.
              </p>
            </div>

            {matchesLoading ? (
              <p className="py-16 text-center text-gray-500">
                Loading your matches...
              </p>
            ) : matches.length === 0 ? (
              <div className="rounded-3xl bg-white px-6 py-16 text-center shadow-sm">
                <Heart size={40} className="mx-auto text-pink-400" />
                <h2 className="mt-5 text-xl font-bold text-gray-900">
                  No matches yet
                </h2>
                <p className="mt-2 text-sm text-gray-500">
                  When you and someone else like each other, your connection
                  will appear here.
                </p>
                <button
                  onClick={() => setActiveTab("discover")}
                  className="mt-6 rounded-full bg-pink-500 px-6 py-3 text-sm font-semibold text-white"
                >
                  Explore Discover
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {matches.map((person) => (
                  <div
                    key={person.id}
                    className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="relative h-64">
                      <img
                        src={person.photo}
                        alt={person.name}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                      <div className="absolute bottom-4 left-4 text-white">
                        <h3 className="text-2xl font-bold">
                          {person.name}, {person.age}
                        </h3>
                        <p className="mt-1 text-sm text-white/85">
                          {person.city}
                        </p>
                      </div>
                    </div>

                    <div className="p-5">
                      <p className="text-sm font-medium text-gray-700">
                        {person.college}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-gray-500">
                        {person.bio}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {person.interests.map((interest: string) => (
                          <span
                            key={interest}
                            className="rounded-full bg-pink-50 px-3 py-1.5 text-xs font-medium text-pink-600"
                          >
                            {interest}
                          </span>
                        ))}
                      </div>
                      <div className="mt-5 flex items-center gap-2 border-t border-gray-100 pt-4 text-xs font-semibold text-pink-600">
                        <Heart size={15} fill="currentColor" />
                        Mutual match
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-100 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-lg items-center justify-around px-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex min-w-[90px] flex-col items-center gap-1.5 transition ${
                  isActive
                    ? "text-pink-600"
                    : "text-gray-400 hover:text-gray-700"
                }`}
              >
                <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                <span className="text-[11px] font-semibold">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </main>
  );
}
