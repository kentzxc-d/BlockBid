import styles from "./page.module.css";
import Link from "next/link";
import HeroAuthButtons from "@/components/HeroAuthButtons";
import AcquisitionCard from "@/components/AcquisitionCard";

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
              <div className={styles.manifestoLabel}>[ 0x01. ON-CHAIN SECURITY ]</div>
              <h3>Immutable acquisition.</h3>
              <p>
                Every bid is hashed and committed directly to the Polygon network. This immutable ledger guarantees that acquisition records cannot be altered or tampered with retroactively.
              </p>
            </div>

            <div className={styles.manifestoCard}>
              <div className={styles.manifestoLabel}>[ 0x02. FRICTIONLESS ACCESS ]</div>
              <h3>No crypto experience required.</h3>
              <p>
                Powered by Privy, suppliers can participate using standard email accounts. A secure, non-custodial wallet is automatically provisioned in the background.
              </p>
            </div>

            <div className={styles.manifestoCard}>
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
            <h2>Recent Acquisitions</h2>
            <Link href="/portal" className="btn bg-secondary text-white hover:bg-secondary-hover hover:text-primary transition-all hover:-translate-y-1 hover:shadow-md active:scale-[0.98] shadow-sm" style={{ borderRadius: 0, fontWeight: 600 }}>
              View Transparency Portal
            </Link>
          </div>
          
          <div style={{ display: 'grid', gap: '24px' }}>
            {/* Mock Acquisition 1 */}
            <AcquisitionCard
              title="Acquisition of Medical Supplies (Q3 2026)"
              description="Looking for verified suppliers of medical-grade face masks, PPEs, and surgical gloves for public hospitals. Must have FDA clearance."
              status="OPEN"
              location="DOH Region 7"
              estBudget={5000000}
              closingDate="T-12 Days"
              contractHash="0x8f2a...4a1c"
            />

            {/* Mock Project 2 */}
            <AcquisitionCard
              title="IT Equipment Supply for Public Schools"
              description="Acquisition of 500 desktop computers and 50 network switches for the public high schools in the district."
              status="OPEN"
              location="DepEd Central"
              estBudget={15000000}
              closingDate="T-03 Days"
              contractHash="0xb41f...9c2d"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className="container">
          <p className={styles.footerText}>
            BlockBid &middot; Cor Jesu College Capstone 2025&ndash;2026 &middot; Powered by Polygon
          </p>
        </div>
      </footer>
    </>
  );
}

