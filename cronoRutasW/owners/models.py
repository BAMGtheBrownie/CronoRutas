from django.db import models

# Create your models here.
class Owner(models.Model):
    class Meta:
        db_table='owners'
    id_owner = models.AutoField(primary_key=True)
    name = models.CharField(max_length=200)
    last_name = models.CharField(max_length=200)
    email = models.EmailField(max_length=254)
    password = models.CharField(max_length=254)
    phone = models.CharField(max_length=10)

    def __str__(self):
        return self.name
