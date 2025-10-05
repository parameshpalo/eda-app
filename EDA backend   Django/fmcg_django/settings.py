import os
from pathlib import Path
import dj_database_url

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.getenv("DJANGO_SECRET_KEY", "unsafe-secret-for-dev")
# DEBUG = os.getenv("DJANGO_DEBUG", "1") != "0"
DEBUG = True


ALLOWED_HOSTS = ["localhost", "127.0.0.1", "eda-app-gcsn.vercel.app"]

INSTALLED_APPS = [
    "django.contrib.auth",          # 🔹 add this
    "django.contrib.contenttypes",  # needed for permissions
    "django.contrib.sessions",      # good practice
    "django.contrib.messages",      # optional but common
    "django.contrib.staticfiles",
    "rest_framework",
    "corsheaders",
    "fmcg_api",
]


MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
]

ROOT_URLCONF = "fmcg_django.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]


WSGI_APPLICATION = "fmcg_django.wsgi.application"

# DATABASE
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    # fallback to your FastAPI connection string (change if you want)
    "postgresql://postgres:DNZLSylZrtywxuiljnLHjClhjRXSEZkF@maglev.proxy.rlwy.net:56717/railway"
)
DATABASES = {"default": dj_database_url.parse(DATABASE_URL, conn_max_age=600)}

# Internationalization
LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = False
USE_TZ = True

STATIC_URL = "/static/"

# CORS - allow your frontend origins
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://eda-app-gcsn.vercel.app",
]
CORS_ALLOW_CREDENTIALS = True

REST_FRAMEWORK = {}
