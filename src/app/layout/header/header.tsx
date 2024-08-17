'use client'

import Image from "next/image";
import Link from "next/link";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { useEffect, useState } from "react";
import LoginButton from "./LoginButton";
import LogOutButton from "./logOutButton";

const Header = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);
  return (
    <div>
      <header className="h-[80px] border-b p-4">
        <div className="container flex h-full max-w-[1200px] items-center justify-between">
          <Link href="/" className="flex">
            <h1 className="flex items-center text-3xl font-bold">Maclay Rush</h1>
          </Link>
          <div>
            {user ? (
              <div>
                <LogOutButton />
              </div>
            ) : (
              <div>
                <LoginButton />
              </div>
            )}
          </div>
        </div>
      </header>
    </div>
  );
};

export default Header;
