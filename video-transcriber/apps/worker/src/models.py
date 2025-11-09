from pydantic import BaseModel
from typing import Literal, Optional

class JobPayload(BaseModel):
    jobId: str
    sourceType: Literal['url','upload']
    sourceUrl: Optional[str] = None
    objectKey: Optional[str] = None
