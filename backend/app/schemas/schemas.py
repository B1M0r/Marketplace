from pydantic import BaseModel, EmailStr, Field, field_validator
from datetime import date, datetime
from typing import Optional, List
from enum import Enum


class Role(str, Enum):
    USER = "USER"
    ADMIN = "ADMIN"


class OrderStatus(str, Enum):
    PENDING = "PENDING"
    CONFIRMED = "CONFIRMED"
    SHIPPED = "SHIPPED"
    DELIVERED = "DELIVERED"
    CANCELLED = "CANCELLED"


# Словарь для перевода статусов на русский
ORDER_STATUS_TRANSLATIONS = {
    "PENDING": "Ожидает подтверждения",
    "CONFIRMED": "Подтверждён",
    "SHIPPED": "Отправлен",
    "DELIVERED": "Доставлен",
    "CANCELLED": "Отменён"
}


# Auth schemas
class UserRegister(BaseModel):
    name: str
    surname: str
    birth_date: Optional[date] = None
    email: EmailStr
    password: str = Field(..., min_length=8)
    role: Role = Role.USER

    @field_validator('birth_date', mode='before')
    @classmethod
    def parse_birth_date(cls, v):
        if v is None or v == '':
            return None
        if isinstance(v, date):
            return v
        if isinstance(v, str):
            try:
                return datetime.strptime(v, '%Y-%m-%d').date()
            except ValueError:
                return None
        return v


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    email: Optional[str] = None
    user_id: Optional[int] = None
    role: Optional[str] = None


# Card schemas
class CardCreate(BaseModel):
    number: str = Field(..., min_length=13, max_length=19)
    expiration_date: str  # Формат YYYY-MM-DD
    user_id: int


class CardResponse(BaseModel):
    id: int
    number: str
    holder: str
    expiration_date: date
    user_id: int

    class Config:
        from_attributes = True


# User schemas
class UserUpdate(BaseModel):
    name: Optional[str] = None
    surname: Optional[str] = None
    birth_date: Optional[date] = None
    email: Optional[EmailStr] = None

    @field_validator('birth_date', mode='before')
    @classmethod
    def parse_birth_date(cls, v):
        if v is None or v == '':
            return None
        if isinstance(v, date):
            return v
        if isinstance(v, str):
            try:
                return datetime.strptime(v, '%Y-%m-%d').date()
            except ValueError:
                return None
        return v


class UserResponse(BaseModel):
    id: int
    name: str
    surname: str
    birth_date: Optional[date]
    email: str
    role: Role
    cards: List[CardResponse] = []

    class Config:
        from_attributes = True


class UserListResponse(BaseModel):
    content: List[UserResponse]
    total_elements: int
    total_pages: int
    page_number: int
    page_size: int


# Item schemas
class ItemImageCreate(BaseModel):
    image_url: str
    order: int = 0


class ItemImageResponse(BaseModel):
    id: int
    item_id: int
    image_url: str
    order: int

    class Config:
        from_attributes = True


class ItemCreate(BaseModel):
    name: str
    price: float = Field(..., gt=0)
    description: Optional[str] = None
    image_url: Optional[str] = None


class ItemUpdate(BaseModel):
    name: Optional[str] = None
    price: Optional[float] = Field(None, gt=0)
    description: Optional[str] = None
    image_url: Optional[str] = None


class ItemResponse(BaseModel):
    id: int
    name: str
    price: float
    description: Optional[str] = None
    image_url: Optional[str] = None
    images: List[ItemImageResponse] = []

    class Config:
        from_attributes = True


# Order schemas
class OrderItemCreate(BaseModel):
    name: str
    quantity: int = Field(..., gt=0)


class OrderCreate(BaseModel):
    email: EmailStr
    items: List[OrderItemCreate]


class OrderItemResponse(BaseModel):
    id: int
    item_id: int
    name: str
    price: float
    quantity: int

    class Config:
        from_attributes = True


class OrderUpdate(BaseModel):
    status: OrderStatus


class OrderResponse(BaseModel):
    id: int
    user_id: int
    status: OrderStatus
    status_ru: str = None  # Русское название статуса
    creation_date: datetime
    items: List[OrderItemResponse]
    user: Optional[UserResponse] = None

    class Config:
        from_attributes = True

    @classmethod
    def from_orm(cls, obj):
        instance = super().from_orm(obj)
        instance.status_ru = ORDER_STATUS_TRANSLATIONS.get(obj.status, obj.status)
        return instance


class OrderListResponse(BaseModel):
    content: List[OrderResponse]
    total_elements: int
    total_pages: int
    page_number: int
    page_size: int
