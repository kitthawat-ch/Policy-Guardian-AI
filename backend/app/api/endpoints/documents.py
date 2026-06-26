import io
import os
import logging
from typing import List, Optional

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, Form
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime

from app.core.database import get_db
from app.models.policy import Policy, PolicySection

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/documents", tags=["Knowledge Base"])

# ─────────────────────────────────────────────
# Chunking Helper
# ─────────────────────────────────────────────
CHUNK_SIZE = 800  # characters per chunk

import re

def _chunk_text(text: str, chunk_size: int = CHUNK_SIZE) -> List[str]:
    """Split text logically, preferring markdown headers, then falling back to length."""
    text = text.strip()
    if not text:
        return []

    # If document has markdown headers, split by them first
    if re.search(r'^#{1,3}\s+', text, flags=re.MULTILINE):
        # Split by headers (e.g. '# ', '## ', '### ')
        # We use a lookahead so the header is kept in the chunk
        parts = re.split(r'\n(?=#{1,3}\s)', "\n" + text)
        chunks = []
        for p in parts:
            p = p.strip()
            if not p: continue
            
            # If a single section is extremely long, split it by length
            if len(p) > chunk_size * 2:
                start = 0
                while start < len(p):
                    end = start + chunk_size
                    # Try to cut at sentence boundary
                    cut_pos = p.rfind("\n", start, end)
                    if cut_pos <= start + chunk_size / 2:
                        cut_pos = p.rfind(". ", start, end)
                    if cut_pos <= start:
                        cut_pos = end
                    else:
                        cut_pos += 1 # Include the delimiter
                        
                    chunks.append(p[start:cut_pos].strip())
                    start = cut_pos
            else:
                chunks.append(p)
        return chunks

    # Fallback to pure length-based chunking for non-markdown text
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        if end >= len(text):
            chunks.append(text[start:].strip())
            break
        # Try to cut at a sentence boundary within the last 200 chars
        cut_pos = -1
        for sep in ["\n\n", "\n", ". ", "! ", "? "]:
            pos = text.rfind(sep, start + chunk_size - 200, end)
            if pos != -1:
                cut_pos = pos + len(sep)
                break
        if cut_pos == -1:
            cut_pos = end
        chunk = text[start:cut_pos].strip()
        if chunk:
            chunks.append(chunk)
        start = cut_pos

    return chunks


# ─────────────────────────────────────────────
# PDF / TXT Parser
# ─────────────────────────────────────────────
def _extract_text(file_bytes: bytes, filename: str) -> str:
    """Extract raw text from PDF or TXT file."""
    ext = os.path.splitext(filename)[1].lower()

    if ext == ".pdf":
        try:
            import pdfplumber
            pages_text = []
            with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        pages_text.append(page_text)
            return "\n\n".join(pages_text)
        except Exception as e:
            logger.error(f"PDF parsing error: {e}")
            raise HTTPException(status_code=422, detail=f"Failed to parse PDF: {e}")

    elif ext in (".txt", ".md"):
        try:
            return file_bytes.decode("utf-8", errors="ignore")
        except Exception as e:
            raise HTTPException(status_code=422, detail=f"Failed to read text file: {e}")

    else:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported file type '{ext}'. Only .pdf, .txt, and .md are supported."
        )


# ─────────────────────────────────────────────
# Response Schemas (inline for simplicity)
# ─────────────────────────────────────────────
class SectionInfo(BaseModel):
    id: int
    section_number: str
    title: str
    content_preview: str

class PolicyInfo(BaseModel):
    id: int
    title: str
    version: str
    description: Optional[str]
    status: str
    section_count: int
    created_at: datetime

    class Config:
        from_attributes = True

class UploadResult(BaseModel):
    policy_id: int
    title: str
    total_chunks: int
    message: str


