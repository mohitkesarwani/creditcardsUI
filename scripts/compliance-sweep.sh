#!/usr/bin/env bash
# Pre-launch compliance grep — runs against the codebase to catch risky
# user-facing copy before it ships. Inspired by the iSelect $8.5M and
# Choosi 2025 patterns documented in BUSINESS-PLAN/09-Legal-Audit.md.
#
# Exit 0 = clean (safe to ship)
# Exit 1 = at least one risky pattern found — review each hit by hand
#
# Run from creditcardsUI/ root:   bash scripts/compliance-sweep.sh

set -u

cd "$(dirname "$0")/.."

YELLOW='\033[33m'
RED='\033[31m'
GREEN='\033[32m'
RESET='\033[0m'

EXIT=0

SCAN_DIRS="src/pages src/components"
SCAN_EXTS="--include=*.jsx --include=*.js --include=*.tsx --include=*.ts"

note() {
  local sev="$1"; shift
  local label="$1"; shift
  local pattern="$1"; shift
  local rationale="$1"; shift
  local color=$YELLOW
  [ "$sev" = "BLOCK" ] && color=$RED

  hits=$(grep -rnE $SCAN_EXTS "$pattern" $SCAN_DIRS 2>/dev/null \
         | grep -vE "//|\\*|test/" \
         | head -5)
  if [ -n "$hits" ]; then
    echo -e "${color}${sev}${RESET} ${label}"
    echo "  Why: $rationale"
    echo "$hits" | sed 's/^/    /'
    echo ""
    [ "$sev" = "BLOCK" ] && EXIT=1
  fi
}

echo "═══════════════════════════════════════════════════════════════"
echo "  RewardRadar pre-launch compliance sweep"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Each rule below is a WARN by default. The script's job is to surface
# candidate copy for human review — context matters. A grep alone can't
# tell whether "right for you" is a violation (saying it OURSELVES) or a
# legitimate disclaimer (telling the user to ask if it's right for them).
# BLOCK status is reserved for patterns that are NEVER OK regardless of
# context (e.g. asserting we hold a licence we don't).

# ── Suitability / advice triggers — review whether WE are saying this or
#    whether we're inside a disclaimer telling the user to seek advice ──────
note WARN "Suitability language: 'best for you' / 'right for you' / 'perfect for you'" \
  "(this (card|loan|deposit|product) is (the )?(best|right|perfect) for you|find (a |the )?(card|loan|product) (that's |that is )?(right|perfect) for you|our (best|top) pick for you)" \
  "Suggests we're assessing personal circumstances. OK when in a disclaimer ('consider whether it's right for you') — not OK as a positive claim about a product."

# ── Superlatives without substantiation (iSelect / Compare The Market pattern) ─
note WARN "Unsubstantiated superlatives in marketing copy" \
  "(>|>=)\s*['\"](the )?(best|biggest|cheapest|fastest|highest|lowest|widest)" \
  "Superlative claims attract ACL s18 / ASIC Act s12DA scrutiny — must be substantiable at time of publication."

# ── 'All' / 'compare all' claims that must be auditable ────────────────────
note WARN "'Compare all' / 'every product' claims" \
  "compare all (issuer|bank|product|card|loan|deposit)|compare every (issuer|bank|product|card|loan|deposit)" \
  "iSelect \$8.5M penalty (2018) was for a 'compare all' claim that wasn't true. Confirm we actually do."

# ── 'Save' / 'earn' promises (EnergyWatch \$1.95M pattern) ──────────────────
note WARN "Unsubstantiated savings / earnings claims" \
  "(save up to|save (over|more than)|earn (over|up to)) \\\$|guaranteed (savings|return|approval)" \
  "EnergyWatch \$1.95M penalty (+ \$65k personal director fine) was for unsubstantiated savings claims."

# ── Personal info collection on listing pages (would break mere-info posture)
note BLOCK "Sensitive personal-info inputs on browse/result pages" \
  "name=['\"](income|credit_score|account_number|date_of_birth|tfn|ssn|driver_licence|medicare)" \
  "Collecting personal financial info turns us into a credit-assistance provider (ACL required)."

# ── Fake urgency / scarcity (deceptive-conduct risk) ───────────────────────
note WARN "Fake urgency / scarcity tactics" \
  "(\d+ people viewing|act now|limited time only|only \d+ left|hurry, this) " \
  "ACL prohibits misleading scarcity claims even on legitimate offers."

# ── Asserting we hold a licence we don't have ──────────────────────────────
note BLOCK "Claims that RewardRadar holds a licence" \
  "(RewardRadar (is|holds|has) an? (ACL|AFSL|Australian Credit Licen[cs]e|Australian Financial Services Licen[cs]e))|(we are licen[cs]ed (under|to provide))" \
  "We don't have an ACL or AFSL. Saying we do is a strict liability misrepresentation."

# ── Hero / marketing using personalisation language ────────────────────────
note WARN "Marketing copy implying personalised matching" \
  "(your perfect|tailored to you|matched to your|find your perfect match|customised for you)" \
  "Personalisation language implies advice. Use 'compare', 'browse', 'shortlist' instead."

# ── Done ───────────────────────────────────────────────────────────────────
if [ $EXIT -eq 0 ]; then
  echo -e "${GREEN}✓ No blocking issues found.${RESET}"
  echo "  Review any WARN hits above by hand; they're context-dependent."
fi

exit $EXIT
