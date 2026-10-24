"""Optional server-side SanghaMitra API for the static GitHub Pages frontend.

Providers (updated 2026-10-24): OpenAI-compatible chat completions OR
Google Gemini. Choose with AI_PROVIDER=openai|gemini (default: whichever
API key is configured; OpenAI takes precedence when both are set).

Run from the repository root:
    uvicorn server.sanghamitra_api:app --host 127.0.0.1 --port 8000

Keep API keys (OPENAI_API_KEY / GEMINI_API_KEY or GOOGLE_API_KEY) on the
server only. Never put them in frontend JavaScript. For Vertex AI /
Dialogflow, front this same /api/chat contract with your own adapter so
the static frontend does not change.
"""
from __future__ import annotations

import json
import os
import re
from pathlib import Path
from typing import Any

import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator

ROOT = Path(__file__).resolve().parents[1]
PROMPT_PATH = ROOT / "docs" / "sanghamitra-system-prompt.md"
DATA_PATH = ROOT / "data" / "heritage-sites.json"

APP_NAME = "SanghaMitra Heritage Guide API"
MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
API_URL = os.getenv("OPENAI_CHAT_COMPLETIONS_URL", "https://api.openai.com/v1/chat/completions")
API_KEY = os.getenv("OPENAI_API_KEY", "")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "") or os.getenv("GOOGLE_API_KEY", "")
GEMINI_API_URL = os.getenv(
    "GEMINI_API_URL",
    "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent",
)
_provider_env = os.getenv("AI_PROVIDER", "").strip().lower()
if _provider_env in ("openai", "gemini"):
    AI_PROVIDER = _provider_env
elif API_KEY:
    AI_PROVIDER = "openai"
elif GEMINI_API_KEY:
    AI_PROVIDER = "gemini"
else:
    AI_PROVIDER = "openai"  # unconfigured; chat() returns 503 with guidance
MAX_MESSAGE_CHARS = 500

def _load_prompt() -> str:
    try:
        return PROMPT_PATH.read_text(encoding="utf-8")
    except OSError:
        return (
            "You are SanghaMitra, a bilingual Bengali and English guide to Buddhist heritage "
            "in Bangladesh. Do not invent dates, coordinates, historical claims, prices, "
            "hours, service availability or transport schedules. Cite provided sources. "
            "Preserve privacy and encourage respectful monastery visits."
        )

def _load_sites() -> dict[str, dict[str, Any]]:
    try:
        raw = json.loads(DATA_PATH.read_text(encoding="utf-8"))
        records = raw.get("records", []) if isinstance(raw, dict) else raw
        return {
            str(item.get("id")): item
            for item in records
            if isinstance(item, dict) and item.get("id")
        }
    except (OSError, json.JSONDecodeError, AttributeError, TypeError):
        return {}

SYSTEM_PROMPT = _load_prompt()
SITES = _load_sites()

app = FastAPI(
    title=APP_NAME,
    version="2.0.0",
    description="Optional server-side bilingual heritage guide. API credentials remain server-side.",
)

configured_origins = [
    value.strip()
    for value in os.getenv(
        "ALLOWED_ORIGINS",
        "http://localhost:8000,http://127.0.0.1:8000",
    ).split(",")
    if value.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=configured_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)

