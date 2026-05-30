import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

# Configure Gemini
api_key = os.getenv("GOOGLE_API_KEY")
print(f"API Key: {api_key[:10]}..." if api_key else "No API key found")

if api_key:
    genai.configure(api_key=api_key)
    
    try:
        # Test with gemini-1.5-flash
        print("\nTesting gemini-1.5-flash...")
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content("Say hello in one word")
        print(f"✅ Success: {response.text}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    try:
        # Test with gemini-1.5-pro
        print("\nTesting gemini-1.5-pro...")
        model = genai.GenerativeModel('gemini-1.5-pro')
        response = model.generate_content("Say hello in one word")
        print(f"✅ Success: {response.text}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # List available models
    print("\n📋 Available models:")
    try:
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                print(f"  - {m.name}")
    except Exception as e:
        print(f"❌ Error listing models: {e}")
else:
    print("❌ No API key found in .env file")
