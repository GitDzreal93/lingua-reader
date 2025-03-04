import { streamText } from 'ai'
import { 
  SYSTEM_PROMPT, 
  getModelProvider, 
  type AIModel,
  AImodelsOptions,
  AIAPIHostOptions 
} from './aiModel'
import { getCopilotMessageId } from './idGenerator'

export interface Message {
  id: string
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface AIServiceConfig {
  apiKey: string
  model: AIModel
  temperature?: number
  apiHost?: string // 改为可选参数
}

export class AIService {
  private systemMessages: Message[] = [
    {
      id: 'system-id',
      role: 'system',
      content: SYSTEM_PROMPT,
    },
  ]

  constructor(private config: AIServiceConfig) {}

  async chat(
    messages: Message[],
    callbacks: {
      onText?: (text: string) => void
      onError?: (error: Error) => void
      onFinish?: (message: Message) => void
    } = {},
  ) {
    const { onText, onError, onFinish } = callbacks

    // 合并系统消息和用户消息
    const userMessages = [
      ...this.systemMessages.map(({ role, content }) => ({ role, content })),
      ...messages.slice(-20).map(({ role, content }) => ({ role, content })),
    ]

    try {
      const responseMessage: Message = {
        id: getCopilotMessageId(),
        role: 'assistant',
        content: '',
      }

      console.log('=== AI Service Chat Start ===')
      console.log('Model:', this.config.model)
      console.log('Messages:', JSON.stringify(userMessages, null, 2))
      
      // 创建流式响应
      console.log('Creating model provider...')
      const provider = getModelProvider({
        model: this.config.model,
        apiKey: this.config.apiKey,
      })
      console.log('Model provider created:', provider ? 'success' : 'failed')

      console.log('Initializing streamText...')
      const { textStream } = streamText({
        model: provider,
        temperature: this.config.temperature ?? 0.8,
        messages: userMessages,
        onError: ({ error }) => {
          console.error('StreamText error:', error)
          if (onError && error instanceof Error) {
            onError(error)
          }
        },
      })
      console.log('StreamText initialized')

      // 处理流式响应
      console.log('Starting stream processing...')
      let chunkCount = 0
      for await (const textPart of textStream) {
        chunkCount++
        console.log(`Received chunk #${chunkCount}:`, textPart.slice(0, 50) + '...')
        responseMessage.content += textPart
        if (onText) {
          onText(textPart)
        }
      }
      console.log('Stream processing completed')
      console.log('Total chunks received:', chunkCount)
      console.log('Final response length:', responseMessage.content.length)

      if (onFinish) {
        onFinish(responseMessage)
      }

      console.log('=== AI Service Chat End ===')
      return responseMessage
    } catch (error) {
      console.error('=== AI Service Error ===')
      console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error)
      console.error('Error message:', error instanceof Error ? error.message : String(error))
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
      console.error('Config:', { ...this.config, apiKey: '***' })
      
      if (onError) {
        onError(error as Error)
      }
      throw error
    }
  }

  // 更新系统提示词
  setSystemPrompt(prompt: string) {
    this.systemMessages = [
      {
        id: 'system-id',
        role: 'system',
        content: prompt,
      },
    ]
  }
}

// 创建 AI 服务实例的工厂函数
export const createAIService = (config: AIServiceConfig) => {
  const modelProvider = AImodelsOptions.find((item) =>
    item.children.some((child) => child.value === config.model)
  );

  if (!modelProvider) {
    throw new Error(`未找到模型 ${config.model} 的配置`);
  }

  const apiHost = config.apiHost || AIAPIHostOptions[modelProvider.value];

  if (!apiHost) {
    throw new Error(`未找到 ${modelProvider.value} 的 API 地址配置`);
  }

  return new AIService({
    ...config,
    apiHost,
  });
};