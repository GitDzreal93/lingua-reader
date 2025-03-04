import { Reader } from '@/components/Reader';
import { Header } from '@/components/Header';

// 空的初始数据结构
const emptyData = {
  en: [],
  zh: [],
  words: []
};

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="p-8">
        <Reader data={emptyData} />
      </div>
    </div>
  );
}
