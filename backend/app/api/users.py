from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.db.database import get_db
from app.models.models import User, Card, Role
from app.schemas.schemas import UserResponse, UserUpdate, CardCreate, CardResponse, UserListResponse
from app.api.auth import get_current_user, get_current_admin_user
from datetime import date, datetime

router = APIRouter()


@router.get("/users/{user_id}", response_model=UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Пользователь может смотреть свой профиль или админ может смотреть любого
    if current_user.id != user_id and current_user.role != Role.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    return user


@router.get("/users", response_model=UserListResponse)
def get_all_users(
    page: int = Query(0, ge=0),
    size: int = Query(5, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    offset = page * size
    users = db.query(User).offset(offset).limit(size).all()
    total = db.query(User).count()
    
    return UserListResponse(
        content=users,
        total_elements=total,
        total_pages=(total + size - 1) // size,
        page_number=page,
        page_size=size
    )


@router.get("/users/search", response_model=UserResponse)
def search_user_by_email(
    email: str = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    # Проверка прав
    if current_user.id != user.id and current_user.role != Role.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    return user


@router.put("/users/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    user_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Пользователь может редактировать только свой профиль
    if current_user.id != user_id and current_user.role != Role.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    # Обновление полей
    if user_data.name is not None:
        user.name = user_data.name
    if user_data.surname is not None:
        user.surname = user_data.surname
    if user_data.birth_date is not None:
        user.birth_date = user_data.birth_date
    if user_data.email is not None:
        user.email = user_data.email
    
    db.commit()
    db.refresh(user)
    
    return user


@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    # Админ не может удалить сам себя
    if current_user.id == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete yourself. Ask another admin to delete your account."
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    db.delete(user)
    db.commit()

    return {"message": "User deleted successfully"}


# Card endpoints
@router.post("/cards", response_model=CardResponse)
def create_card(
    card_data: CardCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Пользователь может добавлять карты только себе
    if current_user.id != card_data.user_id and current_user.role != Role.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )

    user = db.query(User).filter(User.id == card_data.user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    # Формируем имя держателя из данных пользователя
    holder = f"{user.name} {user.surname}"

    # Парсим дату истечения из строки YYYY-MM-DD
    try:
        expiration_date_obj = datetime.strptime(card_data.expiration_date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid date format. Use YYYY-MM-DD"
        )

    db_card = Card(
        number=card_data.number,
        holder=holder,
        expiration_date=expiration_date_obj,
        user_id=card_data.user_id
    )

    db.add(db_card)
    db.commit()
    db.refresh(db_card)

    return db_card


@router.get("/cards", response_model=list[CardResponse])
def get_my_cards(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Получить все карты текущего пользователя"""
    cards = db.query(Card).filter(Card.user_id == current_user.id).all()
    return cards


@router.get("/cards/all", response_model=list[CardResponse])
def get_all_cards(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Получить все карты всех пользователей (только для админа)"""
    cards = db.query(Card).all()
    return cards


@router.put("/cards/{card_id}", response_model=CardResponse)
def update_card(
    card_id: int,
    card_data: CardCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    card = db.query(Card).filter(Card.id == card_id).first()
    if not card:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Card not found")
    
    # Проверка прав
    if current_user.id != card.user_id and current_user.role != Role.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    user = db.query(User).filter(User.id == card_data.user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    holder = f"{user.name} {user.surname}"
    
    card.number = card_data.number
    card.holder = holder
    card.expiration_date = card_data.expiration_date
    card.user_id = card_data.user_id
    
    db.commit()
    db.refresh(card)
    
    return card


@router.delete("/cards/{card_id}")
def delete_card(
    card_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    card = db.query(Card).filter(Card.id == card_id).first()
    if not card:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Card not found")
    
    # Проверка прав
    if current_user.id != card.user_id and current_user.role != Role.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    db.delete(card)
    db.commit()
    
    return {"message": "Card deleted successfully"}
