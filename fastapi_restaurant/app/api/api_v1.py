from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.config import settings
from app.core.deps import require_admin, require_restaurant
import shutil, os

from app.crud.crud import (
    create_restaurant,
    get_restaurants,
    get_restaurant,
    get_restaurant_by_email,
    create_category,
    list_categories,
    create_product,
    get_products_by_restaurant,
    get_product,
    update_product_availability,
    add_product_image,
)

from app.schemas.schemas import (
    RestaurantCreate,
    RestaurantRead,
    CategoryBase,
    CategoryRead,
    ProductCreate,
    ProductRead,
    ProductImageRead,
    ProductAvailabilityUpdate,
)

router = APIRouter()

# =========================================================
# RESTAURANTS
# =========================================================

@router.post(
    "/restaurants/",
    response_model=RestaurantRead,
    dependencies=[Depends(require_admin)]
)
def create_restaurant_api(
    rest_in: RestaurantCreate,
    db: Session = Depends(get_db),
):
    if get_restaurant_by_email(db, rest_in.email):
        raise HTTPException(status_code=400, detail="Email already registered")

    return create_restaurant(db, rest_in)


@router.get("/restaurants/", response_model=list[RestaurantRead])
def list_restaurants_api(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    return get_restaurants(db, skip, limit)


# =========================================================
# CATEGORIES (ADMIN CREATE, PUBLIC READ)
# =========================================================

@router.post(
    "/categories/",
    response_model=CategoryRead,
    dependencies=[Depends(require_admin)]
)
def create_category_api(
    category: CategoryBase,
    db: Session = Depends(get_db),
):
    return create_category(db, category)


@router.get("/categories/", response_model=list[CategoryRead])
def list_categories_api(db: Session = Depends(get_db)):
    return list_categories(db)


# =========================================================
# PRODUCTS
# =========================================================

@router.post(
    "/restaurants/{rest_id}/products/",
    response_model=ProductRead
)
def create_product_api(
    rest_id: int,
    product_in: ProductCreate,
    db: Session = Depends(get_db),
    user=Depends(require_restaurant),
):
    # 🔐 restaurant can only create for itself
    if user["restaurant_id"] != rest_id:
        raise HTTPException(status_code=403, detail="Not allowed")

    if not get_restaurant(db, rest_id):
        raise HTTPException(status_code=404, detail="Restaurant not found")

    return create_product(db, rest_id, product_in)


@router.get(
    "/restaurants/{rest_id}/products/",
    response_model=list[ProductRead]
)
def list_products_api(
    rest_id: int,
    db: Session = Depends(get_db),
):
    return get_products_by_restaurant(db, rest_id)


@router.get(
    "/products/{product_id}",
    response_model=ProductRead
)
def read_product_api(
    product_id: int,
    db: Session = Depends(get_db),
):
    product = get_product(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


# =========================================================
# PRODUCT AVAILABILITY (RESTAURANT ONLY)
# =========================================================

@router.patch(
    "/products/{product_id}/availability",
    response_model=ProductRead
)
def update_availability_api(
    product_id: int,
    payload: ProductAvailabilityUpdate,
    db: Session = Depends(get_db),
    user=Depends(require_restaurant),
):
    product = get_product(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    if product.restaurant_id != user["restaurant_id"]:
        raise HTTPException(status_code=403, detail="Not allowed")

    return update_product_availability(db, product_id, payload.available)


# =========================================================
# PRODUCT IMAGES (RESTAURANT ONLY)
# =========================================================

@router.post(
    "/products/{product_id}/images/",
    response_model=ProductImageRead
)
def upload_product_image_api(
    product_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user=Depends(require_restaurant),
):
    product = get_product(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    if product.restaurant_id != user["restaurant_id"]:
        raise HTTPException(status_code=403, detail="Not allowed")

    os.makedirs(settings.IMAGE_UPLOAD_DIR, exist_ok=True)
    filename = f"{product_id}_{file.filename}"
    path = os.path.join(settings.IMAGE_UPLOAD_DIR, filename)

    with open(path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return add_product_image(db, product_id, filename)
