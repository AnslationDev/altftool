import { MissingEnvError } from "./env.js";

export function jsonError(NextResponse, message, status = 500, extra = {}) {
  return NextResponse.json({ error: message, ...extra }, { status });
}

export function routeError(NextResponse, error, fallbackMessage = "Request failed.") {
  const status = Number(error?.status) || 500;
  const message =
    error instanceof MissingEnvError
      ? error.message
      : error?.message || fallbackMessage;

  return jsonError(NextResponse, message, status);
}

export function getRequestUrl(req) {
  return new URL(req.url);
}

export function searchParam(req, name, fallback = "") {
  return (getRequestUrl(req).searchParams.get(name) || fallback).trim();
}

export function requireSearchParam(req, name, message = `${name} is required.`) {
  const value = searchParam(req, name);
  if (!value) {
    const error = new Error(message);
    error.status = 400;
    throw error;
  }
  return value;
}

export function requireHttpUrl(value, message = "Please provide a valid http(s) URL.") {
  const url = String(value || "").trim();
  if (!/^https?:\/\//i.test(url)) {
    const error = new Error(message);
    error.status = 400;
    throw error;
  }
  return url;
}

export async function readJson(res) {
  return res.json().catch(() => ({}));
}

export async function proxyJson(NextResponse, upstream, options = {}) {
  const res = await fetch(upstream, options);
  const data = await readJson(res);
  return NextResponse.json(data, { status: res.ok ? 200 : res.status });
}