# ─────────────────────────────────────────────
# POST /api/documents/upload
# ─────────────────────────────────────────────
@router.post("/upload", response_model=UploadResult)
async def upload_document(
    file: UploadFile = File(...),
    title: Optional[str] = Form(None),
    version: Optional[str] = Form("1.0"),
    db: Session = Depends(get_db),
):
    """
    Upload a PDF or TXT document. The system will:
    1. Extract text from the file
    2. Split into chunks of ~800 characters
    3. Save as a Policy with PolicySections in the database
    4. MCP tools (search_policy) will immediately find these sections
    """
    logger.info(f"Document upload: '{file.filename}', content_type={file.content_type}")

    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided.")

    # Read file bytes
    file_bytes = await file.read()
    if len(file_bytes) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    # Extract text
    raw_text = _extract_text(file_bytes, file.filename)
    if not raw_text.strip():
        raise HTTPException(status_code=422, detail="Could not extract any text from the document.")

    # Determine policy title
    base_name = os.path.splitext(file.filename)[0].replace("_", " ").replace("-", " ").title()
    policy_title = title.strip() if title and title.strip() else base_name

    # Chunk the text
    chunks = _chunk_text(raw_text)
    if not chunks:
        raise HTTPException(status_code=422, detail="Document is too short to process.")

    # Save Policy record
    db_policy = Policy(
        title=policy_title,
        version=version or "1.0",
        description=f"Uploaded from file: {file.filename}. Contains {len(chunks)} sections.",
        status="active",
        created_by=None,
    )
    db.add(db_policy)
    db.commit()
    db.refresh(db_policy)

    # Save PolicySection records (one per chunk)
    from app.services.embedding_service import embedding_service

    for i, chunk in enumerate(chunks, start=1):
        # Auto-generate a section title from first line of the chunk
        first_line = chunk.split("\n")[0][:80].strip()
        
        import re
        # Try to extract actual section number from headers like "## 7. Title" or "# Section 7: Title"
        match = re.match(r'^#{1,3}\s+(?:Section\s+)?([\d\.]+)(?:[:\.\s\-]+)?(.*)', first_line, re.IGNORECASE)
        if match:
            actual_sec_number = match.group(1).strip()
            clean_title = match.group(2).strip()
            if not clean_title:
                clean_title = f"Section {actual_sec_number}"
            section_number_str = actual_sec_number
            section_title = clean_title
        else:
            # Fallback
            clean_first_line = re.sub(r'^#{1,3}\s+', '', first_line).strip()
            section_title = clean_first_line if clean_first_line else f"Section {i}"
            if len(section_title) < 5:
                section_title = f"{policy_title} — Part {i}"
            section_number_str = str(i)

        # Generate embedding for semantic search (non-fatal if model unavailable)
        embedding_json = embedding_service.embed_to_json(chunk)

        section = PolicySection(
            policy_id=db_policy.id,
            section_number=section_number_str,
            title=section_title,
            content=chunk,
            embedding=embedding_json,
        )
        db.add(section)

    db.commit()
    logger.info(f"Saved policy ID={db_policy.id} with {len(chunks)} chunks (embeddings generated).")

    # Sync to ChromaDB
    try:
        from app.repositories.policy_repository import policy_section_repository
        import json
        collection = policy_section_repository._get_chroma_collection()
        if collection:
            new_sections = db.query(PolicySection).filter(
                PolicySection.policy_id == db_policy.id,
                PolicySection.embedding.isnot(None)
            ).all()
            if new_sections:
                ids = [str(sec.id) for sec in new_sections]
                embeddings = [json.loads(sec.embedding) for sec in new_sections]
                metadatas = [
                    {
                        "policy_id": sec.policy_id, 
                        "title": sec.title, 
                        "section_number": sec.section_number
                    } for sec in new_sections
                ]
                documents = [sec.content for sec in new_sections]
                collection.add(
                    ids=ids,
                    embeddings=embeddings,
                    metadatas=metadatas,
                    documents=documents
                )
    except Exception as e:
        logger.error(f"Failed to sync to ChromaDB: {e}")

    return UploadResult(
        policy_id=db_policy.id,
        title=policy_title,
        total_chunks=len(chunks),
        message=f"Successfully ingested '{policy_title}' into the Knowledge Base with {len(chunks)} searchable sections.",
    )


# ─────────────────────────────────────────────
# GET /api/documents/
# ─────────────────────────────────────────────
@router.get("/", response_model=List[PolicyInfo])
def list_documents(db: Session = Depends(get_db)):
    """Return all policies stored in the Knowledge Base."""
    policies = db.query(Policy).order_by(Policy.created_at.desc()).all()
    result = []
    for p in policies:
        result.append(PolicyInfo(
            id=p.id,
            title=p.title,
            version=p.version,
            description=p.description,
            status=p.status,
            section_count=len(p.sections),
            created_at=p.created_at,
        ))
    return result


# ─────────────────────────────────────────────
# DELETE /api/documents/{policy_id}
# ─────────────────────────────────────────────
@router.delete("/{policy_id}")
def delete_document(policy_id: int, db: Session = Depends(get_db)):
    """Delete a policy and all its sections from the Knowledge Base."""
    policy = db.query(Policy).filter(Policy.id == policy_id).first()
    if not policy:
        raise HTTPException(status_code=404, detail=f"Policy ID {policy_id} not found.")

    title = policy.title
    section_count = len(policy.sections)

    db.delete(policy)
    db.commit()

    # Delete from ChromaDB
    try:
        from app.repositories.policy_repository import policy_section_repository
        collection = policy_section_repository._get_chroma_collection()
        if collection:
            collection.delete(where={"policy_id": policy_id})
    except Exception as e:
        logger.error(f"Failed to delete from ChromaDB: {e}")

    logger.info(f"Deleted policy ID={policy_id} '{title}' with {section_count} sections.")
    return {
        "message": f"Successfully deleted '{title}' ({section_count} sections removed from Knowledge Base).",
        "policy_id": policy_id,
    }


# ─────────────────────────────────────────────
# GET /api/documents/sections/{section_id}
# ─────────────────────────────────────────────
@router.get("/sections/{section_id}")
def get_section_details(section_id: int, db: Session = Depends(get_db)):
    """Retrieve full content of a policy section by its ID."""
    section = db.query(PolicySection).join(Policy).filter(PolicySection.id == section_id).first()
    if not section:
        raise HTTPException(status_code=404, detail=f"Policy section ID {section_id} not found.")
        
    return {
        "id": section.id,
        "policy_id": section.policy_id,
        "policy_title": section.policy.title,
        "section_number": section.section_number,
        "title": section.title,
        "content": section.content,
    }
