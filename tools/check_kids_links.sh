#!/usr/bin/env bash
# শিশু ও শিক্ষা তালিকার লিংক যাচাই — সহজ র‍্যাপার
set -euo pipefail
cd "$(dirname "$0")/.."
python3 tools/check_kids_links.py --report docs/kids-link-report.md
echo
echo "রিপোর্ট: docs/kids-link-report.md"
