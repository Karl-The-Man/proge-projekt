"""
Simple script to test Suno API connection and backend setup

This script verifies:
1. Environment variables are loaded correctly
2. Suno API key is valid
3. Can connect to Suno API
"""

import sys
from pathlib import Path

try:
    from dotenv import load_dotenv
    import httpx
    import os
except ImportError:
    print("Error: Required packages not installed")
    print("Run: pip install -r requirements.txt")
    sys.exit(1)

# Load environment variables
load_dotenv()

# Check environment variables
print("=" * 60)
print("Environment Configuration Check")
print("=" * 60)

required_vars = {
    "SUNO_API_KEY": os.getenv("SUNO_API_KEY"),
    "SUNO_API_BASE_URL": os.getenv("SUNO_API_BASE_URL"),
    "PUBLIC_BASE_URL": os.getenv("PUBLIC_BASE_URL"),
}

all_configured = True
for var_name, var_value in required_vars.items():
    if not var_value:
        print(f"❌ {var_name}: NOT SET")
        all_configured = False
    elif var_name == "SUNO_API_KEY":
        # Hide API key for security
        masked = var_value[:8] + "*" * (len(var_value) - 8)
        print(f"✓ {var_name}: {masked}")
    else:
        print(f"✓ {var_name}: {var_value}")

if not all_configured:
    print("\n❌ Configuration incomplete!")
    print("Please create a .env file based on .env.example")
    sys.exit(1)

print("\n" + "=" * 60)
print("Suno API Connection Test")
print("=" * 60)

# Test Suno API connection
try:
    headers = {
        "Authorization": f"Bearer {os.getenv('SUNO_API_KEY')}",
        "Content-Type": "application/json"
    }

    # Try to get remaining credits (simple API call to verify connection)
    response = httpx.get(
        f"{os.getenv('SUNO_API_BASE_URL')}/api/v1/generate/remaining-credits",
        headers=headers,
        timeout=10.0
    )

    if response.status_code == 200:
        data = response.json()
        print(f"✓ Connection successful!")
        print(f"✓ API Status: {data.get('msg', 'OK')}")

        # Try to extract credit info if available
        credits_data = data.get('data', {})
        if credits_data:
            print(f"✓ Credits remaining: {credits_data.get('credits', 'Unknown')}")
    elif response.status_code == 401:
        print("❌ Authentication failed!")
        print("Your SUNO_API_KEY is invalid or expired")
        print("Get a new key from: https://sunoapi.org/api-key")
        sys.exit(1)
    else:
        print(f"⚠️ Unexpected response: {response.status_code}")
        print(f"Response: {response.text}")

except httpx.TimeoutException:
    print("❌ Connection timeout!")
    print("Check your internet connection and firewall settings")
    sys.exit(1)
except httpx.ConnectError:
    print("❌ Cannot connect to Suno API!")
    print("Check your internet connection")
    sys.exit(1)
except Exception as e:
    print(f"❌ Error: {str(e)}")
    sys.exit(1)

print("\n" + "=" * 60)
print("Local Setup Check")
print("=" * 60)

# Check upload directory
upload_dir = Path(os.getenv("UPLOAD_DIR", "./uploads"))
if upload_dir.exists():
    print(f"✓ Upload directory exists: {upload_dir.absolute()}")
else:
    print(f"⚠️ Upload directory will be created: {upload_dir.absolute()}")

# Check public URL
public_url = os.getenv("PUBLIC_BASE_URL")
if "localhost" in public_url or "127.0.0.1" in public_url:
    print(f"⚠️ PUBLIC_BASE_URL is set to localhost: {public_url}")
    print("   This will NOT work with Suno API!")
    print("   You need to use ngrok or deploy to a public server")
    print("   Run: ngrok http 8000")
    print("   Then update PUBLIC_BASE_URL in .env with your ngrok URL")
else:
    print(f"✓ PUBLIC_BASE_URL is publicly accessible: {public_url}")

print("\n" + "=" * 60)
print("Setup Complete!")
print("=" * 60)
print("\nTo start the backend:")
print("  python main.py")
print("\nTo start ngrok (if needed):")
print("  ngrok http 8000")
print("\nAPI Documentation:")
print("  http://localhost:8000/docs")
print("=" * 60)
