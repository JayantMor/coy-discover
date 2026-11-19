
"use client";

import { useState } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  type PanInfo,
} from "framer-motion";
import { Heart, X, MapPin, Sparkles } from "lucide-react";
import { Profile } from "../data/profile";
type ProfileCardProps = {
  profile: Profile;
  onSwipe: (action: "like" | "pass", profileId: number) => void;
};

export default function ProfileCard({
  profile,
  onSwipe,
}: ProfileCardProps) {
  const [isLeaving, setIsLeaving] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Rotation and depth respond to the drag distance.
  const rotate = useTransform(x, [-300, 0, 300], [-24, 0, 24]);
  const rotateY = useTransform(x, [-300, 0, 300], [16, 0, -16]);

  // Feedback appears as the card moves.
  const likeOpacity = useTransform(x, [15, 110], [0, 1]);
  const passOpacity = useTransform(x, [-110, -15], [1, 0]);

  const likeScale = useTransform(x, [15, 120], [0.8, 1.08]);
  const passScale = useTransform(x, [-120, -15], [1.08, 0.8]);

  async function completeSwipe(action: "like" | "pass") {
    if (isLeaving) return;

    setIsLeaving(true);

    const destination = action === "like" ? 850 : -850;

    await animate(x, destination, {
      type: "spring",
      stiffness: 170,
      damping: 22,
    });

    onSwipe(action, profile.id);
  }

  function handleDragEnd(
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) {
    if (isLeaving) return;

    const horizontal = info.offset.x;
    const vertical = info.offset.y;

    // Require a decisive horizontal gesture.
    if (Math.abs(horizontal) > 115 && Math.abs(horizontal) > Math.abs(vertical) * 1.15) {
      completeSwipe(horizontal > 0 ? "like" : "pass");
    } else {
      animate(x, 0, {
        type: "spring",
        stiffness: 320,
        damping: 26,
      });

      animate(y, 0, {
        type: "spring",
        stiffness: 320,
        damping: 26,
      });
    }
  }

  return (
    <motion.div
      drag={!isLeaving ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.85}
      onDragEnd={handleDragEnd}
      style={{
        x,
        y,
        rotate,
        rotateY,
        transformPerspective: 1100,
        touchAction: "pan-y",
      }}
      whileDrag={{ scale: 1.025 }}
      initial={{ opacity: 0, scale: 0.94, y: 24 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 25 }}
      className="absolute inset-0 cursor-grab select-none overflow-hidden rounded-[28px] bg-[#e9e5e2] shadow-2xl active:cursor-grabbing"
    >
      {/* Full profile image */}
      <img
        src={profile.photo}
        alt={`${profile.name}'s profile`}
        draggable={false}
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        onError={(event) => {
          event.currentTarget.src =
            "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=900";
        }}
      />

      {/* Photo contrast */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/15 to-black/10" />

      {/* LIKE feedback */}
      <motion.div
        style={{ opacity: likeOpacity, scale: likeScale }}
        className="pointer-events-none absolute left-6 top-9 z-20 -rotate-12 rounded-xl border-[3px] border-[#5cf0ad] px-5 py-2 text-3xl font-black tracking-wider text-[#5cf0ad]"
      >
        LIKE <Heart className="ml-1 inline" size={25} />
      </motion.div>

      {/* PASS feedback */}
      <motion.div
        style={{ opacity: passOpacity, scale: passScale }}
        className="pointer-events-none absolute right-6 top-9 z-20 rotate-12 rounded-xl border-[3px] border-[#ff7777] px-5 py-2 text-3xl font-black tracking-wider text-[#ff7777]"
      >
        PASS <X className="ml-1 inline" size={25} />
      </motion.div>

      {/* Profile information */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 p-6 text-white">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-white/30 bg-black/20 px-3 py-1.5 text-xs backdrop-blur-md">
            {profile.college}
          </span>

          <span className="rounded-full bg-white/20 px-3 py-1.5 text-xs backdrop-blur-md">
            <Sparkles className="mr-1 inline" size={12} />
            Discover
          </span>
        </div>

        <h2 className="text-4xl font-bold tracking-tight">
          {profile.name}, {profile.age}
        </h2>

        <div className="mt-2 flex items-center gap-1.5 text-sm text-white/85">
          <MapPin size={16} />
          {profile.city}
        </div>

        <p className="mt-4 max-w-sm text-sm leading-6 text-white/90">
          {profile.bio}
        </p>

        <div className="mt-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[2px] text-white/65">
            Interests
          </p>

          <div className="flex flex-wrap gap-2">
            {profile.interests.map((interest) => (
              <span
                key={interest}
                className="rounded-full border border-white/30 bg-white/15 px-3 py-2 text-xs font-medium backdrop-blur-md"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
