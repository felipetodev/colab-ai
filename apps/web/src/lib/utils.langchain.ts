import { RunnableSequence } from 'langchain/schema/runnable'
import { StringOutputParser } from 'langchain/schema/output_parser'
import { ChatPromptTemplate, MessagesPlaceholder, PromptTemplate } from 'langchain/prompts'
import { AIMessage, HumanMessage } from 'langchain/schema'
import { type BaseLanguageModel } from 'langchain/base_language'
import { type BaseRetriever } from 'langchain/schema/retriever'
import { type BaseMessage } from 'langchain/schema'
import { type Document } from 'langchain/document'
import { type Message as VercelChatMessage } from 'ai'

export type ChatWindowMessage = {
  content: string
  role: 'human' | 'ai'
  id?: string
  traceUrl?: string
}

export const _formatChatHistoryAsMessages = async (chatHistory: ChatWindowMessage[]) => {
  // console.log(chatHistory)
  return chatHistory.map((chatMessage) => {
    if (chatMessage.role === 'human') {
      return new HumanMessage(chatMessage.content)
    } else {
      return new AIMessage(chatMessage.content)
    }
  })
}

export const parsePrevMessages = (messages: VercelChatMessage[]): ChatWindowMessage[] => {
  const messagesArr: ChatWindowMessage[] = []

  for (const message of messages) {
    if (message.role === 'user') {
      messagesArr.push({
        content: message.content,
        role: 'human',
        id: message.id
      })
    }
    if (message.role === 'assistant') {
      messagesArr.push({
        content: message.content,
        role: 'ai',
        id: message.id
      })
    }
  }

  return messagesArr
}

const REPHRASE_QUESTION_TEMPLATE = `Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question.

Chat History:
{chat_history}
Follow Up Input: {question}
Standalone Question:`

const rephraseQuestionChainPrompt = PromptTemplate.fromTemplate(
  REPHRASE_QUESTION_TEMPLATE
)

const RESPONSE_SYSTEM_TEMPLATE = `###{prompt}###
You are an experienced researcher, expert at interpreting and answering questions based on provided sources. Using the provided context, answer the user's question to the best of your ability using the resources provided.
Generate a concise answer for a given question based solely on the provided search results (URL and content). You must only use information from the provided search results. Use an unbiased and journalistic tone. Combine search results together into a coherent answer. Do not repeat text.
If there is nothing in the context relevant to the question at hand, just say "Hmm, I'm not sure." Don't try to make up an answer.
Anything between the following \`context\` html blocks is retrieved from a knowledge bank, not part of the conversation with the user.
<context>
  {context}
<context/>

REMEMBER: If there is no relevant information within the context, just say "Hmm, I'm not sure." Don't try to make up an answer. Anything between the preceding 'context' html blocks is retrieved from a knowledge bank, not part of the conversation with the user.`

export const responseChainPrompt = ChatPromptTemplate.fromMessages<{
  context: string
  chat_history: BaseMessage[]
  question: string
}>([
  ['system', RESPONSE_SYSTEM_TEMPLATE],
  new MessagesPlaceholder('chat_history'),
  ['user', '{question}']
])

const formatDocs = (docs: Document[]) => {
  // here's the context provided from Pinecone
  return docs
    .map((doc, i) => `<doc id='${doc.metadata?.refId ?? i}'>${doc.pageContent}</doc>`)
    .join('\n')
}

export const createRetrievalChain = (
  llm: BaseLanguageModel,
  retriever: BaseRetriever,
  chatHistory: ChatWindowMessage[]
) => {
  if (chatHistory.length) {
    return RunnableSequence.from([
      rephraseQuestionChainPrompt,
      llm,
      new StringOutputParser(),
      retriever,
      formatDocs
    ])
  } else {
    return RunnableSequence.from([
      (input) => input.question,
      retriever,
      formatDocs
    ])
  }
}
