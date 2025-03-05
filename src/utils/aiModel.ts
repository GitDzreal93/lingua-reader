import type { OpenAIProvider } from '@ai-sdk/openai'
import type { DeepSeekProvider } from '@ai-sdk/deepseek'
import type { AnthropicProvider } from '@ai-sdk/anthropic'
import type { XaiProvider } from '@ai-sdk/xai'
import type { GoogleGenerativeAIProvider } from '@ai-sdk/google'
import { createOpenAI } from '@ai-sdk/openai'
import { createDeepSeek } from '@ai-sdk/deepseek'
import { createAnthropic } from '@ai-sdk/anthropic'
import { createXai } from '@ai-sdk/xai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'

export type AIModel = Parameters<OpenAIProvider['chat']>[0]

export interface OpenAIOptionsModel {
  value: 'OpenAI'
  children: { value: Parameters<OpenAIProvider['chat']>[0] }[]
  providerCreator: typeof createOpenAI
}

export interface DeepSeekOptionsModel {
  value: 'DeepSeek'
  children: { value: Parameters<DeepSeekProvider['chat']>[0] }[]
  providerCreator: typeof createDeepSeek
}

export interface AnthropicOptionsModel {
  value: 'Anthropic'
  children: { value: Parameters<AnthropicProvider['languageModel']>[0] }[]
  providerCreator: typeof createAnthropic
}

export interface XaiOptionsModel {
  value: 'xAI'
  children: { value: Parameters<XaiProvider['chat']>[0] }[]
  providerCreator: typeof createXai
}

export interface GoogleOptionsModel {
  value: 'Google'
  children: { value: Parameters<GoogleGenerativeAIProvider['chat']>[0] }[]
  providerCreator: typeof createGoogleGenerativeAI
}

export interface SiliconFlowOptionsModel {
  value: 'SiliconFlow'
  children: {
    value:
      | 'deepseek-ai/DeepSeek-V3'
      | 'deepseek-ai/DeepSeek-R1'
      | 'Qwen/Qwen2-VL-72B-Instruct'
      | 'Qwen/Qwen2.5-72B-Instruct'
      | (string & {})
  }[]
  providerCreator: typeof createOpenAI
}

export type AImodelsOptionsModel = (
  | OpenAIOptionsModel
  | DeepSeekOptionsModel
  | AnthropicOptionsModel
  | XaiOptionsModel
  | GoogleOptionsModel
  | SiliconFlowOptionsModel
)[]

export const SYSTEM_PROMPT = `
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
`;

export const AImodelsOptions: AImodelsOptionsModel = [
  {
    value: 'OpenAI',
    children: [
      { value: 'gpt-4o' },
      { value: 'gpt-4o-mini' },
      { value: 'o1' },
      { value: 'o1-mini' },
      { value: 'o1-preview' },
      { value: 'o3-mini' },
    ],
    providerCreator: createOpenAI,
  },
  {
    value: 'DeepSeek',
    children: [{ value: 'deepseek-chat' }, { value: 'deepseek-reasoner' }],
    providerCreator: createDeepSeek,
  },
  {
    value: 'Anthropic',
    children: [
      { value: 'claude-3-7-sonnet-20250219' },
      { value: 'claude-3-5-sonnet-latest' },
      { value: 'claude-3-5-haiku-latest' },
      { value: 'claude-3-opus-latest' },
      { value: 'claude-3-haiku-20240307' },
    ],
    providerCreator: createAnthropic,
  },
  {
    value: 'xAI',
    children: [{ value: 'grok-2-1212' }],
    providerCreator: createXai,
  },
  {
    value: 'Google',
    children: [
      { value: 'gemini-1.5-pro' },
      { value: 'gemini-1.5-pro-latest' },
      { value: 'gemini-1.5-flash' },
      { value: 'gemini-1.5-flash-latest' },
      { value: 'gemini-1.0-pro' },
    ],
    providerCreator: createGoogleGenerativeAI,
  },
  {
    value: 'SiliconFlow',
    children: [
      { value: 'deepseek-ai/DeepSeek-V3' },
      { value: 'deepseek-ai/DeepSeek-R1' },
      { value: 'Qwen/Qwen2-VL-72B-Instruct' },
      { value: 'Qwen/Qwen2.5-72B-Instruct' },
    ],
    providerCreator: createOpenAI,
  },
]

export const AIAPIHostOptions = {
  OpenAI: 'https://api.openai.com/v1',
  DeepSeek: 'https://api.deepseek.com/v1',
  Anthropic: 'https://api.anthropic.com/v1',
  xAI: 'https://api.x.ai/v1',
  Google: 'https://generativelanguage.googleapis.com/v1beta',
  SiliconFlow: 'https://api.siliconflow.cn/v1',
} as const

export const getModelProvider = (opts: { model: AIModel; apiKey: string }) => {
  const { model, apiKey } = opts
  const currentModelOptions = AImodelsOptions.find((item) => 
    item.children.some((child) => child.value === model)
  )
  
  if (!currentModelOptions) {
    throw new Error(`未找到模型 ${model} 的配置`)
  }

  const baseURL = AIAPIHostOptions[currentModelOptions.value]
  if (!baseURL) {
    throw new Error(`未找到 ${currentModelOptions.value} 的 API 地址配置`)
  }

  const providerCreator = currentModelOptions.providerCreator
  const provider = providerCreator({ baseURL, apiKey })
  return provider(model)
}