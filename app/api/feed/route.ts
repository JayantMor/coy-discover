
import { NextResponse } from "next/server";
import { getFeed } from "../../../lib/store";

export async function GET() {
  try {
    const profiles = await getFeed();

    return NextResponse.json({
      success: true,
      profiles,
    });
  } catch (error) {
    console.error("Feed API error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to load feed." },
      { status: 500 }
    );
  }
}
