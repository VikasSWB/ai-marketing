# dashboard/models.py
from django.db import models
from django.contrib.auth.models import User

class Order(models.Model):
    id = models.BigAutoField(primary_key=True)
    order_id = models.CharField(max_length=50)
    order_number = models.CharField(max_length=50)
    order_name = models.CharField(max_length=255)
    customer_name = models.CharField(max_length=255)
    customer_email = models.EmailField()
    billing_address = models.TextField()
    shipping_address = models.TextField()
    currency = models.CharField(max_length=10)
    subtotal_price = models.DecimalField(max_digits=10, decimal_places=2)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2)
    shipping_cost = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField()
    payment_method = models.CharField(max_length=50)
    order_status = models.CharField(max_length=50)
    products = models.TextField()  # Assuming products is stored as a JSON string or comma-separated values
    invoice_status = models.CharField(max_length=50)
    email_status = models.CharField(max_length=50)
    pdf_invoice = models.TextField(null=True, blank=True)
    coupon_code = models.CharField(max_length=50, null=True, blank=True)

    class Meta:
        db_table = 'orders'  # Match the table name in the test schema
        managed = False  # Django won't manage the table since it already exists

    def __str__(self):
        return f"Order {self.order_number}"
    
class GoogleAdStrategy(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='google_strategies')
    goal = models.CharField(max_length=50)
    budget = models.DecimalField(max_digits=10, decimal_places=2)
    duration = models.PositiveIntegerField()
    audience_gender = models.CharField(max_length=20)
    audience_start = models.PositiveIntegerField()
    audience_end = models.PositiveIntegerField()
    audience_interest = models.CharField(max_length=100)
    ad_type = models.CharField(max_length=100, blank=True, null=True)
    manual_ad_type = models.CharField(max_length=100, blank=True, null=True)
    cta = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)
    video = models.FileField(upload_to='videos/', null=True, blank=True)
    image = models.ImageField(upload_to='images/', null=True, blank=True)

    def __str__(self):
        return f"{self.goal} (${self.budget})"

class MetaAdStrategy(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='meta_strategies')
    goal = models.CharField(max_length=50)
    budget = models.DecimalField(max_digits=10, decimal_places=2)
    duration = models.PositiveIntegerField()
    audience_gender = models.CharField(max_length=20)
    audience_start = models.PositiveIntegerField()
    audience_end = models.PositiveIntegerField()
    audience_interest = models.CharField(max_length=100)
    ad_type = models.CharField(max_length=100, blank=True, null=True)
    manual_ad_type = models.CharField(max_length=100, blank=True, null=True)
    cta = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)
    video = models.FileField(upload_to='videos/', null=True, blank=True)
    image = models.ImageField(upload_to='images/', null=True, blank=True)

    def __str__(self):
        return f"{self.goal} (${self.budget})"