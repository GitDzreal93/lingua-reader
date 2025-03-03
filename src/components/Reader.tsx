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
           <span class="bg-[#FFF3D6] px-1">${word}</span>
           <span class="text-[#666666] text-sm ml-0.5">(${highlightedWords[word as keyof typeof highlightedWords]})</span>
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
            <div className="mb-8 flex gap-4">
              <div className="flex-1 bg-white rounded-2xl shadow-[0_0_15px_rgba(0,0,0,0.05)]">
                <textarea
                  className="w-full px-6 py-4 text-gray-800 placeholder-gray-400 bg-transparent resize-none focus:outline-none h-[100px]"
                  placeholder="输入中文文本生成中英文对照..."
                />
              </div>
              <button className="w-[100px] h-[100px] bg-[#E84C3D] text-white font-medium rounded-2xl hover:bg-[#E84C3D]/90 transition-colors flex items-center justify-center shrink-0">
                翻译
              </button>
            </div>

            {/* 中英对照区域 */}
            {data.en.map((text, index) => (
              <div key={index} className="mb-4 flex">
                <div className="flex-1 bg-white p-4 text-[15px] leading-relaxed text-gray-800">
                  {renderHighlightedText(text)}
                </div>
                <div className="w-[1px] bg-gray-200 mx-6"></div>
                <div className="flex-1 bg-white p-4 text-[15px] leading-relaxed text-gray-800">
                  {data.zh[index]}
                </div>
              </div>
            ))}
          </div>

          {/* 词汇列表 */}
          <div className="w-[220px] shrink-0 pt-[128px]">
            <div className="bg-white rounded-lg overflow-hidden shadow-lg sticky top-8">
              <div className="p-2 border-b border-gray-100">
                <div className="flex gap-1">
                  {(['Nouns', 'Verbs', 'Adjectives'] as const).map((tab) => (
                    <button
                      key={tab}
                      className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
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
                      className="px-4 py-3 hover:bg-gray-50 transition-colors"
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