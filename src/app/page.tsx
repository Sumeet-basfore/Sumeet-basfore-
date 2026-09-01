import { ArrowDownRight, ArrowUpRight, Cpu, Mail, Terminal, Wrench } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SectionHeading } from "@/components/section-heading";
import { ProjectCard } from "@/components/project-card";
import { GitHubSignal } from "@/components/github-signal";
import { HeroStage } from "@/components/three/hero-stage";
import { portfolio } from "@/data/portfolio";
import { getGitHubSnapshot, getLanguageCounts, selectRepositories } from "@/lib/github";

export default async function Home() {
  const snapshot = await getGitHubSnapshot();
  const repositories = selectRepositories(snapshot.repositories);
  const languageCounts = getLanguageCounts(snapshot.repositories);
  const languages = Array.from(new Set([
    ...portfolio.verifiedLanguages,
    ...Object.entries(languageCounts).sort(([, a], [, b]) => b - a).map(([language]) => language),
  ]));
  const latestUpdate = snapshot.repositories.map((repo) => repo.pushed_at || repo.updated_at).sort().at(-1) || null;
  const profile = snapshot.profile;
  const githubStatus = snapshot.source === "live"
    ? "Live from GitHub"
    : snapshot.source === "partial"
      ? "Partially synced"
      : "Curated fallback";

  return (
    <main id="top">
      <a className="skip-link" href="#work">Skip to selected work</a>
      <SiteHeader />

      <section className="hero page-shell reveal" aria-labelledby="hero-title">
        <HeroStage />
        <div className="hero-copy">
          <p className="eyebrow hero-eyebrow"><span className="eyebrow-dot" />{portfolio.name} <span className="eyebrow-slash">/</span> {portfolio.role}</p>
          <h1 id="hero-title">I build where<br /><em>layers meet.</em></h1>
          <p className="hero-intro">{portfolio.intro}</p>
          <div className="hero-actions">
            <a className="button button-primary" href="#work">Explore the work <ArrowDownRight size={16} aria-hidden="true" /></a>
      <a className="button button-quiet" href={portfolio.githubUrl} target="_blank" rel="noopener noreferrer" aria-label="GitHub profile (opens in a new tab)">GitHub <ArrowUpRight size={16} aria-hidden="true" /></a>
          </div>
        </div>
        <div className="hero-aside">
          <div className="hero-aside-top"><span className="status-dot" />Current range</div>
          <div className="hero-aside-lines">
            {portfolio.focusAreas.slice(0, 3).map((area, index) => (
              <div className="focus-line" key={area.label}>
                <span>0{index + 1}</span><strong>{area.label}</strong>
              </div>
            ))}
          </div>
          <div className="hero-aside-foot"><span>01—04</span><span>Code → device</span></div>
        </div>
        <div className="scroll-cue" aria-hidden="true"><span /> Scroll to explore</div>
      </section>

      <section id="work" className="page-shell section work-section reveal" aria-labelledby="work-title">
        <SectionHeading
          eyebrow="01 / selected work"
          title="Projects with edges."
          id="work-title"
          description="Public builds across embedded systems, Android vision, local AI, and developer tooling. Start with what each one does; open the technical edge when you want the details."
          aside={<span className={`data-status ${snapshot.source === "live" ? "" : "is-muted"}`} title={snapshot.error || undefined}><i />{githubStatus}</span>}
        />
        <div className="work-meta" aria-label="Selected work context">
          <span><strong>{String(repositories.length).padStart(2, "0")}</strong> public projects</span>
          <span>curated from README + source</span>
          <span>GitHub metadata <i /> project notes</span>
        </div>
        {repositories.length > 0 ? (
          <div className="project-grid">
            {repositories.map((repository, index) => <ProjectCard key={repository.id} repository={repository} index={index} />)}
          </div>
        ) : (
          <div className="empty-work">
            <div className="empty-work-icon"><Terminal size={22} strokeWidth={1.4} aria-hidden="true" /></div>
            <div>
              <p className="eyebrow"><span className="eyebrow-dot" />{snapshot.source === "live" ? "No matching repositories" : "Source not connected yet"}</p>
              <h3>{snapshot.source === "live" ? "Nothing public to index yet." : "GitHub is unavailable right now."}</h3>
              <p>{snapshot.source === "live" ? "No public, non-archived repositories currently match the portfolio selection rules." : "The selected projects are still available here from the last curated snapshot."}</p>
            </div>
            <a className="text-link" href={portfolio.githubUrl} target="_blank" rel="noopener noreferrer" aria-label="Visit GitHub profile (opens in a new tab)">Visit GitHub <ArrowUpRight size={15} aria-hidden="true" /></a>
          </div>
        )}
        <GitHubSignal profile={profile} languageCount={Object.keys(languageCounts).length} latestUpdate={latestUpdate} />
      </section>

      <section id="about" className="page-shell section about-section reveal" aria-labelledby="about-title">
        <SectionHeading eyebrow="02 / a little context" title="The layer between ideas and execution." id="about-title" />
        <div className="about-grid">
          <div className="about-lede"><p>{portfolio.about}</p></div>
          <div className="about-aside">
            <div className="about-note"><span className="note-mark">↳</span><p>Most builds start with a question that won&apos;t leave me alone.</p></div>
            <div className="about-rule" />
            <p className="micro-copy">The useful part is getting from the question to the working build.</p>
          </div>
        </div>
      </section>

      <section id="stack" className="page-shell section stack-section reveal" aria-labelledby="stack-title">
        <SectionHeading eyebrow="03 / working stack" title="Tools follow the problem." id="stack-title" description="Languages come from public repositories. The rest is the set of tools these projects actually touch." />
        <div className="stack-grid">
          <div className="stack-panel stack-panel-primary">
            <div className="stack-panel-head"><span className="panel-icon"><Cpu size={18} aria-hidden="true" /></span><h3>Languages in the repo</h3></div>
            {languages.length ? <div className="language-cloud">{languages.map((language, index) => <span className="language-pill" key={language}><b aria-hidden="true">0{index + 1}</b>{language}</span>)}</div> : <p className="panel-empty">Languages will be inferred automatically from the public repository source.</p>}
          </div>
          <div className="stack-panel">
            <div className="stack-panel-head"><span className="panel-icon"><Wrench size={18} aria-hidden="true" /></span><h3>Areas of interest</h3></div>
            <div className="interest-list">{portfolio.focusAreas.map((area) => <div className="interest-row" key={area.label}><strong>{area.label}</strong><span>{area.detail}</span></div>)}</div>
          </div>
        </div>
      </section>

      <section id="lab" className="page-shell section lab-section reveal" aria-labelledby="lab-title">
        <SectionHeading eyebrow="04 / the lab" title="Things I build to find out." id="lab-title" description="A few recurring threads. Some become tools; some stop at the experiment." />
        <div className="lab-grid">{portfolio.labNotes.map((note) => <article className="lab-card" key={note.number}><span className="lab-number">{note.number}</span><div><h3>{note.label}</h3><p>{note.detail}</p></div><ArrowUpRight className="lab-arrow" size={18} strokeWidth={1.5} aria-hidden="true" /></article>)}</div>
      </section>

      <section id="contact" className="contact-section page-shell" aria-labelledby="contact-title">
        <div className="contact-copy"><p className="eyebrow"><span className="eyebrow-dot" />05 / contact</p><h2 id="contact-title">Have a system<br /><em>worth building?</em></h2><p>If the problem has a sharp edge, send it over.</p></div>
        <div className="contact-links">
          <a className="contact-link" href={portfolio.githubUrl} target="_blank" rel="noopener noreferrer" aria-label="GitHub profile (opens in a new tab)"><span>GitHub</span><ArrowUpRight size={18} aria-hidden="true" /></a>
          {portfolio.linkedinUrl && <a className="contact-link" href={portfolio.linkedinUrl} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn profile (opens in a new tab)"><span>LinkedIn</span><ArrowUpRight size={18} aria-hidden="true" /></a>}
          {portfolio.email && <a className="contact-link" href={`mailto:${portfolio.email}`}><span>Email</span><Mail size={18} aria-hidden="true" /></a>}
          {!portfolio.linkedinUrl && !portfolio.email && <p className="contact-note">GitHub is the current public home. Add LinkedIn or email in <code>src/data/portfolio.ts</code> when ready.</p>}
        </div>
      </section>

      <footer className="site-footer page-shell"><div><strong>{portfolio.name}</strong><span>{portfolio.role}</span></div><div className="footer-links"><a href={portfolio.githubUrl} target="_blank" rel="noopener noreferrer" aria-label="GitHub profile (opens in a new tab)">GitHub</a>{portfolio.linkedinUrl && <a href={portfolio.linkedinUrl} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn profile (opens in a new tab)">LinkedIn</a>}{portfolio.email && <a href={`mailto:${portfolio.email}`}>Email</a>}</div><span className="footer-year">© {new Date().getFullYear()}</span></footer>
    </main>
  );
}
