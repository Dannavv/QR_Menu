from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from passlib.context import CryptContext

from app.models import models
from app.schemas import schemas

pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ============================
# Restaurants
# ============================
def create_restaurant(db: Session, rest_in: schemas.RestaurantCreate):
    hashed = pwd_ctx.hash(rest_in.password)

    restaurant = models.Restaurant(
        name=rest_in.name,
        email=rest_in.email,
        password_hash=hashed,

        country_code=rest_in.country_code,
        state_code=rest_in.state_code,
        city_code=rest_in.city_code,

        location=rest_in.location,
        type=rest_in.type,
        pure_veg=rest_in.pure_veg,
    )

    db.add(restaurant)
    db.commit()
    db.refresh(restaurant)
    return restaurant



def get_restaurant(db: Session, rest_id: int):
    return (
        db.query(models.Restaurant)
        .filter(models.Restaurant.id == rest_id)
        .first()
    )


def get_restaurant_by_email(db: Session, email: str):
    return (
        db.query(models.Restaurant)
        .filter(models.Restaurant.email == email)
        .first()
    )


def get_restaurants(db: Session, skip: int = 0, limit: int = 100):
    return (
        db.query(models.Restaurant)
        .offset(skip)
        .limit(limit)
        .all()
    )

# ============================
# Categories
# ============================

def create_category(db: Session, category: schemas.CategoryBase):
    cat = models.Category(
        name=category.name,
        remark=category.remark
    )
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat


def list_categories(db: Session):
    return db.query(models.Category).all()

# ============================
# Products
# ============================

def create_product(db: Session, rest_id: int, product_in: schemas.ProductCreate):
    product = models.Product(
        restaurant_id=rest_id,
        name=product_in.name,
        veg=product_in.veg,
        remark=product_in.remark,
        available=product_in.available,
        iced=product_in.iced,
        description=product_in.description,
    )

    # attach categories
    if product_in.category_ids:
        categories = (
            db.query(models.Category)
            .filter(models.Category.id.in_(product_in.category_ids))
            .all()
        )
        product.categories = categories

    db.add(product)
    db.flush()  # 👈 IMPORTANT (gets product.id)

    # 👇 CREATE SIZES TOGETHER
    for size in product_in.sizes:
        db.add(
            models.ProductSize(
                product_id=product.id,
                size_label=size.size_label,
                price=size.price,
            )
        )

    db.commit()
    db.refresh(product)
    return product



def get_products_by_restaurant(db: Session, rest_id: int):
    return (
        db.query(models.Product)
        .filter(models.Product.restaurant_id == rest_id)
        .all()
    )


def get_product(db: Session, product_id: int):
    return (
        db.query(models.Product)
        .filter(models.Product.id == product_id)
        .first()
    )


def update_product_availability(
    db: Session,
    product_id: int,
    available: bool
):
    product = get_product(db, product_id)
    if not product:
        return None

    product.available = available
    db.commit()
    db.refresh(product)
    return product

# ============================
# Product Images
# ============================

def add_product_image(
    db: Session,
    product_id: int,
    filename: str
):
    image = models.ProductImage(
        product_id=product_id,
        filename=filename
    )
    db.add(image)
    db.commit()
    db.refresh(image)
    return image

# ============================
# Product Sizes & Pricing
# ============================

def add_product_size(
    db: Session,
    product_id: int,
    size_label: str,
    price: float
):
    size = models.ProductSize(
        product_id=product_id,
        size_label=size_label,
        price=price
    )

    db.add(size)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise

    db.refresh(size)
    return size
