import styles from "./page.module.css";
import Link from "next/link";
import HeroAuthButtons from "@/components/HeroAuthButtons";

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={`container ${styles.heroContainer}`}>
          <h1 className={styles.heroTitle}>Transparent<br/>Acquisition Portal.</h1>
          <p className={styles.heroSubtitle}>
            BlockBid is an immutable ledger for government bidding. 
            Ensuring fairness, anonymity, and auditable evaluation for every project on the Polygon Amoy network.
          </p>
          <HeroAuthButtons />
        </div>
      </section>

      {/* Manifesto Section */}
      <section className={styles.manifestoSection}>
        <div className="container">
          <h2 className={styles.manifestoTitle}>WHY CHOOSE US?</h2>
          <div className={styles.manifestoList}>
            <div className={styles.manifestoCard}>
              <svg className={styles.manifestoIcon} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
              </svg>
              <div className={styles.manifestoLabel}>[ 0x01. ON-CHAIN SECURITY ]</div>
              <h3>Immutable acquisition.</h3>
              <p>
                Every bid is hashed and committed directly to the Polygon network. This immutable ledger guarantees that acquisition records cannot be altered or tampered with retroactively.
              </p>
            </div>

            <div className={styles.manifestoCard}>
              <svg className={styles.manifestoIcon} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
              </svg>
              <div className={styles.manifestoLabel}>[ 0x02. FRICTIONLESS ACCESS ]</div>
              <h3>No crypto experience required.</h3>
              <p>
                Powered by Privy, suppliers can participate using standard email accounts. A secure, non-custodial wallet is automatically provisioned in the background.
              </p>
            </div>

            <div className={styles.manifestoCard}>
              <svg className={styles.manifestoIcon} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v16.5c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9zm3.75 11.625a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
              <div className={styles.manifestoLabel}>[ 0x03. AUDITABLE REGISTRY ]</div>
              <h3>Absolute transparency.</h3>
              <p>
                From solicitation to evaluation, the entire acquisition lifecycle leaves a verifiable cryptographic trail, eliminating systemic bias and ensuring public accountability.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Acquisitions Preview */}
      <section className={styles.recentProjectsSection}>
        <div className="container">
          <div className={styles.recentProjectsHeader}>
            <h2>Recent Solicitations</h2>
            <Link href="/portal" className="btn btn-outline" style={{ borderRadius: 0, fontWeight: 600 }}>View Transparency Portal</Link>
          </div>
          
          <div style={{ display: 'grid', gap: '24px' }}>
            {/* Mock Acquisition 1 */}
            <div className={styles.projectCard}>
              <div className={styles.projectCardHeader}>
                <h3 className={styles.projectCardTitle}>Acquisition of Medical Supplies (Q3 2026)</h3>
                <span className="badge" style={{ backgroundColor: '#1E293B', color: '#F9F9F6', borderRadius: '0', fontFamily: 'var(--font-mono)' }}>STATUS: OPEN</span>
              </div>
              <p style={{ color: 'var(--color-text-muted)' }}>
                Looking for verified suppliers of medical-grade face masks, PPEs, and surgical gloves for public hospitals. Must have FDA clearance.
              </p>
              <div className={styles.projectMeta}>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Location</span>
                  <span className={styles.metaValue}>DOH Region 7</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Est. Budget</span>
                  <span className={styles.metaValue}>5,000,000 PHP</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Closing Date</span>
                  <span className={styles.metaValue}>T-12 Days</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Contract Hash</span>
                  <span className={styles.metaValue} style={{ color: 'var(--color-primary)' }}>0x8f2...4a1</span>
                </div>
              </div>
            </div>

            {/* Mock Project 2 */}
            <div className={styles.projectCard}>
              <div className={styles.projectCardHeader}>
                <h3 className={styles.projectCardTitle}>IT Equipment Supply for Public Schools</h3>
                <span className="badge" style={{ backgroundColor: '#1E293B', color: '#F9F9F6', borderRadius: '0', fontFamily: 'var(--font-mono)' }}>STATUS: OPEN</span>
              </div>
              <p style={{ color: 'var(--color-text-muted)' }}>
                Acquisition of 500 desktop computers and 50 network switches for the public high schools in the district.
              </p>
              <div className={styles.projectMeta}>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Location</span>
                  <span className={styles.metaValue}>DepEd Central</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Est. Budget</span>
                  <span className={styles.metaValue}>15,000,000 PHP</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Closing Date</span>
                  <span className={styles.metaValue}>T-03 Days</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Contract Hash</span>
                  <span className={styles.metaValue} style={{ color: 'var(--color-primary)' }}>0xb41...9c2</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

