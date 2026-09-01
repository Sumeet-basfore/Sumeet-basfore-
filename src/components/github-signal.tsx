import { Activity, ArrowUpRight, GitBranch, Layers3 } from "lucide-react";
import type { GitHubProfile } from "@/types/portfolio";
import { formatRelativeDate } from "@/lib/github";

type GitHubSignalProps = {
  profile: GitHubProfile | null;
  languageCount: number;
  latestUpdate: string | null;
};

export function GitHubSignal({ profile, languageCount, latestUpdate }: GitHubSignalProps) {
  const metrics = [
    { label: "Public repos", value: profile ? String(profile.public_repos).padStart(2, "0") : "—", icon: Layers3 },
    { label: "Languages in use", value: languageCount ? String(languageCount).padStart(2, "0") : "—", icon: GitBranch },
    { label: "Latest activity", value: latestUpdate ? formatRelativeDate(latestUpdate) : "—", icon: Activity },
  ];

  return (
    <div className="github-signal">
      <div className="signal-intro">
        <div>
          <p className="eyebrow"><span className="eyebrow-dot" />GitHub signal</p>
          <h3>A small public snapshot.</h3>
        </div>
        <a className="text-link" href={profile?.html_url || "https://github.com/Sumeet-basfore"} target="_blank" rel="noopener noreferrer" aria-label="Open GitHub profile (opens in a new tab)">
          Open profile <ArrowUpRight size={15} aria-hidden="true" />
        </a>
      </div>
      <dl className="signal-metrics" aria-label="GitHub activity summary">
        {metrics.map(({ label, value, icon: Icon }) => (
          <div className="signal-metric" key={label}>
            <Icon size={17} strokeWidth={1.5} aria-hidden="true" />
            <dt>{label}</dt>
            <dd><strong>{value}</strong></dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
