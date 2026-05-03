#!/usr/bin/env python3
"""
Direct test of the AI endpoint to see the exact error
"""

import requests
import json
import base64
from io import BytesIO
from PIL import Image, ImageDraw, ImageFont

def create_simple_image():
    """Create a simple test image"""
    img = Image.new('RGB', (400, 300), color='white')
    draw = ImageDraw.Draw(img)
    draw.text((50, 50), "Test Exam", fill='black')
    
    buffer = BytesIO()
    img.save(buffer, format='JPEG', quality=85)
    img_bytes = buffer.getvalue()
    return base64.b64encode(img_bytes).decode('utf-8')

# Test the AI endpoint directly
image_b64 = create_simple_image()

payload = {
    "model": "gpt-4o",
    "messages": [
        {
            "role": "user",
            "content": [
                {
                    "type": "image_url",
                    "image_url": {"url": f"data:image/jpeg;base64,{image_b64}"}
                },
                {"type": "text", "text": "What do you see?"}
            ]
        }
    ],
    "max_tokens": 100
}

print("Testing AI endpoint directly...")
print(f"Endpoint: https://integrations.emergentagent.com/llm/chat/completions")
print(f"API Key: sk-emergent-d50Fa93BaBfC425400")

response = requests.post(
    'https://integrations.emergentagent.com/llm/chat/completions',
    headers={
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-emergent-d50Fa93BaBfC425400',
        'X-App-ID': 'https://exam-grader-ai-1.preview.emergentagent.com'
    },
    json=payload,
    timeout=30
)

print(f"\nStatus Code: {response.status_code}")
print(f"Response Headers: {dict(response.headers)}")
print(f"Response Body: {response.text}")

if response.status_code == 200:
    print("\n✅ AI endpoint is working!")
else:
    print(f"\n❌ AI endpoint failed with {response.status_code}")
