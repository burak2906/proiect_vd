from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
import pandas as pd
import numpy as np

from sklearn.tree import DecisionTreeClassifier, export_text
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    confusion_matrix, mean_absolute_error, mean_squared_error, r2_score
)
from sklearn.inspection import permutation_importance

import models, schemas, database
from database import engine, get_db
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Food Delivery Analysis System")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

models.Base.metadata.create_all(bind=engine)


@app.get("/")
def root():
    return {"status": "Online", "database": "Connected", "port": 5435}


# =========================
# CRUD ORDERS
# =========================

@app.get("/orders/", response_model=List[schemas.OrderOut])
def read_orders(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Order).offset(skip).limit(limit).all()


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


# =========================
# CRUD USERS
# =========================

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

    has_orders = db.query(models.Order).filter(models.Order.user_id == id).first()
    if has_orders:
        raise HTTPException(
            status_code=400,
            detail="Nu se poate șterge: Utilizatorul are comenzi în istoric. Ștergeți întâi comenzile."
        )

    db.delete(db_user)
    db.commit()
    return {"message": f"Utilizatorul {id} a fost eliminat cu succes"}


# =========================
# PATCH RATING
# =========================

@app.patch("/orders/{id}/rating")
def update_order_rating(id: int, payload: schemas.RatingUpdate, db: Session = Depends(get_db)):
    db_order = db.query(models.Order).filter(models.Order.order_id == id).first()
    if not db_order:
        raise HTTPException(status_code=404, detail="Comanda nu există")

    db_order.rating_given = payload.rating
    db.commit()
    return {"message": f"Rating-ul pentru comanda {id} a fost actualizat la {payload.rating}"}


# =========================
# HELPERS
# =========================

def load_orders_dataframe(db: Session) -> pd.DataFrame:
    query = db.query(
        models.Order.order_id,
        models.Order.user_id,
        models.Order.age,
        models.Order.city,
        models.Order.order_time,
        models.Order.day_type,
        models.Order.cuisine,
        models.Order.meal_type,
        models.Order.restaurant_type,
        models.Order.order_value,
        models.Order.discount_applied,
        models.Order.delivery_fee,
        models.Order.time_taken_to_order,
        models.Order.rating_given,
        models.Order.is_repeat_order,
        models.Order.mood,
        models.Order.hunger_level,
        models.Order.company,
        models.Order.rainy_weather
    ).all()

    df = pd.DataFrame(query, columns=[
        "order_id", "user_id", "age", "city", "order_time", "day_type",
        "cuisine", "meal_type", "restaurant_type", "order_value",
        "discount_applied", "delivery_fee", "time_taken_to_order",
        "rating_given", "is_repeat_order", "mood", "hunger_level",
        "company", "rainy_weather"
    ])

    if df.empty:
        raise HTTPException(status_code=404, detail="Nu există date în tabela orders")

    df = df.dropna().copy()
    df["is_repeat"] = df["is_repeat_order"].str.lower().map({"yes": 1, "no": 0})
    df["is_rainy"] = df["rainy_weather"].str.lower().map({"yes": 1, "no": 0})
    df["has_discount"] = df["discount_applied"].str.lower().map({"yes": 1, "no": 0})
    df["is_weekend"] = df["day_type"].str.lower().map({"weekend": 1, "weekday": 0})
    df["low_rating"] = (df["rating_given"] <= 2).astype(int)
    return df


def encode_features(df: pd.DataFrame, feature_cols: list[str]) -> pd.DataFrame:
    X = df[feature_cols].copy()
    cat_cols = X.select_dtypes(include=["object"]).columns.tolist()
    X = pd.get_dummies(X, columns=cat_cols, drop_first=False)
    return X


