interface ChallengePlanInput {
  goal: string
  timeCommitment: number
  category: string
  difficulty: string
  specificGoals: string[]
  obstacles: string[]
}

export interface ChallengePlan {
  id?: string
  title: string
  description: string
  metrics: {
    success_likelihood: number
    effort_level: string
    time_per_day: number
    difficulty_level: string
    specific_goals?: string[]
    potential_obstacles?: string[]
  }
  specific_goals: string[]
  potential_obstacles: string[]
  days: Array<{
    day: number
    tasks: string[]
    tips?: string[]
    bonus_task?: string
    difficulty_rating?: number
  }>
}

export async function generateChallengePlan(input: ChallengePlanInput) {
  const { goal, timeCommitment, category, difficulty, specificGoals, obstacles } = input

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    throw new Error('Groq API key is not configured. Please check your environment variables.')
  }

  const apiEndpoint = 'https://api.groq.com/openai/v1/chat/completions'
  const model = 'llama-3.3-70b-versatile'

  const response = await fetch(apiEndpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: 'You are a JSON generator for a 30-day challenge planning system. Your task is to generate a structured JSON plan based on user input. Follow these rules:\n1. Output ONLY valid JSON without any additional text or formatting\n2. Ensure all string values are properly escaped\n3. Generate exactly 30 days of tasks\n4. Each day must have 2-4 tasks\n5. Include relevant tips and bonus tasks for each day\n6. Ensure difficulty ratings are between 1-5\n7. Never include null values'
          },
          {
            role: 'user',
            content: `Generate a 30-day challenge plan following this exact JSON structure. Ensure all 30 days are included with appropriate tasks, tips, and difficulty ratings:
{
  "title": "30-Day ${category} Challenge: ${goal.replace(/"/g, '\"')}",
  "description": "A structured plan to ${goal.replace(/"/g, '"')} with ${timeCommitment.toString()} minutes daily commitment.",
  "metrics": {
    "success_likelihood": 85,
    "effort_level": "moderate",
    "time_per_day": ${timeCommitment},
    "difficulty_level": "${difficulty}"
  },
  "specific_goals": ${JSON.stringify(specificGoals.map(g => g.replace(/"/g, '\"')))},
  "potential_obstacles": ${JSON.stringify(obstacles.map(o => o.replace(/"/g, '\"')))},
  "days": [
    {
      "day": 1,
      "tasks": ["Initial planning session", "Set up tracking system"],
      "tips": ["Start small and build momentum"],
      "bonus_task": "Create a detailed schedule for week 1",
      "difficulty_rating": 2
    }
  ]
}`
          }
        ],
      max_tokens: 3000,
      temperature: 0.4,
      response_format: { type: "json_object" }
    })
  })

  if (!response.ok) {
    let errorMessage = 'Failed to generate plan'
    try {
      const error = await response.json()
      console.error('API error details:', {
        status: response.status,
        statusText: response.statusText,
        error: error
      })
      errorMessage = error.error?.message || error.message || 'API request failed'
    } catch (e) {
      console.error('Failed to parse error response:', e)
      errorMessage = `API request failed with status ${response.status}`
    }
    throw new Error(errorMessage)
  }

  const json = await response.json()
  const content = json.choices?.[0]?.message?.content

  if (!content) {
    console.error('API response:', json)
    throw new Error('No content generated in API response')
  }

  let trimmedContent = content.trim()
  if (trimmedContent.startsWith('```json')) {
    trimmedContent = trimmedContent.slice(7)
  }
  if (trimmedContent.endsWith('```')) {
    trimmedContent = trimmedContent.slice(0, -3)
  }
  trimmedContent = trimmedContent.trim()

  try {
    console.log('Processing API response content:', trimmedContent)
    const plan: ChallengePlan = JSON.parse(trimmedContent)
    
    // Validate required fields
    const requiredFields: (keyof ChallengePlan)[] = ['title', 'description', 'metrics', 'days', 'specific_goals', 'potential_obstacles']
    const missingFields = requiredFields.filter(field => !plan[field])
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields in generated plan: ${missingFields.join(', ')}`)
    }
    
    if (!Array.isArray(plan.days)) {
      throw new Error('Days field must be an array')
    }

    if (plan.days.length !== 30) {
      throw new Error(`Plan must contain exactly 30 days, but got ${plan.days.length} days`)
    }

    // Validate each day's structure
    plan.days.forEach((day, index) => {
      if (!Array.isArray(day.tasks) || day.tasks.length < 2 || day.tasks.length > 4) {
        throw new Error(`Day ${index + 1} must have 2-4 tasks`)
      }
      if (day.difficulty_rating && (day.difficulty_rating < 1 || day.difficulty_rating > 5)) {
        throw new Error(`Day ${index + 1} difficulty rating must be between 1 and 5`)
      }
    })
    
    // Validate metrics
    const metrics = plan.metrics
    if (typeof metrics.success_likelihood !== 'number' || 
        typeof metrics.time_per_day !== 'number' || 
        typeof metrics.effort_level !== 'string' || 
        typeof metrics.difficulty_level !== 'string') {
      throw new Error('Invalid metrics format in generated plan')
    }
    
    // Validate specific_goals and potential_obstacles are arrays
    if (!Array.isArray(plan.specific_goals)) {
      throw new Error('specific_goals must be an array')
    }
    
    if (!Array.isArray(plan.potential_obstacles)) {
      throw new Error('potential_obstacles must be an array')
    }
    
    console.log('Successfully parsed plan:', plan)
    return plan
  } catch (e) {
    console.error('Plan generation error:', e)
    console.error('Content that failed to parse:', trimmedContent)
    if (e instanceof SyntaxError) {
      throw new Error('Failed to generate valid JSON plan. The response format was invalid.')
    }
    throw new Error((e as Error).message || 'Failed to generate valid plan. Please try again.')
  }
}