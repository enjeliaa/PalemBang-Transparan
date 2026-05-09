import { NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { isAdmin } from "@/lib/permissions";
import { hasSupabaseAdminEnv, supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Hanya admin pemerintah yang boleh upload media." }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "File belum dipilih." }, { status: 400 });
  }

  const extension = file.name.split(".").pop() ?? "bin";
  const storagePath = `posts/${crypto.randomUUID()}.${extension}`;

  if (hasSupabaseAdminEnv && supabaseAdmin) {
    const { error } = await supabaseAdmin.storage
      .from("palembang-media")
      .upload(storagePath, file, { contentType: file.type, upsert: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const { data } = supabaseAdmin.storage.from("palembang-media").getPublicUrl(storagePath);
    return NextResponse.json({ url: data.publicUrl, path: storagePath });
  }

  if (process.env.VERCEL === "1") {
    return NextResponse.json(
      { error: "Supabase Storage belum dikonfigurasi. Isi SUPABASE_SERVICE_ROLE_KEY di Vercel." },
      { status: 500 },
    );
  }

  const uploadDirectory = path.join(process.cwd(), "public", "uploads", "posts");
  await mkdir(uploadDirectory, { recursive: true });
  const fileName = `${crypto.randomUUID()}.${extension}`;
  const filePath = path.join(uploadDirectory, fileName);
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, bytes);

  return NextResponse.json({
    url: `/uploads/posts/${fileName}`,
    path: `uploads/posts/${fileName}`,
    demo: true,
  });
}
