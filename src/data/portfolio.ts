export const portfolio = {
  name: "Sumeet Basfore",
  role: "Software Developer",
  githubUsername: "Sumeet-basfore",
  githubUrl: "https://github.com/Sumeet-basfore",
  // Keep these explicit so they can be added without touching UI components.
  linkedinUrl: "https://www.linkedin.com/in/sumeet-basfore-405037399",
  email: "sumeetbasfore210@gmail.com",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  intro:
    "I build local AI tools, offline mobile apps, and sensor-driven systems.",
  about:
    "My projects move between the interface and the layers underneath: Compose and CameraX, Rust and PTYs, ESP32 sensors and a web console.",
  focusAreas: [
    { label: "AI-assisted development", detail: "Prompt tools and local model workflows" },
    { label: "Systems + Linux", detail: "Rust, PTYs, and local model servers" },
    { label: "Web applications", detail: "React consoles for real device data" },
    { label: "Hardware + IoT", detail: "ESP32 sensors, telemetry, and control loops" },
  ],
  // Add repository names here to pin them above the heuristic GitHub ranking.
  featuredRepos: ["ThermalGuard", "FrameCoach", "promptvox", "LACE", "BharatQuest"],
  ignoredRepos: ["Sumeet-basfore-"],
  verifiedLanguages: ["TypeScript", "Kotlin", "Rust", "C++", "Python", "JavaScript", "HTML/CSS"],
  labNotes: [
    { number: "01", label: "AI experiments", detail: "Local models, voice input, and useful boundaries." },
    { number: "02", label: "Developer tooling", detail: "Tools that remove friction from the next build." },
    { number: "03", label: "Linux / systems", detail: "PTYs, local servers, and the layers underneath." },
    { number: "04", label: "ESP32 / IoT", detail: "Sensors, wires, and a little patience." },
  ],
} as const;

export type ProjectDetail = {
  category: string;
  summary: string;
  technical: string;
  stack: string[];
  featured?: boolean;
};

export const projectDetails: Record<string, ProjectDetail> = {
  ThermalGuard: {
    category: "Embedded / web systems",
    summary: "An ESP32 prototype for monitoring electrical hotspots with a thermal array and current sensor.",
    technical: "It crosses the whole stack: MLX90640 frames and current sensing at the edge, a REST boundary, and an operator dashboard with safety interlocks and demo mode.",
    stack: ["ESP32", "C++", "React", "MLX90640"],
    featured: true,
  },
  FrameCoach: {
    category: "Android / on-device ML",
    summary: "An offline camera assistant that nudges composition in real time using the phone’s camera and motion sensors.",
    technical: "The loop runs from CameraX frames to MediaPipe detections, pure Kotlin rules, and Compose overlays, with adaptive frame skipping and thermal throttling.",
    stack: ["Kotlin", "Compose", "CameraX", "MediaPipe"],
  },
  promptvox: {
    category: "AI / developer tooling",
    summary: "A voice-to-prompt workflow that turns rough spoken tasks into structured, reviewable instructions for coding agents.",
    technical: "A shared TypeScript core powers both a WXT browser extension and a Tauri desktop app, with pluggable speech providers and local history/settings.",
    stack: ["TypeScript", "Rust", "Tauri", "WXT"],
  },
  LACE: {
    category: "Local AI / systems",
    summary: "A local-first code editor with model-assisted edits, terminal workflows, and native system access.",
    technical: "Model edits become diffs, shell suggestions need approval, and Rust connects the editor to PTYs, files, and local model servers.",
    stack: ["Tauri", "Rust", "React", "Ollama"],
  },
  BharatQuest: {
    category: "Mobile / social impact",
    summary: "A multilingual mobile game for learning to spot digital-payment scams through simulated decisions.",
    technical: "The build combines regional-language content, a game-state reducer, and a native Android SMS receiver that can surface an intervention.",
    stack: ["React Native", "Expo", "Kotlin", "SQLite"],
  },
};

export function getProjectDetail(name: string): ProjectDetail | undefined {
  return Object.entries(projectDetails).find(([projectName]) => projectName.toLowerCase() === name.toLowerCase())?.[1];
}

export type PortfolioConfig = typeof portfolio;
