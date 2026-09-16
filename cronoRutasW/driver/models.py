from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class BusDriver(models.Model):
    class Meta:
        db_table ='drivers'
    id_driver = models.AutoField(primary_key=True)
    name = models.CharField(max_length=200)
    email = models.EmailField(max_length=254)
    password = models.CharField(max_length=254)
    phone = models.CharField(max_length=10)
    route = models.CharField(max_length=20)
    id_owner = models.ForeignKey(User, on_delete=models.CASCADE, default=None)

    def __str__(self):
        return self.name
