import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'support.settings')
django.setup()

from django.test import RequestFactory
from rest_framework.test import force_authenticate
from tcikets.views import send_to_client, send_to_technician
from tcikets.models import Ticket, Client, User, Technician

def test_whatsapp_views():
    factory = RequestFactory()
    
    # Créer un utilisateur de test
    user = User.objects.create_user(
        username='testuser',
        password='testpass',
        email='test@example.com'
    )
    
    # Créer un ticket de test
    client_user = User.objects.create_user(
        username='clientuser',
        password='testpass',
        email='client@example.com'
    )
    client = Client.objects.create(
        user=client_user,
        phone='+33612345678',
        company='Test Company'
    )
    
    ticket = Ticket.objects.create(
        title='Test Ticket',
        description='Test Description',
        client=client,
        priority='medium',
        status='open'
    )
    
    # Test send_to_client
    request = factory.post(f'/api/tickets/{ticket.id}/send-to-client/', {
        'content': 'Test message to client'
    })
    force_authenticate(request, user=user)
    
    response = send_to_client(request, ticket.id)
    print(f"send_to_client response: {response.status_code}")
    print(f"send_to_client data: {response.data}")
    
    # Test send_to_technician avec technicien
    tech_user = User.objects.create_user(
        username='techuser',
        password='testpass',
        email='tech@example.com'
    )
    technician = Technician.objects.create(
        user=tech_user,
        phone='+33687654321',
        specialty='hardware'
    )
    
    ticket.technician = technician
    ticket.save()
    
    request = factory.post(f'/api/tickets/{ticket.id}/send-to-technician/', {
        'content': 'Test message to technician'
    })
    force_authenticate(request, user=user)
    
    response = send_to_technician(request, ticket.id)
    print(f"send_to_technician response: {response.status_code}")
    print(f"send_to_technician data: {response.data}")

if __name__ == "__main__":
    test_whatsapp_views()