import "server-only";

import { portfolio } from "@/data/portfolio";
import type { GitHubRepository, GitHubSnapshot, GitHubProfile } from "@/types/portfolio";

const API_ROOT = "https://api.github.com";
// Repository metadata is not real-time data; a one-hour ISR window keeps the
// page fast and avoids spending GitHub API budget on every visitor.
const CACHE_SECONDS = 60 * 60;
const REQUEST_TIMEOUT_MS = 5_000;

type GitHubResponse<T> = {
  data: T;
  rateLimitRemaining: number | null;
  rateLimitResetAt: string | null;
};

class GitHubRequestError extends Error {
  constructor(public readonly status: number) {
    super(`GitHub request failed with status ${status}`);
    this.name = "GitHubRequestError";
  }
}

function githubHeaders(): HeadersInit {
  const token = process.env.GITHUB_TOKEN;
  return {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function githubFetch<T>(path: string): Promise<GitHubResponse<T>> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${API_ROOT}${path}`, {
      headers: githubHeaders(),
      signal: controller.signal,
      next: {
        revalidate: CACHE_SECONDS,
        tags: ["github-portfolio"],
      },
    });

    const resetSeconds = Number(response.headers.get("x-ratelimit-reset"));
    const rateLimitResetAt = Number.isFinite(resetSeconds) && resetSeconds > 0
      ? new Date(resetSeconds * 1000).toISOString()
      : null;
    const remainingValue = Number(response.headers.get("x-ratelimit-remaining"));
    const rateLimitRemaining = Number.isFinite(remainingValue) ? remainingValue : null;

    if (!response.ok) throw new GitHubRequestError(response.status);

    let data: unknown;
    try {
      data = await response.json();
    } catch {
      throw new Error("GitHub returned invalid JSON");
    }

    return { data: data as T, rateLimitRemaining, rateLimitResetAt };
  } catch (error) {
    if (controller.signal.aborted) throw new Error("GitHub request timed out");
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export async function getGitHubSnapshot(): Promise<GitHubSnapshot> {
  const username = process.env.GITHUB_USERNAME || portfolio.githubUsername;

  const [profileResult, repositoriesResult] = await Promise.allSettled([
    githubFetch<unknown>(`/users/${encodeURIComponent(username)}`),
    githubFetch<unknown>(`/users/${encodeURIComponent(username)}/repos?per_page=100&sort=updated&direction=desc`),
  ]);

  const profileResponse = profileResult.status === "fulfilled" ? profileResult.value : null;
  const repositoriesResponse = repositoriesResult.status === "fulfilled" ? repositoriesResult.value : null;
  const profile = profileResponse ? parseProfile(profileResponse.data) : null;
  let repositories: GitHubRepository[] = [];
  let repositoriesValid = false;
  let invalidRepositoryCount = 0;

  if (repositoriesResponse) {
    try {
      const parsed = parseRepositories(repositoriesResponse.data);
      repositories = parsed.repositories;
      invalidRepositoryCount = parsed.invalidCount;
      repositoriesValid = parsed.invalidCount === 0 || parsed.repositories.length > 0;
    } catch {
      repositoriesValid = false;
    }
  }

  const profileError = profile ? null : describeError(profileResult.status === "rejected" ? profileResult.reason : null, "profile");
  const repositoryError = repositoriesValid ? null : describeError(repositoriesResult.status === "rejected" ? repositoriesResult.reason : null, "repositories");
  const warning = invalidRepositoryCount > 0 ? `${invalidRepositoryCount} invalid repository record${invalidRepositoryCount === 1 ? "" : "s"} skipped` : null;
  const hasUsableLiveData = Boolean(profile || repositoriesValid);
  const source: GitHubSnapshot["source"] = !hasUsableLiveData
    ? "fallback"
    : profile && repositoriesValid && !warning
      ? "live"
      : "partial";
  const errors = [profileError, repositoryError, warning].filter(Boolean).join(" · ") || null;
  const rateLimits = [profileResponse, repositoriesResponse]
    .map((response) => response?.rateLimitRemaining)
    .filter((value): value is number => value !== null && value !== undefined);
  const resetDates = [profileResponse, repositoriesResponse]
    .map((response) => response?.rateLimitResetAt)
    .filter((value): value is string => Boolean(value));

  return {
    profile: profile || fallbackProfile,
    repositories: repositoriesValid ? repositories : fallbackRepositories,
    fetchedAt: hasUsableLiveData ? new Date().toISOString() : null,
    error: errors,
    source,
    rateLimitRemaining: rateLimits.length ? Math.min(...rateLimits) : null,
    rateLimitResetAt: resetDates.sort()[0] || null,
  };
}

export function selectRepositories(repositories: GitHubRepository[]) {
  return repositories
    .filter((repo) => isRenderableRepository(repo) && !portfolio.ignoredRepos.some((name) => name.toLowerCase() === repo.name.toLowerCase()) && !repo.fork && !repo.archived && repo.size > 0)
    .sort((a, b) => {
      const aFeatured = portfolio.featuredRepos.findIndex((name) => name.toLowerCase() === a.name.toLowerCase());
      const bFeatured = portfolio.featuredRepos.findIndex((name) => name.toLowerCase() === b.name.toLowerCase());
      if (aFeatured !== -1 || bFeatured !== -1) {
        if (aFeatured === -1) return 1;
        if (bFeatured === -1) return -1;
        return aFeatured - bFeatured;
      }

      const aScore = a.stargazers_count * 4 + a.forks_count * 2 + safeTimestamp(a.pushed_at || a.updated_at) / 10 ** 11;
      const bScore = b.stargazers_count * 4 + b.forks_count * 2 + safeTimestamp(b.pushed_at || b.updated_at) / 10 ** 11;
      return bScore - aScore;
    })
    .slice(0, 6);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function nonEmptyString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function nullableString(value: unknown): string | null {
  return value === null ? null : nonEmptyString(value);
}

function nonNegativeInteger(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0 ? value : fallback;
}

function validDate(value: unknown): string | null {
  if (typeof value !== "string" || !Number.isFinite(Date.parse(value))) return null;
  return value;
}

function safeUrl(value: unknown, hostname?: string): string | null {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    if (!["https:", "http:"].includes(url.protocol)) return null;
    if (hostname && url.hostname !== hostname) return null;
    return url.toString();
  } catch {
    return null;
  }
}

function parseProfile(value: unknown): GitHubProfile | null {
  if (!isRecord(value)) return null;
  const login = nonEmptyString(value.login);
  const htmlUrl = safeUrl(value.html_url, "github.com");
  if (!login || !htmlUrl) return null;

  return {
    login,
    name: nullableString(value.name),
    bio: nullableString(value.bio),
    html_url: htmlUrl,
    public_repos: nonNegativeInteger(value.public_repos),
    followers: nonNegativeInteger(value.followers),
    following: nonNegativeInteger(value.following),
    avatar_url: safeUrl(value.avatar_url) || "",
  };
}

function parseRepository(value: unknown): GitHubRepository | null {
  if (!isRecord(value)) return null;
  const name = nonEmptyString(value.name);
  const fullName = nonEmptyString(value.full_name);
  const htmlUrl = safeUrl(value.html_url, "github.com");
  const updatedAt = validDate(value.updated_at);
  const id = nonNegativeInteger(value.id, -1);
  if (!name || !fullName || !htmlUrl || !updatedAt || id <= 0) return null;

  return {
    id,
    name,
    full_name: fullName,
    html_url: htmlUrl,
    homepage: safeUrl(value.homepage),
    description: nullableString(value.description),
    language: nullableString(value.language),
    topics: Array.isArray(value.topics) ? value.topics.filter((topic): topic is string => typeof topic === "string" && Boolean(topic.trim())).map((topic) => topic.trim()) : [],
    stargazers_count: nonNegativeInteger(value.stargazers_count),
    forks_count: nonNegativeInteger(value.forks_count),
    updated_at: updatedAt,
    pushed_at: value.pushed_at === null ? null : validDate(value.pushed_at),
    archived: value.archived === true,
    fork: value.fork === true,
    size: nonNegativeInteger(value.size),
  };
}

function parseRepositories(value: unknown): { repositories: GitHubRepository[]; invalidCount: number } {
  if (!Array.isArray(value)) throw new Error("GitHub repositories response was not an array");
  const repositories = value.map(parseRepository).filter((repo): repo is GitHubRepository => repo !== null);
  return { repositories, invalidCount: value.length - repositories.length };
}

function isRenderableRepository(repository: GitHubRepository): boolean {
  return Boolean(
    repository &&
      Number.isInteger(repository.id) &&
      repository.id > 0 &&
      nonEmptyString(repository.name) &&
      safeUrl(repository.html_url, "github.com") &&
      safeTimestamp(repository.updated_at) > 0,
  );
}

function describeError(error: unknown, resource: string): string | null {
  if (!error) return `${resource} data was invalid`;
  if (error instanceof GitHubRequestError) {
    if (error.status === 403 || error.status === 429) return "GitHub API rate limit reached";
    if (error.status === 404) return "GitHub profile or repository list not found";
    return `GitHub ${resource} request failed`;
  }
  if (error instanceof Error && error.message === "GitHub request timed out") return "GitHub request timed out";
  return `GitHub ${resource} unavailable`;
}

function safeTimestamp(value: string | null): number {
  const timestamp = value ? Date.parse(value) : 0;
  return Number.isFinite(timestamp) ? timestamp : 0;
}

const fallbackProfile: GitHubProfile = {
  login: "Sumeet-basfore",
  name: "sumeet basfore",
  bio: null,
  html_url: "https://github.com/Sumeet-basfore",
  public_repos: 6,
  followers: 2,
  following: 2,
  avatar_url: "https://avatars.githubusercontent.com/u/174033686?v=4",
};

const fallbackRepositories: GitHubRepository[] = [
  {
    id: 1352320342, name: "promptvox", full_name: "Sumeet-basfore/promptvox", html_url: "https://github.com/Sumeet-basfore/promptvox", homepage: null,
    description: "Voice-to-prompt workflow for developers", language: "TypeScript", topics: ["rust", "typescript", "ai", "developer-tools"], stargazers_count: 0, forks_count: 0,
    updated_at: "2026-09-01T09:26:56Z", pushed_at: "2026-09-01T09:05:22Z", archived: false, fork: false, size: 1,
  },
  {
    id: 1317564067, name: "ThermalGuard", full_name: "Sumeet-basfore/ThermalGuard", html_url: "https://github.com/Sumeet-basfore/ThermalGuard", homepage: null,
    description: "Industrial thermal intelligence and fire prevention prototype", language: "C++", topics: ["esp32", "iot", "react", "sensors"], stargazers_count: 0, forks_count: 0,
    updated_at: "2026-08-20T06:34:33Z", pushed_at: "2026-08-20T06:32:48Z", archived: false, fork: false, size: 1,
  },
  {
    id: 1305621194, name: "FrameCoach", full_name: "Sumeet-basfore/FrameCoach", html_url: "https://github.com/Sumeet-basfore/FrameCoach", homepage: null,
    description: "AI camera composition assistant for Android", language: "Kotlin", topics: ["android", "mediapipe", "computer-vision", "kotlin"], stargazers_count: 1, forks_count: 0,
    updated_at: "2026-07-30T15:31:04Z", pushed_at: "2026-07-25T16:25:16Z", archived: false, fork: false, size: 1,
  },
  {
    id: 1245803620, name: "LACE", full_name: "Sumeet-basfore/LACE", html_url: "https://github.com/Sumeet-basfore/LACE", homepage: null,
    description: "Local AI code editor", language: "TypeScript", topics: ["tauri", "rust", "local-ai", "code-editor"], stargazers_count: 0, forks_count: 0,
    updated_at: "2026-05-22T11:04:51Z", pushed_at: "2026-05-22T11:04:47Z", archived: false, fork: false, size: 1,
  },
  {
    id: 1222327768, name: "BharatQuest", full_name: "Sumeet-basfore/BharatQuest", html_url: "https://github.com/Sumeet-basfore/BharatQuest", homepage: null,
    description: "Gamified behavioral trainer for digital financial literacy", language: "TypeScript", topics: ["react-native", "expo", "android", "financial-literacy"], stargazers_count: 0, forks_count: 1,
    updated_at: "2026-05-01T04:05:10Z", pushed_at: "2026-05-01T04:05:06Z", archived: false, fork: false, size: 1,
  },
];

export function getLanguageCounts(repositories: GitHubRepository[]) {
  return repositories.reduce<Record<string, number>>((counts, repository) => {
    if (repository.language) counts[repository.language] = (counts[repository.language] || 0) + 1;
    return counts;
  }, {});
}

export function formatRelativeDate(date: string | null) {
  if (!date) return "Unknown";
  const timestamp = Date.parse(date);
  if (!Number.isFinite(timestamp)) return "Unknown";
  const diff = Date.now() - timestamp;
  const days = Math.max(0, Math.floor(diff / 86_400_000));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}
