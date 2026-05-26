from pydantic import BaseModel, EmailStr, Field
from typing import Literal, List, Dict


# =========================
# USER SCHEMAS
# =========================

class UserBase(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    city: str = Field(..., min_length=2, max_length=100)


class UserCreate(UserBase):
    pass


class UserOut(UserBase):
    id: int

    class Config:
        from_attributes = True


# =========================
# ORDER SCHEMAS
# =========================

OrderTimeType = Literal["Morning", "Afternoon", "Evening", "Night"]
DayType = Literal["Weekday", "Weekend"]
YesNoType = Literal["Yes", "No"]
RestaurantType = Literal["Budget", "Mid-range", "Premium"]
MoodType = Literal["Happy", "Stressed", "Celebrating", "Lazy"]
HungerLevelType = Literal["Low", "Medium", "High"]

# IMPORTANT:
# Dacă în dataset valorile pentru company sunt fixe, poți restrânge și mai mult aici.
# Deocamdată îl las string ca să nu-ți blocheze inputul dacă apar alte valori.
# Dacă vrei strict:
# CompanyType = Literal["Alone", "Friends", "Family", "Colleagues"]
# și apoi company: CompanyType
CompanyType = str


class OrderBase(BaseModel):
    age: int = Field(..., ge=10, le=100)
    city: str = Field(..., min_length=2, max_length=100)
    order_time: OrderTimeType
    day_type: DayType
    cuisine: str = Field(..., min_length=2, max_length=100)
    meal_type: str = Field(..., min_length=2, max_length=100)
    restaurant_type: RestaurantType
    order_value: float = Field(..., gt=0)
    discount_applied: YesNoType
    delivery_fee: float = Field(..., ge=0)
    time_taken_to_order: float = Field(..., ge=0)
    rating_given: int = Field(..., ge=1, le=5)
    is_repeat_order: YesNoType
    mood: MoodType
    hunger_level: HungerLevelType
    company: CompanyType = Field(..., min_length=2, max_length=50)
    rainy_weather: YesNoType


class OrderCreate(OrderBase):
    user_id: int = Field(..., gt=0)


class OrderOut(OrderBase):
    order_id: int
    user_id: int

    class Config:
        from_attributes = True


# =========================
# PATCH SCHEMAS
# =========================

class RatingUpdate(BaseModel):
    rating: int = Field(..., ge=1, le=5)


# =========================
# PREDICTION INPUT SCHEMAS
# =========================

class RepeatOrderPredictionInput(BaseModel):
    age: int = Field(..., ge=10, le=100)
    order_time: OrderTimeType
    day_type: DayType
    restaurant_type: RestaurantType
    order_value: float = Field(..., gt=0)
    delivery_fee: float = Field(..., ge=0)
    time_taken_to_order: float = Field(..., ge=0)
    discount_applied: YesNoType
    mood: MoodType
    hunger_level: HungerLevelType
    company: CompanyType = Field(..., min_length=2, max_length=50)
    rainy_weather: YesNoType
    cuisine: str = Field(..., min_length=2, max_length=100)
    meal_type: str = Field(..., min_length=2, max_length=100)


class DeliveryTimePredictionInput(BaseModel):
    age: int = Field(..., ge=10, le=100)
    order_time: OrderTimeType
    day_type: DayType
    restaurant_type: RestaurantType
    order_value: float = Field(..., gt=0)
    delivery_fee: float = Field(..., ge=0)
    discount_applied: YesNoType
    mood: MoodType
    hunger_level: HungerLevelType
    company: CompanyType = Field(..., min_length=2, max_length=50)
    rainy_weather: YesNoType
    cuisine: str = Field(..., min_length=2, max_length=100)
    meal_type: str = Field(..., min_length=2, max_length=100)


# =========================
# PREDICTION OUTPUT SCHEMAS
# =========================

class RepeatOrderPredictionOut(BaseModel):
    prediction: str
    predicted_class: int
    probability_repeat: float


class DeliveryTimePredictionOut(BaseModel):
    predicted_time_taken_to_order: float


# =========================
# ANALYTICS RESPONSE SCHEMAS
# =========================

class FeatureImportanceItem(BaseModel):
    feature: str
    importance: float


class PermutationImportanceItem(BaseModel):
    feature: str
    importance_mean: float
    importance_std: float


class LogisticFactorItem(BaseModel):
    feature: str
    coefficient: float
    odds_ratio: float


class ModelMetricsClassification(BaseModel):
    accuracy: float
    precision: float
    recall: float
    f1_score: float


class ModelMetricsRegression(BaseModel):
    mae: float
    rmse: float
    r2: float


class ConfusionMatrixOut(BaseModel):
    labels: List[str]
    matrix: List[List[int]]


class DecisionTreeAnalyticsOut(BaseModel):
    model: str
    target: str
    metrics: ModelMetricsClassification
    confusion_matrix: ConfusionMatrixOut
    top_features: List[FeatureImportanceItem]
    tree_rules: str


class LogisticAnalyticsOut(BaseModel):
    model: str
    metrics: Dict[str, float]
    factors_increasing_repeat_probability: List[LogisticFactorItem]
    factors_decreasing_repeat_probability: List[LogisticFactorItem]


class LowRatingRiskOut(BaseModel):
    model: str
    target: str
    metrics: ModelMetricsClassification
    confusion_matrix: ConfusionMatrixOut
    top_risk_factors: List[PermutationImportanceItem]


class ActualPredictedItem(BaseModel):
    actual: float
    predicted: float


class DeliveryTimeAnalyticsOut(BaseModel):
    model: str
    metrics: ModelMetricsRegression
    top_time_drivers: List[PermutationImportanceItem]
    actual_vs_predicted_sample: List[ActualPredictedItem]


class ValueDriversOut(BaseModel):
    model: str
    metrics: ModelMetricsRegression
    top_value_drivers: List[PermutationImportanceItem]


class BusinessSummaryOut(BaseModel):
    total_orders: int
    total_users: int
    average_order_value: float
    average_rating: float
    repeat_order_rate: float
    rainy_order_share: float
    weekend_order_share: float