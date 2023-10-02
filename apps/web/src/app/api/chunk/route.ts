import crypto from 'node:crypto'
import { NextResponse } from 'next/server'
import { WebPDFLoader } from 'langchain/document_loaders/web/pdf'
import { DocxLoader } from 'langchain/document_loaders/fs/docx'
import { CSVLoader } from 'langchain/document_loaders/fs/csv'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { TextLoader } from 'langchain/document_loaders/fs/text'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST (request: Request): Promise<any> {
  const formData = await request.formData()

  const file = formData.get('file') as Blob
  const type = formData.get('type') as string | null
  const name = formData.get('name') as string | null
  const documentId = crypto.randomUUID()

  let Loader:
  | typeof WebPDFLoader
  | typeof DocxLoader
  | typeof CSVLoader
  | typeof TextLoader

  switch (type) {
    case 'application/pdf': {
      Loader = WebPDFLoader
      break
    }
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
      Loader = DocxLoader
      break
    }
    case 'text/csv': {
      Loader = CSVLoader
      break
    }
    case 'text/plain': {
      Loader = TextLoader
      break
    }
    default: {
      throw new Error(`Chunked file type ${type} not supported yet, please contact our support team.`)
    }
  }

  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (user === null) return NextResponse.json({ error: 'User not found' })

  const loader = new Loader(file)
  const document = await loader.load()

  // pdf, csv, text, don't need splitting
  const allowedMimeTypes = ['application/pdf', 'text/csv', 'audio/mpeg', 'text/plain']
  const needsSplitting = !allowedMimeTypes.includes(type)

  const textSplitter = new RecursiveCharacterTextSplitter()
  const docs = needsSplitting ? await textSplitter.splitDocuments(document) : document
  const formattedDocs = docs.map(({ pageContent, metadata }) => ({
    pageContent: pageContent.replace(/\n/g, ' '),
    metadata: {
      ...metadata,
      refId: crypto.randomUUID(),
      id: documentId
    }
  }))

  const { status } = await supabase.from('documents').insert({
    user_id: user.id,
    id: documentId,
    name,
    type,
    content: formattedDocs
  })

  return NextResponse.json({ resp: status, type, name })
}
