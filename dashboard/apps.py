# from django.apps import AppConfig


# class DashboardConfig(AppConfig):
#     default_auto_field = 'django.db.models.BigAutoField'
#     name = 'dashboard'

from django.apps import AppConfig

class DashboardConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'dashboard'

    def ready(self):
        import dashboard.signals  # 👈 this line activates the signals
