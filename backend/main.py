from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
import pandas as pd
import numpy as np

from sklearn.tree import DecisionTreeClassifier, export_text
from sklearn.linear_model import LogisticRegression, LinearRegression
from sklearn.cluster import KMeans
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler

import models, schemas, database
from database import engine, get_db

app = FastAPI(title="Food Delivery Analysis System - Master Edition")

# Creare tabele
models.Base.metadata.create_all(bind=engine)

@app.get("/")
def root():
    return {"status": "Online", "database": "Connected", "port": 5435}

# CRUD COMENZI ORDERS

@app.get("/orders/", response_model=List[schemas.OrderOut])
def read_orders(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Order).offset(skip).limit(limit).all()

from sqlalchemy import func

@app.post("/orders/", response_model=schemas.OrderOut)
def create_order(order: schemas.OrderCreate, db: Session = Depends(get_db)):
    max_id = db.query(func.max(models.Order.order_id)).scalar()
    next_id = (max_id or 0) + 1
    
    db_order = models.Order(**order.model_dump())
    db_order.order_id = next_id
    
    try:
        db.add(db_order)
        db.commit()
        db.refresh(db_order)
        return db_order
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Eroare la salvare: {str(e)}")

@app.get("/orders/{id}", response_model=schemas.OrderOut)
def read_order(id: int, db: Session = Depends(get_db)):
    order = db.query(models.Order).filter(models.Order.order_id == id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Comanda nu a fost găsită")
    return order

@app.put("/orders/{id}", response_model=schemas.OrderOut)
def update_order(id: int, order_update: schemas.OrderCreate, db: Session = Depends(get_db)):
    db_order = db.query(models.Order).filter(models.Order.order_id == id).first()
    if not db_order:
        raise HTTPException(status_code=404, detail="Comanda nu există")
    for key, value in order_update.model_dump().items():
        setattr(db_order, key, value)
    db.commit()
    db.refresh(db_order)
    return db_order

@app.delete("/orders/{id}")
def delete_order(id: int, db: Session = Depends(get_db)):
    db_order = db.query(models.Order).filter(models.Order.order_id == id).first()
    if not db_order:
        raise HTTPException(status_code=404, detail="Comanda nu există")
    db.delete(db_order)
    db.commit()
    return {"message": f"Comanda {id} a fost ștearsă cu succes"}

# CRUD UTILIZATORI USERS

@app.post("/users/", response_model=schemas.UserOut)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    max_id = db.query(func.max(models.User.id)).scalar()
    next_id = (max_id or 0) + 1
    
    db_user = models.User(
        id=next_id,
        full_name=user.full_name,
        email=user.email,
        city=user.city
    )
    
    try:
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Eroare la crearea utilizatorului: {str(e)}")

@app.get("/users/", response_model=List[schemas.UserOut])
def read_users(db: Session = Depends(get_db)):
    return db.query(models.User).all()

@app.put("/users/{id}", response_model=schemas.UserOut)
def update_user(id: int, user_update: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.id == id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="Utilizatorul nu există")
    db_user.full_name = user_update.full_name
    db_user.email = user_update.email
    db_user.city = user_update.city
    db.commit()
    db.refresh(db_user)
    return db_user

@app.delete("/users/{id}")
def delete_user(id: int, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.id == id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="Utilizatorul nu există")
    # se poate sterge un user doar daca nu mai are comenzi
    has_orders = db.query(models.Order).filter(models.Order.user_id == id).first()
    
    if has_orders:
        raise HTTPException(
            status_code=400, 
            detail="Nu se poate șterge: Utilizatorul are comenzi în istoric. Ștergeți întâi comenzile."
        )
    
    db.delete(db_user)
    db.commit()
    return {"message": f"Utilizatorul {id} a fost eliminat cu succes"}

# PATCH RATING

@app.patch("/orders/{id}/rating")
def update_order_rating(id: int, rating: int, db: Session = Depends(get_db)):
    db_order = db.query(models.Order).filter(models.Order.order_id == id).first()
    if not db_order:
        raise HTTPException(status_code=404, detail="Comanda nu există")
    db_order.rating_given = rating
    db.commit()
    return {"message": f"Rating-ul pentru comanda {id} a fost actualizat la {rating}"}

# ANALYTICS

# Decision Tree - Structura logica a deciziilor
@app.get("/analytics/decision-tree")
def get_decision_tree(db: Session = Depends(get_db)):
    query = db.query(models.Order.age, models.Order.order_value, models.Order.is_repeat_order).all()
    df = pd.DataFrame(query, columns=['age', 'value', 'repeat'])
    # Convertim "Yes"/"No" in 1/0
    df['target'] = df['repeat'].apply(lambda x: 1 if x == 'Yes' else 0)
    
    clf = DecisionTreeClassifier(max_depth=3)
    clf.fit(df[['age', 'value']], df['target'])
    
    tree_rules = export_text(clf, feature_names=['age', 'value'])
    return {"tree_structure": tree_rules}

# K-Means - Customer Clusters
@app.get("/analytics/customer-clusters")
def get_customer_clusters(db: Session = Depends(get_db)):
    query = db.query(models.Order.age, models.Order.order_value).all()
    df = pd.DataFrame(query, columns=['age', 'order_value'])

    kmeans = KMeans(n_clusters=3, n_init=10).fit(df)

    centers = kmeans.cluster_centers_ # array numpy
    
    # sortam centrele dupa a doua coloana (index 1) care este 'order_value'
    # garanteaza ca primul cluster din lista va fi mereu cel cu valoarea cea mai mica
    sorted_indices = np.argsort(centers[:, 1])
    sorted_centers = centers[sorted_indices].tolist()
    
    return {
        "centers": sorted_centers,
        "labels": [
            "Segment Buget Redus (Low)", 
            "Segment Valoare Medie (Medium)", 
            "Segment Premium (High)"
        ]
    }

# Linear Regression - Predictie Timp Livrare
@app.get("/analytics/delivery-prediction")
def predict_delivery(db: Session = Depends(get_db)):
    query = db.query(
        models.Order.rainy_weather,
        models.Order.delivery_fee,
        models.Order.order_time, # Morning, Afternoon, Evening, Night
        models.Order.day_type,
        models.Order.time_taken_to_order
    ).all()
    
    df = pd.DataFrame(query, columns=['rainy', 'fee', 'order_period', 'day', 'time'])

    # transformam yes/no in 1/0 pentru ploaie
    df['is_rainy'] = df['rainy'].apply(lambda x: 1 if x == 'Yes' else 0)
    
    df['is_weekend'] = df['day'].apply(lambda x: 1 if x == 'Weekend' else 0)
    
    time_dummies = pd.get_dummies(df['order_period'], prefix='period', drop_first=True)
    df = pd.concat([df, time_dummies], axis=1)

    X_columns = ['is_rainy', 'is_weekend', 'fee'] + list(time_dummies.columns)
    X = df[X_columns]
    y = df['time']
    
    model = LinearRegression().fit(X, y)

    coef_dict = dict(zip(X_columns, model.coef_.tolist()))
    
    return {
        "timp_baza_minute": round(model.intercept_, 2),
        "impact_factori": {k: round(v, 2) for k, v in coef_dict.items()}
    }

# Random Forest - Feature Importance pentru Rating
@app.get("/analytics/feature-importance")
def get_feature_importance(db: Session = Depends(get_db)):
    query = db.query(
        models.Order.order_value, 
        models.Order.delivery_fee, 
        models.Order.time_taken_to_order,
        models.Order.rainy_weather,
        models.Order.mood,
        models.Order.rating_given
    ).all()
    
    df = pd.DataFrame(query, columns=['val', 'fee', 'time', 'rainy', 'mood', 'rating'])
    
    df['is_rainy'] = df['rainy'].apply(lambda x: 1 if x == 'Yes' else 0)
    
    mood_map = {'Happy': 3, 'Celebrating': 4, 'Lazy': 2, 'Stressed': 1, 'Neutral': 2}
    df['mood_score'] = df['mood'].map(mood_map).fillna(2)

    features = ['val', 'fee', 'time', 'is_rainy', 'mood_score']
    X = df[features]
    y = df['rating']
    
    rf = RandomForestRegressor(n_estimators=50).fit(X, y)
    
    # procente de importanta pentru fiecare feature 0-1
    importances = dict(zip(['Preț', 'Taxă', 'Timp Livrare', 'Ploaie', 'Stare Spirit'], rf.feature_importances_.tolist()))
    return importances

@app.get("/analytics/mood-impact-budget")
def get_mood_impact_budget(db: Session = Depends(get_db)):
    query = db.query(
        models.Order.order_value, 
        models.Order.age, 
        models.Order.mood, 
        models.Order.hunger_level,
        models.Order.company,
        models.Order.restaurant_type
    ).all()
    
    df = pd.DataFrame(query, columns=['value', 'age', 'mood', 'hunger', 'company', 'restaurant'])
    
    avg_val = df['value'].mean()
    df['is_budget'] = (df['value'] <= avg_val).astype(int)
    
    res_map = {'Budget': 1, 'Mid-range': 2, 'Premium': 3}
    df['res_score'] = df['restaurant'].map(res_map).fillna(2)
    
    df['is_low_energy_mood'] = df['mood'].apply(lambda x: 1 if x in ['Stressed', 'Lazy'] else 0)
    
    df['is_solo'] = df['company'].apply(lambda x: 1 if x == 'Alone' else 0)
    
    hunger_map = {'Low': 1, 'Medium': 2, 'High': 3}
    df['hunger_score'] = df['hunger'].map(hunger_map).fillna(2)

    # Regresie Logistica
    features = ['res_score', 'is_low_energy_mood', 'is_solo', 'hunger_score', 'age']
    X = df[features]
    y = df['is_budget']
    
    # Scalare pentru a elimina scorurile de tip 0.0001
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    model = LogisticRegression().fit(X_scaled, y)
    
    # Extragem impactul ca valori pozitive
    coefs = model.coef_[0]
    feature_impact = dict(zip(features, [abs(round(float(c), 4)) for c in coefs]))
    
    return {
        "analiza": "Profilul Comenzii Budget (Sub Medie)",
        "prag_valoare": round(avg_val, 2),
        "factori_determinanti_budget": {
            "tip_restaurant_ieftin": feature_impact['res_score'],
            "stare_spirit_low_energy": feature_impact['is_low_energy_mood'],
            "comanda_individuala_solo": feature_impact['is_solo'],
            "nivel_foame": feature_impact['hunger_score'],
            "influenta_varsta": feature_impact['age']
        },
        "interpretare": "Aceste scoruri arata cat de mult 'trage' fiecare factor comanda sub pragul de medie."
    }