class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=MAX_MESSAGE_CHARS)
    language: str = Field(default="bn", pattern="^(bn|en)$")
    site_id: str | None = Field(default=None, max_length=160)
    origin: str | None = Field(default=None, max_length=200)

    @field_validator("message")
    @classmethod
    def message_must_not_be_blank(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("Message must not be blank.")
        return cleaned

    @field_validator("site_id")
    @classmethod
    def site_id_is_trimmed(cls, value: str | None) -> str | None:
        return value.strip() if value else None

class SourceLink(BaseModel):
    title: str
    url: str

class ChatResponse(BaseModel):
    answer: str
    language: str
    sources: list[SourceLink] = []
    disclaimer: str = (
        "Current routes, prices, opening hours and nearby-service availability must be verified."
    )

def _site_context(site_id: str | None) -> tuple[str, list[SourceLink]]:
    if not site_id or site_id not in SITES:
        return "No specific site was selected. Ask the visitor which site or town they mean when needed.", []
    site = SITES[site_id]
    history = site.get("history") or ""
    summary = site.get("summary") or ""
    era = site.get("historical_era") or "Not confirmed"
    note = site.get("verification_note") or ""
    source_url = site.get("source_url")
    source_label = site.get("source_label") or "Heritage record source"
    location = site.get("location_lat_long")
    coordinates = (
        f"latitude={location.get('latitude')}, longitude={location.get('longitude')}"
        if isinstance(location, dict) else "Coordinates unavailable"
    )
    context = (
        f"Selected site: {site.get('name')} (id={site.get('id')}).\n"
        f"District: {site.get('district') or 'unknown'}; division: {site.get('division') or 'unknown'}.\n"
        f"Category: {site.get('category') or site.get('type') or 'unknown'}.\n"
        f"Historical era field: {era}.\n"
        f"Coordinate note: {note}; {coordinates}.\n"
        f"Summary: {summary}\nHistory: {history}\n"
        "Treat this entry as a community directory record; do not inflate it into a complete national census. "
        "Do not assign dynasties, archaeological discoveries or dates beyond the supplied evidence."
    )
    links: list[SourceLink] = []
    if isinstance(source_url, str) and source_url.startswith(("https://", "http://")):
        links.append(SourceLink(title=source_label, url=source_url))
    return context, links

async def _call_openai(system_text: str, user_content: str) -> str:
    payload = {
        "model": MODEL,
        "temperature": 0.2,
        "max_tokens": 900,
        "messages": [
            {"role": "system", "content": system_text},
            {"role": "user", "content": user_content},
        ],
    }
    async with httpx.AsyncClient(timeout=httpx.Timeout(35.0, connect=8.0)) as client:
        response = await client.post(
            API_URL,
            headers={"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"},
            json=payload,
        )
        response.raise_for_status()
        body = response.json()
    try:
        return body["choices"][0]["message"]["content"]
    except (KeyError, IndexError, TypeError) as exc:
        raise HTTPException(status_code=502, detail="AI provider returned an unexpected response.") from exc


async def _call_gemini(system_text: str, user_content: str) -> str:
    """Google Gemini (AI Studio API). For Vertex AI, point GEMINI_API_URL at
    your Vertex endpoint through an authenticated proxy; do not expose
    service-account credentials to the browser."""
    url = GEMINI_API_URL.format(model=GEMINI_MODEL)
    payload = {
        "systemInstruction": {"parts": [{"text": system_text}]},
        "contents": [{"role": "user", "parts": [{"text": user_content}]}],
        "generationConfig": {"temperature": 0.2, "maxOutputTokens": 900},
    }
    async with httpx.AsyncClient(timeout=httpx.Timeout(35.0, connect=8.0)) as client:
        response = await client.post(
            url,
            headers={"Content-Type": "application/json", "x-goog-api-key": GEMINI_API_KEY},
            json=payload,
        )
        response.raise_for_status()
        body = response.json()
    try:
        parts = body["candidates"][0]["content"]["parts"]
        return "".join(part.get("text", "") for part in parts if isinstance(part, dict))
    except (KeyError, IndexError, TypeError) as exc:
        raise HTTPException(status_code=502, detail="AI provider returned an unexpected response.") from exc


@app.get("/health")
async def health() -> dict[str, Any]:
    return {
        "ok": True,
        "service": APP_NAME,
        "provider": AI_PROVIDER,
        "model": GEMINI_MODEL if AI_PROVIDER == "gemini" else MODEL,
        "model_configured": bool(GEMINI_API_KEY) if AI_PROVIDER == "gemini" else bool(API_KEY),
        "heritage_records_loaded": len(SITES),
    }

@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest) -> ChatResponse:
    configured = bool(GEMINI_API_KEY) if AI_PROVIDER == "gemini" else bool(API_KEY)
    if not configured:
        raise HTTPException(
            status_code=503,
            detail=(
                "Server AI is not configured. Use the built-in local guide or set "
                "OPENAI_API_KEY (AI_PROVIDER=openai) or GEMINI_API_KEY (AI_PROVIDER=gemini) on the server."
            ),
        )
    context, sources = _site_context(request.site_id)
    language_instruction = (
        "Answer in Bengali (বাংলা)."
        if request.language == "bn"
        else "Answer in English."
    )
    origin_instruction = (
        f"The visitor's stated origin is: {request.origin}. Use it only for trip planning."
        if request.origin else "The visitor has not supplied a starting location."
    )
    user_content = (
        f"Visitor language preference: {request.language}.\n"
        f"{origin_instruction}\n"
        f"Selected heritage record:\n{context}\n\n"
        f"Visitor question: {request.message}"
    )
    system_text = (
        SYSTEM_PROMPT + "\n\n" + language_instruction
        + "\nUse the selected record/source context; do not assume live route or service results."
    )
    try:
        if AI_PROVIDER == "gemini":
            answer = await _call_gemini(system_text, user_content)
        else:
            answer = await _call_openai(system_text, user_content)
    except httpx.TimeoutException as exc:
        raise HTTPException(status_code=504, detail="SanghaMitra timed out; please retry.") from exc
    except httpx.HTTPStatusError as exc:
        # Avoid returning provider response bodies, which may contain internal request details.
        raise HTTPException(status_code=502, detail="Upstream AI service returned an error.") from exc
    except (httpx.HTTPError, json.JSONDecodeError) as exc:
        raise HTTPException(status_code=502, detail="SanghaMitra provider is unreachable.") from exc
    if not isinstance(answer, str) or not answer.strip():
        raise HTTPException(status_code=502, detail="AI provider returned an empty answer.")
    # Return only source links from the curated record; the assistant's prose is never treated as HTML.
    return ChatResponse(answer=answer.strip(), language=request.language, sources=sources)

@app.get("/")
async def root() -> dict[str, str]:
    return {
        "service": APP_NAME,
        "health": "/health",
        "chat": "/api/chat",
        "docs": "/docs",
    }
