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

export const Reader = ({ data: initialData }: ReaderProps) => {
  const [selectedText, setSelectedText] = useState('');
  const [activeTab, setActiveTab] = useState<WordType>('All');  // 默认选中"全部"
  const [inputText, setInputText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState(initialData);
  const [hasTranslated, setHasTranslated] = useState(false);

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
    setInputText('');
    setError(null);
    setData(initialData);
    setHasTranslated(false);
  };

  // 调用 Coze API 的函数
  const translateText = async () => {
    if (!inputText.trim() || isTranslating) return;

    setIsTranslating(true);
    setError(null);

    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: inputText
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '翻译请求失败');
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        setData(result.data);
        setInputText('');
        setHasTranslated(true);
      } else {
        throw new Error(result.message || '翻译失败，请稍后重试');
      }
    } catch (error) {
      console.error('Translation error:', error);
      setError(error instanceof Error ? error.message : '网络错误，请稍后重试');
    } finally {
      setIsTranslating(false);
    }
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
    Object.keys(highlightedWords).forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'g');
      result = result.replace(
        regex,
        `<span class="inline-flex items-center">
           <span class="bg-[#FFF3D6] px-1 rounded">${word}</span>
           <span class="text-[#666666] text-sm ml-1">(${highlightedWords[word as keyof typeof highlightedWords]})</span>
         </span>`
      );
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
    
    return groups;
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
                <div className="flex-1">
                  <textarea
                    value={inputText}
                    onChange={(e) => {
                      setInputText(e.target.value);
                      setError(null);
                    }}
                    className="w-full px-6 py-4 text-gray-800 placeholder-gray-400 bg-white rounded-lg border border-gray-200 resize-none focus:outline-none focus:border-gray-300 h-[120px]"
                    placeholder="输入中文文本生成中英文对照..."
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={translateText}
                    disabled={isTranslating || !inputText.trim()}
                    className={`w-[80px] h-[45px] bg-[#E84C3D] text-white text-base font-medium rounded-lg hover:bg-[#E84C3D]/90 transition-colors flex items-center justify-center shrink-0 ${
                      (isTranslating || !inputText.trim()) ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isTranslating ? '翻译中' : '翻译'}
                  </button>
                  <button
                    onClick={handleReset}
                    className="w-[80px] h-[45px] border border-gray-200 text-gray-600 text-base font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center shrink-0"
                  >
                    重置
                  </button>
                </div>
              </div>
              {error && (
                <div className="text-[#E84C3D] text-sm">{error}</div>
              )}
            </div>

            {/* 中英对照区域 */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              {!hasTranslated ? (
                <div className="text-center text-gray-400 py-8">
                  暂无翻译内容，请在上方输入框中输入要翻译的文本
                </div>
              ) : (
                data.en.map((text, index) => (
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
                ))
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
                  {Object.entries(WORD_TYPES).map(([type, label]) => (
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
                      <div className="text-[15px] font-medium text-gray-800 mb-0.5">
                        {word.word}
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <span className="text-gray-400">{WORD_TYPES[word.type as WordType] || '未知'}</span>
                        <span className="text-gray-600">{word.meaning}</span>
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