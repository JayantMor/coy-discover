
import { NextRequest, NextResponse } from "next/server";
import { recordSwipe } from "../../../lib/store";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const profileId = Number(body.profileId);
    const action = body.action;

    if (
      !Number.isInteger(profileId) ||
      !["like", "pass"].includes(action)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid swipe data." },
        { status: 400 }
      );
    }

    const result = await recordSwipe(profileId, action);

    if (!result.success) {
      return NextResponse.json(result, { status: 409 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Swipe API error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to record swipe." },
      { status: 500 }
    );
  }
}
