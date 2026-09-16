from django.shortcuts import redirect, render
from django.http import HttpResponse
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth import login, logout, authenticate
from django.core.mail import send_mail
from django.conf import settings

@api_view(['GET', 'POST'])
# Create your views here.
def home_view(request, *args, **kwargs):
    return render(request, 'index.html')

def contact(request):
    if request.method == 'POST':
        name = request.POST.get('name')
        email = request.POST.get('email')
        subject = request.POST.get('subject')
        phone = request.POST.get('phone')
        message = request.POST.get('message')

        # Simple form validation
        if not name or not email or not subject or not phone or not message:
            return render(request, 'contact.html', {'error_message': 'All fields are required.'})

        # Send the email
        send_mail(
            subject,
            f'From: {name}\nEmail: {email}\nTelefonoe: {phone}\n\n\{message}',
            email,
            ['mariana.corona9828@alumnos.udg.mx'],
            fail_silently=False,  # Set to True to ignore errors during sending (not recommended in production)
        )

        # Redirect to a thank you page or display a success message
        return render(request, 'contact.html')

    # Render the form for GET requests
    return render(request, 'contact.html')
    
def signout(request):
    logout(request)
    return redirect('home')

def signin(request):
    if request.method == 'GET':
        return render(request, 'login.html', {'form': AuthenticationForm()})
    elif request.method == 'POST':
        user = authenticate(request, username=request.POST.get('username'), password=request.POST.get('password'))
        if user is not None:
            login(request, user)
            # El usuario se autenticó correctamente, puedes realizar acciones adicionales aquí si es necesario.
            return redirect('view-drivers') # Página de éxito o redirección a otra vista
        else:
            return render(request, 'login.html', {'form': AuthenticationForm(), 'error': 'Usuario o contraseña incorrecta'})
