import { NextResponse } from 'next/server';
import { AIService, createAIService, type Message } from '@/utils/ai';
import { SYSTEM_PROMPT, type AIModel } from '@/utils/aiModel';

interface ModelConfig {
  apiKey: string;
  model: AIModel;
}

type ModelConfigs = {
  [key: string]: ModelConfig;
};

// 创建不同模型的 AI 服务实例
const createModelService = (model: string) => {
  const modelConfigs: ModelConfigs = {
    openai: {
      apiKey: process.env.OPENAI_API_KEY || '',
      model: 'gpt-4o' as AIModel,
    },
    gemini: {
      apiKey: process.env.GEMINI_API_KEY || '',
      model: 'gemini-1.5-pro' as AIModel,
    },
    deepseek: {
      apiKey: process.env.DEEPSEEK_API_KEY || '',
      model: 'deepseek-chat' as AIModel,
    },
  };

  const config = modelConfigs[model.toLowerCase()];
  if (!config) {
    throw new Error('不支持的模型类型');
  }

  return createAIService({
    apiKey: config.apiKey,
    model: config.model,
    temperature: 0.7,
  });
};

export async function POST(req: Request) {
  try {
    const { messages, model = 'openai' } = await req.json();
    const text = messages?.[0]?.content || messages?.[0]?.parts?.[0]?.text;

    if (!text?.trim()) {
      return NextResponse.json(
        { success: false, message: '请输入有效的文本内容' },
        { status: 400 }
      );
    }

    const aiService = createModelService(model);
    aiService.setSystemPrompt(SYSTEM_PROMPT);

    const response = await aiService.chat([
      { 
        id: Date.now().toString(), 
        role: 'user', 
        content: text 
      } as Message
    ]);

    console.log('router Translation API Response:', response);

    return new Response(JSON.stringify(response), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Translation API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : '翻译失败，请稍后重试',
      },
      { status: 500 }
    );
  }
}