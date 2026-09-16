from django import forms
from .models import BusDriver

class CreateDriver(forms.ModelForm):
    class Meta:
        model = BusDriver
        fields = ['name', 'email', 'password', 'phone', 'route']
        widgets = {
            'name': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Ej.Juan Perez', 'minlength':'9'}),
            'email': forms.EmailInput(attrs={'class': 'form-control', 'placeholder': 'Ej. correo@ejemplo.com',}),
            'password': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Minimo 8 caracteres', 'minlength':'8'}),
            #'password': forms.PasswordInput(attrs={'class': 'form-control'}),
            'phone': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Ej.3333333333', 'minlength':'10'}),
            'route': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Ej.604', 'minlength':'2'})
        }