def prepare_single_input(payload_dict: dict, reference_columns: list[str]) -> pd.DataFrame:
    input_df = pd.DataFrame([payload_dict])
    cat_cols = input_df.select_dtypes(include=["object"]).columns.tolist()
    input_encoded = pd.get_dummies(input_df, columns=cat_cols, drop_first=False)

    for col in reference_columns:
        if col not in input_encoded.columns:
            input_encoded[col] = 0

    extra_cols = [col for col in input_encoded.columns if col not in reference_columns]
    if extra_cols:
        input_encoded = input_encoded.drop(columns=extra_cols)

    input_encoded = input_encoded[reference_columns]
    return input_encoded


# =========================
# ANALYTICS
# =========================

@app.get("/analytics/business-summary", response_model=schemas.BusinessSummaryOut)
def business_summary(db: Session = Depends(get_db)):
    df = load_orders_dataframe(db)

    return {
        "total_orders": int(len(df)),
        "total_users": int(df["user_id"].nunique()),
        "average_order_value": round(float(df["order_value"].mean()), 2),
        "average_rating": round(float(df["rating_given"].mean()), 2),
        "repeat_order_rate": round(float(df["is_repeat"].mean() * 100), 2),
        "rainy_order_share": round(float(df["is_rainy"].mean() * 100), 2),
        "weekend_order_share": round(float(df["is_weekend"].mean() * 100), 2),
    }


