from pydantic import BaseModel, EmailStr
from typing import Optional

# Schema pentru User
class UserBase(BaseModel):
    full_name: str
    email: EmailStr
    city: str

class UserCreate(UserBase):
    password: str 

class UserOut(UserBase):
    id: int
    class Config:
        from_attributes = True

# Schema pentru Order
class OrderBase(BaseModel):
    age: int
    city: str
    order_time: str
    day_type: str
    cuisine: str
    meal_type: str
    restaurant_type: str
    order_value: float
    discount_applied: str
    delivery_fee: float
    time_taken_to_order: float
    rating_given: int
    is_repeat_order: str
    mood: str
    hunger_level: str
    company: str
    rainy_weather: str

class OrderCreate(OrderBase):
    user_id: int

class OrderOut(OrderBase):
    order_id: int
    user_id: int
    class Config:
        from_attributes = True