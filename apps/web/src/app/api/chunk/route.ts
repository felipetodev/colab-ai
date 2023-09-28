import crypto from 'node:crypto'
import { NextResponse } from "next/server";
import { WebPDFLoader } from "langchain/document_loaders/web/pdf";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const formData = await request.formData()

  const pdf = formData.get('file') as Blob | null
  const type = formData.get('type') as string | null
  const name = formData.get('name') as string | null
  const documentId = crypto.randomUUID()

  if (!pdf) return null

  const loader = new WebPDFLoader(pdf);
  const document = await loader.load();

  document.forEach((page) => {
    page.metadata.id = documentId
  })

  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (user === null) return NextResponse.json({ error: 'User not found' })

  await supabase.from('documents').insert({
    user_id: user.id,
    id: documentId,
    name,
    type,
    content: document
  })

  return NextResponse.json({ success: true });
}
