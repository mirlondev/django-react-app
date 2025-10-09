from twilio.rest import Client
from django.conf import settings
import logging
from django.utils import timezone
from tcikets.models import User, Message

logger = logging.getLogger(__name__)

class WhatsAppService:
    def __init__(self):
        self._validate_twilio_config()
        try:
            self.client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
            # Toujours utiliser le format correct WhatsApp
            self.whatsapp_number = f'whatsapp:{settings.TWILIO_WHATSAPP_NUMBER}'
            if not self._test_connection():
                raise Exception("Impossible de s'authentifier auprès de Twilio. Vérifie SID/AuthToken.")
            logger.info("Service WhatsApp initialisé avec succès")
        except Exception as e:
            logger.error(f"Erreur d'initialisation Twilio: {str(e)}")
            raise

    def _validate_twilio_config(self):
        """Valide la configuration Twilio"""
        required_settings = [
            ('TWILIO_ACCOUNT_SID', getattr(settings, 'TWILIO_ACCOUNT_SID', None)),
            ('TWILIO_AUTH_TOKEN', getattr(settings, 'TWILIO_AUTH_TOKEN', None)),
            ('TWILIO_WHATSAPP_NUMBER', getattr(settings, 'TWILIO_WHATSAPP_NUMBER', None))
        ]
        missing = [name for name, value in required_settings if not value]
        if missing:
            raise Exception(f"Paramètres Twilio manquants: {', '.join(missing)}")

    def _test_connection(self):
        """Teste si l'authentification Twilio fonctionne"""
        try:
            account = self.client.api.accounts(settings.TWILIO_ACCOUNT_SID).fetch()
            logger.info(f"Connexion Twilio réussie pour {account.friendly_name}")
            return True
        except Exception as e:
            logger.error(f"Erreur d'authentification Twilio: {str(e)}")
            return False

    def _clean_phone_number(self, phone_number):
        if not phone_number:
            raise ValueError("Numéro de téléphone vide")
        cleaned = ''.join(filter(str.isdigit, str(phone_number)))
        if not cleaned:
            raise ValueError("Numéro de téléphone invalide")
        # Ajouter indicatif Congo si nécessaire
        if not cleaned.startswith('+'):
            if cleaned.startswith('0'):
                cleaned = '+242' + cleaned[1:]
            else:
                cleaned = '+' + cleaned
        return cleaned

    def send_message(self, to_number, message_body, media_url=None, ticket=None, sender_type="system"):
        """
        Envoie un message WhatsApp via Twilio et sauvegarde en base
        """
        try:
            to_number = self._clean_phone_number(to_number)
            message_params = {
                'from_': self.whatsapp_number,
                'body': message_body,
                'to': f'whatsapp:{to_number}'
            }
            if media_url:
                message_params['media_url'] = [media_url]

            twilio_message = self.client.messages.create(**message_params)

            # Sauvegarde en base
            if ticket:
                message = Message(
                    ticket=ticket,
                    content=message_body,
                    timestamp=timezone.now(),
                    is_whatsapp=True,
                    whatsapp_status='sent',
                    whatsapp_sid=twilio_message.sid
                )
                if media_url:
                    message.image = media_url
                message.save()

            logger.info(f"✅ Message WhatsApp envoyé et sauvegardé: SID {twilio_message.sid}")
            return twilio_message.sid

        except Exception as e:
            logger.error(f"❌ Erreur d'envoi WhatsApp: {str(e)}")
            # Sauvegarde de l'échec en base
            if ticket:
                try:
                    message = Message(
                        ticket=ticket,
                        content=message_body,
                        timestamp=timezone.now(),
                        is_whatsapp=True,
                        whatsapp_status='failed'
                    )
                    if media_url:
                        message.image = media_url
                    message.save()
                    logger.info("Message d'échec sauvegardé en base")
                except Exception as save_error:
                    logger.error(f"Erreur sauvegarde message d'échec: {str(save_error)}")
            raise Exception(f"Erreur d'envoi WhatsApp: {str(save_error)}")
        

    def send_ticket_created_notification(self, ticket):
        """Notification à l'admin lors de la création d'un ticket"""
        admins = User.objects.filter(userType='admin')
        message = (
            f"📩 Nouveau ticket créé par {ticket.client.user.get_full_name() or ticket.client.user.username}\n"
            f"Problème : {ticket.title}\n"
            f"Code : {ticket.code}\n"
            f"Priorité : {ticket.get_priority_display()}"
        )
        
        for admin in admins:
            if admin.phone:
                try:
                    self.send_message(
                        admin.phone, 
                        message, 
                        ticket=ticket,
                        sender_type="admin_notification"
                    )
                    logger.info(f"Notification admin envoyée à {admin.phone}")
                except Exception as e:
                    logger.error(f"Erreur WhatsApp lors de l'envoi à l'admin {admin.id}: {str(e)}")

# Fonction utilitaire globale
def notify_admins_ticket_created(ticket):
    """Envoie une notification WhatsApp à tous les admins"""
    try:
        service = WhatsAppService()
        service.send_ticket_created_notification(ticket)
    except Exception as e:
        logger.error(f"Erreur lors de l'envoi des notifications admin: {str(e)}")

# Fonction pour envoyer des messages depuis les vues
def send_whatsapp_to_client(ticket, message_content, user):
    """
    Envoie un message WhatsApp au client et le sauvegarde en base
    user: l'utilisateur qui envoie le message (admin/technicien)
    """
    try:
        service = WhatsAppService()
        message_sid = service.send_message(
            to_number=ticket.client.phone,
            message_body=message_content,
            ticket=ticket,
            sender_type=user.userType
        )
        
        # Le message est déjà sauvegardé par send_message, on peut logger le succès
        logger.info(f"Message WhatsApp envoyé au client {ticket.client.user.username}: {message_sid}")
        return message_sid
        
    except Exception as e:
        logger.error(f"Erreur lors de l'envoi au client: {str(e)}")
        raise