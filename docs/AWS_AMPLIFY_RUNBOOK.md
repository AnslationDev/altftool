# AWS Amplify runbook

This document records the production hosting shape for ALTFTool. It intentionally
contains no credentials or secret environment values.

## Applications

| Surface | Amplify app | App ID | Branch | Region | Platform |
| --- | --- | --- | --- | --- | --- |
| Public web | `knaltftoolweb` | `d3o0ra1ab3rxzf` | `main` | `ap-south-1` | `WEB_COMPUTE` |
| Admin | `knadmintiertwoanslation` | `d3qv0il8ey2gki` | `main` | `ap-south-1` | `WEB_COMPUTE` |

Both applications use Amplify managed caching without cookies and the
`LARGE_16GB` build instance. Build instance size affects build speed; Amplify
Hosting manages the runtime compute and CloudFront delivery separately.

## Build settings

Both applications must build with `next build --webpack` as required by
`master.md`.

Public web build environment:

- `ALTFT_NODE_MAX_OLD_SPACE_SIZE=12288`
- `ALTFT_BUILD_CPUS=4`
- `ALTFT_PARALLEL_MINIFY=true`
- `NEXT_TELEMETRY_DISABLED=1`

Admin build environment:

- `ALTFT_NODE_MAX_OLD_SPACE_SIZE=12288`
- `NEXT_TELEMETRY_DISABLED=1`

The web configuration clamps build workers to four. This leaves capacity for
Next.js orchestration and artifact packaging on the eight-vCPU builder. Local
builds default to one worker unless the performance variables are explicitly
provided.

The Amplify build specifications cache only `.npm`. Both builds remove
`.next/cache` after compilation so webpack cache packs are not included in the
SSR deployment artifact or uploaded as multi-gigabyte build caches. The Large
builder makes a clean compile cheaper than transferring those caches. Package
installation uses `--no-audit --no-fund` during CI; dependency auditing remains
part of the repository validation workflow.

Never replace the environment-variable map with a partial map. `update-app`
treats it as the complete application environment, so always fetch, merge, and
write the full map without printing secret values.

## Verification

Inspect only non-secret build settings:

```bash
aws amplify get-app \
  --app-id d3o0ra1ab3rxzf \
  --region ap-south-1 \
  --query '{compute:app.jobConfig.buildComputeType,heap:app.environmentVariables.ALTFT_NODE_MAX_OLD_SPACE_SIZE,cpus:app.environmentVariables.ALTFT_BUILD_CPUS,minify:app.environmentVariables.ALTFT_PARALLEL_MINIFY}'
```

```bash
aws amplify get-app \
  --app-id d3qv0il8ey2gki \
  --region ap-south-1 \
  --query '{compute:app.jobConfig.buildComputeType,heap:app.environmentVariables.ALTFT_NODE_MAX_OLD_SPACE_SIZE}'
```

Before a release, run:

```bash
ALTFT_NODE_MAX_OLD_SPACE_SIZE=12288 \
ALTFT_BUILD_CPUS=4 \
ALTFT_PARALLEL_MINIFY=true \
npm run build:web

ALTFT_NODE_MAX_OLD_SPACE_SIZE=12288 npm run build:admin
npm run bundle:audit
npm run performance:budget:strict
```

After a deployment, verify the branch job first, then check the public routes:

```bash
curl -I https://www.altftool.com/
curl -I https://www.altftool.com/tools/all
curl -I https://www.tier2.anslation.com/login
```

Static responses should show CloudFront delivery. Dynamic health responses may
perform a live Firebase probe and intentionally use a short shared cache.

## Rollback

If a future web build becomes memory-unstable, set
`ALTFT_PARALLEL_MINIFY=false` first. If needed, set `ALTFT_BUILD_CPUS=1` and
`ALTFT_NODE_MAX_OLD_SPACE_SIZE=6144` to restore the conservative build mode.

If admin build cost matters more than its build latency, return only the admin
application to `STANDARD_8GB` and set its Node heap to `6144`.

Do not enable legacy Amplify performance mode. Use framework `Cache-Control`
headers and the managed cache policy. Before changing the Next.js major
version, confirm it in the current Amplify SSR support matrix.

## AWS references

- Build instance sizes: <https://docs.aws.amazon.com/amplify/latest/userguide/custom-build-instance.html>
- Next.js deployments: <https://docs.aws.amazon.com/amplify/latest/userguide/deploy-nextjs-app.html>
- Build specification and cache paths: <https://docs.aws.amazon.com/amplify/latest/userguide/yml-specification-syntax.html>
- Managed caching: <https://docs.aws.amazon.com/amplify/latest/userguide/caching.html>
- SSR support matrix: <https://docs.aws.amazon.com/amplify/latest/userguide/ssr-amplify-support.html>
