#!/usr/bin/env python3
"""
Test the exact same request format as the backend sends
"""

import requests
import json
import base64
from io import BytesIO
from PIL import Image, ImageDraw, ImageFont

def create_exam_image():
    """Create exam image"""
    img = Image.new('RGB', (800, 1100), color='white')
    draw = ImageDraw.Draw(img)
    
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 18)
    except:
        font = ImageFont.load_default()
    
    draw.text((50, 30), "EXAMEN DE MATEMÁTICAS", fill='black', font=font)
    draw.text((50, 100), "1. ¿Cuánto es 15 + 27?", fill='black', font=font)
    draw.text((70, 130), "Respuesta: 42", fill='blue', font=font)
    
    buffer = BytesIO()
    img.save(buffer, format='JPEG', quality=85)
    return base64.b64encode(buffer.getvalue()).decode('utf-8')

# Create image
image_b64 = create_exam_image()
print(f"Image size: {len(image_b64)} characters")

# Exact same format as backend
system_prompt = """Eres un corrector de exámenes experto en el sistema educativo español. 
Re cibirás la imagen de un examen de un estudiante y la rúbrica o respuestas correctas.

Tu tarea:
1. Analizar la imagen del examen y extraer las respuestas del estudiante
2. Comparar cada respuesta con la rúbrica proporcionada
3. Asignar puntuación a cada pregunta (siendo justo pero riguroso)
4. Calcular la nota final sobre 10
5. Proporcionar feedback breve y constructivo por cada pregunta

IMPORTANTE: Responde ÚNICAMENTE con JSON válido. Sin texto adicional. Usa este formato exacto:
{
  "grade": 7.5,
  "maxGrade": 10,
  "totalQuestions": 5,
  "gradeLabel": "Notable",
  "questions": [
    {
      "number": 1,
      "studentAnswer": "respuesta del estudiante",
      "correctAnswer": "respuesta correcta según rúbrica",
      "pointsAwarded": 2.0,
      "maxPoints": 2.0,
      "feedback": "Breve feedback constructivo"
    }
  ]
}"""

user_text = """Asignatura: Matemáticas
Nivel educativo: 3º ESO

Rúbrica / Respuestas correctas:
1. 15 + 27 = 42 (2 puntos)

Por favor, evalúa el examen y devuelve el resultado en formato JSON."""

messages = [
    {"role": "system", "content": system_prompt},
    {
        "role": "user",
        "content": [
            {
                "type": "image_url",
                "image_url": {"url": f"data:image/jpeg;base64,{image_b64}"}
            },
            {"type": "text", "text": user_text}
        ]
    }
]

payload = {
    "model": "gpt-4o",
    "messages": messages,
    "max_tokens": 2000,
    "temperature": 0.3
}

print("\nTesting with exact backend format...")
print(f"Endpoint: https://integrations.emergentagent.com/llm/chat/completions")

response = requests.post(
    'https://integrations.emergentagent.com/llm/chat/completions',
    headers={
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-emergent-d50Fa93BaBfC425400',
        'X-App-ID': 'https://exam-grader-ai-1.preview.emergentagent.com'
    },
    json=payload,
    timeout=60
)

print(f"\nStatus Code: {response.status_code}")

if response.status_code == 200:
    data = response.json()
    content = data.get('choices', [{}])[0].get('message', {}).get('content', '')
    print(f"✅ Success! Response length: {len(content)} chars")
    print(f"Content preview: {content[:500]}")
    
    # Try to extract JSON
    if '```' in content:
        start = content.find('```json')
        if start == -1:
            start = content.find('```')
        end = content.rfind('```')
        if start != -1 and end != -1:
            json_str = content[start:end].replace('```json', '').replace('```', '').strip()
            print(f"\nExtracted JSON: {json_str[:300]}")
    else:
        print(f"\nDirect content: {content[:300]}")
else:
    print(f"❌ Failed with {response.status_code}")
    print(f"Response: {response.text}")
