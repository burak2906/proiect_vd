from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

# Tabelul pentru Utilizatori
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String)
    email = Column(String, unique=True, index=True)
    city = Column(String)

    # un utilizator poate avea mai multe comenzi - one-to-many
    orders = relationship("Order", back_populates="owner")

# Tabelul pentru Comenzi
class Order(Base):
    __tablename__ = "orders"

    order_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id")) # legatura catre tabelul users
    
    # Coloanele din dataset
    age = Column(Integer)
    city = Column(String)
    order_time = Column(String)    # Morning, Afternoon, Evening
    day_type = Column(String)      # Weekday, Weekend
    cuisine = Column(String)
    meal_type = Column(String)
    restaurant_type = Column(String)
    order_value = Column(Float)
    discount_applied = Column(String) # Yes/No
    delivery_fee = Column(Float)
    time_taken_to_order = Column(Float)
    rating_given = Column(Integer)
    is_repeat_order = Column(String)  #Yes/No
    mood = Column(String)
    hunger_level = Column(String)
    company = Column(String)
    rainy_weather = Column(String) # Yes/No

    # fiecare comanda apartine unui utilizator - many-to-one
    owner = relationship("User", back_populates="orders")