import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "../_components/PageShell";
import styles from "../styles/info-page.module.css";
import { siteIdentity } from "@/lib/site";

export const metadata: Metadata = {
  title: "DMCA and Copyright Removal Requests",
  description: "How rights holders can report copyright concerns about specific content on Billy Bob Games.",
  alternates: { canonical: "https://billybobgames.org/dmca" },
};

export default function DmcaPage() {
  return (
    <PageShell>
      <main className={styles.wrapper}>
        <section className={styles.hero}>
          <h1>DMCA and Copyright Removal Requests</h1>
          <p>
            Billy Bob Games respects creators and rights holders. This page explains how to report specific material
            that you believe infringes your copyright.
          </p>
          <p className={styles.note}>Last updated: October 8, 2026.</p>
        </section>

        <section className={styles.section}>
          <h2>Send a copyright notice</h2>
          <p>Email the independent site maintainer at:</p>
          <a className={styles.emailLink} href={`mailto:${siteIdentity.contactEmail}?subject=Copyright%20removal%20request`}>
            {siteIdentity.contactEmail}
          </a>
          <p>This contact page does not claim that the address is a separately registered DMCA agent.</p>
        </section>

        <section className={styles.section}>
          <h2>Include the following information</h2>
          <ol className={styles.list}>
            <li>Your name and a reliable way to contact you.</li>
            <li>Identification of the copyrighted work or other protected material.</li>
            <li>The exact Billy Bob Games URL where the material appears.</li>
            <li>An explanation of your ownership or authority to act for the rights holder.</li>
            <li>A statement that you have a good-faith belief the disputed use is not authorized by the rights holder, its agent, or the law.</li>
            <li>A statement that the information you provide is accurate, followed by your physical or electronic signature.</li>
          </ol>
        </section>

        <section className={styles.section}>
          <h2>What happens next</h2>
          <p>
            The report will be reviewed against the identified page and local files. Material may be disabled or removed
            while the claim is investigated. The maintainer may ask for missing details or share the notice with the party
            that supplied the material when needed to resolve the claim.
          </p>
          <p>
            If you believe content was removed by mistake, reply with the affected URL, your explanation, and supporting
            evidence. This process is for specific rights concerns, not general game suggestions or technical support.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Other requests</h2>
          <p>
            For trademark, privacy, source-credit, or general website concerns, use the <Link href="/contact">Contact page</Link>.
            You can also review <Link href="/credits">Credits</Link> and the <Link href="/disclaimer">Disclaimer</Link>.
          </p>
        </section>
      </main>
    </PageShell>
  );
}
