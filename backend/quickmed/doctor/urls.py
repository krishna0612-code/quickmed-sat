from django.urls import path
from . import views

urlpatterns = [
    path("book-appointment/", views.book_appointment),
    path("appointments/", views.appointments_list),
    path("appointments/<int:pk>/approve/", views.approve_appointment),
    path("appointments/<int:pk>/cancel/", views.cancel_appointment),
    path("appointments/<int:pk>/complete/", views.start_consultation),
    path("stats/", views.doctor_dashboard_stats),
    path("my-appointments/", views.user_appointments),
    path('profile/', views.MeDoctorProfileView.as_view(), name='doctor_me_profile'),
    path("all/",views.DoctorListView.as_view(), name="doctor_list"),
]



