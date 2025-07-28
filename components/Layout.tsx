// components/Layout.tsx
import React, { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { auth, db } from "../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";

type Props = { children: ReactNode };

export default function Layout({ children }: Props) {
  const [user, setUser] = useState<any>(null);
  const [tokens, setTokens] = useState<number>(0);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) {
        const unsubscribeSnap = onSnapshot(doc(db, "users", u.uid), (snap) => {
          setTokens(snap.data()?.tokens ?? 0);
        });
        return unsubscribeSnap;
      }
    });
    return unsubscribeAuth;
  }, []);

  return (
    <div className="min-h-screen bg-bg">
      <header className="bg-white shadow p-4 flex justify-between items-center">
        <Link href="/">
          <a className="text-2xl font-bold text-primary">B2B Match</a>
        </Link>
        {user ? (
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">?? {tokens} Tokens</span>
            <button
              onClick={() => auth.signOut()}
              className="px-3 py-1 bg-secondary text-white rounded-lg"
            >
              로그아웃
            </button>
          </div>
        ) : (
          <Link href="/auth/login">
            <a className="px-3 py-1 bg-secondary text-white rounded-lg">
              로그인
            </a>
          </Link>
        )}
      </header>
      <main className="container mx-auto p-6">{children}</main>
    </div>
  );
}
