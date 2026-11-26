import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";

export const dynamic = "force-dynamic";

function safeEqual(a: string, b: string) {
  const aa = Buffer.from(a);
  const bb = Buffer.from(b);
  return aa.length === bb.length && timingSafeEqual(aa, bb);
}

export async function POST(request: NextRequest) {
  try {
    const password = process.env.ADMIN_PASSWORD;
    const token = process.env.GITHUB_TOKEN;
    const owner = process.env.GITHUB_OWNER;
    const repo = process.env.GITHUB_REPO;
    const branch = process.env.GITHUB_BRANCH || "main";
    if (!password || !token || !owner || !repo) {
      return NextResponse.json({ error: "Server is not configured. Check Vercel Environment Variables." }, { status: 500 });
    }

    const supplied = request.headers.get("x-admin-password") || "";
    if (!safeEqual(supplied, password)) {
      return NextResponse.json({ error: "Incorrect admin password." }, { status: 401 });
    }

    const body = await request.json();
    if (!Array.isArray(body.cars)) return NextResponse.json({ error: "Expected a cars array." }, { status: 400 });

    const cleanCars = body.cars.map((car: any) => {
      const name = String(car.name || "").trim();
      const value = Number(car.value);
      if (!name || !Number.isFinite(value) || value < 0) throw new Error("Every car needs a name and a valid non-negative value.");
      return {
        id: String(car.id || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")),
        name,
        category: String(car.category || "Uncategorized").trim(),
        value,
        previousValue: car.previousValue === null || car.previousValue === undefined ? null : Number(car.previousValue),
        imageUrl: String(car.imageUrl || "").trim(),
        updatedAt: String(car.updatedAt || new Date().toISOString())
      };
    });

    const api = `https://api.github.com/repos/${owner}/${repo}/contents/data/cars.json`;
    const headers = {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json"
    };

    const currentResponse = await fetch(`${api}?ref=${branch}`, { headers, cache: "no-store" });
    if (!currentResponse.ok) {
      const detail = await currentResponse.text();
      return NextResponse.json({ error: "Could not find data/cars.json in the selected GitHub branch.", detail }, { status: 502 });
    }
    const currentFile = await currentResponse.json();

    const content = Buffer.from(JSON.stringify(cleanCars, null, 2) + "\n", "utf8").toString("base64");
    const updateResponse = await fetch(api, {
      method: "PUT",
      headers,
      body: JSON.stringify({
        message: "Update Fix It Up car values via CarLiner Admin",
        content,
        sha: currentFile.sha,
        branch
      })
    });
    const result = await updateResponse.json();
    if (!updateResponse.ok) {
      return NextResponse.json({ error: result.message || "GitHub could not save the update.", details: result }, { status: 502 });
    }

    return NextResponse.json({ ok: true, message: "Saved to GitHub. Vercel will redeploy if automatic deployments are enabled.", commit: result.commit?.html_url });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown server error" }, { status: 400 });
  }
}
