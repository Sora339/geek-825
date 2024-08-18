"use client";

import Image from "next/image";
import Link from "next/link";

const AuthHeader = () => {
  return (
    <div>
      <header className="h-[80px] border-b p-4">
        <div className="container flex h-full max-w-[1200px] items-center justify-between" style={{ scrollbarGutter: 'stable' }}>
          <Link href="/" className="flex">
            <h1 className="flex items-center text-3xl font-bold">
              Maclay Rush
            </h1>
          </Link>
          <div className="w-[88px]"></div>
        </div>
      </header>
    </div>
  );
};

export default AuthHeader;
