import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const skill = (searchParams.get('skill') || '').trim();
    const country = (searchParams.get('country') || 'in').trim().toLowerCase();

    if (!skill) return NextResponse.json({ error: 'Missing skill' }, { status: 400 });

    // const ADZUNA_APP_ID = process.env.VITE_ADZUNA_APP_ID || process.env.ADZUNA_APP_ID;
    // const ADZUNA_APP_KEY = process.env.VITE_ADZUNA_APP_KEY || process.env.ADZUNA_APP_KEY;

    const ADZUNA_APP_ID = "6303d62b";
    const ADZUNA_APP_KEY = "272f95515be003c9ad38b58f88fca86c";

    if (!ADZUNA_APP_ID || !ADZUNA_APP_KEY) {
      return NextResponse.json({ error: 'API keys are missing for Adzuna. Please set ADZUNA_APP_ID and ADZUNA_APP_KEY.' }, { status: 500 });
    }

    const endpoint = `https://api.adzuna.com/v1/api/jobs/${encodeURIComponent(country)}/search/1`;
    const params = new URLSearchParams({
      app_id: ADZUNA_APP_ID,
      app_key: ADZUNA_APP_KEY,
      what: skill,
      results_per_page: '50',
      'content-type': 'application/json'
    });

    const res = await fetch(`${endpoint}?${params.toString()}`);
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Adzuna API error: ${res.status} ${txt}`);
    }

    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const txt = await res.text();
      console.error('Adzuna returned non-JSON response:', txt.slice(0, 100));
      return NextResponse.json({ error: 'Adzuna API returned an invalid response format.' }, { status: 502 });
    }

    const data = await res.json();

    const results = Array.isArray(data.results) ? data.results : [];
    const jobCount = Number.isFinite(Number(data.count)) ? Number(data.count) : results.length;

    // compute salary stats from available salary_min / salary_max
    const salaries = results.map(r => ({ min: Number(r.salary_min) || 0, max: Number(r.salary_max) || 0 }));
    const salaryVals = salaries.flatMap(s => [s.min, s.max].filter(v => v > 0));
    const avgSalary = salaryVals.length ? Math.round(salaryVals.reduce((a, b) => a + b, 0) / salaryVals.length) : 0;
    const minSalary = salaryVals.length ? Math.min(...salaryVals) : 0;
    const maxSalary = salaryVals.length ? Math.max(...salaryVals) : 0;

    // top locations
    const locCounts = {};
    results.forEach(r => {
      const loc = (r.location?.display_name || r.location?.area || 'Unknown').split(',')[0].trim();
      if (!loc) return;
      locCounts[loc] = (locCounts[loc] || 0) + 1;
    });
    const topLocations = Object.entries(locCounts).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([loc, count]) => ({ location: loc, count }));

    return NextResponse.json({ jobCount, avgSalary, minSalary, maxSalary, topLocations, raw: data });
  } catch (err) {
    console.error('Adzuna proxy error:', err);
    return NextResponse.json({ error: err.message || 'Failed to fetch Adzuna data' }, { status: 500 });
  }
}
