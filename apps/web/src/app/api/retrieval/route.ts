import type { Message as VercelChatMessage } from 'ai'
import { StreamingTextResponse } from 'ai'
import { ChatOpenAI } from 'langchain/chat_models/openai'
import { BytesOutputParser, StringOutputParser } from 'langchain/schema/output_parser'
import { PromptTemplate } from 'langchain/prompts'
import { RunnablePassthrough, RunnableSequence } from 'langchain/schema/runnable'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { PineconeStore } from 'langchain/vectorstores/pinecone'
import { Pinecone } from '@pinecone-database/pinecone'
import { type Document } from 'langchain/document'
import { type AgentProps } from '@/lib/types/agent'

export const runtime = 'edge'

type ConversationalRetrievalQAChainInput = {
  question: string
  chat_history: VercelChatMessage[]
}

const combineDocumentsFn = (docs: Document[], separator = '\n\n') => {
  const serializedDocs = docs.map((doc) => doc.pageContent)
  return serializedDocs.join(separator)
}

const formatVercelMessages = (chatHistory: VercelChatMessage[]) => {
  const formattedDialogueTurns = chatHistory.map((message) => {
    if (message.role === 'user') {
      return `Human: ${message.content}`
    } else if (message.role === 'assistant') {
      return `Assistant: ${message.content}`
    } else {
      return `${message.role}: ${message.content}`
    }
  })
  return formattedDialogueTurns.join('\n')
}

const CONDENSE_QUESTION_TEMPLATE = `Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question.

Chat History:
{chat_history}
Follow Up Input: {question}
Standalone question:`

const condenseQuestionPrompt = PromptTemplate.fromTemplate(
  CONDENSE_QUESTION_TEMPLATE
)

const RESPONSE_SYSTEM_TEMPLATE = `Eres un agente del Instituto Pascal, experto en resolver preguntas acerca del normativo del Colegio.

You must only use information from the provided search results. Combine search results together into a coherent answer. Do not repeat text.
Anything between the following \`context\` html blocks is retrieved from a knowledge bank, not part of the conversation with the user. Use the original language and idioms from the context when answering the question.
<context>
  {context}
<context/>
`

const answerPrompt = PromptTemplate.fromTemplate(RESPONSE_SYSTEM_TEMPLATE)

export async function POST (req: Request) {
  const body = await req.json() as {
    messages?: VercelChatMessage[]
    docsId?: AgentProps['docsId']
    prompt?: AgentProps['prompt']
    model?: AgentProps['model']
    temperature?: AgentProps['temperature']
    maxTokens?: AgentProps['maxTokens']
  }
  const messages = body.messages ?? []
  const previousMessages = messages.slice(0, -1)
  const currentMessageContent = messages[messages.length - 1].content

  const { docsId, model: agentModel, temperature } = body

  const llm = new ChatOpenAI({
    modelName: agentModel,
    streaming: true,
    temperature,
    openAIApiKey: process.env.OPENAI_API_KEY!
  })

  const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!,
    environment: process.env.PINECONE_ENVIRONMENT!
  })

  const pineconeIndex = pinecone.Index('general')

  const vectorStore = await PineconeStore.fromExistingIndex(
    new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY
    }),
    {
      pineconeIndex,
      filter: {
        id: { $in: docsId }
      }
    }
  )

  const retriever = vectorStore.asRetriever()

  const standaloneQuestionChain = RunnableSequence.from([
    {
      question: (input: ConversationalRetrievalQAChainInput) => input.question,
      chat_history: (input: ConversationalRetrievalQAChainInput) => formatVercelMessages(input.chat_history)
    },
    condenseQuestionPrompt,
    llm,
    new StringOutputParser()
  ])

  const answerChain = RunnableSequence.from([
    {
      context: retriever.pipe(combineDocumentsFn),
      question: new RunnablePassthrough()
    },
    answerPrompt,
    llm,
    new BytesOutputParser()
  ])

  const conversationalRetrievalQAChain = standaloneQuestionChain.pipe(answerChain)

  const stream = await conversationalRetrievalQAChain.stream({
    question: currentMessageContent,
    chat_history: previousMessages
  })

  return new StreamingTextResponse(stream)
}
