from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import Optional, List
import os
import uuid
from app.db.database import get_db
from app.models.models import Item, ItemImage, User, Role
from app.schemas.schemas import ItemCreate, ItemUpdate, ItemResponse, ItemImageResponse
from app.api.auth import get_current_user, get_current_admin_user

router = APIRouter()

# Директория для хранения изображений
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.get("/items", response_model=list[ItemResponse])
def get_items(
    name: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Item)
    if name:
        query = query.filter(Item.name.ilike(f"%{name}%"))
    items = query.all()
    # Для каждого товара подгружаем изображения
    for item in items:
        item.images = db.query(ItemImage).filter(ItemImage.item_id == item.id).order_by(ItemImage.order).all()
    return items


@router.get("/items/{item_id}", response_model=ItemResponse)
def get_item(item_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")
    # Подгружаем изображения
    item.images = db.query(ItemImage).filter(ItemImage.item_id == item_id).order_by(ItemImage.order).all()
    return item


@router.post("/items", response_model=ItemResponse)
def create_item(
    item_data: ItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    # Проверка на уникальность имени
    existing_item = db.query(Item).filter(Item.name == item_data.name).first()
    if existing_item:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Item with this name already exists"
        )

    db_item = Item(
        name=item_data.name,
        price=item_data.price,
        description=item_data.description,
        image_url=item_data.image_url
    )

    db.add(db_item)
    db.commit()
    db.refresh(db_item)

    return db_item


@router.put("/items/{item_id}", response_model=ItemResponse)
def update_item(
    item_id: int,
    item_data: ItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")

    if item_data.name is not None:
        # Проверка на уникальность имени при изменении
        existing_item = db.query(Item).filter(
            Item.name == item_data.name,
            Item.id != item_id
        ).first()
        if existing_item:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Item with this name already exists"
            )
        item.name = item_data.name
    if item_data.price is not None:
        item.price = item_data.price
    if item_data.description is not None:
        item.description = item_data.description
    if item_data.image_url is not None:
        item.image_url = item_data.image_url

    db.commit()
    db.refresh(item)

    return item


@router.delete("/items/{item_id}")
def delete_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")

    # Удаляем изображение если оно есть
    if item.image_url:
        image_path = os.path.join(UPLOAD_DIR, os.path.basename(item.image_url))
        if os.path.exists(image_path):
            os.remove(image_path)

    db.delete(item)
    db.commit()

    return {"message": "Item deleted successfully"}


@router.post("/items/{item_id}/upload-image")
def upload_item_image(
    item_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")

    # Проверка типа файла
    allowed_types = ["image/jpeg", "image/png", "image/jpg", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Неподдерживаемый формат файла. Разрешены: JPEG, PNG, WebP"
        )

    # Генерируем уникальное имя файла
    file_extension = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)

    # Удаляем старое изображение если оно есть
    if item.image_url:
        old_image_path = os.path.join(UPLOAD_DIR, os.path.basename(item.image_url))
        if os.path.exists(old_image_path):
            os.remove(old_image_path)

    # Сохраняем новый файл
    try:
        with open(file_path, "wb") as buffer:
            buffer.write(file.file.read())
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка сохранения файла: {str(e)}"
        )

    # Обновляем путь к изображению в БД
    item.image_url = f"/api/v1/items/images/{unique_filename}"
    db.commit()
    db.refresh(item)

    return {"image_url": item.image_url}


@router.get("/items/images/{filename}")
def get_item_image(filename: str):
    file_path = os.path.join(UPLOAD_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Image not found")
    return FileResponse(file_path, media_type="image/jpeg")


@router.delete("/items/{item_id}/upload-image")
def delete_item_image(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")

    if not item.image_url:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="У товара нет изображения"
        )

    # Удаляем файл
    image_path = os.path.join(UPLOAD_DIR, os.path.basename(item.image_url))
    if os.path.exists(image_path):
        os.remove(image_path)

    # Очищаем поле в БД
    item.image_url = None
    db.commit()
    db.refresh(item)

    return {"message": "Image deleted successfully"}


@router.post("/items/{item_id}/upload-images", response_model=List[ItemImageResponse])
def upload_item_images(
    item_id: int,
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Загрузка нескольких изображений для товара"""
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")

    # Проверка типа файла
    allowed_types = ["image/jpeg", "image/png", "image/jpg", "image/webp"]
    
    uploaded_images = []
    for file in files:
        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Неподдерживаемый формат файла: {file.filename}. Разрешены: JPEG, PNG, WebP"
            )

        # Генерируем уникальное имя файла
        file_extension = file.filename.split(".")[-1] if "." in file.filename else "jpg"
        unique_filename = f"{uuid.uuid4()}.{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)

        # Получаем максимальный порядок для новых изображений
        max_order = db.query(ItemImage).filter(ItemImage.item_id == item_id).count()

        # Сохраняем новый файл
        try:
            with open(file_path, "wb") as buffer:
                buffer.write(file.file.read())
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Ошибка сохранения файла: {str(e)}"
            )

        # Создаем запись в БД
        image_url = f"/api/v1/items/images/{unique_filename}"
        db_image = ItemImage(
            item_id=item_id,
            image_url=image_url,
            order=max_order + len(uploaded_images)
        )
        db.add(db_image)
        uploaded_images.append(db_image)

    db.commit()
    for img in uploaded_images:
        db.refresh(img)

    # Если это первые изображения и основное не задано, устанавливаем первое как основное
    if not item.image_url and uploaded_images:
        item.image_url = uploaded_images[0].image_url
        db.commit()

    return uploaded_images


@router.get("/items/{item_id}/images", response_model=List[ItemImageResponse])
def get_item_images(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Получить все изображения товара"""
    images = db.query(ItemImage).filter(ItemImage.item_id == item_id).order_by(ItemImage.order).all()
    return images


@router.delete("/items/{item_id}/images/{image_id}")
def delete_item_image_by_id(
    item_id: int,
    image_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Удалить конкретное изображение товара"""
    image = db.query(ItemImage).filter(
        ItemImage.id == image_id,
        ItemImage.item_id == item_id
    ).first()
    
    if not image:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Image not found")

    # Удаляем файл
    image_path = os.path.join(UPLOAD_DIR, os.path.basename(image.image_url))
    if os.path.exists(image_path):
        os.remove(image_path)

    # Удаляем запись из БД
    db.delete(image)
    db.commit()

    # Если это было основное изображение, устанавливаем новое основное
    item = db.query(Item).filter(Item.id == item_id).first()
    if item and item.image_url == image.image_url:
        first_image = db.query(ItemImage).filter(ItemImage.item_id == item_id).first()
        item.image_url = first_image.image_url if first_image else None
        db.commit()

    return {"message": "Image deleted successfully"}


@router.put("/items/{item_id}/images/reorder")
def reorder_item_images(
    item_id: int,
    image_ids: List[int],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Изменить порядок изображений"""
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")

    for index, image_id in enumerate(image_ids):
        image = db.query(ItemImage).filter(
            ItemImage.id == image_id,
            ItemImage.item_id == item_id
        ).first()
        if image:
            image.order = index

    db.commit()
    return {"message": "Images reordered successfully"}
