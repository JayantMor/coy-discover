
import { NextResponse } from "next/server";
import { getMatches } from "../../../lib/store";

export async function GET() {
  try {
    const matches = await getMatches();

    return NextResponse.json({
      success: true,
      matches,
    });
  } catch (error) {
    console.error("Matches API error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to load matches." },
      { status: 500 }
    );
  }
}
