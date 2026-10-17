import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import styles from "@/components/layout/Layout.module.css";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`container ${styles.shell}`}>
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
