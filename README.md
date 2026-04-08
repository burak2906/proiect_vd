# proiect_vd

# powershell pornire + populare baza de date
pip install -r requirements.txt
python init_db.py
python import_csv.py

# rulare din backend 
python -m uvicorn main:app




{
  "full_name": "Stefan Buracu",
  "email": "buraku.stefan@gmail.com",
  "city": "Bucuresti",
  "password": "123456"
}

{
  "age": 23,
  "city": "Bucuresti",
  "order_time": "Morning",
  "day_type": "Weekday",
  "cuisine": "Italian",
  "meal_type": "Dinner",
  "restaurant_type": "Budget",
  "order_value": 400,
  "discount_applied": "No",
  "delivery_fee": 15,
  "time_taken_to_order": 20,
  "rating_given": 4,
  "is_repeat_order": "Yes",
  "mood": "Happy",
  "hunger_level": "High",
  "company": "Alone",
  "rainy_weather": "No",
  "user_id": 5000
}