#!/usr/bin/env bash
# GitHub-এ পুশ করার ছোট স্ক্রিপ্ট — টোকেন কোথাও সেভ হয় না।
#
# ব্যবহার:
#   ./push-to-github.sh <TOKEN>                 # ডিফল্ট রিপো ও ব্রাঞ্চ
#   ./push-to-github.sh <TOKEN> owner/repo      # অন্য রিপো
#
# টোকেন বানানোর পাতা: https://github.com/settings/personal-access-tokens/new
#   নাম: charyabhumi-archive-push-2026-11 · মেয়াদ: ৭ দিন
#   Repository access: শুধু Bangladesh-Buddhist-Heritage-Map
#   Permissions → Contents: Read and write
set -euo pipefail

TOKEN="${1:?টোকেন দিন: ./push-to-github.sh ghp_xxx}"
REPO="${2:-Mithun-Mutsuddi/Bangladesh-Buddhist-Heritage-Map}"
BRANCH="${BRANCH:-feat/partner-archive-315}"
CLEAN="https://github.com/${REPO}.git"

cd "$(dirname "$0")"

git remote remove origin 2>/dev/null || true
git remote add origin "https://x-access-token:${TOKEN}@github.com/${REPO}.git"
echo "→ পুশ হচ্ছে: HEAD → ${BRANCH} (${REPO})"
git push -u origin "HEAD:${BRANCH}"
# টোকেন যেন .git/config-এ না থাকে
git remote set-url origin "$CLEAN"
echo "✅ পুশ হয়েছে → ${CLEAN}/tree/${BRANCH}"
echo "   এরপর: GitHub-এ Compare & pull request → main-এ মার্জ করুন।"
