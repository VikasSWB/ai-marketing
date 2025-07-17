from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.cache import cache
from django.contrib.auth.models import User ### LIMITAION 
from .models import Order,UserProfile  # adjust if your model name is different

# @receiver(post_save, sender=Order)
# def clear_cohort_cache(sender, instance, **kwargs):
#     """
#     Clear all cohort cache keys when a new order is created.
#     """
#     keys_to_clear = [key for key in cache._cache.keys() if key.startswith('cohort_data_')]
#     for key in keys_to_clear:
#         cache.delete(key)

 
 ### NEW LIMITATION ###
# Creates UserProfile when a new User is created
@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)

# Saves UserProfile when the User is saved
@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.userprofile.save()