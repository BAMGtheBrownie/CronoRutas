from django.urls import path, include
from rest_framework import routers
from owners import views

router = routers.DefaultRouter()
router.register(r'owners', views.OwnerView, 'owner')

urlpatterns = [
    path("", include(router.urls))
]
