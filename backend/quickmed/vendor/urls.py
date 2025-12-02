from django.urls import path
from .views import MyMedicinesView, MyMedicineDetailView

urlpatterns = [
    path("medicines/", MyMedicinesView.as_view(), name="my_medicines"),
    path("medicines/<int:pk>/", MyMedicineDetailView.as_view(), name="my_medicine_detail"),
]
