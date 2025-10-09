# support/utils/whatsapp_service.py
from twilio.rest import Client
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

class WhatsAppService:
    def __init__(self):
        self._validate_twilio_config()
        try:
            self.client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
            self.whatsapp_number = settings.TWILIO_WHATSAPP_NUMBER
            logger.info("Service WhatsApp initialisé avec succès")
        except Exception as e:
            logger.error(f"Erreur d'initialisation du client Twilio: {str(e)}")
            raise Exception(f"Erreur d'initialisation Twilio: {str(e)}")

    def _validate_twilio_config(self):
        """Valide la configuration Twilio"""
        required = [
            ('TWILIO_ACCOUNT_SID', getattr(settings, 'TWILIO_ACCOUNT_SID', None)),
            ('TWILIO_AUTH_TOKEN', getattr(settings, 'TWILIO_AUTH_TOKEN', None)),
            ('TWILIO_WHATSAPP_NUMBER', getattr(settings, 'TWILIO_WHATSAPP_NUMBER', None))
        ]
        missing = [name for name, value in required if not value]
        if missing:
            error_msg = f"Paramètres Twilio manquants: {', '.join(missing)}"
            logger.error(error_msg)
            raise Exception(error_msg)

    def send_message(self, to_number, message_body, media_url=None):
        """Envoie un message WhatsApp avec option média"""
        to_number = self._clean_phone_number(to_number)
        params = {
            'from_': self.whatsapp_number,
            'to': f'whatsapp:{to_number}',
            'body': message_body
        }
        if media_url:
            params['media_url'] = [media_url]

        try:
            message = self.client.messages.create(**params)
            logger.info(f"Message WhatsApp envoyé à {to_number}: SID {message.sid}")
            return message.sid
        except Exception as e:
            logger.error(f"Erreur d'envoi WhatsApp à {to_number}: {str(e)}")
            raise Exception(f"Erreur d'envoi WhatsApp: {str(e)}")

    def _clean_phone_number(self, phone_number):
        """Nettoie et formate le numéro de téléphone au format +242XXXXXXXXX"""
        if not phone_number:
            raise Exception("Numéro de téléphone vide")

        cleaned = ''.join(filter(str.isdigit, str(phone_number)))
        if not cleaned:
            raise Exception("Numéro de téléphone invalide")

        # Si commence par 0 => Congo +242
        if cleaned.startswith('0'):
            cleaned = '+242' + cleaned[1:]
        elif not cleaned.startswith('+'):
            cleaned = '+' + cleaned

        return cleaned
