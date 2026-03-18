from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from app.db.database import get_db
from app.models.models import Order, OrderItem, Item, User, Role, OrderStatus
from app.schemas.schemas import OrderCreate, OrderResponse, OrderUpdate, OrderListResponse
from app.api.auth import get_current_user, get_current_admin_user

router = APIRouter()


@router.post("/orders", response_model=OrderResponse)
def create_order(
    order_data: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Пользователь может создавать заказ только для себя
    # Email в заказе должен совпадать с email текущего пользователя
    if order_data.email != current_user.email and current_user.role != Role.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only create orders for yourself"
        )

    # Находим пользователя по email (должен совпадать с current_user)
    user = db.query(User).filter(User.email == order_data.email).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    # Создаем заказ
    db_order = Order(
        user_id=user.id,
        status=OrderStatus.PENDING
    )

    db.add(db_order)
    db.commit()
    db.refresh(db_order)

    # Добавляем элементы заказа
    for item_data in order_data.items:
        # Ищем товар по названию
        item = db.query(Item).filter(Item.name == item_data.name).first()
        if not item:
            # Откатываем заказ если товар не найден
            db.delete(db_order)
            db.commit()
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Item '{item_data.name}' not found"
            )

        order_item = OrderItem(
            order_id=db_order.id,
            item_id=item.id,
            name=item.name,
            price=item.price,
            quantity=item_data.quantity
        )
        db.add(order_item)

    db.commit()
    db.refresh(db_order)

    return db_order


@router.get("/orders", response_model=OrderListResponse)
def get_orders(
    page: int = Query(0, ge=0),
    size: int = Query(5, ge=1, le=100),
    statuses: Optional[List[OrderStatus]] = Query(default=None),
    ids: Optional[List[int]] = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Админ видит все заказы, пользователь - только свои
    query = db.query(Order)

    if current_user.role != Role.ADMIN:
        query = query.filter(Order.user_id == current_user.id)
    else:
        # Админ может фильтровать по статусам и ID
        if statuses is not None and len(statuses) > 0:
            query = query.filter(Order.status.in_(statuses))
        if ids is not None and len(ids) > 0:
            query = query.filter(Order.id.in_(ids))

    offset = page * size
    total = query.count()
    orders = query.offset(offset).limit(size).all()

    return OrderListResponse(
        content=orders,
        total_elements=total,
        total_pages=(total + size - 1) // size,
        page_number=page,
        page_size=size
    )


@router.get("/orders/{order_id}", response_model=OrderResponse)
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    
    # Пользователь может смотреть только свои заказы, админ - любые
    if current_user.id != order.user_id and current_user.role != Role.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    return order


@router.put("/orders/{order_id}", response_model=OrderResponse)
def update_order(
    order_id: int,
    order_data: OrderUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    
    order.status = order_data.status
    
    db.commit()
    db.refresh(order)
    
    return order


@router.delete("/orders/{order_id}")
def delete_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    
    db.delete(order)
    db.commit()
    
    return {"message": "Order deleted successfully"}
