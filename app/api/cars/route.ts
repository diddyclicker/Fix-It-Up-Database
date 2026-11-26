import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function config() {
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || "main";
  const token = process.env.GITHUB_TOKEN;
  if (!owner || !repo || !token) throw new Error("GitHub API is not configured in Vercel Environment Variables.");
  return { owner, repo, branch, token };
}

export async function GET() {
  try {
    const { owner, repo, branch, token } = config();
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/data/cars.json?ref=${branch}`;
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" },
      cache: "no-store"
    });
    if (!response.ok) {
      const detail = await response.text();
      return NextResponse.json({ error: "Could not read car data from GitHub.", detail }, { status: 502 });
    }
    const file = await response.json();
    const decoded = Buffer.from(file.content.replace(/\n/g, ""), "base64").toString("utf8");
    const cars = JSON.parse(decoded);
    return NextResponse.json({ cars, updatedAt: file.commit?.sha ?? null }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown server error" }, { status: 500 });
  }
}
