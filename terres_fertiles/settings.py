import os
from pathlib import Path
from decouple import config

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.2/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-lj=da(jg)c)!pz@&6fgeon@+q1n0auof6hy@i0kf@-9@75=o!w'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ['*']

CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOWED_ORIGINS = [
    "http://localhost:4200",
    "https://tf.ismael-dev.com",
    "http://tf.ismael-dev.com",
]
# ajoute seulement si tu rencontres un CSRF origin mismatch
# CSRF_TRUSTED_ORIGINS = [
#     "https://tf.ismael-dev.com",
#     "https://terres-fertiles.ismael-dev.com",
# ]

# Application definition

INSTALLED_APPS = [
    'jazzmin',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework.authtoken',
    'django_filters',
    'core',
    'djoser',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    #'core.middleware.RedirectUnauthenticatedMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'terres_fertiles.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'templates')],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'terres_fertiles.wsgi.application'

AUTH_USER_MODEL = 'core.CustomUser' # Custom user models

# Database
# https://docs.djangoproject.com/en/5.2/ref/settings/#databases

# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.sqlite3',
#         'NAME': BASE_DIR / 'db.sqlite3',
#     }
# }
# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.mysql',
#         'NAME': 'terres_fertiles',
#         'USER': 'root',  # ou ton utilisateur MySQL
#         'PASSWORD': 'sacko',  # mot de passe si défini
#         'HOST': 'localhost',
#         'PORT': '3306',
#     }
# }
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': config('DATABASENAME'),  # Nom de la base de données MySQL
        'USER': config('DATABASEUSER'),  # Nom d'utilisateur MySQL
        'PASSWORD': config('DATABASEPASSWORD'),  # Mot de passe MySQL
        'HOST': 'localhost',  # Adresse de l'hôte, généralement localhost
        'PORT': '3306',  # Port MySQL, par défaut 3306
    }
}
# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.mysql',
#         'NAME': 'terres_fertiles',
#         'USER': 'root',  # ou ton utilisateur MySQL
#         'PASSWORD': 'sacko',  # mot de passe si défini
#         'HOST': 'localhost',
#         'PORT': '3306',
#     }
# }

# Password validation
# https://docs.djangoproject.com/en/5.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# # Django Rest Framework settings
# REST_FRAMEWORK = {
#     'DEFAULT_AUTHENTICATION_CLASSES': (
#         'rest_framework.authentication.SessionAuthentication',
#         'rest_framework.authentication.TokenAuthentication',
#     )
# }
REST_FRAMEWORK = {
        'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',  # Doit permettre accès libre à activation
    ],
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework.authentication.TokenAuthentication',
    ),
  
    'DEFAULT_FILTER_BACKENDS': (
        'django_filters.rest_framework.DjangoFilterBackend',
    ),
}
# settings.py
# SITE_NAME=localhost   en dev
# DOMAIN=localhost:4200  en dev
SITE_NAME = config("SITE_NAME", default="Terres Fertiles")
DOMAIN = config("DOMAIN", default="tf.ismael-dev.com")

DJOSER = {
    'LOGIN_FIELD': 'username',
    'SEND_ACTIVATION_EMAIL': False,
    'SEND_CONFIRMATION_EMAIL': False,
    'SEND_PASSWORD_RESET_EMAIL': False,
   
    'PASSWORD_RESET_CONFIRM_URL': 'reset-password-confirm/{uid}/{token}',
    'ACTIVATION_URL': 'activate/{uid}/{token}',
    'SERIALIZERS': {
        'user': 'core.serializers.CustomUserSerializer',
        'current_user': 'core.serializers.CustomUserSerializer',
        'user_create': 'core.serializers.CustomUserCreateSerializer',
    },
}





JAZZMIN_SETTINGS = {
    "site_title": "Admin Terre Fertiles",
    "site_header": "Terre Fertiles Admin",
    "site_brand": "Terre Fertiles",
    "welcome_sign": "Bienvenue sur le tableau de bord de Terre Fertiles",
"icons": {
    "core.CustomUser": "fas fa-user-cog",
    "core.Chantier": "fas fa-map-marked-alt",
    "core.Gisement": "fas fa-mountain",
    "core.Compost": "fas fa-seedling",
    "core.Melange": "fas fa-blender",
    "core.ProduitVente": "fas fa-truck-loading",
    "core.DocumentTechnique": "fas fa-file-upload",
    "core.DocumentGisement": "fas fa-file-alt",
    "core.AnalyseLaboratoire": "fas fa-vials",
    "core.ChantierRecepteur": "fas fa-house-user",
    "auth.Group": "fas fa-users",
    "auth.Permission": "fas fa-lock",
    "authtoken.tokenproxy": "fas fa-key",
    "core.MelangeIngredient": "fas fa-utensils",
    "core.MelangeAmendement": "fas fa-leaf",
    "core.Plateforme": "fas fa-warehouse",
    "core.amendementorganique": "fas fa-apple-alt",
    "core.DocumentProduitVente": "fas fa-file-invoice",
    "core.SaisieVente": "fas fa-receipt",
    "core.Planning": "fas fa-calendar-alt",
    "core.SuiviStockPlateforme": "fas fa-warehouse",
    "core.FicheAgroPedodeSol": "fas fa-book",
    "core.FicheHorizon": "fas fa-layer-group",
    "core.FichePhoto": "fas fa-images",
},
    "topmenu_links": [
        {"name": "Documentation", "url": "https://docs.terres-fertiles.com", "new_window": True, "icon": "fas fa-book"},
        {"name": "Support", "url": "https://support.terres-fertiles.com", "new_window": True, "icon": "fas fa-life-ring"},
        {"name": "GitHub", "url": "https://github.com/IsmalSacko", "new_window": True, "icon": "fab fa-github"},
        {"name": "Voir le site", "url": "http://localhost:4200", "new_window": True, "icon": "fas fa-external-link-alt"},
    ],
    "usermenu_links": [
        {"name": "Mon profil", "url": "admin:core_customuser_change", "icon": "fas fa-user"},
        {"name": "Déconnexion", "url": "admin:logout", "icon": "fas fa-sign-out-alt"},

    ],
    
     "navigation_expanded": True,
}

JAZZMIN_UI_TWEAKS = {
    "theme": "default",
}


# Internationalization
# https://docs.djangoproject.com/en/5.2/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.2/howto/static-files/

STATIC_URL = '/static/'
STATICFILES_DIRS = [
    BASE_DIR / 'core/static',  # ton JS est bien ici
]
STATIC_ROOT = BASE_DIR / 'staticfiles'  # 🔥 ajoute cette ligne
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Default primary key field type
# https://docs.djangoproject.com/en/5.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


APPEND_SLASH = False
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'in-v3.mailjet.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
#EMAIL_HOST_USER = config('MAILJET_API_KEY')
#EMAIL_HOST_PASSWORD = config('MAILJET_API_SECRET')
DEFAULT_FROM_EMAIL = 'ismaila.sacko@terres-fertiles.com'
PASSWORD_RESET_TIMEOUT = 900  # 900 # 15 minutes


