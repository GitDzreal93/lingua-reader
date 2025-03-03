'use client';

import { useState, useEffect } from 'react';

interface Word {
  text: string;
  type: 'noun' | 'verb' | 'adj';
  translation: string;
}

interface ReaderProps {
  data: {
    en: string[];
    zh: string[];
    words: string[];
  };
}

export const Reader = ({ data }: ReaderProps) => {
  const [selectedText, setSelectedText] = useState('');
  const [activeTab, setActiveTab] = useState<'Nouns' | 'Verbs' | 'Adjectives'>('Nouns');
  const [inputText, setInputText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);

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

  // 调用 Coze API 的函数
  const translateText = async () => {
    if (!inputText.trim() || isTranslating) return;

    setIsTranslating(true);
    try {
      const response = await fetch('https://api.coze.cn/conversation/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.COZE_API_TOKEN}`
        },
        body: JSON.stringify({
          bot_id: process.env.NEXT_PUBLIC_COZE_BOT_ID,
          messages: [
            {
              role: 'user',
              content: inputText
            }
          ]
        })
      });

      const result = await response.json();
      
      if (result.success) {
        // 处理翻译结果
        console.log('Translation result:', result);
        // TODO: 更新界面显示翻译结果
      } else {
        console.error('Translation failed:', result.message);
      }
    } catch (error) {
      console.error('Error during translation:', error);
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

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-[1200px] mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* 左侧主要内容区域 */}
          <div className="flex-1">
            {/* 输入区域 */}
            <div className="mb-8 flex gap-4 items-start">
              <div className="flex-1">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="w-full px-6 py-4 text-gray-800 placeholder-gray-400 bg-white rounded-lg border border-gray-200 resize-none focus:outline-none focus:border-gray-300 h-[120px]"
                  placeholder="输入中文文本生成中英文对照..."
                />
              </div>
              <button
                onClick={translateText}
                disabled={isTranslating || !inputText.trim()}
                className={`w-[80px] h-[45px] bg-[#E84C3D] text-white text-base font-medium rounded-lg hover:bg-[#E84C3D]/90 transition-colors flex items-center justify-center shrink-0 ${
                  (isTranslating || !inputText.trim()) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isTranslating ? '翻译中' : '翻译'}
              </button>
            </div>

            {/* 中英对照区域 */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
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
            </div>
          </div>

          {/* 词汇列表 */}
          <div className="w-[220px] shrink-0">
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden sticky top-8">
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                <h3 className="text-base font-medium text-gray-800">单词表</h3>
              </div>
              <div className="p-2 border-b border-gray-200">
                <div className="flex gap-1">
                  {(['Nouns', 'Verbs', 'Adjectives'] as const).map((tab) => (
                    <button
                      key={tab}
                      className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                        activeTab === tab
                          ? 'bg-[#E84C3D] text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                      onClick={() => setActiveTab(tab)}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>
              <div className="max-h-[calc(100vh-180px)] overflow-y-auto">
                {data.words.map((word, index) => {
                  const [term, meaning] = word.split(': ');
                  return (
                    <div
                      key={index}
                      className="px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                    >
                      <div className="text-[15px] font-medium text-gray-800 mb-0.5">
                        {term}
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <span className="text-gray-400">noun.</span>
                        <span className="text-gray-600">{meaning}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}; 