#!/bin/bash

# ==============================================================================
# 🎂 Cake Shop - Web Frontends Runner (User & Admin only)
# ==============================================================================

# Cleanup function to kill all child processes when the script is stopped
cleanup() {
    echo -e "\n🛑 Stopping web frontends..."
    # Kill the entire process group
    kill -- -$$ 2>/dev/null
}

# Trap SIGINT (Ctrl+C) and SIGTERM
trap cleanup SIGINT SIGTERM EXIT

echo "--------------------------------------------------------"
echo "🎂 Starting Cake Shop Frontends (User & Admin)..."
echo "--------------------------------------------------------"

# Function to run a command and prefix its output
run_with_prefix() {
    local name=$1
    local color_code=$2
    local command=$3
    local dir=$4

    echo "🚀 Starting $name..."
    cd "$dir" && eval "$command" 2>&1 | sed "s/^/\x1b[1;${color_code}m[$name]\x1b[0m /" &
}

# 1. Start only the web clients
# Note: Color codes: 32=Green (User), 34=Blue (Admin)
run_with_prefix "USER"   "32" "npm run dev" "web-client/user"
run_with_prefix "ADMIN"  "34" "npm run dev" "web-client/admin"

# Keep the script running
wait
