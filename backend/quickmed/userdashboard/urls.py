from django.urls import path
from .views import MyAppointmentsListView, BookAppointmentView

urlpatterns = [
    path("userdashboard/appointments/", MyAppointmentsListView.as_view(), name="my_appointments"),
    path("userdashboard/appointments/book/", BookAppointmentView.as_view(), name="book_appointment"),
]
