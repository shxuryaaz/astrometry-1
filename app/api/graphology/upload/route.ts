import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getSupabaseServiceClient } from "@/lib/supabase";

const bucket = process.env.SUPABASE_STORAGE_BUCKET ?? "graphology";

export const POST = async (request: Request) => {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const supabase = getSupabaseServiceClient();
  const path = `uploads/${randomUUID()}-${file.name}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, Buffer.from(arrayBuffer), {
      contentType: file.type,
      upsert: true,
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(path);

  return NextResponse.json({ url: publicUrl });
};

