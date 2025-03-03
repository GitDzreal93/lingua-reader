'use client';

import Image from 'next/image';
import Link from 'next/link';

// 模拟数据
const books = [
  {
    id: 1,
    title: '哈利·波特与魔法石',
    author: 'J.K. 罗琳',
    cover: '/book-covers/harry-potter.jpg',
    description: '一个男孩的魔法冒险故事...',
    difficulty: '中级',
    tags: ['奇幻', '冒险']
  },
  {
    id: 2,
    title: '小王子',
    author: '安托万·德·圣-埃克苏佩里',
    cover: '/book-covers/little-prince.jpg',
    description: '一个来自外星球的小王子...',
    difficulty: '初级',
    tags: ['寓言', '哲理']
  },
  // 更多书籍...
];

export const BookList = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {books.map((book) => (
        <Link href={`/books/${book.id}`} key={book.id} className="block">
          <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="relative h-64 w-full">
              <div className="absolute inset-0 bg-gray-200 rounded-t-lg">
                {/* 如果图片不存在，显示占位符 */}
                <div className="flex items-center justify-center h-full text-gray-400">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-1">{book.title}</h3>
              <p className="text-sm text-gray-600 mb-2">{book.author}</p>
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  {book.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <span className="text-sm text-gray-500">{book.difficulty}</span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}; 