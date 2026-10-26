"use client";

import Header from "@/components/layout/Header";
import PrivHeader from "@/components/layout/PrivHeader";
import Footer from "@/components/layout/Footer";
import styles from "@/components/layout/Layout.module.css";
import { useAuth } from "@/components/providers/AuthProvider";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();

  return (
    <div className={`container ${styles.shell}`}>
      {!isLoading && (user ? <PrivHeader /> : <Header />)}
      <main>{children}</main>
      <Footer />
    </div>
  );
}