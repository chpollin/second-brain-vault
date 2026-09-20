"""Stable content identity shared by the static demo's source readers."""

import hashlib
import json


def revision_of(value: object) -> str:
    text = json.dumps(value, ensure_ascii=False, sort_keys=True)
    return hashlib.sha256(text.encode("utf-8")).hexdigest()
