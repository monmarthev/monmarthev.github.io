const express = require('express');
const app = express();
// Charger les variables d'environnement depuis .env
require('dotenv').config(); 

// Lire la clé secrète Stripe depuis les variables d'environnement
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  console.error('Erreur: La variable d\'environnement STRIPE_SECRET_KEY n\'est pas définie.');
  console.error('Assurez-vous d\'avoir créé un fichier .env avec STRIPE_SECRET_KEY=votre_clé_secrète');
  process.exit(1); // Arrêter le serveur si la clé n'est pas trouvée
}

const stripe = require('stripe')(stripeSecretKey);

// Important : Pour une vraie application, déplacez votre clé secrète 
// dans une variable d'environnement sécurisée (ex: .env) et ne la codez pas en dur.

app.use(express.static('.')); // Pour servir les fichiers statiques (index.html, etc.)
app.use(express.json());

// Remplacez par votre domaine réel si vous déployez
// Pour les tests locaux, localhost:4242 est généralement correct.
const YOUR_DOMAIN = process.env.YOUR_DOMAIN || 'http://localhost:4242'; 

app.post('/create-checkout-session', async (req, res) => {
  try {
    // Récupérer l'ID du prix depuis la requête client (plus flexible)
    // Pour l'instant, nous utilisons toujours l'ID codé en dur, mais c'est une amélioration possible.
    const priceId = 'price_1RDSpYQTK3FebJtBxPdw0h4d'; // L'ID de prix que vous m'avez donné

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      // Assurez-vous que ces fichiers existent ou créez-les
      success_url: `${YOUR_DOMAIN}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${YOUR_DOMAIN}/cancel.html`,
    });

    res.json({ id: session.id }); // Renvoyer l'ID de session au client
  } catch (error) {
      console.error("Erreur lors de la création de la session Stripe:", error);
      // Renvoyer une erreur plus générique au client pour la sécurité
      res.status(500).json({ error: { message: 'Internal Server Error' } });
  }
});

// Route simple pour vérifier que le serveur fonctionne
app.get('/ping', (req, res) => {
    res.send('pong');
});

const port = process.env.PORT || 4242;
app.listen(port, () => console.log(`Serveur démarré sur ${YOUR_DOMAIN}`)); 