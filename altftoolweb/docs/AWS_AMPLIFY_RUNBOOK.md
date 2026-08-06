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

Effective public web build settings (pinned by `amplify.yml`, which takes
precedence over same-named app environment variables during the build phase):

- `ALTFT_NODE_MAX_OLD_SPACE_SIZE=10240`
- `ALTFT_BUILD_CPUS=1`
- `ALTFT_WEBPACK_BUILD_WORKER=true`
- `ALTFT_PARALLEL_MINIFY=false` (effective because the CPU count is one)
- `NEXT_TELEMETRY_DISABLED=1`

Admin build environment:

- `ALTFT_NODE_MAX_OLD_SPACE_SIZE=12288`
- `NEXT_TELEMETRY_DISABLED=1`

The web build keeps Next's webpack compiler isolated in its sequential child
worker while page-data work stays single-threaded. The child inherits
`NODE_OPTIONS`, including the 10 GiB old-space ceiling. A 12 GiB ceiling left
too little of the `LARGE_16GB` instance for the Next parent, native allocations,
buffers and artifact packaging; repeated compiler `SIGKILL` exits were the
kernel enforcing the instance limit, not V8 reporting an exhausted heap. The
10 GiB ceiling is high enough for the current route graph. Lowering old space
by 2 GiB kept observed total/native RSS within the builder limit; old-space
size is not a total-process RSS limit.

Validation baseline (2026-08-06): the exact command below completed on Node
24.15.0 and Next 16.3.0, compiled webpack in 2.1 minutes, generated all 4,733
pages and produced a 174.72 MiB Amplify artifact against the 184 MiB gate. The
isolated compiler child peaked at about 14.1 GiB RSS on macOS. RSS accounting is
platform-specific, but that measurement demonstrates why a 10 GiB V8 ceiling
does not imply that the process consumes only 10 GiB in total.

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
NEXT_PRIVATE_STANDALONE=true \
ALTFT_DEFER_BULK_PRERENDER=true \
ALTFT_NODE_MAX_OLD_SPACE_SIZE=10240 \
ALTFT_BUILD_CPUS=1 \
ALTFT_WEBPACK_BUILD_WORKER=true \
ALTFT_PARALLEL_MINIFY=false \
npm run build

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

The public web build is already in its conservative mode: one CPU, sequential
webpack compiler workers and no parallel minification. If it becomes unstable,
first distinguish a V8 heap error from a worker `SIGKILL`. A V8 heap error means
the graph needs reducing before its ceiling is raised; a `SIGKILL` means total
instance memory was exhausted, so raising old space makes the failure more
likely. Reproduce with the exact command above and change the ceiling only in
measured 512 MiB steps while keeping `amplify.yml`, the wrapper default and this
runbook aligned.

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
