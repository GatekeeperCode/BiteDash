# Welcome to Cloud Functions for Firebase for Python!
# To get started, simply uncomment the below code or create your own.
# Deploy with `firebase deploy`

from firebase_admin import initialize_app, firestore, credentials
from firebase_functions.firestore_fn import (
  on_document_updated,
  Event,
  Change,
  DocumentSnapshot,
)

#Replace API Key Before Testing
cred = credentials.Certificate({
  "type": "",
  "project_id": "",
  "private_key_id": "",
  "private_key": "",
  "client_email": "",
  "client_id": "",
  "auth_uri": "",
  "token_uri": "",
  "auth_provider_x509_cert_url": "",
  "client_x509_cert_url": "",
  "universe_domain": ""
})

app = initialize_app(cred)
client = firestore.client()

@on_document_updated(document='mealsTest/{mealId}')
def reset_ratings(event: Event[Change[DocumentSnapshot]]) -> None:
    # Fixing meals
    meals = client.collection('meals').stream()
    for meal_ref in meals:
        meal_ref.reference.update({'rating': 0, 'ratingsV2': [], 'up': 0, 'down': 0})

