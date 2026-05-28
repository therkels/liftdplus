"use client";

import Image from "next/image";
import Link from "next/link";
import styles from "@/app/page.module.css";

type SubPageLayoutProps = {
  children: React.ReactNode;
};

export default function SubPageLayout({ children }: SubPageLayoutProps) {
  return (
    <div className={styles.root}>
      <nav className={`${styles.nav} ${styles.navScrolled} ${styles.subPageNav}`}>
        <Link href="/">
          <Image
            src="/logos/01 LIFTD+ Logo - Primary.png"
            alt="LIFTD+"
            width={140}
            height={40}
            className={styles.navLogoDark}
          />
        </Link>
        <div className={styles.navLinks}>
          <Link href="/about" className={styles.navLink}>
            About
          </Link>
          <Link href="/faq" className={styles.navLink}>
            FAQ
          </Link>
          <Link href="/resources" className={styles.navSignIn}>
            Resources
          </Link>
        </div>
      </nav>

      {children}

      <footer className={styles.footer}>
        <div>
          <Image
            src="/logos/04 LIFTD+ Logo - White.png"
            alt="LIFTD+"
            width={160}
            height={44}
            className={styles.footerLogo}
          />
          <p className={styles.footerTagline}>
            LIFTD+ is education, not retail. We&apos;re here to help you
            understand cannabis before you decide what&apos;s right for you.
          </p>
        </div>
        <div className={styles.footerRight}>
          <div>© 2026 LIFTD+</div>
          <div>
            <Link href="/privacy">Privacy Policy</Link>
            &nbsp;·&nbsp;
            <Link href="/terms">Terms</Link>
            &nbsp;·&nbsp;
            <Link href="mailto:support@liftdplus.com">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
