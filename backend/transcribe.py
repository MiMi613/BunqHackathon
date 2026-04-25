from __future__ import annotations

import argparse
import base64
import io
import json
import os
from dataclasses import asdict
from functools import lru_cache
from pathlib import Path

from claude_controller import ClaudeController
from dotenv import load_dotenv

load_dotenv(Path(__file__).with_name(".env"))

DEFAULT_MODEL = os.getenv(
    "ANTHROPIC_MODEL_TRANSCRIBE",
    os.getenv("ANTHROPIC_MODEL", "claude-opus-4-7"),
)
DEFAULT_TRANSCRIPTION_PROMPT = (
    "Transcribe all visible text in this image. Preserve the original line breaks "
    "and structure as closely as possible. Only return the transcription."
    "if sum of all item prices match the total, to confirm if receipt was read correctly. If not, write ERROR only."
)
MAX_IMAGE_UPLOAD_BYTES = 4_500_000
MAX_IMAGE_EDGE_PX = 1568
MAX_IMAGE_PIXELS = 1_150_000


class ImageTranscriber:
    SUPPORTED_MEDIA_TYPES = {
        "image/gif",
        "image/jpeg",
        "image/png",
        "image/webp",
    }
    _EXTENSION_TO_MEDIA_TYPE = {
        ".gif": "image/gif",
        ".jpeg": "image/jpeg",
        ".jpg": "image/jpeg",
        ".png": "image/png",
        ".webp": "image/webp",
    }
    _FORMAT_TO_MEDIA_TYPE = {
        "JPEG": "image/jpeg",
        "PNG": "image/png",
        "WEBP": "image/webp",
    }

    def __init__(
        self,
        *,
        api_key: str | None = None,
        model: str = DEFAULT_MODEL,
        max_tokens: int = 4096,
    ) -> None:
        try:
            from anthropic import Anthropic
        except ModuleNotFoundError as exc:
            raise RuntimeError(
                "The 'anthropic' package is not installed. Run 'pip install -r backend/requirements.txt'."
            ) from exc

        resolved_api_key = api_key or os.getenv("ANTHROPIC_API_KEY")
        if not resolved_api_key:
            raise RuntimeError(
                "ANTHROPIC_API_KEY is not set. Export it in your shell before running."
            )

        self.client = Anthropic(api_key=resolved_api_key)
        self.model = model
        self.max_tokens = max_tokens

    @classmethod
    def detect_media_type(
        cls,
        filename: str | None = None,
        content_type: str | None = None,
    ) -> str:
        if content_type in cls.SUPPORTED_MEDIA_TYPES:
            return content_type

        if filename:
            extension = Path(filename).suffix.lower()
            if extension in cls._EXTENSION_TO_MEDIA_TYPE:
                return cls._EXTENSION_TO_MEDIA_TYPE[extension]

        raise ValueError(
            "Unsupported image type. Use PNG, JPG, JPEG, WEBP, or GIF."
        )

    def transcribe_image_bytes(
        self,
        image_bytes: bytes,
        *,
        media_type: str,
        prompt: str = DEFAULT_TRANSCRIPTION_PROMPT,
    ) -> str:
        if not image_bytes:
            raise ValueError("Image bytes are empty.")
        if media_type not in self.SUPPORTED_MEDIA_TYPES:
            raise ValueError(
                "Unsupported image type. Use PNG, JPG, JPEG, WEBP, or GIF."
            )

        prepared_bytes, prepared_media_type = self._prepare_image_for_upload(
            image_bytes,
            media_type=media_type,
        )
        image_b64 = base64.b64encode(prepared_bytes).decode("utf-8")
        response = self.client.messages.create(
            model=self.model,
            max_tokens=self.max_tokens,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": prepared_media_type,
                                "data": image_b64,
                            },
                        },
                        {"type": "text", "text": prompt},
                    ],
                }
            ],
        )

        transcription = "\n".join(
            block.text.strip()
            for block in response.content
            if getattr(block, "type", None) == "text" and getattr(block, "text", None)
        ).strip()

        if not transcription:
            raise RuntimeError("Anthropic returned an empty transcription.")

        return transcription

    def _prepare_image_for_upload(
        self,
        image_bytes: bytes,
        *,
        media_type: str,
    ) -> tuple[bytes, str]:
        try:
            from PIL import Image, ImageOps
        except ModuleNotFoundError as exc:
            raise RuntimeError(
                "The 'Pillow' package is required for image resizing. "
                "Run 'pip install -r backend/requirements.txt'."
            ) from exc

        with Image.open(io.BytesIO(image_bytes)) as original_image:
            image = ImageOps.exif_transpose(original_image)
            width, height = image.size
            needs_resize = (
                len(image_bytes) > MAX_IMAGE_UPLOAD_BYTES
                or max(width, height) > MAX_IMAGE_EDGE_PX
                or (width * height) > MAX_IMAGE_PIXELS
            )

            if not needs_resize:
                return image_bytes, media_type

            working = image.copy()

        resize_ratio = min(
            1.0,
            MAX_IMAGE_EDGE_PX / max(working.size),
            (MAX_IMAGE_PIXELS / (working.width * working.height)) ** 0.5,
        )
        if resize_ratio < 1.0:
            resized_width = max(1, int(working.width * resize_ratio))
            resized_height = max(1, int(working.height * resize_ratio))
            working = working.resize(
                (resized_width, resized_height),
                resample=Image.Resampling.LANCZOS,
            )

        has_alpha = (
            working.mode in {"RGBA", "LA"}
            or (working.mode == "P" and "transparency" in working.info)
        )
        output_format = "WEBP" if has_alpha else "JPEG"

        for quality in (85, 75, 65, 55, 45):
            candidate_bytes = self._encode_image(
                working,
                output_format=output_format,
                quality=quality,
            )
            if len(candidate_bytes) <= MAX_IMAGE_UPLOAD_BYTES:
                return candidate_bytes, self._FORMAT_TO_MEDIA_TYPE[output_format]

        shrinking = working
        for _ in range(4):
            next_width = max(1, int(shrinking.width * 0.8))
            next_height = max(1, int(shrinking.height * 0.8))
            shrinking = shrinking.resize(
                (next_width, next_height),
                resample=Image.Resampling.LANCZOS,
            )
            candidate_bytes = self._encode_image(
                shrinking,
                output_format=output_format,
                quality=45,
            )
            if len(candidate_bytes) <= MAX_IMAGE_UPLOAD_BYTES:
                return candidate_bytes, self._FORMAT_TO_MEDIA_TYPE[output_format]

        return candidate_bytes, self._FORMAT_TO_MEDIA_TYPE[output_format]

    def _encode_image(
        self,
        image,
        *,
        output_format: str,
        quality: int,
    ) -> bytes:
        buffer = io.BytesIO()
        save_image = image
        save_kwargs: dict[str, object] = {}

        if output_format == "JPEG":
            save_image = image.convert("RGB")
            save_kwargs = {
                "format": "JPEG",
                "quality": quality,
                "optimize": True,
            }
        elif output_format == "WEBP":
            save_kwargs = {
                "format": "WEBP",
                "quality": quality,
                "method": 6,
            }
        else:
            save_kwargs = {"format": output_format}

        save_image.save(buffer, **save_kwargs)
        return buffer.getvalue()

    def transcribe_image_file(
        self,
        image_path: str | os.PathLike[str],
        *,
        media_type: str | None = None,
        prompt: str = DEFAULT_TRANSCRIPTION_PROMPT,
    ) -> str:
        path = Path(image_path)
        resolved_media_type = media_type or self.detect_media_type(path.name)
        return self.transcribe_image_bytes(
            path.read_bytes(),
            media_type=resolved_media_type,
            prompt=prompt,
        )


