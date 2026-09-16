from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework import viewsets
from .models import Owner
from .serializer import OwnerSerializer

from rest_framework.response import Response


class OwnerView(viewsets.ModelViewSet):
    serializer_class = OwnerSerializer
    queryset = Owner.objects.all()