#!/bin/bash

# Enable strict error handling:
# -e: exit on error
# -u: treat unset variables as error
# -o pipefail: catch errors in piped commands
set -euo pipefail

############################################
#            Logging Functions             #
# Provide consistent and colored output    #
############################################
log_info() {
  echo -e "\033[1;34m[INFO]\033[0m $1"
}

log_warn() {
  echo -e "\033[1;33m[WARN]\033[0m $1"
}

log_error() {
  echo -e "\033[1;31m[ERROR]\033[0m $1"
}

############################################
#        Handle Local Uncommitted Work     #
############################################

# If there are any unstaged or staged changes, stash them
safe_stash() {
  if ! git diff --quiet || ! git diff --cached --quiet; then
    log_info "Uncommitted changes detected. Stashing them temporarily..."
    git stash push -u -m "temp-stash-before-script"
    STASHED=true
  else
    STASHED=false
  fi
}

# Restore stashed changes if needed
restore_stash() {
  if [ "$STASHED" = true ]; then
    log_info "Restoring stashed changes..."
    git stash pop
  fi
}

############################################
#         Parse CLI Arguments              #
############################################

# Modes:
# 1. ./commit-sync.sh default → current branch -> dev3
# 2. ./commit-sync.sh source target → cherry-pick from source -> target
if [[ $# -eq 2 ]]; then
  SOURCE_BRANCH=$1
  TARGET_BRANCH=$2
else
  SOURCE_BRANCH=$(git rev-parse --abbrev-ref HEAD)
  TARGET_BRANCH="dev3"
  log_info "No arguments provided. Using current branch '$SOURCE_BRANCH' as source and 'dev3' as target."
fi

# Prevent cherry-picking into same branch
if [ "$SOURCE_BRANCH" = "$TARGET_BRANCH" ]; then
  log_error "Source and target branches are the same ('$SOURCE_BRANCH'). Cannot cherry-pick into the same branch."
  exit 1
fi

log_info "Source branch: $SOURCE_BRANCH"
log_info "Target branch: $TARGET_BRANCH"

############################################
#        Ensure Git Repository             #
############################################

if ! git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
  log_error "This is not a Git repository. Please run inside a Git repo."
  exit 1
fi

# Save any work-in-progress changes
safe_stash

############################################
#         Fetch Latest Changes             #
############################################

log_info "Fetching latest from origin..."
git fetch origin

# Checkout source and pull latest
log_info "Checking out and pulling latest on source branch '$SOURCE_BRANCH'..."
git checkout "$SOURCE_BRANCH" || {
  log_error "Source branch '$SOURCE_BRANCH' does not exist locally."
  restore_stash
  exit 1
}
git pull origin "$SOURCE_BRANCH"

# Checkout target branch or create it if missing
log_info "Checking out and pulling latest on target branch '$TARGET_BRANCH'..."
if ! git checkout "$TARGET_BRANCH" 2>/dev/null; then
  log_warn "Target branch '$TARGET_BRANCH' does not exist locally. Creating tracking branch..."
  git checkout -b "$TARGET_BRANCH" "origin/$TARGET_BRANCH" || {
    log_error "Failed to checkout or create target branch '$TARGET_BRANCH'."
    restore_stash
    exit 1
  }
fi
git pull origin "$TARGET_BRANCH"

############################################
#         Cherry-Pick Latest Commit        #
############################################

# Get latest commit hash from source branch
log_info "Getting latest commit hash from source branch '$SOURCE_BRANCH'..."
LATEST_COMMIT=$(git rev-parse "$SOURCE_BRANCH")

if [[ -z "$LATEST_COMMIT" ]]; then
  log_error "Could not find latest commit on branch '$SOURCE_BRANCH'."
  restore_stash
  exit 1
fi
log_info "Latest commit hash: $LATEST_COMMIT"

# Switch to target branch
log_info "Switching to target branch '$TARGET_BRANCH'..."
git checkout "$TARGET_BRANCH"

# Attempt to cherry-pick the commit
log_info "Cherry-picking commit $LATEST_COMMIT into $TARGET_BRANCH..."
if git cherry-pick "$LATEST_COMMIT"; then
  log_info "Cherry-pick successful!"
  git push origin "$TARGET_BRANCH"
  log_info "Pushed to origin/$TARGET_BRANCH"
else
  # In case of conflict, notify and show git status
  if git status | grep -q "You are currently cherry-picking"; then
    log_error "Conflict during cherry-pick! Please resolve manually."
    git status --short
    exit 1
  fi
fi

# Restore any previously stashed changes
restore_stash

log_info "Cherry-pick complete from $SOURCE_BRANCH to $TARGET_BRANCH!"
