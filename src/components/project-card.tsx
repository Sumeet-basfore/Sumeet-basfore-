import { ArrowUpRight, GitFork, Star } from "lucide-react";
import type { GitHubRepository } from "@/types/portfolio";
import { formatRelativeDate } from "@/lib/github";
import { getProjectDetail } from "@/data/portfolio";

const languageColors: Record<string, string> = {
  TypeScript: "#66e3c4",
  JavaScript: "#f4d35e",
  Python: "#82aaff",
  Java: "#f08a5d",
  C: "#b9c0ff",
  "C++": "#c69cff",
  Rust: "#f39b6b",
  Go: "#76d4e8",
};

export function ProjectCard({ repository, index }: { repository: GitHubRepository; index: number }) {
  const detail = getProjectDetail(repository.name);
  const tags = [...new Set([...(detail?.stack || []), repository.language, ...repository.topics].filter(Boolean))].slice(0, 5) as string[];
  const href = repository.html_url;
  const titleId = `project-title-${index}-${repository.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

  return (
    <article className={`project-card ${detail?.featured ? "project-card-featured" : ""}`} aria-labelledby={titleId}>
      <div className="project-card-topline">
        <span className="project-index">0{index + 1} / {detail?.category || "public project"}</span>
        {detail?.featured && <span className="project-featured">Featured</span>}
        <span className="project-updated">Updated {formatRelativeDate(repository.pushed_at || repository.updated_at)}</span>
      </div>
      <div className="project-card-body">
        <div className="project-title-row">
          <h3 id={titleId}>{repository.name}</h3>
          <a className="icon-link" href={href} target="_blank" rel="noopener noreferrer" aria-label={`Open ${repository.name} on GitHub (opens in a new tab)`}>
            <ArrowUpRight size={19} strokeWidth={1.7} aria-hidden="true" />
          </a>
        </div>
        <p className="project-summary">{detail?.summary || repository.description || "No description is available yet."}</p>
        {detail?.technical && (
          <details className="project-technical" open={detail.featured}>
            <summary>Technical edge <span aria-hidden="true">+</span></summary>
            <p>{detail.technical}</p>
          </details>
        )}
        <div className="project-tags">
          {(detail?.stack || tags).map((tag) => (
            <span className="tag" key={tag}>
              {tag === repository.language && <i className="language-dot" style={{ background: languageColors[tag] || "var(--accent)" }} />}
              {tag}
            </span>
          ))}
        </div>
      </div>
      <div className="project-card-footer">
        <span><Star size={14} aria-hidden="true" /> {repository.stargazers_count}<span className="sr-only"> stars</span></span>
        <span><GitFork size={14} aria-hidden="true" /> {repository.forks_count}<span className="sr-only"> forks</span></span>
        {repository.language && <span className="project-language">{repository.language}</span>}
        <a className="project-visit" href={href} target="_blank" rel="noopener noreferrer" aria-label={`View ${repository.name} repository on GitHub (opens in a new tab)`}>View repository <ArrowUpRight size={14} aria-hidden="true" /></a>
      </div>
    </article>
  );
}
