import { NextResponse } from 'next/server';
import { requireServerEnvGroup } from '@altftool/core/env';
import { enforceRateLimit, fetchJson, jsonResponse, routeError } from '@altftool/core/http';
import { SERVER_ENV } from '@altftool/core/services';

export async function GET(req) {
  try {
    const limited = enforceRateLimit(NextResponse, req, {
      limit: 30,
      scope: 'tools:skill-jobs',
      windowMs: 60000,
    });
    if (limited) return limited;

    const { searchParams } = new URL(req.url);
    const skill = (searchParams.get('skill') || '').trim();
    const country = (searchParams.get('country') || 'in').trim().toLowerCase();

    if (!skill) return NextResponse.json({ error: 'Missing skill' }, { status: 400 });

    const {
      [SERVER_ENV.adzunaAppId]: ADZUNA_APP_ID,
      [SERVER_ENV.adzunaAppKey]: ADZUNA_APP_KEY,
    } = requireServerEnvGroup(
      [SERVER_ENV.adzunaAppId, SERVER_ENV.adzunaAppKey],
      'Adzuna API keys'
    );

    const endpoint = `https://api.adzuna.com/v1/api/jobs/${encodeURIComponent(country)}/search/1`;
    const params = new URLSearchParams({
      app_id: ADZUNA_APP_ID,
      app_key: ADZUNA_APP_KEY,
      what: skill,
      results_per_page: '50',
      'content-type': 'application/json'
    });

    const result = await fetchJson(`${endpoint}?${params.toString()}`, {
      next: { revalidate: 300 },
      timeoutMs: 10000,
    });

    if (!result.ok) {
      const error = new Error(`Adzuna API error: ${result.status}`);
      error.status = result.status || 502;
      throw error;
    }

    const data = result.data;

    const results = Array.isArray(data.results) ? data.results : [];
    if (!Array.isArray(data.results)) {
      return NextResponse.json({ error: 'Adzuna API returned an invalid response format.' }, { status: 502 });
    }

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

    return jsonResponse(NextResponse, { jobCount, avgSalary, minSalary, maxSalary, topLocations, raw: data }, {
      cache: { sMaxage: 300, staleWhileRevalidate: 600 },
    });
  } catch (err) {
    console.error('Adzuna proxy error:', err);
    return routeError(NextResponse, err, 'Failed to fetch Adzuna data');
  }
}
