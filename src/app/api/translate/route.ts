import { openai } from '@ai-sdk/openai';
import { google } from '@ai-sdk/google';
import { GoogleAICacheManager } from '@google/generative-ai/server';
import { streamText } from 'ai';
import { deepseek } from '@ai-sdk/deepseek';
import { NextResponse } from 'next/server';

// 初始化 Gemini 缓存管理器
const cacheManager = new GoogleAICacheManager(process.env.GEMINI_API_KEY || '');
const geminiModel = 'models/gemini-1.5-pro-001';

// 系统提示词
const SYSTEM_PROMPT = `
## 角色
你是英语母语者，把这篇文章翻译成英语，文笔可以参考美国或者英国现代流行小说的作者

## 任务
1、我的英语水平是英语六级，重点词难点词的中英意思，请列在最后，方便我学习记忆。
2、给我一个中英文对照的版本，中文用小说里的原文，一句中文对应一句英文排列，不要给我一堆英文或者一堆中文。
3、请严格使用json格式输出，不要输出其他额外的内容。
4、输出的中文和英文的列表要一一对应

## 要求
1、小说里人物的名字，仍然使用中文字体。
2、输出的word字段，要加上词性类型，以下是可选的词性表：["Noun", "Verb", "Adjective", "Adverb", "Pronoun", "Preposition", "Conjunction", "Interjection", "Article", "Determiner", "Numeral", "Phrase"]
3、words的结构是：[{"word":"english word", "type": "Noun", "meaning": "英文单词"}]

## 示例
input:
content:
    时近半夜，硬卧车厢熄灯，只过道里还有点亮，供起夜的乘客来回。
    陈琮挺想跟上铺那女人聊聊、打听点“人石会”和陈天海的事，奈何那位大姐爬上去之后倒头就睡，主打一个不给机会。


output:
{
    "en": [
        "It was nearing midnight. The lights were out in the sleeper car, save for the dim ones in the aisle, just enough for passengers stumbling to the bathroom.",
        "陈琮 was itching to chat with the woman in the upper bunk, pump her for info on this \"People Stone Society\" and 陈天海, but the moment she’d clambered up there, she’d passed out cold. No chance."
        ],
    "zh": [
        "时近半夜，硬卧车厢熄灯，只过道里还有点亮，供起夜的乘客来回。",
        "陈琮挺想跟上铺那女人聊聊、打听点“人石会”和陈天海的事，奈何那位大姐爬上去之后倒头就睡，主打一个不给机会。"
    ],
    "words": [
{"word": "vigorously", "type": "Adverb", "meaning": "用力地，大力地"},
{"word": "neurasthenia", "type": "Noun", "meaning": "神经衰弱"},
{"word": "insomniac", "type": "Noun", "meaning": "失眠症患者"},
{"word": "anxious", "type": "Adjective", "meaning": "焦虑的"},
{"word": "heart - wrenching", "type": "Adjective", "meaning": "令人心痛的，不忍的"},
{"word": "thud", "type": "Noun", "meaning": "砰的一声，重击声"},
{"word": "doze off", "type": "Phrase", "meaning": "打瞌睡，打盹"}
]
}
`; // 你的系统提示词

// 处理不同模型的翻译请求
async function handleTranslation(text: string, model: string) {
  switch (model) {
    case 'openai':
      return streamText({
        model: openai('gpt-3.5-turbo'),
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: text }
        ],
        temperature: 0.7,
      });

    case 'gemini':
      const { name: cachedContent } = await cacheManager.create({
        model: geminiModel,
        contents: [
          {
            role: 'user',
            parts: [{ text: SYSTEM_PROMPT + '\n\n' + text }],
          },
        ],
        ttlSeconds: 60 * 5,
      });

      return streamText({
        model: google(geminiModel, { cachedContent }),
        prompt: text,
      });

    case 'deepseek':
      return streamText({
        model: deepseek('deepseek-chat'),
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: text }
        ],
        temperature: 0.7,
      });

    default:
      throw new Error('不支持的模型类型');
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    console.log('Request body:', body);

    // 从消息中提取文本内容
    const text = body.messages?.[0]?.content || body.messages?.[0]?.parts?.[0]?.text;
    const model = body.model || 'openai';
    
    console.log('Extracted text:', text);
    console.log('Selected model:', model);

    // 更严格的输入验证
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      console.log('Error: Invalid text input');
      return NextResponse.json(
        { 
          success: false, 
          message: '请输入有效的文本内容',
          debug: { receivedText: text, receivedType: typeof text, body }
        },
        { status: 400 }
      );
    }

    if (!text) {
      console.log('Error: Empty text input');
      return NextResponse.json(
        { success: false, message: '请输入要翻译的文本' },
        { status: 400 }
      );
    }

    // 调用相应的 AI 模型
    const response = await handleTranslation(text, model);
    
    // 使用 toTextStreamResponse 创建流式响应
    return response.toTextStreamResponse();
    
  } catch (error) {
    console.error('=== Translation API Request Failed ===');
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : '翻译失败，请稍后重试',
      model: error instanceof Error ? error.stack : undefined
    });

    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : '翻译失败，请稍后重试',
        debug: process.env.NODE_ENV === 'development' ? {
          hasOpenAIKey: !!process.env.OPENAI_API_KEY,
          hasGeminiKey: !!process.env.GEMINI_API_KEY,
          hasDeepSeekKey: !!process.env.DEEPSEEK_API_KEY,
          timestamp: new Date().toISOString()
        } : undefined
      },
      { status: 500 }
    );
  }
}