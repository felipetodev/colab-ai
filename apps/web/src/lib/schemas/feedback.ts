import { z } from 'zod'

const feedbackSchema = z
  .string()
  .min(8, { message: 'Feedback must be at least 8 characters long' })
  .max(200, { message: 'Feedback must be less than 200 characters long' })

type FeedbackSchema = z.infer<typeof feedbackSchema>

function validateFeedback (body: FeedbackSchema) {
  return feedbackSchema.safeParse(body)
}

export {
  validateFeedback
}
