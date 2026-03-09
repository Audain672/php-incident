# Configuration du Mode API

L'application Incident Reporter supporte deux modes de fonctionnement :

## 🏠 Mode LocalStorage (Développement)

**Configuration par défaut** - Idéal pour le développement et la démonstration.

### Fonctionnalités :
- ✅ Authentification locale avec comptes démo
- ✅ Gestion complète des incidents (CRUD)
- ✅ Persistance des données dans le navigateur
- ✅ Aucune dépendance au backend
- ✅ Données de démonstration pré-chargées

### Comptes démo :
- **Admin** : `admin@example.com` / `admin123`
- **Utilisateur** : `demo@example.com` / `demo123`

### Activation :
```bash
# Créer le fichier .env.local
cp .env.example .env.local

# S'assurer que la variable est correcte
VITE_API_MODE=local
```

## 🌐 Mode API (Production)

**Pour production** - Se connecte à un backend réel.

### Prérequis :
- Backend API fonctionnel
- Base de données configurée
- Endpoint API accessible

### Activation :
```bash
# Modifier .env.local
VITE_API_MODE=api
VITE_API_BASE_URL=http://votre-backend.com/api
```

## 🔄 Basculement Automatique

L'application utilise une configuration dynamique qui bascule automatiquement selon `VITE_API_MODE` :

- **`local`** → Utilise `localStorage` et les APIs mock
- **`api`** → Utilise les vraies APIs backend

### Fichiers concernés :
- `src/config/apiConfig.js` - Configuration centrale
- `src/hooks/index.js` - Hooks dynamiques
- `src/api/localAuthApi.js` - API auth locale
- `src/api/localIncidentApi.js` - API incidents locale

## 🎯 Avantages

### Mode LocalStorage :
- 🚀 Développement rapide sans backend
- 💾 Données persistantes localement
- 🧪 Tests faciles et reproductibles
- 📱 Hors-ligne fonctionnel

### Mode API :
- 🔒 Production-ready
- 🗄️ Base de données partagée
- 👥 Multi-utilisateurs réel
- 📊 Scalabilité

## 🔧 Variables d'Environnement

```bash
# Mode de fonctionnement (local/api)
VITE_API_MODE=local

# URL de l'API (mode api uniquement)
VITE_API_BASE_URL=http://localhost:8000/api

# Timeout des requêtes API
VITE_API_TIMEOUT=10000

# Activer les délais simulés (mode local)
VITE_MOCK_DELAY=true
```

## 🐛 Débogage

En développement, un indicateur visuel affiche le mode actuel :
- 🟢 **VERT** = Mode LocalStorage
- 🔵 **BLEU** = Mode API

L'indicateur s'affiche en haut à droite de l'écran.

## 📝 Notes

- Le basculement ne nécessite **aucune modification de code**
- Les hooks React s'adaptent automatiquement
- La persistance des données est gérée selon le mode
- Les erreurs API sont gérées gracieusement

## 🚀 Mise en Production

1. Configurer `VITE_API_MODE=api`
2. Définir `VITE_API_BASE_URL`
3. Désactiver `VITE_MOCK_DELAY`
4. Builder l'application : `npm run build`

---

**Pour passer du développement à la production, il suffit de modifier une seule variable d'environnement !** 🎉
