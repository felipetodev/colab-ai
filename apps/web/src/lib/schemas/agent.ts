import { z } from 'zod'

const newAgentSchema = z.object({
  name: z.string(),
  prompt: z.string(),
  temperature: z.number().min(0).max(1),
  max_tokens: z.number().int().min(0).max(4000),
  references: z.number().int().min(0).max(10),
  model: z.string(),
  docs_id: z.array(z.string()).default([])
})

const updateAgentSchema = z.object({
  name: z.string(),
  prompt: z.string(),
  temperature: z.number().min(0).max(1).nullable(),
  max_tokens: z.number().int().min(0).max(4000).nullable(),
  references: z.number().int().min(0).max(10).nullable(),
  model: z.string(),
  docs_id: z.array(z.string()).default([]),
  agentId: z.string()
})

function validateNewAgent (data: unknown) {
  return newAgentSchema.safeParse(data)
}

function validateUpdateAgent (data: unknown) {
  return updateAgentSchema.safeParse(data)
}

export {
  validateNewAgent,
  validateUpdateAgent
}
