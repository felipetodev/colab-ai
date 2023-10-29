'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { WebPDFLoader } from 'langchain/document_loaders/web/pdf'
import { DocxLoader } from 'langchain/document_loaders/fs/docx'
import { CSVLoader } from 'langchain/document_loaders/fs/csv'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { TextLoader } from 'langchain/document_loaders/fs/text'
import { formatMimeType } from '@/lib/utils'

export const createFileChunks = async (formData: FormData) => {
  const name = formData.get('name')
  const file = formData.get('file')

  if (!file) throw new Error('File not found')

  const type = (file as File).type

  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (user === null) return { error: 'User not found' }

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

  const loader = new Loader(file as File)
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
    type: formatMimeType(type),
    content: formattedDocs
  })

  revalidatePath('/')

  return { status }
}

export const createTranscription = async (formData: FormData) => {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (user === null) return { error: 'User not found' }

  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY!}`
    },
    body: formData
  })

  const { text = '', error } = await response.json()

  if (error) {
    return { error: error.message }
  }

  return { transcription: text }
}
