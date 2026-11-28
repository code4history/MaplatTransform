#!/bin/sh
# 視点変換 ViewpointField 実測（段 1 ②）実行ランナー。
#   sh bench/viewpoint-field/run.sh [0|1|2|3|4|5]...
# 結果は docs/measurements/2026-11-28-viewpoint-field.md へ書き込む。
set -e
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
OUT="${TMPDIR:-/tmp}/maplat-viewpoint-field-bench.mjs"
"$ROOT/node_modules/.bin/esbuild" "$ROOT/bench/viewpoint-field/bench.ts" \
  --bundle --platform=node --format=esm --target=node20 \
  --outfile="$OUT" --log-level=warning
BENCH_ROOT="$ROOT" node "$OUT" "$@"
