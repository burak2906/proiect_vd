"""
Generator dataset realist pentru food ordering.
Inlocuieste datasetul artificial uniform cu unul care are relatii cauzale reale.

Relatii cauzale implementate:
  - restaurant_type (Premium/Mid/Budget) -> order_value, delivery_fee, time_taken
  - rainy_weather -> delivery_fee (+), time_taken (+), rating (-)
  - mood -> order_value, rating, repeat probability
  - discount_applied -> rating (+), repeat probability (+)
  - time_taken -> rating (inversat)
  - rating -> repeat_order probability

Bug detectat in main.py:
  - /analytics/delivery-time-model include 'time_taken_to_order' in feature_cols -> data leakage -> R2=1.0
  - /analytics/value-drivers include 'order_value' in feature_cols -> data leakage -> R2=1.0
  Fix: eliminati target-ul din feature_cols in endpoint-urile respective.
"""

import pandas as pd
import numpy as np

def generate(N=50000, seed=42, output_path="food_ordering_behavior_dataset_v2.csv"):
    np.random.seed(seed)

    cities         = np.random.choice(['Pune','Mumbai','Delhi','Chandigarh','Bangalore','Hyderabad'], N)
    order_times    = np.random.choice(['Morning','Afternoon','Evening','Night'], N, p=[0.15,0.25,0.35,0.25])
    day_types      = np.random.choice(['Weekday','Weekend'], N, p=[0.65,0.35])
    cuisines       = np.random.choice(['Chinese','South Indian','Biryani','Fast Food','North Indian','Desserts'], N)
    meal_types     = np.random.choice(['Breakfast','Lunch','Snacks','Dinner'], N, p=[0.1,0.3,0.2,0.4])
    restaurant_types = np.random.choice(['Budget','Mid-range','Premium'], N, p=[0.35,0.40,0.25])
    moods          = np.random.choice(['Happy','Lazy','Stressed','Celebrating'], N, p=[0.35,0.25,0.25,0.15])
    hunger_levels  = np.random.choice(['Low','Medium','High'], N, p=[0.2,0.45,0.35])
    companies      = np.random.choice(['Alone','Partner','Friends','Family'], N, p=[0.3,0.25,0.25,0.2])
    rainy_weather  = np.random.choice(['Yes','No'], N, p=[0.3,0.7])
    discount_applied = np.random.choice(['Yes','No'], N, p=[0.4,0.6])
    ages           = np.random.randint(18, 45, N)

    # --- order_value ---
    base_value   = np.where(restaurant_types=='Premium', 700, np.where(restaurant_types=='Mid-range', 500, 300))
    mood_bonus   = np.where(moods=='Celebrating', 150, np.where(moods=='Happy', 50, np.where(moods=='Lazy', -50, -30)))
    comp_bonus   = np.where(companies=='Family', 120, np.where(companies=='Friends', 80, np.where(companies=='Partner', 40, 0)))
    hunger_bonus = np.where(hunger_levels=='High', 80, np.where(hunger_levels=='Medium', 30, -20))
    order_value  = base_value + mood_bonus + comp_bonus + hunger_bonus + np.random.normal(0, 200, N)
    order_value  = np.clip(order_value, 100, 999).astype(int)

    # --- delivery_fee ---
    base_fee    = np.where(restaurant_types=='Premium', 70, np.where(restaurant_types=='Mid-range', 50, 30))
    rain_fee    = np.where(rainy_weather=='Yes', 15, 0)
    delivery_fee = base_fee + rain_fee + np.random.normal(0, 15, N)
    delivery_fee = np.clip(delivery_fee, 20, 99).astype(int)

    # --- time_taken_to_order ---
    base_time      = np.where(restaurant_types=='Premium', 9.0, np.where(restaurant_types=='Mid-range', 7.0, 5.0))
    rain_time      = np.where(rainy_weather=='Yes', 2.5, 0)
    night_time     = np.where(order_times=='Night', 1.5, 0)
    evening_time   = np.where(order_times=='Evening', 0.8, 0)
    hunger_urgency = np.where(hunger_levels=='High', -0.5, 0)
    city_time      = np.where(np.isin(cities, ['Mumbai','Delhi']), 0.8, 0)
    time_taken     = base_time + rain_time + night_time + evening_time + hunger_urgency + city_time + np.random.normal(0, 3.5, N)
    time_taken     = np.clip(np.round(time_taken).astype(int), 1, 14)

    # --- rating_given ---
    rating_score = np.full(N, 3.0)
    rating_score += np.where(time_taken<=4, 0.8, np.where(time_taken<=7, 0.3, np.where(time_taken>=11, -0.7, -0.3)))
    rating_score += np.where(discount_applied=='Yes', 0.5, -0.2)
    rating_score += np.where(moods=='Celebrating', 0.8, np.where(moods=='Happy', 0.4, np.where(moods=='Stressed', -0.6, -0.2)))
    rating_score += np.where((restaurant_types=='Premium') & (discount_applied=='No'), -0.5, 0)
    rating_score += np.where((rainy_weather=='Yes') & (time_taken>=10), -0.8, 0)
    rating_score += np.where((day_types=='Weekend') & (order_times=='Evening'), 0.3, 0)
    rating_score += np.random.normal(0, 0.7, N)
    rating_given  = np.clip(np.round(rating_score).astype(int), 1, 5)

    # --- is_repeat_order ---
    repeat_prob  = 0.4 * np.ones(N)
    repeat_prob += np.where(rating_given>=4,  0.25, 0)
    repeat_prob += np.where(rating_given<=2, -0.20, 0)
    repeat_prob += np.where(discount_applied=='Yes', 0.10, 0)
    repeat_prob += np.where(moods=='Celebrating', 0.08, 0)
    repeat_prob += np.where(moods=='Stressed', -0.10, 0)
    repeat_prob += np.random.normal(0, 0.1, N)
    repeat_prob  = np.clip(repeat_prob, 0.05, 0.95)
    is_repeat_order = np.where(np.random.binomial(1, repeat_prob)==1, 'Yes', 'No')

    df = pd.DataFrame({
        'order_id': np.arange(1, N+1),
        'user_id': np.random.randint(1000, 5000, N),
        'age': ages, 'city': cities, 'order_time': order_times,
        'day_type': day_types, 'cuisine': cuisines, 'meal_type': meal_types,
        'restaurant_type': restaurant_types, 'order_value': order_value,
        'discount_applied': discount_applied, 'delivery_fee': delivery_fee,
        'time_taken_to_order': time_taken, 'rating_given': rating_given,
        'is_repeat_order': is_repeat_order, 'mood': moods,
        'hunger_level': hunger_levels, 'company': companies,
        'rainy_weather': rainy_weather
    })

    df.to_csv(output_path, index=False)
    print(f"Dataset generat: {output_path} ({len(df)} randuri)")
    print(f"rating_given: {dict(df['rating_given'].value_counts().sort_index())}")
    print(f"is_repeat_order: {dict(df['is_repeat_order'].value_counts())}")
    return df

if __name__ == "__main__":
    generate()