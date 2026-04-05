import pandas as pd
from database import engine
import sys

csv_path = "../dataset/food_ordering_behavior_dataset.csv"

try:
    print("Citim datele din CSV ")
    df = pd.read_csv(csv_path)

    df.columns = [col.lower() for col in df.columns]
    
    print("Generăm utilizatorii unici...")
    user_ids = df['user_id'].unique()
    users_df = pd.DataFrame({
        'id': user_ids,
        'full_name': [f"User {uid}" for uid in user_ids],
        'email': [f"user{uid}@example.com" for uid in user_ids],
        'city': ['Unknown'] * len(user_ids)
    })

    users_df.to_sql('users', engine, if_exists='append', index=False)
    print(f"Am inserat {len(users_df)} utilizatori")

    print("Inseram comenzile in baza de date...")
    df.to_sql('orders', engine, if_exists='append', index=False)
    print(" Toate datele au fost importate în PostgreSQL")

except Exception as e:
    print(f"Eroare la import: {e}")