@app.get("/analytics/decision-tree-repeat-order", response_model=schemas.DecisionTreeAnalyticsOut)
def decision_tree_repeat_order(db: Session = Depends(get_db)):
    df = load_orders_dataframe(db)

    feature_cols = [
        "age", "order_value", "delivery_fee", "time_taken_to_order",
        "order_time", "day_type", "discount_applied", "restaurant_type",
        "mood", "hunger_level", "company", "rainy_weather"
    ]

    X = encode_features(df, feature_cols)
    y = df["is_repeat"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    clf = DecisionTreeClassifier(
        max_depth=4,
        min_samples_leaf=50,
        random_state=42,
        class_weight="balanced"
    )
    clf.fit(X_train, y_train)

    y_pred = clf.predict(X_test)
    rules = export_text(clf, feature_names=list(X.columns))

    importances = pd.DataFrame({
        "feature": X.columns,
        "importance": clf.feature_importances_
    }).sort_values("importance", ascending=False)
    importances = importances[importances["importance"] > 0]

    cm = confusion_matrix(y_test, y_pred)

    return {
        "model": "DecisionTreeClassifier pentru repeat order",
        "target": "is_repeat_order",
        "metrics": {
            "accuracy": round(float(accuracy_score(y_test, y_pred)), 4),
            "precision": round(float(precision_score(y_test, y_pred, zero_division=0)), 4),
            "recall": round(float(recall_score(y_test, y_pred, zero_division=0)), 4),
            "f1_score": round(float(f1_score(y_test, y_pred, zero_division=0)), 4),
        },
        "confusion_matrix": {
            "labels": ["No Repeat", "Repeat"],
            "matrix": cm.tolist()
        },
        "top_features": importances.head(10).to_dict(orient="records"),
        "tree_rules": rules
    }


@app.get("/analytics/repeat-order-probability", response_model=schemas.LogisticAnalyticsOut)
def repeat_order_probability(db: Session = Depends(get_db)):
    df = load_orders_dataframe(db)

    feature_cols = [
        "age", "order_value", "delivery_fee", "time_taken_to_order",
        "order_time", "day_type", "discount_applied", "restaurant_type",
        "mood", "hunger_level", "company", "rainy_weather", "cuisine", "meal_type"
    ]

    X = encode_features(df, feature_cols)
    y = df["is_repeat"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    model = LogisticRegression(max_iter=2000, class_weight="balanced")
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)

    coef_df = pd.DataFrame({
        "feature": X.columns,
        "coefficient": model.coef_[0],
        "odds_ratio": np.exp(model.coef_[0])
    })

    positive_df = coef_df[coef_df["odds_ratio"] > 1].sort_values("odds_ratio", ascending=False)
    negative_df = coef_df[coef_df["odds_ratio"] < 1].sort_values("odds_ratio", ascending=True)

    return {
        "model": "LogisticRegression pentru repeat order",
        "metrics": {
            "accuracy": round(float(accuracy_score(y_test, y_pred)), 4),
            "precision": round(float(precision_score(y_test, y_pred, zero_division=0)), 4),
            "recall": round(float(recall_score(y_test, y_pred, zero_division=0)), 4),
            "f1_score": round(float(f1_score(y_test, y_pred, zero_division=0)), 4),
        },
        "factors_increasing_repeat_probability": positive_df.head(12).to_dict(orient="records"),
        "factors_decreasing_repeat_probability": negative_df.head(12).to_dict(orient="records")
    }

@app.get("/analytics/high-rating-drivers", response_model=schemas.HighRatingDriversOut)
def high_rating_drivers(db: Session = Depends(get_db)):
    df = load_orders_dataframe(db)

    df["high_rating"] = (df["rating_given"] >= 4).astype(int)

    feature_cols = [
        "order_value", "delivery_fee", "time_taken_to_order",
        "order_time", "day_type", "discount_applied",
        "restaurant_type", "cuisine", "meal_type",
        "company", "rainy_weather", "mood", "hunger_level"
    ]

    X = encode_features(df, feature_cols)
    y = df["high_rating"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    clf = RandomForestClassifier(
        n_estimators=250,
        max_depth=10,
        min_samples_leaf=10,
        random_state=42,
        class_weight="balanced"
    )
    clf.fit(X_train, y_train)

    y_pred = clf.predict(X_test)
    cm = confusion_matrix(y_test, y_pred)

    perm = permutation_importance(
        clf, X_test, y_test, n_repeats=10, random_state=42, scoring="f1"
    )

    importance_df = pd.DataFrame({
        "feature": X_test.columns,
        "importance_mean": perm.importances_mean,
        "importance_std": perm.importances_std
    }).sort_values("importance_mean", ascending=False)

    return {
        "model": "RandomForestClassifier pentru high rating",
        "target": "rating_given >= 4",
        "metrics": {
            "accuracy": round(float(accuracy_score(y_test, y_pred)), 4),
            "precision": round(float(precision_score(y_test, y_pred, zero_division=0)), 4),
            "recall": round(float(recall_score(y_test, y_pred, zero_division=0)), 4),
            "f1_score": round(float(f1_score(y_test, y_pred, zero_division=0)), 4),
        },
        "confusion_matrix": {
            "labels": ["Not High Rating", "High Rating"],
            "matrix": cm.tolist()
        },
        "top_risk_factors": importance_df.head(12).to_dict(orient="records")
    }

@app.get("/analytics/delivery-time-model", response_model=schemas.DeliveryTimeAnalyticsOut)
def delivery_time_model(db: Session = Depends(get_db)):
    df = load_orders_dataframe(db)

    feature_cols = [
        "age", "order_value", "delivery_fee",
        "order_time", "day_type", "discount_applied",
        "restaurant_type", "mood", "hunger_level",
        "company", "rainy_weather", "cuisine", "meal_type"
    ]

    X = encode_features(df, feature_cols)
    y = df["time_taken_to_order"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    model = RandomForestRegressor(
        n_estimators=150,
        max_depth=10,
        min_samples_leaf=20,
        random_state=42
    )
    model.fit(X_train, y_train)

    preds = model.predict(X_test)

    perm = permutation_importance(
        model, X_test, y_test, n_repeats=10, random_state=42, scoring="r2"
    )

    importance_df = pd.DataFrame({
        "feature": X_test.columns,
        "importance_mean": perm.importances_mean,
        "importance_std": perm.importances_std
    }).sort_values("importance_mean", ascending=False)

    sample_df = pd.DataFrame({
        "actual": y_test.values[:50],
        "predicted": preds[:50]
    })

    rmse = float(np.sqrt(mean_squared_error(y_test, preds)))

    return {
        "model": "RandomForestRegressor pentru time_taken_to_order",
        "metrics": {
            "mae": round(float(mean_absolute_error(y_test, preds)), 4),
            "rmse": round(rmse, 4),
            "r2": round(float(r2_score(y_test, preds)), 4)
        },
        "top_time_drivers": importance_df.head(12).to_dict(orient="records"),
        "actual_vs_predicted_sample": sample_df.to_dict(orient="records")
    }


@app.get("/analytics/value-drivers", response_model=schemas.ValueDriversOut)
def value_drivers(db: Session = Depends(get_db)):
    df = load_orders_dataframe(db)

    feature_cols = [
        "age", "delivery_fee", "time_taken_to_order",
        "order_time", "day_type", "discount_applied",
        "restaurant_type", "mood", "hunger_level",
        "company", "rainy_weather", "cuisine", "meal_type"
    ]

    X = encode_features(df, feature_cols)
    y = df["order_value"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    model = RandomForestRegressor(
        n_estimators=150,
        max_depth=10,
        min_samples_leaf=20,
        random_state=42
    )
    model.fit(X_train, y_train)

    preds = model.predict(X_test)

    perm = permutation_importance(
        model, X_test, y_test, n_repeats=10, random_state=42, scoring="r2"
    )

    importance_df = pd.DataFrame({
        "feature": X_test.columns,
        "importance_mean": perm.importances_mean,
        "importance_std": perm.importances_std
    }).sort_values("importance_mean", ascending=False)

    return {
        "model": "RandomForestRegressor pentru valoarea comenzii",
        "metrics": {
            "mae": round(float(mean_absolute_error(y_test, preds)), 4),
            "rmse": round(float(np.sqrt(mean_squared_error(y_test, preds))), 4),
            "r2": round(float(r2_score(y_test, preds)), 4)
        },
        "top_value_drivers": importance_df.head(12).to_dict(orient="records")
    }


# =========================
# PREDICTIONS
# =========================

@app.post("/predict/repeat-order", response_model=schemas.RepeatOrderPredictionOut)
def predict_repeat_order(payload: schemas.RepeatOrderPredictionInput, db: Session = Depends(get_db)):
    df = load_orders_dataframe(db)

    feature_cols = [
        "age", "order_value", "delivery_fee", "time_taken_to_order",
        "order_time", "day_type", "discount_applied", "restaurant_type",
        "mood", "hunger_level", "company", "rainy_weather", "cuisine", "meal_type"
    ]

    X = encode_features(df, feature_cols)
    y = df["is_repeat"]

    model = LogisticRegression(max_iter=2000, class_weight="balanced")
    model.fit(X, y)

    input_encoded = prepare_single_input(payload.model_dump(), list(X.columns))

    probability = model.predict_proba(input_encoded)[0][1]
    predicted_class = int(model.predict(input_encoded)[0])

    return {
        "prediction": "Repeat" if predicted_class == 1 else "No Repeat",
        "predicted_class": predicted_class,
        "probability_repeat": round(float(probability), 4)
    }


@app.post("/predict/delivery-time", response_model=schemas.DeliveryTimePredictionOut)
def predict_delivery_time(payload: schemas.DeliveryTimePredictionInput, db: Session = Depends(get_db)):
    df = load_orders_dataframe(db)

    feature_cols = [
        "age", "order_value", "delivery_fee",
        "order_time", "day_type", "discount_applied",
        "restaurant_type", "mood", "hunger_level",
        "company", "rainy_weather", "cuisine", "meal_type"
    ]

    X = encode_features(df, feature_cols)
    y = df["time_taken_to_order"]

    model = RandomForestRegressor(
        n_estimators=150,
        max_depth=10,
        min_samples_leaf=20,
        random_state=42
    )
    model.fit(X, y)

    input_encoded = prepare_single_input(payload.model_dump(), list(X.columns))
    prediction = model.predict(input_encoded)[0]

    return {"predicted_time_taken_to_order": round(float(prediction), 2)}