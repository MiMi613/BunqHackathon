from dataclasses import asdict

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from claude_controller import ClaudeController
from transcribe import DEFAULT_TRANSCRIPTION_PROMPT, ImageTranscriber, get_image_transcriber

app = FastAPI(title="BunqHackathon API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "BunqHackathon API is running 🚀"}


@app.get("/api/hello")
def hello(name: str = "World"):
    return {"message": f"Hello, {name}! 👋"}


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.post("/api/receipt/parse")
async def parse_receipt(
    user_prompt: str = Form(...),
    file: UploadFile = File(...),
    transcription_prompt: str = Form(DEFAULT_TRANSCRIPTION_PROMPT),
):
    try:
        image_bytes = await file.read()
        media_type = ImageTranscriber.detect_media_type(
            filename=file.filename,
            content_type=file.content_type,
        )
        print(
            "parse_receipt upload:",
            {
                "filename": file.filename,
                "content_type": file.content_type,
                "media_type": media_type,
                "size_bytes": len(image_bytes),
                "user_prompt": user_prompt,
            },
        )
        receipt_text = get_image_transcriber().transcribe_image_bytes(
            image_bytes,
            media_type=media_type,
            prompt=transcription_prompt,
        )
        print("parse_receipt transcription:\n", receipt_text)
        info, people = ClaudeController.parse_people_from_receipt(
            receipt_text,
            user_prompt,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Receipt parsing failed: {exc}",
        ) from exc
    finally:
        await file.close()

    return {
        "filename": file.filename,
        "media_type": media_type,
        "transcription_prompt": transcription_prompt,
        "user_prompt": user_prompt,
        "receipt_text": receipt_text,
        "info": asdict(info),
        "people": [asdict(person) for person in people],
    }
