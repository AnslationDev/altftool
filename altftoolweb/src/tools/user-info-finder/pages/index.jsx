"use client";
import UserInfoFinder from "../components/UserInfoFinder";
import Features from "../components/Features";
import Header from "../components/Header";

export default function UserInfoApp() {
  return (
    <div className="min-h-screen relative bg-(--background) p-2 sm:p-4">
      <Header />
      <UserInfoFinder />
      <Features />
    </div>
  );
}
