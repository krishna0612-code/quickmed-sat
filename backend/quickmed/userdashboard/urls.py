from django.urls import path
from . import views

urlpatterns = [
    path("appointments/book/", views.book_appointment),
    path("appointments/", views.get_appointments),
]
