#!/bin/bash

# Exit immediately if a command exits with a non-zero status,
# Treat unset variables as an error and exit immediately,
# and Return the exit status of the last command in the pipeline that failed
set -euo pipefail

# === Logging Functions ===

# Logs an informational message in blue
log_info() {
  echo -e "\033[1;34m[INFO]\033[0m $1"
}

# Logs a warning message in yellow
log_warn() {
  echo -e "\033[1;33m[WARN]\033[0m $1"
}

# Logs an error message in red
log_error() {
  echo -e "\033[1;31m[ERROR]\033[0m $1"
}

# === Stashing Functions ===

# Safely stash uncommitted changes if any exist
safe_stash() {
  if ! git diff --quiet || ! git diff --cached --quiet; then
    log_info "Uncommitted changes detected. Stashing them temporarily..."
    git stash push -u -m "temp-stash-before-script"
    STASHED=true
  else
    STASHED=false
  fi
}

# Restore previously stashed changes (if any were stashed)
restore_stash() {
  if [ "$STASHED" = true ]; then
    log_info "Restoring stashed changes..."
    git stash pop
  fi
}

# === Main Script ===

# Ensure we are inside a Git repository
if ! git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
  log_error "This is not a Git repository."
  exit 1
fi

# === Determine Source and Target Branches ===

# If two arguments are passed, use them directly
if [[ $# -eq 2 ]]; then
  SOURCE_BRANCH=$1
  TARGET_BRANCH=$2
  INTERACTIVE=false
else
  # No arguments passed, use current branch as source and 'dev3' as target
  INTERACTIVE=true
  CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
  log_info "Current branch detected: $CURRENT_BRANCH"
  SOURCE_BRANCH=$CURRENT_BRANCH
  TARGET_BRANCH="dev3"
  log_info "No arguments provided. Using current branch '$SOURCE_BRANCH' as source and 'dev3' as target."
fi

# Temporarily stash uncommitted changes
safe_stash

# Fetch latest updates from origin
log_info "Fetching latest from origin..."
git fetch origin

# === Checkout Target Branch ===

log_info "Checking out target branch '$TARGET_BRANCH'..."
# Try to checkout the target branch, or create it if it doesn't exist locally
if ! git checkout "$TARGET_BRANCH" 2>/dev/null; then
  log_warn "Target branch '$TARGET_BRANCH' does not exist locally. Creating..."
  git checkout -b "$TARGET_BRANCH" "origin/$TARGET_BRANCH" || {
    log_error "Failed to checkout or create target branch."
    restore_stash
    exit 1
  }
fi

# === Pull Latest Changes on Target Branch ===

log_info "Pulling latest changes for '$TARGET_BRANCH'..."
# First try a fast-forward pull, fallback to normal pull if needed
if ! git pull --ff-only origin "$TARGET_BRANCH"; then
  log_warn "Fast-forward pull failed. Attempting normal pull..."
  git pull origin "$TARGET_BRANCH" || {
    log_error "Failed to pull '$TARGET_BRANCH'."
    git checkout "$CURRENT_BRANCH"
    restore_stash
    exit 1
  }
fi

# === Rebase and Merge ===

# Rebase source branch onto target branch
log_info "Rebasing '$SOURCE_BRANCH' onto '$TARGET_BRANCH'..."
if git rebase "$TARGET_BRANCH" "$SOURCE_BRANCH"; then
  log_info "Rebase successful. Merging '$SOURCE_BRANCH' into '$TARGET_BRANCH'..."
  git checkout "$TARGET_BRANCH"
  git merge "$SOURCE_BRANCH"
else
  # Rebase conflict handling
  log_error "Rebase conflict occurred! Aborting..."
  git rebase --abort
  git checkout "$CURRENT_BRANCH"
  restore_stash
  exit 1
fi

# === Push to Remote ===

log_info "Pushing changes to origin/$TARGET_BRANCH..."
git push origin "$TARGET_BRANCH"

# === Cleanup and Return ===

# Return to original branch if user ran script interactively
if [ "$INTERACTIVE" = true ]; then
  log_info "Switching back to '$CURRENT_BRANCH'..."
  git checkout "$CURRENT_BRANCH"
fi

# Restore any previously stashed changes
restore_stash

# === Done ===

log_info "✅ '$SOURCE_BRANCH' successfully merged into '$TARGET_BRANCH'"
