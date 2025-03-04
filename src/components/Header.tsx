'use client';

export const Header = () => {
  return (
    <header className="border-b border-gray-200">
      <div className="max-w-[1200px] mx-auto px-6 py-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#E84C3D] text-white flex items-center justify-center font-bold text-xl">
          L
        </div>
        <h1 className="text-2xl font-bold text-[#1B4332]" style={{ fontFamily: 'Special Elite' }}>
          Lingua Novels
        </h1>
      </div>
    </header>
  );
};