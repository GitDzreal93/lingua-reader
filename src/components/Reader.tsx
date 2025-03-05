'use client';

import { useState, useEffect, useMemo } from 'react';

interface Word {
  word: string;
  type: string;
  meaning: string;
}

interface ReaderProps {
  data: {
    en: string[];
    zh: string[];
    words: Word[];
  };
}

// 词性分类的中英文映射
const WORD_TYPES = {
  'All': '全部',
  'Noun': '名词',
  'Verb': '动词',
  'Adjective': '形容词',
  'Adverb': '副词',
  'Pronoun': '代词',
  'Preposition': '介词',
  'Conjunction': '连词',
  'Interjection': '感叹词',
  'Article': '冠词',
  'Determiner': '限定词',
  'Numeral': '数词',
  'Phrase': '短语'
} as const;

type WordType = keyof typeof WORD_TYPES;

// 可用的 AI 模型
const AI_MODELS = {
  'openai': 'OpenAI',
  'gemini': 'Google Gemini',
  'deepseek': 'DeepSeek'
} as const;

type AIModel = keyof typeof AI_MODELS;

export const Reader = ({ data: initialData }: ReaderProps) => {
  const [selectedModel, setSelectedModel] = useState<AIModel>('openai');
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatError, setChatError] = useState<Error | null>(null);
  
  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };
  
  // 处理提交翻译请求
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || isLoading) return;
    
    setIsLoading(true);
    setChatError(null);
    setError(null);
    
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ content: input }],
          model: selectedModel
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '翻译请求失败');
      }
      
      const result = await response.json();
      console.log('Translation result:', result);
      
      // 解析返回的数据
      try {
        const parsedData = JSON.parse(result.content);
        if (parsedData.en && parsedData.zh && parsedData.words) {
          setData({
            en: parsedData.en,
            zh: parsedData.zh,
            words: parsedData.words
          });
          setHasTranslated(true);
        } else {
          throw new Error('返回数据格式不正确');
        }
      } catch (parseError) {
        console.error('Parse error:', parseError);
        setError('解析翻译结果失败，请重试');
      }
    } catch (error) {
      console.error('Translation error:', error);
      setChatError(error instanceof Error ? error : new Error('翻译失败'));
    } finally {
      setIsLoading(false);
    }
  };

  const [selectedText, setSelectedText] = useState('');
  const [activeTab, setActiveTab] = useState<WordType>('All');
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState(initialData);
  const [hasTranslated, setHasTranslated] = useState(false);
  const [showAnnotation, setShowAnnotation] = useState(true);

  useEffect(() => {
    const handleMouseUp = () => {
      const selection = window.getSelection();
      if (selection && selection.toString()) {
        setSelectedText(selection.toString());
      }
    };

    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // 重置所有状态
  const handleReset = () => {
    setInput('');
    setError(null);
    setChatError(null);
    setData(initialData);
    setHasTranslated(false);
  };

  // 模拟高亮单词数据
  const highlightedWords = {
    'took': '花费',
    'tortured': '折磨',
    'diplomacy': '外交',
    'unwind': '被毁',
    'Trump': '特朗普',
    'thrashing': '痛骂',
    'bare': '揭露',
    'allies': '同盟国',
    'reshaping': '重塑',
    'profound': '深刻',
    'emboldened': '壮胆',
    'redirect': '重定向',
    'agenda': '议程',
    'tumultuous': '动荡',
    'staid': '稳重',
    'brutal': '残酷',
    'mortal': '凡人',
    'jeopardy': '危险之中'
  };

  const renderHighlightedText = (text: string) => {
    let result = text;
    const processedWords = new Set<string>();
  
    data.words.forEach(word => {
      const escapedWord = word.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escapedWord}\\b|${escapedWord}`, 'gi');
      
      const firstMatch = regex.exec(result);
      if (firstMatch && !processedWords.has(word.word.toLowerCase())) {
        const prefix = result.slice(0, firstMatch.index);
        const suffix = result.slice(firstMatch.index + firstMatch[0].length);
        
        result = `${prefix}<span class="inline-flex items-center">
          <span class="text-[#F97316]">${firstMatch[0]}</span>
          ${showAnnotation ? `<span class="text-[#666666] text-[11px] ml-1 font-['SimSun']">(${word.meaning})</span>` : ''}
        </span>${suffix}`;
        
        processedWords.add(word.word.toLowerCase());
      }
    });
  
    return <div dangerouslySetInnerHTML={{ __html: result }} />;
  };

  // 按词性分类单词
  const groupedWords = useMemo(() => {
    const groups: Record<string, Word[]> = {
      All: [...(data.words || [])]
        .filter((word): word is Word => !!word && typeof word.word === 'string')
        .sort((a, b) => a.word.localeCompare(b.word))
    };
    
    data.words?.forEach(word => {
      if (!word) return;
      if (!groups[word.type]) {
        groups[word.type] = [];
      }
      groups[word.type].push(word);
    });
    
    // 过滤掉没有单词的分类
    const filteredGroups: Record<string, Word[]> = {};
    Object.entries(groups).forEach(([type, words]) => {
      if (type === 'All' || words.length > 0) {
        filteredGroups[type] = words;
      }
    });
    
    return filteredGroups;
  }, [data.words]);

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-[1200px] mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* 左侧主要内容区域 */}
          <div className="flex-1">
            {/* 输入区域 */}
            <div className="mb-8 flex flex-col gap-4">
              <div className="flex gap-4 items-start">
                <div className="flex-1 relative">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-sm text-gray-600">选择模型：</div>
                    <div className="flex gap-2">
                      {Object.entries(AI_MODELS).map(([key, label]) => (
                        <button
                          key={key}
                          onClick={() => setSelectedModel(key as AIModel)}
                          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                            selectedModel === key
                              ? 'bg-[#E84C3D] text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea
                    value={input}
                    onChange={handleInputChange}
                    maxLength={1024}
                    className="w-full px-6 py-4 pb-8 text-gray-800 placeholder-gray-400 bg-white rounded-lg border border-gray-200 resize-none focus:outline-none focus:border-gray-300 h-[120px]"
                    placeholder="输入中文文本生成中英文对照...(最多1024个字符)"
                  />
                  <div className="absolute bottom-3 right-3 px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-500 select-none">
                    {input.length}/1024
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={(e) => handleSubmit(e as unknown as React.FormEvent)}
                    disabled={isLoading || !input.trim()}
                    className={`w-[80px] h-[45px] bg-[#E84C3D] text-white text-base font-medium rounded-lg hover:bg-[#E84C3D]/90 transition-colors flex items-center justify-center shrink-0 ${
                      (isLoading || !input.trim()) ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isLoading ? '翻译中' : '翻译'}
                  </button>
                  <button
                    onClick={handleReset}
                    className="w-[80px] h-[45px] border border-gray-200 text-gray-600 text-base font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center shrink-0"
                  >
                    重置
                  </button>
                </div>
              </div>
              {(error || chatError) && (
                <div className="text-[#E84C3D] text-sm">
                  {error || (chatError instanceof Error ? chatError.message : String(chatError))}
                </div>
              )}
            </div>

            {/* 中英对照区域 */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              {!hasTranslated ? (
                <div className="text-center text-gray-400 py-8">
                  暂无翻译内容，请在上方输入框中输入要翻译的文本
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-end mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">显示注释</span>
                      <button
                        className={`w-12 h-6 rounded-full transition-colors ${
                          showAnnotation ? 'bg-[#E84C3D]' : 'bg-gray-200'
                        }`}
                        onClick={() => setShowAnnotation(!showAnnotation)}
                      >
                        <div
                          className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform ${
                            showAnnotation ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                  {data.en.map((text, index) => (
                    <div key={index} className="flex items-stretch">
                      <div className="flex-1 p-4 text-[15px] leading-relaxed text-gray-800">
                        {renderHighlightedText(text)}
                      </div>
                      <div className="flex flex-col items-center mx-6">
                        <div className="flex-1 w-[1px] bg-gray-200"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-300 my-4"></div>
                        <div className="flex-1 w-[1px] bg-gray-200"></div>
                      </div>
                      <div className="flex-1 p-4 text-[15px] leading-relaxed text-gray-800">
                        {data.zh[index]}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* 词汇列表 */}
          <div className="w-[220px] shrink-0">
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden sticky top-8">
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                <h3 className="text-base font-medium text-gray-800">单词表</h3>
              </div>
              <div className="p-2 border-b border-gray-200">
                <div className="flex flex-wrap gap-1">
                  {Object.entries(WORD_TYPES)
                    .filter(([type]) => type === 'All' || groupedWords[type]?.length > 0)
                    .map(([type, label]) => (
                      <button
                        key={type}
                        className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                          activeTab === type
                            ? 'bg-[#E84C3D] text-white'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                        onClick={() => setActiveTab(type as WordType)}
                      >
                        {label}
                      </button>
                    ))}
                </div>
              </div>
              <div className="max-h-[calc(100vh-180px)] overflow-y-auto">
                {!hasTranslated ? (
                  <div className="text-center text-gray-400 py-8">
                    暂无单词数据
                  </div>
                ) : !groupedWords[activeTab] || groupedWords[activeTab].length === 0 ? (
                  <div className="text-center text-gray-400 py-8">
                    未找到{WORD_TYPES[activeTab]}
                  </div>
                ) : (
                  groupedWords[activeTab].map((word, index) => (
                    <div
                      key={index}
                      className="px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                    >
                      <div className="text-[15px] font-bold text-[#F97316] mb-1">
                        {word.word}
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-500">
                          {WORD_TYPES[word.type as WordType] || '未知'}
                        </span>
                        <span className="text-gray-600 font-['SimSun']">{word.meaning}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};