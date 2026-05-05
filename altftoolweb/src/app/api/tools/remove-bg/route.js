import { NextResponse } from "next/server";
import { requireServerEnv } from "@altftool/core/env";
import { routeError } from "@altftool/core/http";
import { SERVER_ENV } from "@altftool/core/services";

export async function POST(req) {
  try {
    const apiKey = requireServerEnv(SERVER_ENV.removeBg);

    const formData = await req.formData();
    const image = formData.get("image_file");
    if (!image) {
      return NextResponse.json({ error: "image_file is required." }, { status: 400 });
    }

    const upstream = new FormData();
    upstream.append("image_file", image);

    const res = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: { "X-Api-Key": apiKey },
      body: upstream,
    });

    if (!res.ok) {
      const errorText = await res.text();
      return NextResponse.json(
        { error: errorText || "Remove.bg request failed." },
        { status: res.status }
      );
    }

    return new NextResponse(await res.arrayBuffer(), {
      status: 200,
      headers: { "Content-Type": res.headers.get("content-type") || "image/png" },
    });
  } catch (error) {
    return routeError(NextResponse, error, "Background removal failed.");
  }
}
