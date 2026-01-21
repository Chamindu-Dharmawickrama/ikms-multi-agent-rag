#!/usr/bin/env python3
"""
Keep-Alive Script for Railway Deployment

This script pings your Railway app every 5 minutes to prevent cold starts.
Run this on your local machine or a free service like:
- GitHub Actions (free)
- Render Cron Jobs (free)
- Railway Cron (built-in)

Usage:
    python keep_alive.py https://your-app.railway.app
"""

import sys
import time
import urllib.request
import urllib.error
from datetime import datetime

def ping_app(url: str) -> bool:
    """Ping the application health endpoint.
    
    Args:
        url: Base URL of the application
        
    Returns:
        True if successful, False otherwise
    """
    health_url = f"{url.rstrip('/')}/health"
    
    try:
        with urllib.request.urlopen(health_url, timeout=10) as response:
            status = response.status
            if status == 200:
                print(f"[{datetime.now()}] Ping successful - App is alive")
                return True
            else:
                print(f"[{datetime.now()}] Unexpected status: {status}")
                return False
    except urllib.error.URLError as e:
        print(f"[{datetime.now()}] Ping failed: {e}")
        return False
    except Exception as e:
        print(f"[{datetime.now()}] Error: {e}")
        return False

def main():
    """Main keep-alive loop."""
    if len(sys.argv) < 2:
        print("Usage: python keep_alive.py <app-url>")
        print("Example: python keep_alive.py https://your-app.railway.app")
        sys.exit(1)
    
    app_url = sys.argv[1]
    interval = int(sys.argv[2]) if len(sys.argv) > 2 else 300  # 5 minutes default
    
    print("=" * 60)
    print("Keep-Alive Service Started")
    print("=" * 60)
    print(f"Target URL: {app_url}")
    print(f"Ping Interval: {interval} seconds ({interval // 60} minutes)")
    print(f"Health Endpoint: {app_url}/health")
    print("=" * 60)
    print("\nPress Ctrl+C to stop\n")
    
    try:
        while True:
            ping_app(app_url)
            time.sleep(interval)
    except KeyboardInterrupt:
        print(f"\n\n[{datetime.now()}] Keep-Alive service stopped")
        sys.exit(0)

if __name__ == "__main__":
    main()
