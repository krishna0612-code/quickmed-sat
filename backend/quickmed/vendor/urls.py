from django.urls import path
from .views import MyMedicinesView, MyMedicineDetailView, AllMedicinesView

urlpatterns = [
    path("medicines/", MyMedicinesView.as_view(), name="my_medicines"),
    path("medicines/<int:pk>/", MyMedicineDetailView.as_view(), name="my_medicine_detail"),
    path("medicines/all/", AllMedicinesView.as_view(), name="all_medicines"),  # Public endpoint for users
]
