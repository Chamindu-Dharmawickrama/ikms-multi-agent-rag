#!/usr/bin/env python3
"""
Pre-deployment validation script for Railway.
Run this locally to verify all requirements are met before deploying.
"""

import sys
import os
from pathlib import Path

def check_env_file():
    """Check if .env file exists and has required variables."""
    print("\n🔍 Checking .env file...")
    
    env_path = Path(".env")
    if not env_path.exists():
        print("  ⚠️  Warning: .env file not found (Railway uses Variables instead)")
        return True
    
    required_vars = [
        "OPENAI_API_KEY",
        "PINECONE_API_KEY",
        "PINECONE_INDEX_NAME",
        "DATABASE_URL"
    ]
    
    with open(env_path) as f:
        content = f.read()
    
    missing = []
    for var in required_vars:
        if var not in content:
            missing.append(var)
    
    if missing:
        print(f"  ❌ Missing variables: {', '.join(missing)}")
        return False
    
    print("  ✅ .env file looks good")
    return True

def check_dependencies():
    """Check if all required packages are importable."""
    print("\n🔍 Checking Python dependencies...")
    
    required_packages = {
        "fastapi": "FastAPI",
        "uvicorn": "Uvicorn",
        "langchain": "LangChain",
        "psycopg": "PostgreSQL driver",
        "pydantic_settings": "Pydantic Settings",
        "pinecone": "Pinecone client"
    }
    
    missing = []
    for package, name in required_packages.items():
        try:
            __import__(package)
            print(f"  ✅ {name}")
        except ImportError:
            print(f"  {name} not installed")
            missing.append(package)
    
    if missing:
        print(f"\n  Install missing packages:")
        print(f"  pip install {' '.join(missing)}")
        return False
    
    return True

def check_files():
    """Check if all required files exist."""
    print("\n🔍 Checking required files...")
    
    required_files = [
        "requirements.txt",
        "Dockerfile",
        "Procfile",
        "runtime.txt",
        "src/app/main.py",
        "src/app/core/config.py"
    ]
    
    missing = []
    for file_path in required_files:
        path = Path(file_path)
        if path.exists():
            print(f"  {file_path}")
        else:
            print(f"  {file_path} not found")
            missing.append(file_path)
    
    return len(missing) == 0

def check_dockerfile():
    """Verify Dockerfile has correct CMD."""
    print("\n🔍 Checking Dockerfile configuration...")
    
    with open("Dockerfile") as f:
        content = f.read()
    
    # Check for correct CMD
    if "CMD uvicorn src.app.main:server --host 0.0.0.0 --port $PORT" in content:
        print("  CMD uses $PORT correctly")
        return True
    else:
        print("  CMD might not use PORT variable correctly")
        return False

def check_requirements():
    """Verify requirements.txt has all needed packages."""
    print("\n Checking requirements.txt...")
    
    with open("requirements.txt") as f:
        content = f.read()
    
    critical_packages = [
        "fastapi",
        "uvicorn",
        "pydantic-settings",
        "langchain",
        "psycopg"
    ]
    
    missing = []
    for package in critical_packages:
        if package not in content:
            missing.append(package)
            print(f"  {package} not in requirements.txt")
        else:
            print(f"  {package}")
    
    return len(missing) == 0

def main():
    """Run all validation checks."""
    print("=" * 60)
    print("Railway Deployment Pre-flight Checks")
    print("=" * 60)
    
    # Change to backend directory if needed
    if Path("backend").exists():
        os.chdir("backend")
        print("\nChanged to backend directory")
    
    checks = [
        ("Files", check_files),
        ("Dockerfile", check_dockerfile),
        ("Requirements", check_requirements),
        ("Dependencies", check_dependencies),
        ("Environment", check_env_file)
    ]
    
    results = []
    for name, check_func in checks:
        try:
            results.append(check_func())
        except Exception as e:
            print(f"\n  {name} check failed: {e}")
            results.append(False)
    
    print("\n" + "=" * 60)
    if all(results):
        print("All checks passed! Ready to deploy to Railway.")
        print("=" * 60)
        print("\nNext steps:")
        print("1. git add .")
        print("2. git commit -m 'Fix deployment issues'")
        print("3. git push origin main")
        print("4. Railway will auto-deploy")
        return 0
    else:
        print("Some checks failed. Fix the issues above before deploying.")
        print("=" * 60)
        return 1

if __name__ == "__main__":
    sys.exit(main())
