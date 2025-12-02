import { NextResponse } from "next/server";

export const POST = async () =>
  NextResponse.json({
    bypass: true,
    timestamp: Date.now(),
  });

