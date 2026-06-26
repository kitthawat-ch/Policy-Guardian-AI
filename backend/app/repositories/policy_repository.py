import json
from sqlalchemy.orm import Session
from app.repositories.base_repository import BaseRepository
from app.models.policy import Policy, PolicySection
from app.schemas.policy import PolicyCreate, PolicyBase, PolicySectionCreate

class PolicyRepository(BaseRepository[Policy, PolicyCreate, PolicyBase]):
    def create_with_sections(self, db: Session, *, obj_in: PolicyCreate) -> Policy:
        # Separate the sections from the main policy data
        sections_data = obj_in.sections
        policy_data = obj_in.model_dump(exclude={"sections"})
        
        db_policy = self.model(**policy_data)
        db.add(db_policy)
        db.commit()
        db.refresh(db_policy)
        
        # Add sections
        for section in sections_data:
            db_section = PolicySection(**section.model_dump(), policy_id=db_policy.id)
            db.add(db_section)
        
        db.commit()
        db.refresh(db_policy)
        
        # Sync newly added sections to ChromaDB if available
        try:
            from app.repositories.policy_repository import policy_section_repository
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
            import logging
            logging.getLogger(__name__).error(f"Failed to add new policy to ChromaDB: {e}")
            
        return db_policy

policy_repository = PolicyRepository(Policy)

class PolicySectionRepository(BaseRepository[PolicySection, PolicySectionCreate, PolicySectionCreate]):
    def __init__(self, model):
        super().__init__(model)
        self._chroma_client = None
        self._collection = None
        
    def _get_chroma_collection(self):
        if self._chroma_client is None:
            try:
                import chromadb
                import os
                
                # Make sure the chroma db directory exists
                db_path = os.path.join(os.path.dirname(__file__), "../../chroma_db")
                os.makedirs(db_path, exist_ok=True)
                
                self._chroma_client = chromadb.PersistentClient(path=db_path)
                self._collection = self._chroma_client.get_or_create_collection(name="policy_sections")
            except Exception as e:
                import logging
                logging.getLogger(__name__).error(f"Failed to initialize ChromaDB: {e}")
                self._collection = None
        return self._collection

    def _sync_to_chroma(self, db: Session):
        """One-time sync of SQLite policies into ChromaDB"""
        collection = self._get_chroma_collection()
        if not collection:
            return
            
        try:
            # Check if collection is empty
            if collection.count() == 0:
                sections = db.query(PolicySection).filter(PolicySection.embedding.isnot(None)).all()
                if sections:
                    ids = [str(sec.id) for sec in sections]
                    embeddings = [json.loads(sec.embedding) for sec in sections]
                    metadatas = [
                        {
                            "policy_id": sec.policy_id, 
                            "title": sec.title, 
                            "section_number": sec.section_number
                        } for sec in sections
                    ]
                    documents = [sec.content for sec in sections]
                    
                    # Batch insert
                    batch_size = 100
                    for i in range(0, len(ids), batch_size):
                        collection.add(
                            ids=ids[i:i+batch_size],
                            embeddings=embeddings[i:i+batch_size],
                            metadatas=metadatas[i:i+batch_size],
                            documents=documents[i:i+batch_size]
                        )
        except Exception as e:
            import logging
            logging.getLogger(__name__).error(f"ChromaDB Sync Error: {e}")

    def search_by_vector(self, db: Session, query: str, limit: int = 5):
        """
        Primary search: Embed the query and rank sections by cosine similarity using ChromaDB.
        Falls back to keyword search if embeddings or ChromaDB are not available.
        """
        from app.services.embedding_service import embedding_service
        
        # Sync if needed (lightweight check inside)
        self._sync_to_chroma(db)

        query_vec = embedding_service.embed(query)

        if query_vec is not None:
            collection = self._get_chroma_collection()
            if collection and collection.count() > 0:
                try:
                    results = collection.query(
                        query_embeddings=[query_vec],
                        n_results=limit
                    )
                    
                    if results and results["ids"] and len(results["ids"]) > 0 and len(results["ids"][0]) > 0:
                        matched_ids = [int(id_str) for id_str in results["ids"][0]]
                        
                        # Fetch the actual SQLAlchemy models
                        sections = db.query(PolicySection).filter(PolicySection.id.in_(matched_ids)).all()
                        
                        # Preserve order returned by Chroma
                        section_map = {sec.id: sec for sec in sections}
                        ordered_sections = [section_map[idx] for idx in matched_ids if idx in section_map]
                        
                        return ordered_sections
                except Exception as e:
                    import logging
                    logging.getLogger(__name__).error(f"ChromaDB Query Error: {e}")
            
            # Fallback to O(N) Python scan if Chroma fails or is empty
            sections = db.query(PolicySection).filter(
                PolicySection.embedding.isnot(None)
            ).all()

            if sections:
                scored = []
                for sec in sections:
                    try:
                        sec_vec = json.loads(sec.embedding)
                        sim = embedding_service.cosine_similarity(query_vec, sec_vec)
                        scored.append((sim, sec))
                    except Exception:
                        continue

                # Sort descending by similarity and return top-limit
                scored.sort(key=lambda x: x[0], reverse=True)
                return [sec for _, sec in scored[:limit]]

        # Fallback: keyword search (for old sections without embeddings)
        return self.search_by_keyword(db, query=query, limit=limit)

    def search_by_keyword(self, db: Session, query: str, limit: int = 5):
        """Legacy keyword LIKE search — kept as fallback."""
        search_term = f"%{query}%"
        results = db.query(self.model).filter(
            (PolicySection.title.ilike(search_term)) |
            (PolicySection.content.ilike(search_term))
        ).limit(limit).all()

        if not results:
            words = [w.strip() for w in query.split() if w.strip()]
            if len(words) > 1:
                from sqlalchemy import or_
                conditions = []
                for w in words:
                    conditions.append(PolicySection.title.ilike(f"%{w}%"))
                    conditions.append(PolicySection.content.ilike(f"%{w}%"))
                results = db.query(self.model).filter(or_(*conditions)).limit(limit).all()

        return results

policy_section_repository = PolicySectionRepository(PolicySection)

