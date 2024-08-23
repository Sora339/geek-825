// /app/api/user/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase/server"; // Firebase Admin SDKで初期化されたdbをインポート

export async function GET(req: NextRequest) {
  const uid = req.nextUrl.searchParams.get("uid");

  if (!uid) {
    return NextResponse.json({ message: "User ID is required" }, { status: 400 });
  }

  try {
    const userRef = db.collection("users").doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return NextResponse.json({ message: "No such user data!" }, { status: 404 });
    }

    const userData = userDoc.data();
    const gameResultsRef = db.collection("gameResults").where("userId", "==", uid);
    const gameResultsSnapshot = await gameResultsRef.get();

    let totalScore = 0;
    gameResultsSnapshot.forEach((doc) => {
      totalScore += doc.data().score;
    });

    return NextResponse.json({ userData, totalScore }, { status: 200 });
  } catch (error) {
    console.error("Error fetching user data: ", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