@lru_cache(maxsize=1)
def get_image_transcriber() -> ImageTranscriber:
    return ImageTranscriber()


def build_arg_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Transcribe text from a local image file with Anthropic.",
    )
    parser.add_argument("image_path", help="Path to the local image file.")
    parser.add_argument(
        "--prompt",
        default=DEFAULT_TRANSCRIPTION_PROMPT,
        help="Override the default transcription prompt.",
    )
    parser.add_argument(
        "--model",
        default=DEFAULT_MODEL,
        help="Anthropic model name to use.",
    )
    parser.add_argument(
        "--max-tokens",
        type=int,
        default=4096,
        help="Maximum output tokens to request from the model.",
    )
    parser.add_argument(
        "--media-type",
        default=None,
        help="Optional explicit media type, e.g. image/png.",
    )
    return parser


def main() -> int:
    args = build_arg_parser().parse_args()

    transcriber = ImageTranscriber(
        model=args.model,
        max_tokens=args.max_tokens,
    )
    while True:
        text = transcriber.transcribe_image_file(
            args.image_path,
            media_type=args.media_type,
            prompt=args.prompt,
        )
        if "ERROR" not in text:
            break
        print("\nCould not read the receipt clearly. Please provide a better image.")
        args.image_path = input("Enter new image path: ").strip()

    print("\nTranscribed receipt:\n")
    print(text)

    user_prompt = input(
        "\nDescribe who ate what from this receipt: "
    ).strip()
    while not user_prompt:
        user_prompt = input(
            "Please enter a description related to the receipt: "
        ).strip()

    info, people = ClaudeController.parse_people_from_receipt(text, user_prompt)
    verification_payload = {
        "info": asdict(info),
        "people": [asdict(person) for person in people],
    }

    print("\nParsed JSON objects for verification:\n")
    print(json.dumps(verification_payload, indent=2))

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
