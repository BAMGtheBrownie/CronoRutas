from django.urls import path, include
from rest_framework import routers
from driver import views

router = routers.DefaultRouter()
router.register(r'drivers', views.DriverView, 'driver')

urlpatterns = [
    path("", include(router.urls)),
    path("view-drivers/", views.viewDrivers, name='view-drivers' ),
    path("create/", views.createDriver, name='create' ),
    path("<int:id>/", views.driverDetails, name='driver-detail'),
    path("<int:id>/delete", views.deleteDriver, name='delete'),
]