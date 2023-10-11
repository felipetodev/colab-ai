import { NextResponse } from 'next/server'
import { GithubRepoLoader } from 'langchain/document_loaders/web/github'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// WIP 🔥

export async function GET (req: Request) {
  // const { url, branch } = await req.json() as { url: string, branch: string }
  const documentId = crypto.randomUUID()
  const url = 'https://github.com/felipetodev/apartment-scraper'

  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })
  const { data: { user } } = await supabase.auth.getUser()

  if (user === null) return NextResponse.json({ error: 'User not found' })

  try {
    const loader = new GithubRepoLoader(
      url,
      {
        branch: 'main',
        recursive: true,
        unknown: 'warn',
        ignorePaths: [
          '**/.DS_Store',
          '**/Thumbs.db',
          'node_modules/',
          'dist/',
          'build/',
          '*.log',
          '*.tmp',
          '**/.idea/',
          '**/.vscode/',
          '.editorconfig',
          '.eslintcache',
          '.gitattributes',
          '**/.env',
          '!**/.env.example',
          'package-lock.json',
          'yarn.lock',
          'Gemfile.lock',
          'config.js',
          '.nvmrc',
          '.npmrc',
          '.prettierignore',
          '**/*.yaml',
          'prettier.config.cjs',
          'postcss.config.cjs'
        ]
        // accessToken: ''
      }
    )
    const docs = await loader.load()

    const formattedDocs = docs.map(({ pageContent, metadata }) => ({
      pageContent,
      metadata: {
        ...metadata,
        id: documentId
      }
    }))

    const { status } = await supabase.from('documents').insert({
      user_id: user.id,
      id: documentId,
      name: url.split('/').slice(-1)[0],
      type: 'github',
      content: formattedDocs
    })

    // await fetch('http://localhost:3000/api/embeddings/supabase', {
    //   method: 'POST',
    //   body: JSON.stringify({
    //     name: url.split('/').slice(-1)[0],
    //     docId: documentId,
    //     content: formattedDocs
    //   })
    // })

    return NextResponse.json({ chunked: true, status })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: `Something went wrong chunking ${url}` })
  }
}
