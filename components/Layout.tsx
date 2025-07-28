// components/Layout.tsx
import React, { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { auth, db } from "../lib/firebase";
import type { User } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot, DocumentSnapshot } from "firebase/firestore";

type Props = { children: ReactNode };

export default function Layout({ children }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<number>(0);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) {
        const userDoc = doc(db, "users", u.uid);
        const unsubscribeSnap = onSnapshot(
          userDoc,
          (snap: DocumentSnapshot) => {
            // snap.data() may be undefined
            const data = snap.data() as { tokens?: number } | undefined;
            setTokens(data?.tokens ?? 0);
          }
        );
        return unsubscribeSnap;
      }
    });
    return unsubscribeAuth;
  }, []);

  return (
    <div className="min-h-screen bg-bg">
      <header className="flex items-center justify-between p-4 bg-white shadow">
        <Link href="/">
          <a className="text-2xl font-bold text-primary">B2B Match</a>
        </Link>
        {user ? (
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">💎 {tokens} Tokens</span>
            <button
              onClick={() => auth.signOut()}
              className="px-3 py-1 text-white rounded-lg bg-secondary"
            >
              로그아웃
            </button>
          </div>
        ) : (
          <Link href="/auth/login">
            <a className="px-3 py-1 text-white rounded-lg bg-secondary">
              로그인
            </a>
          </Link>
        )}
      </header>
      <main className="container p-6 mx-auto">{children}</main>
    </div>
  );
}
