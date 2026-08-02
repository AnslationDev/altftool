const headers = {
  "cache-control": "public, max-age=0, s-maxage=3600",
  "x-robots-tag": "noindex, nofollow",
};

export function GET() {
  return new Response(null, { status: 404, headers });
}

export function HEAD() {
  return new Response(null, { status: 404, headers });
}
