from django.http import JsonResponse
from django.shortcuts import get_object_or_404, redirect, render
from .models import BusDriver
from .serializer import DriverSerializer
from rest_framework import viewsets
from .forms import CreateDriver
from django.contrib.auth.decorators import login_required

# Create your views here.
class DriverView(viewsets.ModelViewSet):
    serializer_class = DriverSerializer
    queryset = BusDriver.objects.all()

@login_required
def createDriver(request):
    if (request.method == 'GET'):
        return render(request,'create.html',{
            'form': CreateDriver,
        })
    else:
        try:
            form = CreateDriver(request.POST)
            new_driver =form.save(commit=False)
            new_driver.id_owner = request.user
            new_driver.save()
            return redirect('view-drivers')
        except ValueError:
            return render(request,'create.html',{
            'form': CreateDriver,
            'error': 'Ingresa datos validos'
        })

@login_required
def viewDrivers(request):
    drivers = BusDriver.objects.filter(id_owner = request.user)
    return render(request,'drivers.html', {'drivers':drivers})

@login_required
def driverDetails(request, id):
    if (request.method == 'GET'):
        driver = get_object_or_404(BusDriver, pk = id, id_owner = request.user)
        form = CreateDriver(instance= driver)
        return render(request,'driver_detail.html',{
            'driver':driver,
            'form': form,
        })
    else:
        try:
            driver = get_object_or_404(BusDriver, pk = id,id_owner = request.user )
            form = CreateDriver(request.POST, instance = driver)
            form.save()
            return redirect('view-drivers')
        except ValueError:
            return render(request,'driver_detail.html',{
            'driver':driver,
            'form': form,
            'error': 'Error al actualizar los datos',
        })

@login_required  
def deleteDriver(request, id):
    driver = get_object_or_404(BusDriver, pk = id, id_owner = request.user)
    if (request.method == 'POST'):
        driver.delete()
        return redirect('view-drivers')