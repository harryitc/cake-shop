#!/bin/bash

# ==============================================================================
# 🎂 Cake Shop - Development Runner (No dependencies version)
# ==============================================================================

# Cleanup function to kill all child processes when the script is stopped
cleanup() {
    echo -e "\n🛑 Stopping all services..."
    # Kill the entire process group
    kill -- -$$ 2>/dev/null
}

# Trap SIGINT (Ctrl+C) and SIGTERM
trap cleanup SIGINT SIGTERM EXIT

echo "--------------------------------------------------------"
echo "🎂 Starting Cake Shop Development Environment..."
echo "--------------------------------------------------------"

# 1. Start MongoDB via Docker if it's not already running (optional but useful)
# if [ "$(docker ps -q -f name=mongodb)" ]; then
#     echo "📦 MongoDB is already running."
# else
#     echo "📦 Starting MongoDB infrastructure..."
#     docker-compose up -d
# fi

# 2. Function to run a command and prefix its output
run_with_prefix() {
    local name=$1
    local color_code=$2
    local command=$3
    local dir=$4

    echo "🚀 Starting $name..."
    cd "$dir" && eval "$command" 2>&1 | sed "s/^/\x1b[${color_code}m[$name]\x1b[0m /" &
}

# 3. Start the services
# Note: Color codes: 35=Magenta, 32=Green, 34=Blue
run_with_prefix "SERVER" "35" "npm run dev" "web-server"
run_with_prefix "USER"   "32" "npm run dev" "web-client/user"
run_with_prefix "ADMIN"  "34" "npm run dev" "web-client/admin"

# Keep the script running
wait
