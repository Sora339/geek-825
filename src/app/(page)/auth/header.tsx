'use client'

import Link from "next/link";

const Header = () => {
  return (
    <div>
      <header className="bg-[#252525] h-[80px]">
        <div className="container flex h-full max-w-[1200px] items-center justify-between" style={{ scrollbarGutter: 'stable' }}>
          <Link href="/" className="flex">
            <h1 className="flex items-center text-white text-3xl font-bold">Maclay Rush</h1>
          </Link>
        </div>
      </header>
    </div>
  );
};

export default Header;
