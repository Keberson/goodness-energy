"""
Сервис для автоматической модерации контента через LLM (OpenRouter)
"""
import os
import json
import httpx
import logging
from typing import Optional, Dict, Any
from datetime import datetime

logger = logging.getLogger(__name__)

# Настройки OpenRouter API
# Поддерживаем два варианта названия переменной:
# - OPENROUTER_API_KEY (основное)
# - OPEN_ROUTER_KEY (как в .llmenv)
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY") or os.getenv("OPEN_ROUTER_KEY")
OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"

# Модель по умолчанию (можно использовать более дешевую модель для модерации)
# Например: "google/gemini-flash-1.5" или "anthropic/claude-3-haiku"
DEFAULT_MODEL = os.getenv("OPENROUTER_MODEL", "tngtech/deepseek-r1t2-chimera:free")


async def moderate_content(
    title: str,
    text: str,
    annotation: Optional[str] = None
) -> Dict[str, Any]:
    """
    Модерирует контент новости через LLM.
    
    Args:
        title: Заголовок новости
        text: Текст новости
        annotation: Аннотация новости (опционально)
    
    Returns:
        Dict с результатами модерации:
        {
            "approved": bool,  # Одобрено ли содержимое
            "reason": str,  # Причина одобрения/отклонения
            "confidence": float,  # Уверенность модели (0-1)
            "issues": List[str]  # Список найденных проблем (если есть)
        }
    """
    if not OPENROUTER_API_KEY:
        logger.warning("OPENROUTER_API_KEY не установлен, пропускаем автоматическую модерацию")
        return {
            "approved": True,  # По умолчанию одобряем, если модерация недоступна
            "reason": "Автоматическая модерация недоступна (API ключ не установлен)",
            "confidence": 0.0,
            "issues": []
        }
    
    # Формируем полный текст для модерации
    full_content = f"Заголовок: {title}\n"
    if annotation:
        full_content += f"Аннотация: {annotation}\n"
    full_content += f"Текст: {text}"
    
    # Промпт для модерации.
    # Используем двойные фигурные скобки в JSON-примере, чтобы .format не пытался
    # интерпретировать их как плейсхолдеры. Плейсхолдер только {content}.
    moderation_prompt = """Ты модератор контента для платформы волонтерства и благотворительности. 
Проверь следующий текст на соответствие правилам:

1. Отсутствие оскорблений, ненормативной лексики, разжигания ненависти
2. Отсутствие спама, рекламы, мошенничества
3. Соответствие тематике волонтерства и благотворительности
4. Отсутствие политической агитации (кроме благотворительных инициатив)
5. Отсутствие контента для взрослых

Ответь в формате JSON:
{{
    "approved": true/false,
    "reason": "краткое объяснение",
    "confidence": 0.0-1.0,
    "issues": ["список проблем, если есть"]
}}

Текст для проверки:
{content}"""

    try:
        # Экранируем фигурные скобки в самом контенте, чтобы .format не падал,
        # если в новости вдруг встретятся { или }.
        safe_content = full_content.replace("{", "{{").replace("}", "}}")

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                OPENROUTER_API_URL,
                headers={
                    "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                    "Content-Type": "application/json",
                    # В HTTP-заголовках должны быть только ASCII-символы
                    "HTTP-Referer": os.getenv("OPENROUTER_REFERER", "https://goodness-energy.ru"),
                    "X-Title": "Goodness Energy - Auto Moderation",
                },
                json={
                    "model": DEFAULT_MODEL,
                    "messages": [
                        {
                            "role": "system",
                            "content": "Ты помощник модератора контента. Отвечай только валидным JSON."
                        },
                        {
                            "role": "user",
                            "content": moderation_prompt.format(content=safe_content)
                        }
                    ],
                    "temperature": 0.3,  # Низкая температура для более детерминированных ответов
                    "max_tokens": 500
                }
            )
            
            response.raise_for_status()
            result = response.json()
            
            # Извлекаем ответ модели
            content = result.get("choices", [{}])[0].get("message", {}).get("content", "")
            
            # Парсим JSON из ответа
            # Убираем markdown форматирование, если есть
            content = content.strip()
            if content.startswith("```json"):
                content = content[7:]
            if content.startswith("```"):
                content = content[3:]
            if content.endswith("```"):
                content = content[:-3]
            content = content.strip()
            
            moderation_result = json.loads(content)
            
            logger.info(f"Модерация завершена: approved={moderation_result.get('approved')}, confidence={moderation_result.get('confidence')}")
            
            return {
                "approved": bool(moderation_result.get("approved", False)),
                "reason": moderation_result.get("reason", "Проверка завершена"),
                "confidence": float(moderation_result.get("confidence", 0.5)),
                "issues": moderation_result.get("issues", [])
            }
            
    except json.JSONDecodeError as e:
        logger.error(f"Ошибка парсинга JSON ответа от LLM: {e}")
        logger.error(f"Содержимое ответа: {content[:500]}")
        # В случае ошибки парсинга одобряем контент, но логируем
        return {
            "approved": True,
            "reason": "Ошибка парсинга ответа модерации, контент одобрен автоматически",
            "confidence": 0.0,
            "issues": []
        }
    except httpx.HTTPStatusError as e:
        logger.error(f"Ошибка HTTP при запросе к OpenRouter: {e.response.status_code} - {e.response.text}")
        return {
            "approved": True,  # В случае ошибки одобряем, чтобы не блокировать публикацию
            "reason": f"Ошибка API модерации: {e.response.status_code}",
            "confidence": 0.0,
            "issues": []
        }
    except Exception as e:
        logger.error(f"Неожиданная ошибка при модерации: {e}", exc_info=True)
        return {
            "approved": True,  # В случае ошибки одобряем
            "reason": f"Ошибка модерации: {str(e)}",
            "confidence": 0.0,
            "issues": []
        }

