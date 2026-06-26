from sqlalchemy.orm import Session
from app.repositories.base_repository import BaseRepository
from app.models.user import User
from app.schemas.user import UserCreate, UserBase

class UserRepository(BaseRepository[User, UserCreate, UserBase]):
    def get_by_email(self, db: Session, *, email: str) -> User | None:
        return db.query(self.model).filter(User.email == email).first()
        
    def get_by_username(self, db: Session, *, username: str) -> User | None:
        return db.query(self.model).filter(User.username == username).first()

user_repository = UserRepository(User)
