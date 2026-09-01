export type GitHubRepository = {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  homepage: string | null;
  description: string | null;
  language: string | null;
  topics: string[];
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  pushed_at: string | null;
  archived: boolean;
  fork: boolean;
  size: number;
};

export type GitHubProfile = {
  login: string;
  name: string | null;
  bio: string | null;
  html_url: string;
  public_repos: number;
  followers: number;
  following: number;
  avatar_url: string;
};

export type GitHubSnapshot = {
  profile: GitHubProfile | null;
  repositories: GitHubRepository[];
  fetchedAt: string | null;
  error: string | null;
  source: "live" | "partial" | "fallback";
  rateLimitRemaining: number | null;
  rateLimitResetAt: string | null;
};
