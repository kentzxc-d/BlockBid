import styles from "./page.module.css";
import Link from "next/link";

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className="container">
          <h1 className={styles.heroTitle}>Transparent Government Procurement</h1>
          <p className={styles.heroSubtitle}>
            BlockBid is a secure, blockchain-powered platform for government bidding. 
            Ensuring fairness, anonymity, and AI-assisted evaluation for every project.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <Link href="/projects" className="btn btn-primary">
              View Active Projects
            </Link>
            <Link href="/bids/new" className="btn btn-outline">
              Submit a Bid
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container">
        <div className={styles.featuresGrid}>
          <div className="card">
            <div className={styles.featureIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3>On-Chain Security</h3>
            <p style={{ color: 'var(--color-text-muted)', marginTop: '8px' }}>
              All bids are hashed and committed to the Base Sepolia network, ensuring records cannot be tampered with.
            </p>
          </div>

          <div className="card">
            <div className={styles.featureIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 12h4l3-9 5 18 3-9h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3>Dynamic Criteria</h3>
            <p style={{ color: 'var(--color-text-muted)', marginTop: '8px' }}>
              Procurement officers can define flexible scoring structures without being locked into rigid database columns.
            </p>
          </div>

          <div className="card">
            <div className={styles.featureIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3>Blind Evaluation</h3>
            <p style={{ color: 'var(--color-text-muted)', marginTop: '8px' }}>
              Requestors evaluate submissions using anonymous aliases (e.g., Supplier-3F8A) to eliminate bias.
            </p>
          </div>
        </div>
      </section>

      {/* Recent Projects Preview */}
      <section className="container" style={{ paddingBottom: '80px' }}>
        <div className={styles.recentProjectsHeader}>
          <h2>Recent Solicitations</h2>
          <Link href="/projects" className="btn btn-outline">View All</Link>
        </div>
        
        <div style={{ display: 'grid', gap: '24px' }}>
          {/* Mock Project 1 */}
          <div className={`card ${styles.projectCard}`}>
            <div className={styles.projectCardHeader}>
              <div>
                <h3 className={styles.projectCardTitle}>Construction of Public Library - Phase 1</h3>
                <div className={styles.projectMeta}>
                  <span>📍 Cebu City Gov</span>
                  <span>💰 Est. 50,000,000 PHP</span>
                  <span>⏳ Closes in 12 days</span>
                </div>
              </div>
              <span className="badge">Open</span>
            </div>
            <p style={{ color: 'var(--color-text-muted)' }}>
              Looking for licensed contractors to build the new public library located at the city center. Must have 10+ years of experience in civic projects.
            </p>
          </div>

          {/* Mock Project 2 */}
          <div className={`card ${styles.projectCard}`}>
            <div className={styles.projectCardHeader}>
              <div>
                <h3 className={styles.projectCardTitle}>IT Equipment Supply for Public Schools</h3>
                <div className={styles.projectMeta}>
                  <span>📍 Department of Education</span>
                  <span>💰 Est. 5,000,000 PHP</span>
                  <span>⏳ Closes in 3 days</span>
                </div>
              </div>
              <span className="badge">Open</span>
            </div>
            <p style={{ color: 'var(--color-text-muted)' }}>
              Procurement of 500 desktop computers and 50 network switches for the public high schools in the district.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
