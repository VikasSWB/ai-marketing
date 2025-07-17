

from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.db.models import Sum, Count, Avg
from django.db.models.functions import TruncMonth, TruncYear
from .models import Order
from django.utils import timezone
from datetime import timedelta,date,datetime
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.contrib import messages
import json
import pandas as pd
from django.db.models import Count, Min, Max, Avg, Sum, F,Q
from dateutil.relativedelta import relativedelta
from django.utils.dateparse import parse_date
import datetime
import math
import logging
import traceback 
from django.views.decorators.csrf import csrf_exempt
from django.core.cache import cache
from .models import GoogleAdStrategy, MetaAdStrategy
import google.generativeai as genai
from django.shortcuts import render, redirect
from django.contrib import messages
import re
from django.urls import reverse
from django.http import JsonResponse
import numpy as np
import sys
import os
from django.http import HttpResponse
import joblib

##### MACHINELERNING PART churn thing ###

# Load the trained churn prediction model once
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'static', 'ml', 'churn_model.pkl')
if os.path.exists(MODEL_PATH):
    churn_model = joblib.load(MODEL_PATH)
else:
    churn_model = None
    logger.warning("Churn model not found. ML churn predictions will be skipped.")

def predict_churn_model(recency, frequency, monetary):
    if churn_model:
        X = pd.DataFrame([{
            'recency': float(recency),
            'frequency': float(frequency),
            'monetary': float(monetary)
        }])
        pred = churn_model.predict(X)[0]
        prob = churn_model.predict_proba(X)[0][1] * 100  # Convert to %
        return "Yes" if pred == 1 else "No", round(prob, 2)
    else:
        return "Unknown", 0.0


## FOR LIMITING ADDS ###
from .models import UserProfile

## FOR ADS ## 
from facebook_business.api import FacebookAdsApi
from facebook_business.adobjects.adaccount import AdAccount
from facebook_business.adobjects.campaign import Campaign
from django.conf import settings
from facebook_business.adobjects.adset import AdSet
from facebook_business.exceptions import FacebookRequestError
from facebook_business.adobjects.targetingsearch import TargetingSearch


@login_required(login_url='signin')
def dashboard(request):
    return render(request, 'dashboard.html')

def signin(request):
    if request.user.is_authenticated:
        return redirect('dashboard')
    
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return redirect('dashboard')
        else:
            messages.error(request, 'Invalid username or password.')
    
    return render(request, 'signin.html')

def signup(request):
    if request.user.is_authenticated:
        return redirect('dashboard')
    
    if request.method == 'POST':
        username = request.POST.get('username')
        email = request.POST.get('email')
        password1 = request.POST.get('password1')
        password2 = request.POST.get('password2')
        
        if password1 != password2:
            messages.error(request, 'Passwords do not match.')
        elif User.objects.filter(username=username).exists():
            messages.error(request, 'Username already exists.')
        elif User.objects.filter(email=email).exists():
            messages.error(request, 'Email already exists.')
        else:
            user = User.objects.create_user(username=username, email=email, password=password1)
            user.save()
            login(request, user)
            return redirect('dashboard')
    
    return render(request, 'signup.html')

def signout(request):
    logout(request)
    return redirect('signup')

@login_required(login_url='signin')
def get_dashboard_data(request):
    # Parse custom range from query params
    start_date_str = request.GET.get('start_date', '').strip()
    end_date_str = request.GET.get('end_date', '').strip()

    today = timezone.now().date()  # May 22, 2025
    default_start_date = today - datetime.timedelta(days=365)  # May 22, 2024

    # Parse dates if provided, otherwise set to None
    # Use datetime.strptime for predictable parsing of YYYY-MM-DD format
    try:
        start_date = datetime.datetime.strptime(start_date_str, '%Y-%m-%d').date() if start_date_str else None
    except ValueError:
        start_date = None

    try:
        end_date = datetime.datetime.strptime(end_date_str, '%Y-%m-%d').date() if end_date_str else None
    except ValueError:
        end_date = None

    # Determine if this is the default "Last 1 Year" range
    date_diff_days = (end_date - start_date).days
    is_default_range = date_diff_days >= 360 and date_diff_days <= 370
 

    # If no dates provided or invalid dates, set to default range (for initial load)
    if not start_date or not end_date:
        start_date = default_start_date
        end_date = today
        is_default_range = True

    # Filter orders based on the date range
    orders = Order.objects.filter(created_at__date__range=[start_date, end_date])

    # ======================
    # Today’s Stats
    # ======================
    today_orders = Order.objects.filter(created_at__date=today)
    today_customers = today_orders.values('customer_email').distinct().count()
    today_products = sum(len(set(order.products.split(','))) for order in today_orders if order.products)

    total_orders = orders.count()
    total_revenue = orders.aggregate(Sum('total_price'))['total_price__sum'] or 0

    # ======================
    # Orders & Revenue Trend
    # ======================
    orders_by_month = orders.annotate(month=TruncMonth('created_at')).values('month').annotate(
        order_count=Count('id'),
        revenue=Sum('total_price')
    ).order_by('month')
    orders_revenue_data = {
        'labels': [entry['month'].strftime('%b %Y') for entry in orders_by_month],
        'orders': [entry['order_count'] for entry in orders_by_month],
        'revenue': [float(entry['revenue']) if entry['revenue'] else 0.0 for entry in orders_by_month]
    }

    # ======================
    # Yearly Sales Chart
    # ======================
    if is_default_range:
        # Default "Last 1 Year": Compare 2024 and 2025 month-wise
        orders_2024 = orders.filter(created_at__year=2024)
        orders_2025 = orders.filter(created_at__year=2025)

        def group_by_month(qs):
            return qs.annotate(month=TruncMonth('created_at')).values('month').annotate(
                total_sales=Sum('total_price')
            ).order_by('month')

        data_2024 = group_by_month(orders_2024)
        data_2025 = group_by_month(orders_2025)

        months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

        def map_months(data):
            lookup = {entry['month'].strftime('%b'): float(entry['total_sales']) if entry['total_sales'] else 0.0 for entry in data}
            return [lookup.get(month, 0.0) for month in months]

        yearly_sales_data = {
            'labels': months,
            'datasets': [
                {
                    'label': '2025 Sales ($)',
                    'data': map_months(data_2025),
                    'borderColor': '#000000',  # Black for 2025
                    'backgroundColor': 'rgba(0, 0, 0, 0.2)',
                    'fill': True
                },
                {
                    'label': '2024 Sales ($)',
                    'data': map_months(data_2024),
                    'borderColor': '#D3D3D3',  # Light gray for 2024
                    'backgroundColor': 'rgba(211, 211, 211, 0.2)',
                    'fill': True
                }
            ]
        }
    else:
        # Custom range: Show total sales per year
        yearly_sales = orders.annotate(year=TruncYear('created_at')).values('year').annotate(
            total_sales=Sum('total_price')
        ).order_by('year')
        yearly_sales_data = {
            'labels': [entry['year'].strftime('%Y') for entry in yearly_sales],
            'datasets': [{
                'label': 'Total Sales ($)',
                'data': [float(entry['total_sales']) if entry['total_sales'] else 0.0 for entry in yearly_sales],
                'borderColor': '#000000',
                'backgroundColor': 'rgba(0, 0, 0, 0.2)',
                'fill': True
            }]
        }

    # ======================
    # Other Charts
    # ======================
    order_status = orders.values('order_status').annotate(avg_total=Avg('total_price')).order_by('order_status')
    order_status_data = {
        'labels': [entry['order_status'] for entry in order_status],
        'data': [float(entry['avg_total']) if entry['avg_total'] else 0.0 for entry in order_status]
    }

    payment_method = orders.values('payment_method').annotate(total_revenue=Sum('total_price')).order_by('payment_method')
    payment_method_data = {
        'labels': [entry['payment_method'] for entry in payment_method],
        'data': [float(entry['total_revenue']) if entry['total_revenue'] else 0.0 for entry in payment_method]
    }

    avg_order_value = orders.values('customer_email').annotate(avg_value=Avg('total_price')).order_by('-avg_value')[:5]
    avg_order_value_data = {
        'labels': [entry['customer_email'] for entry in avg_order_value],
        'data': [float(entry['avg_value']) if entry['avg_value'] else 0.0 for entry in avg_order_value]
    }

    payment_popularity = orders.values('payment_method').annotate(count=Count('id')).order_by('-count')
    payment_popularity_data = {
        'labels': [entry['payment_method'] for entry in payment_popularity],
        'data': [entry['count'] for entry in payment_popularity]
    }

    recent_orders = orders.order_by('-created_at')[:5].values(
        'order_number', 'created_at', 'customer_name', 'total_price', 'order_status'
    )

    product_counts = {}
    for order in orders:
        try:
            products_list = json.loads(order.products)  # Parse actual JSON list
            for product in products_list:
                if isinstance(product, dict):
                    product_name = product.get("name", "").strip()
                    if product_name:
                        product_counts[product_name] = product_counts.get(product_name, 0) + 1
        except (json.JSONDecodeError, TypeError):
            continue  # Skip if JSON invalid
                
    top_products = sorted(product_counts.items(), key=lambda x: x[1], reverse=True)[:5]
    top_products_data = [{'product': name, 'count': count} for name, count in top_products]
    
    discount_usage = orders.values('coupon_code').annotate(times_used=Count('id')).exclude(coupon_code__isnull=True).order_by('-times_used')[:5]

    return JsonResponse({
        'today_customers': today_customers,
        'today_products': today_products,
        'total_orders': total_orders,
        'total_revenue': float(total_revenue),
        'orders_revenue': orders_revenue_data,
        'yearly_sales': yearly_sales_data,
        'order_status': order_status_data,
        'payment_method': payment_method_data,
        'avg_order_value': avg_order_value_data,
        'payment_popularity': payment_popularity_data,
        'recent_orders': list(recent_orders),
        'top_products': top_products_data,
        'discount_usage': list(discount_usage)
    })

import logging
# Configure the logger
logger = logging.getLogger(__name__)  # __name__ ensures the logger is named after the module (e.g., 'dashboard.views')
# Placeholder views for sidebar links (to be implemented later)
@login_required
def customer_insights_data(request):
    """
    API endpoint to provide data for customer insights visualizations.
    """
    try:
        logger.info("Fetching customer insights data...")

        # Get query parameters for range filtering, date range, and pagination
        min_orders = int(request.GET.get('min_orders', 0))
        max_orders = request.GET.get('max_orders', None)  # None means no upper limit
        start_date = request.GET.get('start_date', None)
        end_date = request.GET.get('end_date', None)
        date_range_option = request.GET.get('date_range_option', 'last_1_year')  # Default to last 1 year
        page = int(request.GET.get('page', 1))
        items_per_page = 20

        # 1. Top Customers by Total Orders (top 10 customers by number of orders)
        # Apply date range filter to the orders used for top customers
        top_customers_query = (Order.objects.values('customer_name', 'customer_email')
                              .annotate(total_orders=Count('order_id')))
        
        if start_date and end_date:
            start_date = pd.to_datetime(start_date).tz_localize('UTC')
            end_date = pd.to_datetime(end_date).tz_localize('UTC')
            top_customers_query = top_customers_query.filter(created_at__gte=start_date, created_at__lte=end_date)
        elif date_range_option != 'all':
            # Default to the most recent 1 year (April 2024 to April 2025)
            end_date = pd.to_datetime('2025-04-02').tz_localize('UTC')  # Current date
            start_date = end_date - pd.Timedelta(days=365)  # 1 year ago
            top_customers_query = top_customers_query.filter(created_at__gte=start_date, created_at__lte=end_date)

        top_customers = top_customers_query.order_by('-total_orders')[:10]
        customer_names = [item['customer_name'] for item in top_customers]
        total_orders = [item['total_orders'] for item in top_customers]
        logger.debug(f"Top Customers Data: {list(top_customers)}")

        # 2. Customer Order Trend Over Time (total orders per month)
        orders_over_time_query = (Order.objects
                                 .annotate(month=TruncMonth('created_at'))  # Changed from order_date to created_at
                                 .values('month')
                                 .annotate(total_orders=Count('order_id'))
                                 .order_by('month'))

        # Apply date range filter to orders_over_time
        if start_date and end_date:
            orders_over_time_query = orders_over_time_query.filter(created_at__gte=start_date, created_at__lte=end_date)
        elif date_range_option != 'all':
            orders_over_time_query = orders_over_time_query.filter(created_at__gte=start_date, created_at__lte=end_date)

        orders_over_time = list(orders_over_time_query)

        # Generate a list of months and order counts, filling in gaps with zeros
        earliest_order = Order.objects.earliest('created_at')  # Changed from order_date to created_at
        earliest_date = earliest_order.created_at.date() if earliest_order else timezone.now().date()
        today = timezone.now().date()
        earliest_month = earliest_date.replace(day=1)

        # Adjust the timeline based on the date range
        if start_date and end_date:
            timeline_start = start_date.date().replace(day=1)
            timeline_end = end_date.date().replace(day=1)
        elif date_range_option == 'all':
            timeline_start = earliest_month
            timeline_end = today.replace(day=1)
        else:
            timeline_start = start_date.date().replace(day=1)
            timeline_end = end_date.date().replace(day=1)

        order_months = []
        order_values = []
        current_month = timeline_start
        while current_month <= timeline_end:
            order_months.append(current_month.strftime('%Y-%m'))
            order_value = next((item['total_orders'] for item in orders_over_time if item['month'].date() == current_month), 0)
            order_values.append(order_value)
            current_month = (current_month + timedelta(days=32)).replace(day=1)
        logger.debug(f"Order Trend Data: Months={order_months}, Values={order_values}")

        # 3. Customer Details Table (group by customer, count total orders, filter by range, paginate)
        customer_details_query = (Order.objects.values('customer_name', 'customer_email')
                                .annotate(total_orders=Count('order_id'))
                                .order_by('-total_orders'))

        # Apply date range filter to customer details
        if start_date and end_date:
            customer_details_query = customer_details_query.filter(created_at__gte=start_date, created_at__lte=end_date)
        elif date_range_option != 'all':
            customer_details_query = customer_details_query.filter(created_at__gte=start_date, created_at__lte=end_date)

        # Apply range filtering for total orders
        if max_orders is not None:
            max_orders = int(max_orders)
            customer_details_query = customer_details_query.filter(total_orders__gte=min_orders, total_orders__lt=max_orders)
        else:
            customer_details_query = customer_details_query.filter(total_orders__gte=min_orders)

        # Get total count for pagination
        total_customers = customer_details_query.count()
        total_pages = (total_customers + items_per_page - 1) // items_per_page  # Ceiling division

        # Apply pagination
        start_index = (page - 1) * items_per_page
        end_index = start_index + items_per_page
        customer_details = customer_details_query[start_index:end_index]
        customer_details_list = list(customer_details)
        logger.debug(f"Customer Details Data: Page={page}, Range={min_orders}-{max_orders}, Data={customer_details_list}")

        # 4. Calculate order ranges for the dropdown
        max_customer_orders = (Order.objects.values('customer_name')
                             .annotate(total_orders=Count('order_id'))
                             .order_by('-total_orders')
                             .first())
        max_orders_value = max_customer_orders['total_orders'] if max_customer_orders else 0
        order_ranges = []
        step = 20
        for i in range(0, max_orders_value + step, step):
            range_start = i
            range_end = i + step
            order_ranges.append({'min': range_start, 'max': range_end})
        logger.debug(f"Order Ranges: {order_ranges}")

        data = {
            'customer_names': customer_names,
            'total_orders': total_orders,
            'order_months': order_months,
            'order_values': order_values,
            'customer_details': customer_details_list,
            'total_pages': total_pages,
            'current_page': page,
            'order_ranges': order_ranges,
        }
        logger.info("Customer insights data fetched successfully.")
        return JsonResponse(data, safe=False)

    except Exception as e:
        logger.error(f"Error in customer_insights_data: {str(e)}", exc_info=True)
        return JsonResponse({'error': f'Server error: {str(e)}'}, status=500)

@login_required(login_url='/signin/')
def customer_insights(request):
    return render(request, 'customer_insights.html')


# Customer Profile Views
@login_required
def customer_profile_data(request):
    """
    API endpoint to provide data for customer profile visualizations.
    """
    try:
        logger.info("Fetching customer profile data...")

        customer_name = request.GET.get('customer_name', None)

        if not customer_name:
            # Return a list of all customer names for the dropdown
            customers = Order.objects.values_list('customer_name', flat=True).distinct().order_by('customer_name')
            logger.info("Returning list of customers for dropdown.")
            return JsonResponse({'customers': list(customers)}, safe=False)

        # Fetch customer-specific data
        customer_orders = Order.objects.filter(customer_name=customer_name)

        if not customer_orders.exists():
            logger.warning(f"No orders found for customer: {customer_name}")
            return JsonResponse({'error': f'No orders found for customer: {customer_name}'}, status=404)

        # Basic customer info
        customer_email = customer_orders.first().customer_email
        first_order = customer_orders.earliest('created_at')
        last_order = customer_orders.latest('created_at')
        first_order_date = first_order.created_at.strftime('%Y-%m-%d')
        last_order_date = last_order.created_at.strftime('%Y-%m-%d')

        # Lifetime (in months)
        lifetime_delta = relativedelta(last_order.created_at, first_order.created_at)
        lifetime_months = lifetime_delta.years * 12 + lifetime_delta.months + lifetime_delta.days / 30.0
        lifetime_months = max(lifetime_months, 0)

        # Total LTV (Lifetime Value)
        ltv = customer_orders.aggregate(total=Sum('total_price'))['total'] or 0
        ltv = float(ltv)  # Convert Decimal to float

        # Average days between orders
        order_dates = customer_orders.values_list('created_at', flat=True).order_by('created_at')
        if len(order_dates) > 1:
            date_diffs = [(order_dates[i+1] - order_dates[i]).days for i in range(len(order_dates)-1)]
            avg_days_between_orders = sum(date_diffs) / len(date_diffs)
        else:
            avg_days_between_orders = 0

        # Estimated next order date (based on average days between orders)
        if avg_days_between_orders > 0:
            est_next_order_date = last_order.created_at + timedelta(days=avg_days_between_orders)
            est_next_order_date_str = est_next_order_date.strftime('%Y-%m-%d')
        else:
            est_next_order_date_str = 'N/A'

        # RFM calculation (Recency, Frequency, Monetary) with normalized scores
        recency = (timezone.now() - last_order.created_at).days
        frequency = customer_orders.count()
        monetary = ltv

        # Normalize RFM scores (scale 1-5)
        all_recency = Order.objects.values('customer_name').annotate(last_order=Max('created_at'))
        recency_values = [(timezone.now() - r['last_order']).days for r in all_recency]
        max_recency = max(recency_values) if recency_values else 1
        recency_score = 5 - min(4, (recency / max_recency) * 5)  # Lower recency = higher score

        all_frequency = Order.objects.values('customer_name').annotate(freq=Count('order_id'))
        frequency_values = [f['freq'] for f in all_frequency]
        max_frequency = max(frequency_values) if frequency_values else 1
        frequency_score = min(5, (frequency / max_frequency) * 5)

        all_monetary = Order.objects.values('customer_name').annotate(total=Sum('total_price'))
        monetary_values = [float(m['total']) for m in all_monetary if m['total'] is not None]  # Convert Decimal to float
        max_monetary = max(monetary_values) if monetary_values else 1
        monetary_score = min(5, (monetary / max_monetary) * 5)

        # Calculate RFM score after converting all scores to float
        rfm_score = (recency_score + frequency_score + monetary_score) / 3
        if rfm_score >= 4:
            rfm_segment = 'Champions'
        elif rfm_score >= 3:
            rfm_segment = 'Loyal Customers'
        elif rfm_score >= 2:
            rfm_segment = 'Potential Loyalists'
        else:
            rfm_segment = 'At Risk'

        # Churn risk (logistic decay based on recency)
        churn_rate = 100 / (1 + 2.71828 ** (-0.02 * (recency - 90)))  # Sigmoid function centered at 90 days

        # LTV over time (cumulative total_price over different periods)
        ltv_over_time = {}
        current_date = timezone.now()
        periods = [('30_days', 30), ('90_days', 90), ('1_year', 365), ('2_years', 730), ('5_years', 1825)]
        cumulative_ltv = 0
        sorted_orders = customer_orders.order_by('created_at')
        for period, days in periods:
            cutoff_date = current_date - timedelta(days=days)
            period_orders = sorted_orders.filter(created_at__gte=cutoff_date)
            period_ltv = period_orders.aggregate(total=Sum('total_price'))['total'] or 0
            period_ltv = float(period_ltv)  # Convert Decimal to float
            cumulative_ltv += period_ltv
            ltv_over_time[period] = cumulative_ltv

        # Top 10% badges
        all_customers_ltv = Order.objects.values('customer_name').annotate(total_ltv=Sum('total_price')).order_by('-total_ltv')
        total_customers = len(all_customers_ltv)
        top_10_index = max(1, int(total_customers * 0.1)) - 1  # Ensure at least 1 customer
        ltv_threshold = float(all_customers_ltv[top_10_index]['total_ltv']) if total_customers > 0 else 0  # Convert Decimal to float
        is_top_10_ltv = ltv >= ltv_threshold

        all_customers_lifetime = Order.objects.values('customer_name').annotate(
            first_order=Min('created_at'),
            last_order=Max('created_at')
        ).annotate(
            lifetime=(F('last_order') - F('first_order'))
        ).order_by('-lifetime')
        total_lifetimes = len(all_customers_lifetime)
        top_10_lifetime_index = max(1, int(total_lifetimes * 0.1)) - 1  # Ensure at least 1 customer
        lifetime_threshold = all_customers_lifetime[top_10_lifetime_index]['lifetime'].days / 30.0 if total_lifetimes > 0 else 0
        is_top_10_lifetime = lifetime_months >= lifetime_threshold

        data = {
            'customer_name': customer_name,
            'customer_email': customer_email,
            'first_order_date': first_order_date,
            'last_order_date': last_order_date,
            'rfm_segment': rfm_segment,
            'ltv': ltv,
            'lifetime_months': lifetime_months,
            'avg_days_between_orders': avg_days_between_orders,
            'est_next_order_date': est_next_order_date_str,
            'churn_rate': churn_rate,
            'ltv_over_time': ltv_over_time,
            'is_top_10_ltv': is_top_10_ltv,
            'is_top_10_lifetime': is_top_10_lifetime,
        }
        logger.info(f"Customer profile data fetched successfully for {customer_name}.")
        return JsonResponse(data, safe=False)

    except Exception as e:
        logger.error(f"Error in customer_profile_data: {str(e)}", exc_info=True)
        return JsonResponse({'error': f'Server error: {str(e)}'}, status=500)

@login_required(login_url='/signin/')
def customer_profile(request):
    return render(request, 'customer_profile.html')


# 3 financial_insights
# Financial Insights Views
@login_required
def financial_insights_data(request):
    """
    API endpoint to provide data for financial insights visualizations.
    """
    try:
        logger.info("Fetching financial insights data...")

        # Get query parameters for date range
        start_date = request.GET.get('start_date', None)
        end_date = request.GET.get('end_date', None)
        date_range_option = request.GET.get('date_range_option', 'last_1_year')

        # Base query for orders
        orders_query = Order.objects.all()

        # Apply date range filter
        if date_range_option == 'custom' and start_date and end_date:
            start_date = pd.to_datetime(start_date).tz_localize('UTC')
            end_date = pd.to_datetime(end_date).tz_localize('UTC')
            orders_query = orders_query.filter(created_at__gte=start_date, created_at__lte=end_date)
        else:  # Default to last 1 year
            end_date = timezone.now()
            start_date = end_date - pd.Timedelta(days=365)
            orders_query = orders_query.filter(created_at__gte=start_date, created_at__lte=end_date)

        # Check if there are any orders after filtering
        if not orders_query.exists():
            logger.warning("No orders found for the given date range.")
            return JsonResponse({
                'revenue_months': [],
                'revenue_values': [],
                'shipping_months': [],
                'shipping_values': [],
                'tax_months': [],
                'tax_values': [],
                'summary': {
                    'total_revenue': 0.0,
                    'total_shipping': 0.0,
                    'total_tax': 0.0,
                    'order_count': 0,
                }
            }, safe=False)

        # Determine the timeline for monthly data
        earliest_order = orders_query.earliest('created_at')
        earliest_date = earliest_order.created_at.date() if earliest_order else timezone.now().date()
        today = timezone.now().date()
        earliest_month = earliest_date.replace(day=1)

        # Adjust the timeline based on the date range
        timeline_start = start_date.date().replace(day=1)
        timeline_end = end_date.date().replace(day=1)

        # 1. Total Revenue Trend (monthly total revenue)
        revenue_query = (orders_query
                        .annotate(month=TruncMonth('created_at'))
                        .values('month')
                        .annotate(total_revenue=Sum('total_price'))
                        .order_by('month'))
        revenue_data = list(revenue_query)

        revenue_months = []
        revenue_values = []
        current_month = timeline_start
        while current_month <= timeline_end:
            revenue_months.append(current_month.strftime('%Y-%m'))
            revenue_value = next((item['total_revenue'] for item in revenue_data if item['month'].date() == current_month), 0)
            revenue_values.append(float(revenue_value) if revenue_value is not None else 0.0)
            current_month = (current_month + timedelta(days=32)).replace(day=1)
        logger.debug(f"Total Revenue Data: Months={revenue_months}, Values={revenue_values}")

        # 2. Shipping Charges Trend (monthly shipping charges)
        shipping_charges_query = (orders_query
                                 .annotate(month=TruncMonth('created_at'))
                                 .values('month')
                                 .annotate(total_shipping=Sum('shipping_cost'))
                                 .order_by('month'))
        shipping_charges = list(shipping_charges_query)

        shipping_months = []
        shipping_values = []
        current_month = timeline_start
        while current_month <= timeline_end:
            shipping_months.append(current_month.strftime('%Y-%m'))
            shipping_value = next((item['total_shipping'] for item in shipping_charges if item['month'].date() == current_month), 0)
            shipping_values.append(float(shipping_value) if shipping_value is not None else 0.0)
            current_month = (current_month + timedelta(days=32)).replace(day=1)
        logger.debug(f"Shipping Charges Data: Months={shipping_months}, Values={shipping_values}")

        # 3. Tax Collected by Month (monthly tax collected)
        tax_collected_query = (orders_query
                              .annotate(month=TruncMonth('created_at'))
                              .values('month')
                              .annotate(total_tax=Sum('tax_amount'))
                              .order_by('month'))
        tax_collected = list(tax_collected_query)

        tax_months = []
        tax_values = []
        current_month = timeline_start
        while current_month <= timeline_end:
            tax_months.append(current_month.strftime('%Y-%m'))
            tax_value = next((item['total_tax'] for item in tax_collected if item['month'].date() == current_month), 0)
            tax_values.append(float(tax_value) if tax_value is not None else 0.0)
            current_month = (current_month + timedelta(days=32)).replace(day=1)
        logger.debug(f"Tax Collected Data: Months={tax_months}, Values={tax_values}")

        # 4. Summary Metrics
        summary = {
            'total_revenue': float(orders_query.aggregate(total=Sum('total_price'))['total'] or 0),
            'total_shipping': float(orders_query.aggregate(total=Sum('shipping_cost'))['total'] or 0),
            'total_tax': float(orders_query.aggregate(total=Sum('tax_amount'))['total'] or 0),
            'order_count': orders_query.count(),
        }
        logger.debug(f"Summary Metrics: {summary}")

        data = {
            'revenue_months': revenue_months,
            'revenue_values': revenue_values,
            'shipping_months': shipping_months,
            'shipping_values': shipping_values,
            'tax_months': tax_months,
            'tax_values': tax_values,
            'summary': summary,
        }
        logger.info("Financial insights data fetched successfully.")
        return JsonResponse(data, safe=False)

    except Exception as e:
        logger.error(f"Error in financial_insights_data: {str(e)}", exc_info=True)
        return JsonResponse({'error': f'Server error: {str(e)}'}, status=500)

@login_required(login_url='/signin/')
def financial_insights(request):
    return render(request, 'financial_insights.html')

# 4 product_insights 

# Product Insights Views
@login_required
def product_insights_data(request):
    """
    API endpoint to provide data for product insights visualizations.
    """
    try:
        logger.info("Fetching product insights data...")

        # Get query parameters for date range and product selection
        start_date = request.GET.get('start_date', None)
        end_date = request.GET.get('end_date', None)
        date_range_option = request.GET.get('date_range_option', 'last_1_year')
        selected_product = request.GET.get('product', None)

        # Base query for orders
        orders_query = Order.objects.all()

        # Apply date range filter
        if date_range_option == 'custom' and start_date and end_date:
            start_date = pd.to_datetime(start_date).tz_localize('UTC')
            end_date = pd.to_datetime(end_date).tz_localize('UTC') + pd.Timedelta(days=1) - pd.Timedelta(seconds=1)  # Include the whole end date
            orders_query = orders_query.filter(created_at__gte=start_date, created_at__lte=end_date)
            logger.debug(f"Custom date range applied: {start_date} to {end_date}")
        else:  # Default to last 1 year
            end_date = timezone.now()
            start_date = end_date - pd.Timedelta(days=365)
            orders_query = orders_query.filter(created_at__gte=start_date, created_at__lte=end_date)
            logger.debug(f"Default date range applied: {start_date} to {end_date}")

        # Check if there are any orders after filtering
        orders_count = orders_query.count()
        logger.debug(f"Number of orders after date filtering: {orders_count}")
        if not orders_query.exists():
            logger.warning("No orders found for the given date range.")
            return JsonResponse({
                'error': 'No orders found for the selected date range.',
                'product_names_revenue': [],
                'revenue_values': [],
                'quantity_months': [],
                'quantity_values': [],
                'product_list': [],
            }, safe=False)

        # Parse the products field (JSON string in the database)
        product_data = []
        invalid_products_count = 0
        for order in orders_query:
            try:
                products = json.loads(order.products) if isinstance(order.products, str) else order.products
                if not isinstance(products, list):
                    logger.warning(f"Invalid products format for order {order.order_id}: {products}")
                    invalid_products_count += 1
                    continue
                for product in products:
                    if not isinstance(product, dict):
                        logger.warning(f"Invalid product entry in order {order.order_id}: {product}")
                        invalid_products_count += 1
                        continue
                    # Validate required fields
                    required_fields = ['name', 'price', 'product_quantity']  # Updated to match database field
                    missing_fields = [field for field in required_fields if field not in product]
                    if missing_fields:
                        logger.warning(f"Missing required fields {missing_fields} in product for order {order.order_id}: {product}")
                        invalid_products_count += 1
                        continue
                    # Ensure price and quantity are numeric
                    try:
                        price = float(product['price']) if product['price'] is not None else 0.0
                        quantity = int(product['product_quantity']) if product['product_quantity'] is not None else 0
                    except (ValueError, TypeError) as e:
                        logger.warning(f"Invalid price or product_quantity in product for order {order.order_id}: {product}, Error: {str(e)}")
                        invalid_products_count += 1
                        continue
                    product_data.append({
                        'name': product['name'],
                        'price': price,
                        'quantity': quantity,  # Map product_quantity to quantity
                        'created_at': order.created_at,
                    })
            except (json.JSONDecodeError, TypeError) as e:
                logger.error(f"Error parsing products for order {order.order_id}: {str(e)}")
                invalid_products_count += 1
                continue

        logger.debug(f"Total products parsed successfully: {len(product_data)}")
        logger.debug(f"Total invalid products skipped: {invalid_products_count}")
        if not product_data:
            logger.warning("No valid product data found after parsing all orders.")
            return JsonResponse({
                'error': f'No valid product data found after parsing. {invalid_products_count} invalid products skipped.',
                'product_names_revenue': [],
                'revenue_values': [],
                'quantity_months': [],
                'quantity_values': [],
                'product_list': [],
            }, safe=False)

        # Create a DataFrame for easier manipulation
        df = pd.DataFrame(product_data)
        logger.debug(f"DataFrame created with {len(df)} rows")

        # Get the list of all products for the dropdown
        product_list = sorted(df['name'].unique().tolist())
        logger.debug(f"Product List: {product_list}")

        # 1. Top Products by Revenue (Top 10)
        revenue_by_product = df.groupby('name').apply(
            lambda x: (x['price'] * x['quantity']).sum()
        ).reset_index(name='total_revenue')
        top_revenue = revenue_by_product.sort_values(by='total_revenue', ascending=False).head(10)
        product_names_revenue = top_revenue['name'].tolist()
        revenue_values = top_revenue['total_revenue'].astype(float).tolist()
        logger.debug(f"Top Products by Revenue: Names={product_names_revenue}, Values={revenue_values}")

        # 2. Product Quantity Sold Over Time
        # Filter by selected product if specified
        if selected_product and selected_product != 'All Products':
            df = df[df['name'] == selected_product]
            logger.debug(f"Filtered by product '{selected_product}': {len(df)} rows remaining")

        # Aggregate quantity sold by month
        df['month'] = df['created_at'].dt.to_period('M').astype(str)
        quantity_by_month = df.groupby('month')['quantity'].sum().reset_index()
        quantity_by_month = quantity_by_month.sort_values('month')
        logger.debug(f"Quantity by month: {quantity_by_month.to_dict()}")

        # Generate the timeline for monthly data
        timeline_start = start_date.date().replace(day=1)
        timeline_end = end_date.date().replace(day=1)

        quantity_months = []
        quantity_values = []
        current_month = timeline_start
        while current_month <= timeline_end:
            month_str = current_month.strftime('%Y-%m')
            quantity_months.append(month_str)
            quantity_value = quantity_by_month[quantity_by_month['month'] == month_str]['quantity'].sum() if month_str in quantity_by_month['month'].values else 0
            quantity_values.append(float(quantity_value))
            current_month = (current_month + timedelta(days=32)).replace(day=1)
        logger.debug(f"Quantity Sold Over Time: Months={quantity_months}, Values={quantity_values}")

        data = {
            'product_names_revenue': product_names_revenue,
            'revenue_values': revenue_values,
            'quantity_months': quantity_months,
            'quantity_values': quantity_values,
            'product_list': product_list,
            'invalid_products_skipped': invalid_products_count,  # Include for debugging
        }
        logger.info("Product insights data fetched successfully.")
        return JsonResponse(data, safe=False)

    except Exception as e:
        logger.error(f"Error in product_insights_data: {str(e)}", exc_info=True)
        return JsonResponse({'error': f'Server error: {str(e)}'}, status=500)

@login_required(login_url='/signin/')
def product_insights(request):
    return render(request, 'product_insights.html')

# @login_required(login_url='signin')
# def rfm_analysis(request):
#     return render(request, 'placeholder.html', {'message': 'RFM Analysis - To be implemented'})

@login_required(login_url='signin')
# def rfm_churn_visualizations(request):
#     return render(request, 'placeholder.html', {'message': 'RFM & Churn Trends - To be implemented'})


# 5 rfm churn mix ###

# Set up logging
# logger = logging.getLogger(__name__)

# Helper function to calculate churn probability (simplified logistic model)
def calculate_churn_probability(recency, frequency):
    try:
        k = 0.1  # Steepness of the curve
        x0 = 90  # Midpoint (e.g., 90 days recency as a threshold)
        recency_score = recency * (1 - frequency / (frequency + 10))  # Adjust recency by frequency
        churn_prob = 1 / (1 + math.exp(-k * (recency_score - x0)))
        return round(churn_prob * 100, 2)  # Return as percentage
    except Exception as e:
        logger.error(f"Error calculating churn probability: {e}")
        return 0

# Helper function to assign RFM segment
def assign_rfm_segment(r, f, m):
    try:
        if r <= 30 and f >= 5 and m >= 1000:
            return "Loyal Customer"
        elif r <= 60 and f >= 3 and m >= 500:
            return "Active Customer"
        elif r <= 90 and f >= 2 and m >= 200:
            return "Average Customer"
        elif r > 180:
            return "At Risk"
        else:
            return "New Customer"
    except Exception as e:
        logger.error(f"Error assigning RFM segment: {e}")
        return "Unknown"

# def rfm_churn_visualizations_data(request):
    try:
        # Parse request parameters
        filter_segment = request.GET.get('filter_segment', None)
        start_date_str = request.GET.get('start_date')
        end_date_str = request.GET.get('end_date')
        date_range_option = request.GET.get('date_range_option', 'last_1_year')
        segment = request.GET.get('segment', None)
        page = int(request.GET.get('page', 1))
        per_page = 10  # Customers per page

        today = date.today()  # Current date: May 28, 2025

        # Determine date range
        if date_range_option == 'all' and not start_date_str and not end_date_str:
            orders = Order.objects.all()
            start_date = orders.aggregate(min_date=Min('created_at'))['min_date'].date() if orders.exists() else today
            end_date = today
        else:
            if start_date_str and end_date_str:
                try:
                    start_date = datetime.datetime.strptime(start_date_str, '%Y-%m-%d').date()
                    end_date = datetime.datetime.strptime(end_date_str, '%Y-%m-%d').date()
                except ValueError:
                    logger.warning(f"Invalid date format for start_date={start_date_str} or end_date={end_date_str}, using default range")
                    start_date = today - timedelta(days=365)
                    end_date = today
            else:
                start_date = today - timedelta(days=365)
                end_date = today

            if start_date > end_date:
                start_date, end_date = end_date, start_date

            orders = Order.objects.filter(created_at__date__gte=start_date, created_at__date__lte=end_date)

        # If a specific segment and page are requested, return paginated customer data
        if segment and page:
            # Compute RFM for all customers, grouping by customer_email
            customer_rfm = {}
            for order in orders:
                customer_email = order.customer_email
                if not customer_email:
                    logger.warning(f"Order {order.id} has no customer_email, skipping")
                    continue
                if customer_email not in customer_rfm:
                    customer_rfm[customer_email] = {
                        'orders': [],
                        'name': order.customer_name or 'Unknown',
                        'email': customer_email
                    }
                customer_rfm[customer_email]['orders'].append(order)

            customer_data = []
            for customer_email, data in customer_rfm.items():
                try:
                    last_order = max(order.created_at.date() for order in data['orders'])
                    recency = (today - last_order).days
                    frequency = len(data['orders'])
                    monetary = sum(float(order.total_price) for order in data['orders'])
                    rfm_segment = assign_rfm_segment(recency, frequency, monetary)
                    churn_prob = calculate_churn_probability(recency, frequency)
                    churned = "Yes" if churn_prob > 50 else "No"
                    recommended_action = {
                        "Loyal Customer": "Offer loyalty rewards or exclusive discounts.",
                        "Active Customer": "Encourage repeat purchases with targeted promotions.",
                        "Average Customer": "Send personalized offers to increase engagement.",
                        "At Risk": "Re-engage with win-back campaigns or special incentives.",
                        "New Customer": "Send welcome emails and introductory offers."
                    }.get(rfm_segment, "Monitor behavior and engage accordingly.")

                    if rfm_segment == segment:
                        customer_data.append({
                            'customer_name': data['name'],
                            'customer_email': data['email'],
                            'recency': recency,
                            'frequency': frequency,
                            'monetary': float(monetary),
                            'Churn': churned,
                            'Recommended Action': recommended_action
                        })
                except Exception as e:
                    logger.error(f"Error processing customer {customer_email}: {e}")
                    continue

            # Apply pagination
            total_items = len(customer_data)
            total_pages = max(1, (total_items + per_page - 1) // per_page)
            page = max(1, min(page, total_pages))
            start_idx = (page - 1) * per_page
            end_idx = start_idx + per_page
            paginated_data = customer_data[start_idx:end_idx]

            response_data = {
                'customer_data': {segment: paginated_data},
                'pagination_data': {segment: {
                    'current_page': page,
                    'total_pages': total_pages,
                    'total_items': total_items
                }}
            }
            return JsonResponse(response_data)

        # Otherwise, compute visualization data
        # 1. Compute RFM and Segments
        customer_rfm = {}
        for order in orders:
            customer_email = order.customer_email
            if not customer_email:
                logger.warning(f"Order {order.id} has no customer_email, skipping")
                continue
            if customer_email not in customer_rfm:
                customer_rfm[customer_email] = {
                    'orders': [],
                    'name': order.customer_name or 'Unknown',
                    'email': customer_email
                }
            customer_rfm[customer_email]['orders'].append(order)

        segment_counts = {
            "Loyal Customer": 0,
            "Active Customer": 0,
            "Average Customer": 0,
            "At Risk": 0,
            "New Customer": 0
        }
        customer_segments = {}
        customer_details = {}

        for customer_email, data in customer_rfm.items():
            try:
                last_order = max(order.created_at.date() for order in data['orders'])
                recency = (today - last_order).days
                frequency = len(data['orders'])
                monetary = sum(float(order.total_price) for order in data['orders'])
                rfm_segment = assign_rfm_segment(recency, frequency, monetary)
                churn_prob = calculate_churn_probability(recency, frequency)
                churned = "Yes" if churn_prob > 50 else "No"
                recommended_action = {
                    "Loyal Customer": "Offer loyalty rewards or exclusive discounts.",
                    "Active Customer": "Encourage repeat purchases with targeted promotions.",
                    "Average Customer": "Send personalized offers to increase engagement.",
                    "At Risk": "Re-engage with win-back campaigns or special incentives.",
                    "New Customer": "Send welcome emails and introductory offers."
                }.get(rfm_segment, "Monitor behavior and engage accordingly.")

                segment_counts[rfm_segment] += 1
                if rfm_segment not in customer_segments:
                    customer_segments[rfm_segment] = []
                customer_segments[rfm_segment].append(customer_email)

                customer_details[customer_email] = {
                    'customer_name': data['name'],
                    'customer_email': data['email'],
                    'recency': recency,
                    'frequency': frequency,
                    'monetary': float(monetary),
                    'Churn': churned,
                    'Recommended Action': recommended_action
                }
            except Exception as e:
                logger.error(f"Error processing customer {customer_email}: {e}")
                continue

        # Apply segment filter if provided
        filtered_segments = {}
        if filter_segment and filter_segment != 'All':
            for seg, customers in customer_segments.items():
                if seg == filter_segment:
                    filtered_segments[seg] = customers
            segment_counts = {seg: (count if seg == filter_segment else 0) for seg, count in segment_counts.items()}
        else:
            filtered_segments = customer_segments

        # Prepare segment data for pie chart
        segment_data = {
            'labels': list(segment_counts.keys()),
            'values': list(segment_counts.values())
        }

        # 2. Active Customers and Orders Over Time
        monthly_data = orders.annotate(
            month=TruncMonth('created_at')
        ).values('month').annotate(
            order_count=Count('id'),
            total_revenue=Sum('total_price'),
            customer_count=Count('customer_email', distinct=True)  # Use customer_email instead of customer
        ).order_by('month')

        labels = []
        active_customers = []
        orders_count = []
        avg_order_value = []

        active_threshold = 180  # Active if ordered within last 180 days
        for month_entry in monthly_data:
            month = month_entry['month']
            labels.append(month.strftime('%Y-%m'))
            orders_count.append(month_entry['order_count'])
            avg_order_value.append(float(month_entry['total_revenue'] / month_entry['order_count']) if month_entry['order_count'] > 0 else 0)

            # Calculate active customers: customers who ordered within 180 days prior to the month
            month_end = month.replace(day=1) + timedelta(days=31)
            if month_end.day != 1:
                month_end = month_end.replace(day=1)
            start_window = month_end - timedelta(days=active_threshold)
            active = orders.filter(
                created_at__date__gte=start_window,
                created_at__date__lt=month_end
            ).values('customer_email').distinct().count()  # Use customer_email instead of customer
            active_customers.append(active)

        active_customers_data = {
            'labels': labels,
            'active_customers': active_customers,
            'orders': orders_count,
            'avg_order_value': avg_order_value
        }

        # 3. Customer Data and Recommendations with Pagination
        customer_data = {}
        pagination_data = {}
        recommendations = {
            "Loyal Customer": "Offer loyalty rewards or exclusive discounts.",
            "Active Customer": "Encourage repeat purchases with targeted promotions.",
            "Average Customer": "Send personalized offers to increase engagement.",
            "At Risk": "Re-engage with win-back campaigns or special incentives.",
            "New Customer": "Send welcome emails and introductory offers."
        }

        per_page = 10
        for seg, customers in filtered_segments.items():
            seg_customers = []
            for customer_email in customers:
                seg_customers.append(customer_details[customer_email])
            # Sort by recency for display
            seg_customers.sort(key=lambda x: x['recency'])

            # Paginate
            total_items = len(seg_customers)
            total_pages = max(1, (total_items + per_page - 1) // per_page)
            page = 1  # Default to first page
            start_idx = (page - 1) * per_page
            end_idx = start_idx + per_page
            paginated_customers = seg_customers[start_idx:end_idx]

            customer_data[seg] = paginated_customers
            pagination_data[seg] = {
                'current_page': page,
                'total_pages': total_pages,
                'total_items': total_items
            }

        response_data = {
            'segment_data': segment_data,
            'active_customers_data': active_customers_data,
            'customer_data': customer_data,
            'recommendations': recommendations,
            'pagination_data': pagination_data
        }

        return JsonResponse(response_data)

    except Exception as e:
        logger.error(f"Error in rfm_churn_visualizations_data: {e}", exc_info=True)
        return JsonResponse({'error': f'Server error: {str(e)}'}, status=500)

from django.db.models import Count, Sum, Min
from django.db.models.functions import TruncMonth
from django.contrib.auth.decorators import login_required
from django.shortcuts import render
from django.http import JsonResponse
from .models import Order

import pandas as pd
import numpy as np
import logging
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans

logger = logging.getLogger(__name__)


@login_required(login_url='signin')
def rfm_churn_visualizations_data(request):
    try:
        filter_segment = request.GET.get('filter_segment', None)
        start_date_str = request.GET.get('start_date')
        end_date_str = request.GET.get('end_date')
        date_range_option = request.GET.get('date_range_option', 'last_1_year')
        segment = request.GET.get('segment', None)
        page = int(request.GET.get('page', 1))
        per_page = 10

        today = datetime.date.today()

        if date_range_option == 'all' and not start_date_str and not end_date_str:
            orders = Order.objects.all()
            start_date = orders.aggregate(min_date=Min('created_at'))['min_date'].date() if orders.exists() else today
            end_date = today
        else:
            if start_date_str and end_date_str:
                try:
                    start_date = datetime.datetime.strptime(start_date_str, '%Y-%m-%d').date()
                    end_date = datetime.datetime.strptime(end_date_str, '%Y-%m-%d').date()
                except ValueError:
                    logger.warning("Invalid date format, using default")
                    start_date = today - datetime.timedelta(days=365)
                    end_date = today
            else:
                start_date = today - datetime.timedelta(days=365)
                end_date = today

            if start_date > end_date:
                start_date, end_date = end_date, start_date

            orders = Order.objects.filter(created_at__gte=start_date, created_at__lte=end_date)

        customer_rfm = {}
        for order in orders:
            email = order.customer_email
            if not email:
                continue
            if email not in customer_rfm:
                customer_rfm[email] = {'orders': [], 'name': order.customer_name or 'Unknown', 'email': email}
            customer_rfm[email]['orders'].append(order)

        rfm_rows = []
        for email, data in customer_rfm.items():
            try:
                orders_list = data['orders']
                if not orders_list:
                    continue

                order_dates = []
                for order in orders_list:
                    try:
                        if isinstance(order.created_at, datetime.datetime):
                            order_dates.append(order.created_at.date())
                        else:
                            order_dates.append(datetime.strptime(str(order.created_at), "%Y-%m-%d %H:%M:%S").date())
                    except Exception as e:
                        logger.warning(f"Invalid datetime in order {order.id}: {e}")
                        continue

                if not order_dates:
                    continue

                last_order = max(order_dates)
                recency = (today - last_order).days
                frequency = len(orders_list)
                monetary = sum(float(order.total_price) for order in orders_list)

                rfm_rows.append({
                    'customer_email': email,
                    'customer_name': data['name'],
                    'recency': recency,
                    'frequency': frequency,
                    'monetary': monetary
                })

            except Exception as e:
                logger.error(f"Error computing RFM for {email}: {e}")
                continue

        rfm_df = pd.DataFrame(rfm_rows)
        if rfm_df.empty:
            return JsonResponse({'error': 'No customer data found'}, status=404)

        # ML Segment Clustering
        scaler = StandardScaler()
        rfm_scaled = scaler.fit_transform(rfm_df[['recency', 'frequency', 'monetary']])
        kmeans = KMeans(n_clusters=4, n_init='auto', random_state=42)
        rfm_df['cluster'] = kmeans.fit_predict(rfm_scaled)

        # Churn prediction
        # rfm_df['churn_probability'] = 1 / (1 + np.exp(-0.05 * (rfm_df['recency'] - 60)))
        # rfm_df['churned'] = rfm_df['churn_probability'].apply(lambda x: "Yes" if x > 0.5 else "No")
        # rfm_df[['churned', 'churn_probability']] = rfm_df.apply(
        #     lambda x: pd.Series(predict_churn_model(x['recency'], x['frequency'], x['monetary'])),
        #     axis=1
        # )
        rfm_df[['churned', 'churn_probability']] = rfm_df.apply(
            lambda row: pd.Series(predict_churn_model(
                row['recency'], row['frequency'], row['monetary']
            )),
            axis=1
        )



        # Segment labels
        cluster_names = {
            0: "Loyal Customer",
            1: "New Customer",
            2: "At Risk",
            3: "VIP"
        }
        rfm_df['rfm_segment'] = rfm_df['cluster'].map(cluster_names)

        def get_strategy(segment, churned):
            if churned == "Yes":
                return "Win-back Campaign or Incentive"
            return {
                "VIP": "Offer early access or upsell",
                "Loyal Customer": "Reward with loyalty benefits",
                "New Customer": "Send welcome offer",
                "At Risk": "Re-engage with discount"
            }.get(segment, "Monitor")

        rfm_df['strategy'] = rfm_df.apply(lambda x: get_strategy(x['rfm_segment'], x['churned']), axis=1)

        segment_counts = rfm_df['rfm_segment'].value_counts().to_dict()
        churn_by_segment = rfm_df.groupby('rfm_segment')['churn_probability'].mean().apply(lambda x: round(x, 2)).to_dict()


        customer_segments = {}
        customer_details = {}
        for _, row in rfm_df.iterrows():
            seg = row['rfm_segment']
            email = row['customer_email']
            customer_segments.setdefault(seg, []).append(email)
            customer_details[email] = {
                'customer_name': row['customer_name'],
                'customer_email': email,
                'recency': int(row['recency']),
                'frequency': int(row['frequency']),
                'monetary': round(row['monetary'], 2),
                'Churn': row['churned'],
                'Recommended Action': row['strategy']
            }

        if filter_segment and filter_segment != 'All':
            customer_segments = {seg: emails for seg, emails in customer_segments.items() if seg == filter_segment}
            segment_counts = {seg: count for seg, count in segment_counts.items() if seg == filter_segment}

        segment_data = {
            'labels': list(segment_counts.keys()),
            'values': list(segment_counts.values())
        }

        monthly_data = orders.annotate(month=TruncMonth('created_at')).values('month').annotate(
            order_count=Count('id'),
            total_revenue=Sum('total_price'),
            customer_count=Count('customer_email', distinct=True)
        ).order_by('month')

        labels, active_customers, orders_count, avg_order_value = [], [], [], []
        active_threshold = 180

        for m in monthly_data:
            month = m['month']
            labels.append(month.strftime('%Y-%m'))
            orders_count.append(m['order_count'])
            avg_order_value.append(float(m['total_revenue'] / m['order_count']) if m['order_count'] else 0)

            month_end = month.replace(day=1) + timedelta(days=31)
            if month_end.day != 1:
                month_end = month_end.replace(day=1)
            start_window = month_end - timedelta(days=active_threshold)

            active = orders.filter(created_at__gte=start_window, created_at__lt=month_end).values('customer_email').distinct().count()
            active_customers.append(active)

        active_customers_data = {
            'labels': labels,
            'active_customers': active_customers,
            'orders': orders_count,
            'avg_order_value': avg_order_value
        }

        customer_data, pagination_data = {}, {}
        for seg, emails in customer_segments.items():
            seg_customers = [customer_details[email] for email in emails]
            seg_customers.sort(key=lambda x: x['recency'])
            total_items = len(seg_customers)
            total_pages = max(1, (total_items + per_page - 1) // per_page)
            page = 1
            start_idx = (page - 1) * per_page
            end_idx = start_idx + per_page
            paginated_customers = seg_customers[start_idx:end_idx]
            customer_data[seg] = paginated_customers
            pagination_data[seg] = {
                'current_page': page,
                'total_pages': total_pages,
                'total_items': total_items
            }

        return JsonResponse({
            'segment_data': segment_data,
            'churn_by_segment': churn_by_segment,
            'active_customers_data': active_customers_data,
            'customer_data': customer_data,
            'recommendations': {},
            'pagination_data': pagination_data
        })

    except Exception as e:
        logger.error(f"Error in rfm_churn_visualizations_data: {e}", exc_info=True)
        return JsonResponse({'error': f'Server error: {str(e)}'}, status=500)

    
def rfm_churn_visualizations(request):
    return render(request, 'rfm_churn_visualizations.html')

@login_required
def cohort_analysis(request):
    """
    View to render the cohort analysis page.
    """
    try:
        logger.info("Rendering cohort analysis page.")
        return render(request, 'cohort_analysis.html')
    except Exception as e:
        logger.error(f"Error rendering cohort analysis page: {str(e)}", exc_info=True)
        return render(request, 'dashboard/error.html', {'error': 'An error occurred while loading the cohort analysis page.'}, status=500)


def compute_cohort_data(start_date, end_date, page, items_per_page):
    orders = Order.objects.filter(created_at__gte=start_date, created_at__lte=end_date)

    df = pd.DataFrame(list(orders.values('created_at', 'customer_email', 'total_price')))
    df['created_at'] = pd.to_datetime(df['created_at'])

    first_orders = df.groupby('customer_email')['created_at'].min().reset_index()
    first_orders['cohort'] = first_orders['created_at'].dt.strftime('%b %Y')
    df = df.merge(first_orders[['customer_email', 'cohort']], on='customer_email', how='left')

    df['order_month'] = df['created_at'].dt.to_period('M')
    df['cohort_month'] = pd.to_datetime(df['cohort'], format='%b %Y').dt.to_period('M')
    df['month_diff'] = (df['order_month'].dt.start_time - df['cohort_month'].dt.start_time).dt.days // 30

    max_months = 12
    cohort_matrix = []
    cohort_sizes = {}
    cohort_metrics = []
    cohorts = sorted(df['cohort'].unique(), key=lambda x: pd.to_datetime(x, format='%b %Y'))

    for cohort in cohorts:
        cohort_data = df[df['cohort'] == cohort]
        cohort_size = len(cohort_data['customer_email'].unique())
        cohort_sizes[cohort] = cohort_size

        revenue_rates = [cohort_size]
        for month in range(1, max_months + 1):
            revenue = cohort_data[cohort_data['month_diff'] == month]['total_price'].sum() or 0
            revenue_rates.append(round(float(revenue), 2))
        while len(revenue_rates) < (1 + max_months):
            revenue_rates.append(0.0)
        cohort_matrix.append({'cohort': cohort, 'revenue_rates': revenue_rates})

        total_revenue = cohort_data['total_price'].sum() or 0
        purchase_frequency = len(cohort_data) / cohort_size if cohort_size > 0 else 0
        aov = float(total_revenue / len(cohort_data)) if len(cohort_data) > 0 else 0
        revenue_per_customer = float(total_revenue / cohort_size) if cohort_size > 0 else 0
        gross_margin = 0.4
        ltv = (aov * purchase_frequency) * gross_margin

        cohort_metrics.append({
            'cohort': cohort,
            'cohort_size': cohort_size,
            'purchase_frequency': round(purchase_frequency, 2),
            'aov': round(aov, 2),
            'revenue_per_customer': round(revenue_per_customer, 2),
            'ltv': round(ltv, 2)
        })

    overall_revenue = [df['customer_email'].nunique()]
    for month in range(1, max_months + 1):
        total_revenue = df[df['month_diff'] == month]['total_price'].sum() or 0
        overall_revenue.append(round(float(total_revenue), 2))
    while len(overall_revenue) < (1 + max_months):
        overall_revenue.append(0.0)
    cohort_matrix.insert(0, {'cohort': 'Overall', 'revenue_rates': overall_revenue})
    cohort_sizes['Overall'] = df['customer_email'].nunique()

    cohorts_list = [row['cohort'] for row in cohort_matrix]
    revenue_matrix = [row['revenue_rates'] for row in cohort_matrix]
    month_labels = [f"After {i} Months" for i in range(1, max_months + 1)]

    total_cohorts = len(cohort_metrics)
    total_pages = (total_cohorts + items_per_page - 1) // items_per_page
    start_index = (page - 1) * items_per_page
    end_index = start_index + items_per_page
    paginated_cohort_metrics = cohort_metrics[start_index:end_index]

    export_data = {}
    for cohort in cohorts:
        customers = df[df['cohort'] == cohort]['customer_email'].unique().tolist()
        export_data[cohort] = customers

    return {
        'cohorts': cohorts_list,
        'revenue_matrix': revenue_matrix,
        'month_labels': month_labels,
        'cohort_metrics': paginated_cohort_metrics,
        'total_pages': total_pages,
        'current_page': page,
        'export_data': export_data,
    }


@login_required
def cohort_data(request):
    """
    Cached API endpoint for cohort analysis.
    """
    try:
        logger.info("Fetching cohort analysis data...")

        start_date = request.GET.get('start_date', None)
        end_date = request.GET.get('end_date', None)
        date_range_option = request.GET.get('date_range_option', 'last_1_year')
        page = int(request.GET.get('page', 1))
        items_per_page = 10

        today = timezone.now().date()

        if start_date and end_date:
            start_date = pd.to_datetime(start_date).tz_localize('UTC')
            end_date = pd.to_datetime(end_date).tz_localize('UTC')
        elif date_range_option != 'all':
            end_date = pd.to_datetime(today).tz_localize('UTC')
            start_date = end_date - pd.Timedelta(days=365)
        else:
            earliest_order = Order.objects.earliest('created_at')
            start_date = pd.to_datetime(earliest_order.created_at).tz_localize('UTC') if earliest_order else pd.to_datetime(today).tz_localize('UTC')
            end_date = pd.to_datetime(today).tz_localize('UTC')

        data = compute_cohort_data(start_date, end_date, page, items_per_page)

        return JsonResponse(data, safe=False)

    except Exception as e:
        logger.error(f"Error in cohort_data: {str(e)}", exc_info=True)
        return JsonResponse({'error': f'Server error: {str(e)}'}, status=500)

genai.configure(api_key="")

@login_required(login_url='signin')
def strategies(request):
    try:
        google_strategies = GoogleAdStrategy.objects.filter(user=request.user).order_by('-created_at')[:5]
        meta_strategies = MetaAdStrategy.objects.filter(user=request.user).order_by('-created_at')[:5]
        context = {
            'google_strategies': google_strategies,
            'meta_strategies': meta_strategies,
        }
        logger.info("Loaded strategies page for user: %s", request.user.username)
        return render(request, 'strategies.html', context)
    except Exception as e:
        logger.error("Error in strategies view: %s", str(e))
        return render(request, 'strategies.html', {'error': 'An error occurred while loading strategies.'})

@login_required(login_url='signin')
@csrf_exempt
def generate_multiple_strategies(request):
    if request.method == 'POST':
        prompt = request.POST.get('prompt', '').strip()
        if not prompt:
            logger.error("No prompt provided in request")
            return JsonResponse({'success': False, 'error': 'No prompt provided'}, status=400)
        ### NEW LIMITAION THING ###
        user_profile = request.user.userprofile
        if not user_profile.is_premium and user_profile.strategy_count >= 2:
            logger.info("User %s reached free strategy limit", request.user.username)
            return JsonResponse({
                'success': False,
                'error': '⚠️ You have reached your free strategy limit. Upgrade to premium for unlimited access.'
            }, status=403)
        

        try:
            # Store the prompt in the session for later use
            request.session['last_prompt'] = prompt
            request.session.modified = True
            logger.info("Stored prompt in session: %s", prompt)

            # Modify the prompt for Gemini API
            modified_prompt = (
                f"{prompt}. Provide 2-3 clearly separated ad strategies labeled 'Strategy 1', 'Strategy 2', etc. "
                f"Each strategy MUST include these fields exactly: Goal, Budget, Ad Type, Audience, CTA, Platform, Duration, and Target Location. "
                f"Use the format 'Audience: [value]' exactly. Do not embed these inside paragraphs."
            )

            # Call Gemini API
            model = genai.GenerativeModel('gemini-1.5-flash')
            response = model.generate_content(modified_prompt)
            ai_output = response.text

            # Parse the AI response
            strategies = []
            current_strategy = None
            strategy_id = 1

            for line in ai_output.splitlines():
                clean_line = line.replace("**", "").replace("*", "").strip()
                if not clean_line:
                    continue

                if clean_line.lower().startswith(('strategy 1', 'strategy 2', 'strategy 3')):
                    if current_strategy:
                        strategies.append(current_strategy)
                    current_strategy = {'id': strategy_id, 'title': clean_line, 'content': []}
                    strategy_id += 1

                elif current_strategy and ':' in clean_line:
                    key, value = clean_line.split(':', 1)
                    normalized_key = key.strip().lower()

                    key_map = {
                        'goal': 'Goal',
                        'objective': 'Goal',
                        'budget': 'Budget',
                        'ad type': 'Ad Type',
                        'advertisement type': 'Ad Type',
                        'audience': 'Audience',
                        'target audience': 'Audience',
                        'target group': 'Audience',
                        'buyer persona': 'Audience',
                        'customer segment': 'Audience',
                        'demographic': 'Audience',
                        'ideal audience': 'Audience',
                        'user profile': 'Audience',
                        'cta': 'CTA',
                        'call to action': 'CTA',
                        'platform': 'Platform',
                        'placement': 'Platform',
                        'duration': 'Duration',
                        'timeframe': 'Duration',
                        'target location': 'Target Location',
                        'location': 'Target Location'
                    }

                    display_key = key_map.get(normalized_key, key.strip())
                    current_strategy['content'].append({'key': display_key, 'value': value.strip()})

                elif current_strategy:
                    current_strategy['content'].append({'key': '', 'value': clean_line})

            if current_strategy:
                strategies.append(current_strategy)

            # Ensure at least 2 strategies
            if len(strategies) < 2:
                strategies.append({
                    'id': strategy_id,
                    'title': f"Strategy {strategy_id}",
                    'content': [{'key': '', 'value': 'Fallback strategy due to limited response.'}]
                })

            strategies = strategies[:3]
            request.session['generated_strategies'] = strategies
            # cache.set(cache_key, strategies, timeout=3600)

            logger.info("Generated strategies for prompt: %s", prompt)
            if not user_profile.is_premium:
                user_profile.strategy_count += 1
                user_profile.save()
            return JsonResponse({'success': True, 'strategies': strategies})

        except Exception as e:
            logger.error("Error in generate_multiple_strategies: %s", str(e))
            return JsonResponse({'success': False, 'error': str(e)}, status=400)

    logger.error("Invalid request method for generate_multiple_strategies: %s", request.method)
    return JsonResponse({'success': False, 'error': 'Invalid request method'}, status=400)

@login_required(login_url='signin')
@csrf_exempt
def save_edited_strategy(request):
    if request.method == 'POST':
        strategy_id = request.POST.get('strategy_id')
        content = request.POST.get('content', '').strip()
        if not strategy_id or not content:
            return JsonResponse({'success': False, 'error': 'Invalid input'}, status=400)
        try:
            strategies = request.session.get('generated_strategies', [])
            strategy = next((s for s in strategies if s['id'] == int(strategy_id)), None)
            if not strategy:
                return JsonResponse({'success': False, 'error': 'Strategy not found'}, status=404)
            strategy['content'] = []
            for line in content.splitlines():
                line = line.strip()
                if not line:
                    continue
                if ':' in line:
                    key, value = line.split(':', 1)
                    strategy['content'].append({'key': key.strip(), 'value': value.strip()})
                else:
                    strategy['content'].append({'key': '', 'value': line})
            request.session['generated_strategies'] = strategies
            request.session.modified = True
            logger.info("Saved edited strategy ID: %s for user: %s", strategy_id, request.user.username)
            return JsonResponse({'success': True})
        except Exception as e:
            logger.error("Error in save_edited_strategy: %s", str(e))
            return JsonResponse({'success': False, 'error': str(e)}, status=400)
    return JsonResponse({'success': False, 'error': 'Invalid request method'}, status=400)

@login_required(login_url='signin')
def select_strategy(request):
    if request.method == 'POST':
        try:
            # DEBUG: Log the raw body to see what's actually arriving
            print("Raw request.body:", request.body)

            if request.content_type == 'application/json':
                body = json.loads(request.body.decode('utf-8'))
            else:
                return JsonResponse({'success': False, 'error': 'Expected JSON data'}, status=400)

            strategy_id = body.get('strategy_id')
            if not strategy_id:
                return JsonResponse({'success': False, 'error': 'Missing strategy ID'}, status=400)

            strategies = request.session.get('generated_strategies', [])
            strategy = next((s for s in strategies if s['id'] == int(strategy_id)), None)
            if not strategy:
                return JsonResponse({'success': False, 'error': 'Strategy not found'}, status=404)

            request.session['selected_strategy'] = strategy
            request.session.modified = True

            prompt = request.session.get('last_prompt', '').lower()
            platform = 'google'
            if any(k in prompt for k in ['meta', 'facebook', 'instagram', 'reels', 'stories']):
                platform = 'meta'

            redirect_url = reverse('meta_form') if platform == 'meta' else reverse('google_form')
            return JsonResponse({'success': True, 'redirect_url': redirect_url})

        except json.JSONDecodeError:
            return JsonResponse({'success': False, 'error': 'Invalid JSON (decode error)'}, status=400)
        except Exception as e:
            return JsonResponse({'success': False, 'error': f'Unexpected error: {str(e)}'}, status=500)

    return JsonResponse({'success': False, 'error': 'Invalid request method'}, status=405)


### NEW LIMITATION BUTTON ####
@login_required(login_url='signin')
def upgrade_premium(request):
    return render(request, 'upgrade.html')

@login_required(login_url='signin')
def google_form(request):
    if request.method == 'POST':
        try:
            goal = request.POST.get('goal')
            budget = request.POST.get('budget')
            duration = request.POST.get('duration')
            audience_gender = request.POST.get('audience_gender')
            audience_start = request.POST.get('audience_start')
            audience_end = request.POST.get('audience_end')
            audience_interest = request.POST.get('audience_interest')
            ad_type = request.POST.get('ad_type')
            manual_ad_type = request.POST.get('manual_ad_type')
            cta = request.POST.get('cta')
            video = request.FILES.get('video')
            image = request.FILES.get('image')

            # Use manual ad type if selected
            final_ad_type = manual_ad_type if ad_type == 'Manual Entry' else ad_type

            # Save to GoogleAdStrategy model
            strategy = GoogleAdStrategy(
                user=request.user,
                goal=goal,
                budget=budget,
                duration=duration,
                audience_gender=audience_gender,
                audience_start=audience_start,
                audience_end=audience_end,
                audience_interest=audience_interest,
                ad_type=final_ad_type,
                manual_ad_type=manual_ad_type if manual_ad_type else None,
                cta=cta,
                video=video,
                image=image
            )
            strategy.save()

            messages.success(request, 'Google Ad Strategy submitted successfully!')
            return redirect('strategies')
        except Exception as e:
            logger.error("Error in google_form: %s", str(e))
            messages.error(request, 'An error occurred while submitting the form.')
            return render(request, 'dashboard/google_form.html')
    # return render(request, 'google_form.html') working well just not show str box 
    return render(request, 'google_form.html', {'strategy': request.session.get('selected_strategy')})


@login_required(login_url='signin')
def meta_form(request):
    if request.method == 'POST':
        try:
            goal = request.POST.get('goal')
            budget = request.POST.get('budget')
            duration = request.POST.get('duration')
            audience_gender = request.POST.get('audience_gender')
            audience_start = request.POST.get('audience_start')
            audience_end = request.POST.get('audience_end')
            audience_interest = request.POST.get('audience_interest')
            ad_type = request.POST.get('ad_type')
            manual_ad_type = request.POST.get('manual_ad_type')
            cta = request.POST.get('cta')
            video = request.FILES.get('video')
            image = request.FILES.get('image')

            # Use manual ad type if selected
            final_ad_type = manual_ad_type if ad_type == 'Manual Entry' else ad_type

            # Save to MetaAdStrategy model
            strategy = MetaAdStrategy(
                user=request.user,
                goal=goal,
                budget=budget,
                duration=duration,
                audience_gender=audience_gender,
                audience_start=audience_start,
                audience_end=audience_end,
                audience_interest=audience_interest,
                ad_type=final_ad_type,
                manual_ad_type=manual_ad_type if manual_ad_type else None,
                cta=cta,
                video=video,
                image=image
            )
            strategy.save()

            messages.success(request, 'Meta Ad Strategy submitted successfully!')
            return redirect('strategies')
        except Exception as e:
            logger.error("Error in meta_form: %s", str(e))
            messages.error(request, 'An error occurred while submitting the form.')
            return render(request, 'dashboard/metaform.html')
    # return render(request, 'metaform.html') working just it will not show str box only 16.6
    return render(request, 'metaform.html', {'strategy': request.session.get('selected_strategy')})


## 6 ### 

@login_required
def eda_charts(request):
    return render(request, 'eda_charts.html')

@login_required
def rfm_analysis(request):
    return render(request, 'rfm_analysis.html')

@login_required
def chart_data(request):
    try:
        date_range_option = request.GET.get('date_range_option', 'last_1_year')
        start_date = request.GET.get('start_date')
        end_date = request.GET.get('end_date')
        selected_month = request.GET.get('month', '')

        logger.info(f"Received chart-data request with params: date_range_option={date_range_option}, start_date={start_date}, end_date={end_date}, selected_month={selected_month}")

        orders = Order.objects.all()

        if date_range_option != 'all' and start_date and end_date:
            try:
                start_date = datetime.datetime.strptime(start_date, '%Y-%m-%d')  # Fixed: Use datetime.strptime
                end_date = datetime.datetime.strptime(end_date, '%Y-%m-%d')      # Fixed: Use datetime.strptime
                start_date = timezone.make_aware(start_date)
                end_date = timezone.make_aware(end_date)
                orders = orders.filter(created_at__range=[start_date, end_date])
            except ValueError as e:
                logger.error(f"Invalid date format: {e}")
                return JsonResponse({'error': 'Invalid date format'}, status=400)
        # elif date_range_option == 'last_1_year':
        #     end_date = timezone.now()
        #     start_date = end_date - datetime.timedelta(days=365)
        #     orders = orders.filter(created_at__range=[start_date, end_date])
        elif date_range_option == 'last_1_year':
            end_date = orders.aggregate(max_date=Max('created_at'))['max_date'] or timezone.now()
            start_date = end_date - datetime.timedelta(days=365)
            orders = orders.filter(created_at__range=[start_date, end_date])

        if selected_month:
            try:
                year, month = map(int, selected_month.split('-'))
                orders = orders.filter(created_at__year=year, created_at__month=month)
            except ValueError as e:
                logger.error(f"Invalid month format: {e}")
                return JsonResponse({'error': 'Invalid month format'}, status=400)

        # EDA: Order Totals Histogram
        total_prices = [float(order.total_price) for order in orders if order.total_price is not None]
        hist_labels, hist_values = [], []
        if total_prices:
            hist, bins = np.histogram(total_prices, bins=10)
            hist_labels = [f"{int(bins[i])}-{int(bins[i+1])}" for i in range(len(bins)-1)]
            hist_values = hist.tolist()

        # Orders Over Time
        orders_by_month = orders.annotate(month=TruncMonth('created_at')).values('month').annotate(count=Count('id')).order_by('month')
        months = [entry['month'].strftime('%Y-%m') for entry in orders_by_month if entry['month']]
        order_counts = [entry['count'] for entry in orders_by_month if entry['month']]

        # Average Order Value Over Time
        aov_data = orders.annotate(month=TruncMonth('created_at')) \
                         .values('month') \
                         .annotate(avg_order_value=Avg('total_price')) \
                         .order_by('month')
        aov_labels = [entry['month'].strftime('%Y-%m') for entry in aov_data if entry['month']]
        aov_values = [float(entry['avg_order_value']) if entry['avg_order_value'] is not None else 0.0 for entry in aov_data if entry['month']]

        # Order Status Stats
        stats = orders.values('order_status').annotate(mean=Avg('total_price'), min=Min('total_price'), max=Max('total_price'))
        statuses = [s['order_status'] for s in stats if s['order_status']]
        means = [float(s['mean'] or 0) for s in stats if s['order_status']]
        mins = [float(s['min'] or 0) for s in stats if s['order_status']]
        maxs = [float(s['max'] or 0) for s in stats if s['order_status']]

        # Total vs Quantity
        order_totals, quantities = [], []
        for order in orders:
            try:
                order_totals.append(float(order.total_price))
            except (ValueError, TypeError):
                continue
            total_quantity = 0
            try:
                # Parse the products JSON string
                products = json.loads(order.products) if isinstance(order.products, str) else order.products
                if isinstance(products, list):
                    total_quantity = sum(int(p.get('product_quantity', 0)) for p in products if isinstance(p, dict))
            except Exception as e:
                logger.warning(f"Failed to parse products for order {order.id}: {e}")
            quantities.append(total_quantity)

        # Correlation
        corr, corr_labels = [], []
        if len(order_totals) > 1 and len(order_totals) == len(quantities):
            try:
                # Check if quantities has variance; if not, set correlation to 0
                if len(set(quantities)) == 1:  # All values are the same (e.g., all 0s)
                    corr_val = 0.0
                else:
                    corr_val = np.corrcoef(order_totals, quantities)[0, 1]
                corr = [float(corr_val) if not np.isnan(corr_val) else 0.0]
                corr_labels = ['Total Price vs Quantity']
            except Exception as e:
                logger.warning(f"Correlation calculation failed: {e}")
                corr = [0.0]  # Default to 0 on failure
                corr_labels = ['Total Price vs Quantity']

        # RFM Calculation
        current_date = datetime.datetime(2025, 12, 31, tzinfo=timezone.get_current_timezone())  # Fixed reference date
        customer_orders = {}
        for order in orders:
            if not order.customer_email:
                continue
            customer_orders.setdefault(order.customer_email, []).append(order)

        recency_values, frequency_values, monetary_values = [], [], []
        churn_status, recency_scatter, monetary_scatter, churn_scatter = [], [], [], []
        for email, cust_orders in customer_orders.items():
            try:
                last_order = max(cust_orders, key=lambda x: x.created_at)
                if not isinstance(last_order.created_at, datetime.datetime):
                    continue
                recency = (current_date - last_order.created_at).days
                frequency = len(cust_orders)
                monetary = sum(float(o.total_price) for o in cust_orders if o.total_price is not None)
                churned = 1 if recency > 90 else 0
            except Exception as e:
                logger.error(f"RFM calc error for {email}: {e}")
                continue
            recency_values.append(recency)
            frequency_values.append(frequency)
            monetary_values.append(monetary)
            churn_status.append(churned)
            recency_scatter.append(recency)
            monetary_scatter.append(monetary)
            churn_scatter.append(churned)

        def make_hist(values):
            hist, bins = np.histogram(values, bins=10)
            labels = [f"{int(bins[i])}-{int(bins[i+1])}" for i in range(len(bins)-1)]
            return labels, hist.tolist()

        rec_hist_labels, rec_hist_values = make_hist(recency_values) if recency_values else ([], [])
        freq_hist_labels, freq_hist_values = make_hist(frequency_values) if frequency_values else ([], [])
        mon_hist_labels, mon_hist_values = make_hist(monetary_values) if monetary_values else ([], [])

        def churn_avg(values, churns):
            try:
                # Calculate average for non-churned (churned == 0)
                non_churned_vals = [v for v, c in zip(values, churns) if c == 0]
                avg_non_churned = float(np.mean(non_churned_vals)) if non_churned_vals else 0.0

                # Calculate average for churned (churned == 1)
                churned_vals = [v for v, c in zip(values, churns) if c == 1]
                avg_churned = float(np.mean(churned_vals)) if churned_vals else 0.0

                return [avg_non_churned, avg_churned]
            except Exception as e:
                logger.warning(f"Churn average calculation failed: {e}")
                return [0.0, 0.0]

        churn_freq = churn_avg(frequency_values, churn_status)
        churn_monetary = churn_avg(monetary_values, churn_status)

        # Prepare the response dictionary
        response_data = {
            'hist_labels': hist_labels,
            'hist_values': hist_values,
            'months': months,
            'order_counts': order_counts,
            'month_options': months,
            'statuses': statuses,
            'means': means,
            'mins': mins,
            'maxs': maxs,
            'order_totals': order_totals,
            'quantities': quantities,
            'corr': corr,
            'corr_labels': corr_labels,
            'recency_hist_labels': rec_hist_labels,
            'recency_hist_values': rec_hist_values,
            'freq_hist_labels': freq_hist_labels,
            'freq_hist_values': freq_hist_values,
            'monetary_hist_labels': mon_hist_labels,
            'monetary_hist_values': mon_hist_values,
            'churn_freq': churn_freq,
            'churn_monetary': churn_monetary,
            'recency_scatter': recency_scatter,
            'monetary_scatter': monetary_scatter,
            'churn_scatter': churn_scatter,
            'aov_labels': aov_labels,
            'aov_values': aov_values,
        }

        return JsonResponse(response_data)

    except Exception as e:
        logger.error(f"Error in chart_data view: {e}", exc_info=True)
        return JsonResponse({'error': traceback.format_exc()}, status=500)
    

### WORKING WAY TO WELL ### FINAL REQ PAYMENT ###
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
import logging
import re
import tempfile
import os
import pycountry
from facebook_business.api import FacebookAdsApi
from facebook_business.adobjects.adaccount import AdAccount
from facebook_business.adobjects.adset import AdSet
from facebook_business.adobjects.adcreative import AdCreative
from facebook_business.adobjects.ad import Ad
from facebook_business.exceptions import FacebookRequestError
from facebook_business.adobjects.targetingsearch import TargetingSearch
from .models import MetaAdStrategy

logger = logging.getLogger(__name__)

def get_country_code(country_name):
    try:
        country = pycountry.countries.lookup(country_name)
        return country.alpha_2
    except LookupError:
        return None

@login_required
def submit_meta_form(request):
    if request.method == 'POST':
        try:
            # Collect and validate form data
            goal = request.POST.get('goal')
            budget = request.POST.get('budget')
            duration = request.POST.get('duration')
            gender = request.POST.get('audience_gender')
            age_start = request.POST.get('audience_start')
            age_end = request.POST.get('audience_end')
            interests = request.POST.get('audience_interest')
            ad_type = request.POST.get('manual_ad_type') or request.POST.get('ad_type')
            cta = request.POST.get('cta')
            video = request.FILES.get('video')
            image = request.FILES.get('image')
            target_location = request.POST.get('target_location', '').strip()
            landing_page = request.POST.get('landing_page')
            create_ad = request.POST.get('create_ad', 'no') == 'yes'  # Checkbox for ad creation (default: no)

            # Input validation
            if not goal or goal not in ['Leads', 'Traffic', 'Brand Awareness', 'Conversions']:
                messages.error(request, "Invalid or missing goal.")
                return redirect('strategies')
            try:
                budget = float(budget) * 100  # Convert to cents
                if budget < 100:  # Minimum $1
                    raise ValueError("Budget must be at least $1.")
            except (ValueError, TypeError):
                messages.error(request, "Invalid budget value.")
                return redirect('strategies')
            try:
                duration = int(duration)
                if duration < 1 or duration > 90:
                    raise ValueError("Duration must be between 1 and 90 days.")
            except (ValueError, TypeError):
                messages.error(request, "Invalid duration value.")
                return redirect('strategies')
            try:
                age_start = int(age_start)
                age_end = int(age_end)
                if not (18 <= age_start <= age_end <= 65):
                    raise ValueError("Age range must be between 18 and 65, with start age less than or equal to end age.")
            except (ValueError, TypeError):
                messages.error(request, "Invalid age range.")
                return redirect('strategies')
            if gender not in ['Men', 'Women', 'All']:
                messages.error(request, "Invalid gender selection.")
                return redirect('strategies')
            # Validate and convert target_location
            if not target_location:
                messages.error(request, "Target location is required.")
                return redirect('strategies')
            # Try as a 2-letter code first
            if len(target_location) == 2 and target_location.upper() in [c.alpha_2 for c in pycountry.countries]:
                target_location = target_location.upper()
            else:
                # Convert country name to code
                country_code = get_country_code(target_location)
                if not country_code:
                    messages.error(request, f"Invalid country: '{target_location}'. Please use a valid country name or 2-letter code (e.g., US, United Kingdom).")
                    return redirect('strategies')
                target_location = country_code
            if not video and not image:
                messages.error(request, "Please upload an image or video for the ad.")
                return redirect('strategies')
            # Validate landing page URL
            if not landing_page:
                messages.error(request, "Landing page URL is required.")
                return redirect('strategies')
            url_pattern = re.compile(
                r'^(https?:\/\/)?'  # http:// or https://
                r'([\da-z\.-]+)\.'  # domain name
                r'([a-z\.]{2,6})'   # top-level domain
                r'([\/\w\.-]*)*\/?$' # path
            )
            if not url_pattern.match(landing_page):
                messages.error(request, "Invalid landing page URL.")
                return redirect('strategies')
            # Ensure URL starts with http:// or https://
            if not landing_page.startswith(('http://', 'https://')):
                landing_page = 'https://' + landing_page

            # Validate image file
            if image:
                if image.content_type not in ['image/jpeg', 'image/png']:
                    messages.error(request, "Image must be JPEG or PNG.")
                    return redirect('strategies')
                if image.size > 30 * 1024 * 1024:  # 30MB
                    messages.error(request, "Image must be less than 30MB.")
                    return redirect('strategies')
            # Validate video file
            if video:
                if video.content_type != 'video/mp4':
                    messages.error(request, "Video must be MP4.")
                    return redirect('strategies')
                if video.size > 4 * 1024 * 1024 * 1024:  # 4GB
                    messages.error(request, "Video must be less than 4GB.")
                    return redirect('strategies')

            # Map goal to Meta objective and optimization goal
            objective_map = {
                'Leads': {'objective': 'OUTCOME_LEADS', 'optimization_goal': 'LEAD_GENERATION'},
                'Traffic': {'objective': 'OUTCOME_TRAFFIC', 'optimization_goal': 'LINK_CLICKS'},
                'Brand Awareness': {'objective': 'OUTCOME_AWARENESS', 'optimization_goal': 'REACH'},
                'Conversions': {'objective': 'OUTCOME_SALES', 'optimization_goal': 'OFFSITE_CONVERSIONS'}
            }
            goal_info = objective_map.get(goal, {'objective': 'OUTCOME_ENGAGEMENT', 'optimization_goal': 'POST_ENGAGEMENT'})
            objective = goal_info['objective']
            optimization_goal = goal_info['optimization_goal']

            # Map CTA to Meta's call-to-action types
            cta_map = {
                'Learn More': 'LEARN_MORE',
                'Shop Now': 'SHOP_NOW',
                'Sign Up': 'SIGN_UP',
                'Download': 'DOWNLOAD',
                'Get Offer': 'GET_OFFER',
                'Book Now': 'BOOK_TRAVEL',
                'Send Message': 'MESSAGE_PAGE'
            }
            cta_value = cta_map.get(cta, 'LEARN_MORE')

            # Initialize Meta API
            FacebookAdsApi.init(
                settings.META_APP_ID,
                settings.META_APP_SECRET,
                settings.META_ACCESS_TOKEN
            )
            ad_account = AdAccount(settings.META_AD_ACCOUNT_ID)

            # Create Campaign
            campaign_params = {
                'name': f'{goal} Campaign - {timezone.now().strftime("%Y%m%d")}',
                'objective': objective,
                'status': 'PAUSED',
                'special_ad_categories': [],
            }
            campaign = ad_account.create_campaign(params=campaign_params)
            campaign_id = campaign['id']
            logger.info(f"Created campaign with ID: {campaign_id}")

            # Fetch interest IDs for targeting
            interest_list = []
            if interests:
                interest_names = [i.strip() for i in interests.split(',') if i.strip()]
                for interest_name in interest_names:
                    try:
                        params = {
                            'q': interest_name,
                            'type': 'adinterest',
                            'limit': 1
                        }
                        search_results = TargetingSearch.search(params=params)
                        if search_results and len(search_results) > 0:
                            interest = search_results[0]
                            interest_list.append({
                                'id': interest['id'],
                                'name': interest['name']
                            })
                            logger.info(f"Found interest: {interest['name']} (ID: {interest['id']})")
                        else:
                            logger.warning(f"No interest found for: {interest_name}")
                    except FacebookRequestError as e:
                        logger.error(f"Error fetching interest '{interest_name}': {str(e)}")
                        continue

            # Validate interests if provided
            if interests and not interest_list:
                messages.error(request, "No valid interests found for the provided input.")
                return redirect('strategies')

            # Calculate bid amount (10% of daily budget, min $5, max $50)
            bid_amount = max(500, min(5000, int(budget * 0.1)))

            # Create Ad Set
            adset_params = {
                'name': f'{goal} Ad Set - {timezone.now().strftime("%Y%m%d")}',
                'campaign_id': campaign_id,
                'status': 'PAUSED',
                'billing_event': 'IMPRESSIONS',
                'optimization_goal': optimization_goal,
                'bid_strategy': 'LOWEST_COST_WITH_BID_CAP',
                'bid_amount': bid_amount,
                'daily_budget': int(budget),
                'start_time': timezone.now().isoformat(),
                'end_time': (timezone.now() + timedelta(days=duration)).isoformat(),
                'targeting': {
                    'geo_locations': {'countries': [target_location]},
                    'age_min': age_start,
                    'age_max': age_end,
                    'genders': [1 if gender == 'Men' else 2 if gender == 'Women' else 0],
                    'targeting_automation': {
                        'advantage_audience': 0
                    }
                }
            }

            if interest_list:
                adset_params['targeting']['interests'] = [{'id': interest['id'], 'name': interest['name']} for interest in interest_list]

            # Add promoted_object for OFFSITE_CONVERSIONS
            if optimization_goal == 'OFFSITE_CONVERSIONS':
                if not hasattr(settings, 'META_PIXEL_ID') or not settings.META_PIXEL_ID:
                    messages.error(request, "Meta Pixel ID is not configured. Please contact support.")
                    return redirect('strategies')
                adset_params['promoted_object'] = {
                    'pixel_id': settings.META_PIXEL_ID,
                    'custom_event_type': 'PURCHASE'
                }

            adset = ad_account.create_ad_set(params=adset_params)
            adset_id = adset['id']
            logger.info(f"Created ad set with ID: {adset_id}")

            # Upload media (image or video)
            media_id = None
            if image:
                try:
                    # Handle InMemoryUploadedFile or TemporaryUploadedFile
                    if hasattr(image, 'temporary_file_path'):
                        image_path = image.temporary_file_path()
                    else:
                        # Save in-memory file to a temporary file
                        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(image.name)[1]) as temp_file:
                            for chunk in image.chunks():
                                temp_file.write(chunk)
                            image_path = temp_file.name

                    # Upload image to Meta
                    image_upload = ad_account.create_ad_image(fields=['hash'], params={'filename': image_path})
                    logger.info(f"Raw image upload response: {image_upload}")

                    # Access image hash
                    if 'images' in image_upload and isinstance(image_upload['images'], dict):
                        for key, value in image_upload['images'].items():
                            if 'hash' in value:
                                media_id = value['hash']
                                break
                    elif 'hash' in image_upload:
                        media_id = image_upload['hash']
                    else:
                        raise ValueError(f"Unexpected image upload response: {image_upload}")

                    logger.info(f"Uploaded image with hash: {media_id}")

                    # Clean up temporary file if created
                    if not hasattr(image, 'temporary_file_path'):
                        os.unlink(image_path)
                except FacebookRequestError as e:
                    logger.error(f"Error uploading image: {str(e)}")
                    messages.error(request, f"Error uploading image: {str(e)}")
                    return redirect('strategies')
                except Exception as e:
                    logger.error(f"Error uploading image file: {str(e)}")
                    messages.error(request, f"Error processing image file: {str(e)}")
                    return redirect('strategies')
            elif video:
                try:
                    # Handle InMemoryUploadedFile or TemporaryUploadedFile
                    if hasattr(video, 'temporary_file_path'):
                        video_path = video.temporary_file_path()
                    else:
                        # Save in-memory file to a temporary file
                        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(video.name)[1]) as temp_file:
                            for chunk in video.chunks():
                                temp_file.write(chunk)
                            video_path = temp_file.name

                    video_upload = ad_account.create_ad_video(params={'file': video_path})
                    media_id = video_upload['id']
                    logger.info(f"Uploaded video with ID: {media_id}")

                    # Clean up temporary file
                    if not hasattr(video, 'temporary_file_path'):
                        os.unlink(video_path)
                except FacebookRequestError as e:
                    logger.error(f"Error uploading video: {str(e)}")
                    messages.error(request, f"Error uploading video: {str(e)}")
                    return redirect('strategies')
                except Exception as e:
                    logger.error(f"Error handling video file: {str(e)}")
                    messages.error(request, f"Error processing video file: {str(e)}")
                    return redirect('strategies')

            # Create Ad Creative
            creative_params = {
                'name': f'{goal} Creative - {timezone.now().strftime("%Y%m%d")}',
                'object_story_spec': {
                    'page_id': settings.META_PAGE_ID,
                }
            }

            if image:
                creative_params['object_story_spec']['link_data'] = {
                    'image_hash': media_id,
                    'link': landing_page,
                    'message': f'Discover {goal.lower()} with our latest offer!',
                    'call_to_action': {'type': cta_value}
                }
            elif video:
                creative_params['object_story_spec']['video_data'] = {
                    'video_id': media_id,
                    'link': landing_page,
                    'message': f'Watch our {goal.lower()} video!',
                    'call_to_action': {'type': cta_value}
                }

            creative = ad_account.create_ad_creative(params=creative_params)
            creative_id = creative['id']
            logger.info(f"Created ad creative with ID: {creative_id}")

            # Create Ad only if checkbox is checked
            ad_id = None
            if create_ad:
                ad_params = {
                    'name': f'{goal} Ad - {timezone.now().strftime("%Y%m%d")}',
                    'adset_id': adset_id,
                    'creative': {'creative_id': creative_id},
                    'status': 'PAUSED'
                }
                try:
                    ad = ad_account.create_ad(params=ad_params)
                    ad_id = ad['id']
                    logger.info(f"Created ad with ID: {ad_id}")
                except FacebookRequestError as e:
                    if e._error.get('error_subcode') == 1359188:
                        logger.error(f"No payment method configured for ad account: {str(e)}")
                        messages.error(request, "No payment method configured. Please add a valid payment method in Meta Ads Manager to create ads.")
                    else:
                        logger.error(f"Error creating ad: {str(e)}")
                        messages.error(request, f"Error creating ad: {str(e)}")
                    return redirect('strategies')

            # Save to MetaAdStrategy model
            strategy = MetaAdStrategy(
                user=request.user,
                goal=goal,
                budget=budget / 100,
                duration=duration,
                audience_gender=gender,
                audience_start=age_start,
                audience_end=age_end,
                audience_interest=interests,
                ad_type=ad_type,
                manual_ad_type=ad_type if request.POST.get('manual_ad_type') else None,
                cta=cta,
                video=video,
                image=image,
                campaign_id=campaign_id,
                adset_id=adset_id,
                creative_id=creative_id,
                ad_id=ad_id
            )
            strategy.save()

            # Display appropriate success message
            if create_ad and ad_id:
                logger.info(f"Saved MetaAdStrategy with campaign ID: {campaign_id}, ad set ID: {adset_id}, creative ID: {creative_id}, ad ID: {ad_id}")
                messages.success(request, f"Meta campaign, ad set, creative, and ad created! Campaign ID: {campaign_id}, Ad Set ID: {adset_id}, Creative ID: {creative_id}, Ad ID: {ad_id}")
            else:
                logger.info(f"Saved MetaAdStrategy with campaign ID: {campaign_id}, ad set ID: {adset_id}, creative ID: {creative_id}, no ad created")
                messages.success(request, f"Meta campaign, ad set, and creative created! Campaign ID: {campaign_id}, Ad Set ID: {adset_id}, Creative ID: {creative_id}")

            return redirect('strategies')

        except FacebookRequestError as e:
            logger.error(f"Meta API error: {str(e)}", exc_info=True)
            messages.error(request, f"Error creating campaign, ad set, or creative: {str(e)}")
            return redirect('strategies')
        except Exception as e:
            logger.error(f"Error in submit_meta_form: {str(e)}", exc_info=True)
            messages.error(request, f"Error processing form: {str(e)}")
            return redirect('strategies')
    return render(request, 'metaform.html')




from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.conf import settings
from django.utils import timezone
import logging
import re
import pycountry
import tempfile
import os
from google.ads.googleads.client import GoogleAdsClient
from google.ads.googleads.errors import GoogleAdsException
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
from .models import GoogleAdStrategy

logger = logging.getLogger(__name__)

def get_country_code(country_name):
    try:
        country = pycountry.countries.lookup(country_name)
        return country.alpha_2
    except LookupError:
        return None

@login_required(login_url='signin')
def google_form(request):
    return render(request, 'google_form.html', {'strategy': request.session.get('selected_strategy')})

@login_required(login_url='signin')
def submit_google_form(request):
    if request.method == 'POST':
        try:
            # Collect form data
            goal = request.POST.get('goal')
            budget = request.POST.get('budget')
            duration = request.POST.get('duration')
            gender = request.POST.get('audience_gender')
            age_start = request.POST.get('audience_start')
            age_end = request.POST.get('audience_end')
            interests = request.POST.get('audience_interest')
            ad_type = request.POST.get('ad_type')
            cta = request.POST.get('cta')
            video = request.FILES.get('video')
            image = request.FILES.get('image')
            target_location = request.POST.get('target_location', '').strip()
            keywords = request.POST.get('keywords')
            headline1 = request.POST.get('headline1')
            headline2 = request.POST.get('headline2')
            description1 = request.POST.get('description1')
            description2 = request.POST.get('description2')
            final_url = request.POST.get('final_url')
            app_id = request.POST.get('app_id')
            app_store_url = request.POST.get('app_store_url')
            phone_number = request.POST.get('phone_number')
            create_ad = request.POST.get('create_ad') == 'on'

            # Input validation
            if not goal or goal not in ['Leads', 'Traffic', 'Brand Awareness', 'Conversions']:
                messages.error(request, "Invalid or missing goal.")
                return redirect('strategies')
            try:
                budget = float(budget)
                if budget < 1:
                    raise ValueError("Budget must be at least $1.")
            except (ValueError, TypeError):
                messages.error(request, "Invalid budget value.")
                return redirect('strategies')
            try:
                duration = int(duration)
                if duration < 1 or duration > 90:
                    raise ValueError("Duration must be between 1 and 90 days.")
            except (ValueError, TypeError):
                messages.error(request, "Invalid duration value.")
                return redirect('strategies')
            try:
                age_start = int(age_start)
                age_end = int(age_end)
                if not (18 <= age_start <= age_end <= 65):
                    raise ValueError("Age range must be between 18 and 65.")
            except (ValueError, TypeError):
                messages.error(request, "Invalid age range.")
                return redirect('strategies')
            if gender not in ['Men', 'Women', 'All']:
                messages.error(request, "Invalid gender selection.")
                return redirect('strategies')
            if not target_location:
                messages.error(request, "Target location is required.")
                return redirect('strategies')
            if len(target_location) == 2 and target_location.upper() in [c.alpha_2 for c in pycountry.countries]:
                target_location = target_location.upper()
            else:
                country_code = get_country_code(target_location)
                if not country_code:
                    messages.error(request, f"Invalid country: '{target_location}'.")
                    return redirect('strategies')
                target_location = country_code
            if ad_type not in [
                'Responsive Search Ads', 'Search Ads', 'Responsive Display Ads', 'Display Ads',
                'Performance Max Campaigns', 'Shopping Ads', 'YouTube Video Ads', 'Discovery Ads',
                'App Promotion Ads', 'Call-Only Ads'
            ]:
                messages.error(request, "Invalid ad type.")
                return redirect('strategies')
            # Ad type-specific validation
            if ad_type in ['Responsive Display Ads', 'Display Ads', 'Discovery Ads', 'Performance Max Campaigns']:
                if not image:
                    messages.error(request, f"An image is required for {ad_type}.")
                    return redirect('strategies')
            elif ad_type == 'YouTube Video Ads':
                if not video:
                    messages.error(request, "A video is required for YouTube Video Ads.")
                    return redirect('strategies')
            elif ad_type == 'App Promotion Ads':
                if not app_id or not app_store_url:
                    messages.error(request, "App ID and store URL are required for App Promotion Ads.")
                    return redirect('strategies')
                if not re.match(r'^[a-zA-Z0-9\.]+$', app_id):
                    messages.error(request, "Invalid app ID format.")
                    return redirect('strategies')
            elif ad_type == 'Call-Only Ads':
                if not phone_number or not re.match(r'^\+[1-9][0-9]{1,14}$', phone_number):
                    messages.error(request, "Valid phone number is required (e.g., +12025550123).")
                    return redirect('strategies')
            elif ad_type not in ['Search Ads', 'Responsive Search Ads']:
                if not video and not image:
                    messages.error(request, "Please upload an image or video for the ad.")
                    return redirect('strategies')
            # Search ad fields
            if ad_type in ['Search Ads', 'Responsive Search Ads']:
                if not all([keywords, headline1, headline2, description1, description2, final_url]):
                    messages.error(request, "All Search ad fields are required.")
                    return redirect('strategies')
                if len(headline1) > 30 or len(headline2) > 30:
                    messages.error(request, "Headlines must be 30 characters or less.")
                    return redirect('strategies')
                if len(description1) > 90 or len(description2) > 90:
                    messages.error(request, "Descriptions must be 90 characters or less.")
                    return redirect('strategies')
            # Validate final_url
            if final_url:
                url_pattern = re.compile(
                    r'^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w\.-]*)*\/?$'
                )
                if not url_pattern.match(final_url):
                    messages.error(request, "Invalid final URL.")
                    return redirect('strategies')
                if not final_url.startswith(('http://', 'https://')):
                    final_url = 'https://' + final_url
            # Validate media
            if image:
                if image.content_type not in ['image/jpeg', 'image/png']:
                    messages.error(request, "Image must be JPEG or PNG.")
                    return redirect('strategies')
                if image.size > 30 * 1024 * 1024:
                    messages.error(request, "Image must be less than 30MB.")
                    return redirect('strategies')
            if video:
                if video.content_type != 'video/mp4':
                    messages.error(request, "Video must be MP4.")
                    return redirect('strategies')
                if video.size > 4 * 1024 * 1024 * 1024:
                    messages.error(request, "Video must be less than 4GB.")
                    return redirect('strategies')

            # Combine headlines and descriptions
            headlines = f"{headline1},{headline2}" if headline1 and headline2 else None
            descriptions = f"{description1},{description2}" if description1 and description2 else None

            # Map goal to campaign type
            goal_map = {
                'Leads': 'LEADS',
                'Traffic': 'WEBSITE_TRAFFIC',
                'Brand Awareness': 'BRAND_AWARENESS',
                'Conversions': 'CONVERSIONS'
            }
            goal_type = goal_map.get(goal, 'WEBSITE_TRAFFIC')

            # Initialize Google Ads API
            client = GoogleAdsClient.load_from_dict({
                'client_id': settings.GOOGLE_ADS_CLIENT_ID,
                'client_secret': settings.GOOGLE_ADS_CLIENT_SECRET,
                'refresh_token': settings.GOOGLE_ADS_REFRESH_TOKEN,
                'developer_token': settings.GOOGLE_ADS_DEVELOPER_TOKEN,
                'client_customer_id': settings.GOOGLE_ADS_CUSTOMER_ID,
                # "login_customer_id": settings.GOOGLE_ADS_LOGIN_CUSTOMER_ID,
                'use_proto_plus': True
            })
            customer_id = settings.GOOGLE_ADS_CUSTOMER_ID.replace('-', '')

            # Ad type to channel type mapping
            channel_map = {
                'Responsive Search Ads': 'SEARCH',
                'Search Ads': 'SEARCH',
                'Responsive Display Ads': 'DISPLAY',
                'Display Ads': 'DISPLAY',
                'Performance Max Campaigns': 'PERFORMANCE_MAX',
                'Shopping Ads': 'SHOPPING',
                'YouTube Video Ads': 'VIDEO',
                'Discovery Ads': 'DISCOVERY',
                'App Promotion Ads': 'MULTI_CHANNEL',
                'Call-Only Ads': 'SEARCH'
            }
            channel_type = channel_map.get(ad_type, 'SEARCH')

            # Create Campaign Budget
            campaign_budget_service = client.get_service('CampaignBudgetService')
            campaign_budget_operation = client.get_type('CampaignBudgetOperation')
            campaign_budget = campaign_budget_operation.create
            campaign_budget.name = f"Budget {timezone.now().strftime('%Y%m%d')}"
            campaign_budget.amount_micros = int(budget * 1000000)
            campaign_budget.explicitly_shared = False
            campaign_budget_response = campaign_budget_service.mutate_campaign_budgets(
                customer_id=customer_id, operations=[campaign_budget_operation]
            )
            budget_resource_name = campaign_budget_response.results[0].resource_name

            # Create Campaign
            campaign_service = client.get_service('CampaignService')
            campaign_operation = client.get_type('CampaignOperation')
            campaign = campaign_operation.create
            campaign.name = f"{goal} Campaign {timezone.now().strftime('%Y%m%d')}"
            campaign.advertising_channel_type = client.enums.AdvertisingChannelTypeEnum[channel_type]
            campaign.status = client.enums.CampaignStatusEnum.PAUSED
            campaign.campaign_budget = budget_resource_name
            campaign.start_date = timezone.now().strftime('%Y%m%d')
            campaign.end_date = (timezone.now() + timedelta(days=duration)).strftime('%Y%m%d')
            if channel_type in ['SEARCH', 'DISPLAY', 'CALL_ONLY']:
                campaign.manual_cpc = client.get_type('ManualCpc')
            elif channel_type == 'VIDEO':
                campaign.target_cpm = client.get_type('TargetCpm')
            elif channel_type == 'PERFORMANCE_MAX':
                campaign.maximize_conversions = client.get_type('MaximizeConversions')
            campaign.geo_target_type_setting = client.get_type('GeoTargetTypeSetting')
            campaign.geo_target_type_setting.positive_geo_target_type = (
                client.enums.PositiveGeoTargetTypeEnum.PRESENCE
            )
            campaign_response = campaign_service.mutate_campaigns(
                customer_id=customer_id, operations=[campaign_operation]
            )
            campaign_id = campaign_response.results[0].resource_name.split('/')[-1]
            logger.info(f"Created campaign with ID: {campaign_id}")

            # Create Geo Targeting
            geo_target_service = client.get_service('GeoTargetConstantService')
            geo_criteria = geo_target_service.suggest_geo_target_constants({
                'locale': 'en',
                'country_code': target_location,
                'location_names': [{'name': target_location}]
            })
            if geo_criteria.geo_target_constants:
                location_id = geo_criteria.geo_target_constants[0].resource_name.split('/')[-1]
                geo_operation = client.get_type('CampaignCriterionOperation')
                geo_criterion = geo_operation.create
                geo_criterion.campaign = f"customers/{customer_id}/campaigns/{campaign_id}"
                geo_criterion.location.geo_target_constant = (
                    f"geoTargetConstants/{location_id}"
                )
                geo_service = client.get_service('CampaignCriterionService')
                geo_service.mutate_campaign_criteria(
                    customer_id=customer_id, operations=[geo_operation]
                )
                logger.info(f"Added geo targeting: {target_location}")

            # Create Ad Group
            ad_group_service = client.get_service('AdGroupService')
            ad_group_operation = client.get_type('AdGroupOperation')
            ad_group = ad_group_operation.create
            ad_group.name = f"{goal} Ad Group {timezone.now().strftime('%Y%m%d')}"
            ad_group.campaign = f"customers/{customer_id}/campaigns/{campaign_id}"
            ad_group.status = client.enums.AdGroupStatusEnum.PAUSED
            ad_group.cpc_bid_micros = 500000
            ad_group.type_ = client.enums.AdGroupTypeEnum[channel_type + '_STANDARD']
            ad_group_response = ad_group_service.mutate_ad_groups(
                customer_id=customer_id, operations=[ad_group_operation]
            )
            ad_group_id = ad_group_response.results[0].resource_name.split('/')[-1]
            logger.info(f"Created ad group with ID: {ad_group_id}")

            # Add Keywords (for Search Ads)
            if keywords and ad_type in ['Search Ads', 'Responsive Search Ads']:
                keyword_service = client.get_service('AdGroupCriterionService')
                keyword_operations = []
                for keyword in [k.strip() for k in keywords.split(',') if k.strip()]:
                    keyword_operation = client.get_type('AdGroupCriterionOperation')
                    criterion = keyword_operation.create
                    criterion.ad_group = f"customers/{customer_id}/adGroups/{ad_group_id}"
                    criterion.keyword.text = keyword
                    criterion.keyword.match_type = client.enums.KeywordMatchTypeEnum.BROAD
                    keyword_operations.append(keyword_operation)
                keyword_response = keyword_service.mutate_ad_group_criteria(
                    customer_id=customer_id, operations=keyword_operations
                )
                logger.info(f"Added {len(keyword_response.results)} keywords")

            # Upload Media
            asset_id = None
            if image and ad_type in ['Responsive Display Ads', 'Display Ads', 'Discovery Ads', 'Performance Max Campaigns', 'App Promotion Ads']:
                asset_service = client.get_service('AssetService')
                asset_operation = client.get_type('AssetOperation')
                asset = asset_operation.create
                asset.type_ = client.enums.AssetTypeEnum.IMAGE
                if hasattr(image, 'temporary_file_path'):
                    image_path = image.temporary_file_path()
                else:
                    with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(image.name)[1]) as temp_file:
                        for chunk in image.chunks():
                            temp_file.write(chunk)
                        image_path = temp_file.name
                with open(image_path, 'rb') as img_file:
                    asset.image_asset.data = img_file.read()
                asset.image_asset.file_name = image.name
                asset_response = asset_service.mutate_assets(
                    customer_id=customer_id, operations=[asset_operation]
                )
                asset_id = asset_response.results[0].resource_name
                logger.info(f"Uploaded image asset: {asset_id}")
                if not hasattr(image, 'temporary_file_path'):
                    os.unlink(image_path)
            elif video and ad_type == 'YouTube Video Ads':
                youtube = build('youtube', 'v3', developerKey=settings.YOUTUBE_API_KEY)
                video_path = video.temporary_file_path() if hasattr(video, 'temporary_file_path') else None
                if not video_path:
                    with tempfile.NamedTemporaryFile(delete=False, suffix='.mp4') as temp_file:
                        for chunk in video.chunks():
                            temp_file.write(chunk)
                        video_path = temp_file.name
                request = youtube.videos().insert(
                    part='snippet,status',
                    body={
                        'snippet': {
                            'title': f"{goal} Video Ad {timezone.now().strftime('%Y%m%d')}",
                            'description': f"Ad for {goal}",
                            'categoryId': '22'
                        },
                        'status': {'privacyStatus': 'unlisted'}
                    },
                    media_body=MediaFileUpload(video_path)
                )
                video_response = request.execute()
                video_id = video_response['id']
                asset_id = video_id
                logger.info(f"Uploaded YouTube video: {video_id}")
                if not hasattr(video, 'temporary_file_path'):
                    os.unlink(video_path)

            # Create Ad (if create_ad is checked)
            ad_id = None
            if create_ad:
                ad_group_ad_service = client.get_service('AdGroupAdService')
                ad_group_ad_operation = client.get_type('AdGroupAdOperation')
                ad = ad_group_ad_operation.create
                ad.status = client.enums.AdGroupAdStatusEnum.PAUSED
                ad.ad_group = f"customers/{customer_id}/adGroups/{ad_group_id}"
                if ad_type in ['Search Ads', 'Responsive Search Ads']:
                    ad.ad.final_urls.append(final_url)
                    if ad_type == 'Responsive Search Ads':
                        responsive_search_ad = ad.ad.responsive_search_ad
                        for headline in [headline1, headline2]:
                            if headline:
                                headline_asset = client.get_type('AdTextAsset')
                                headline_asset.text = headline
                                responsive_search_ad.headlines.append(headline_asset)
                        for description in [description1, description2]:
                            if description:
                                description_asset = client.get_type('AdTextAsset')
                                description_asset.text = description
                                responsive_search_ad.descriptions.append(description_asset)
                    else:
                        expanded_text_ad = ad.ad.expanded_text_ad
                        expanded_text_ad.headline_part1 = headline1
                        expanded_text_ad.headline_part2 = headline2
                        expanded_text_ad.description = description1
                        expanded_text_ad.description2 = description2
                elif ad_type in ['Responsive Display Ads', 'Display Ads']:
                    responsive_display_ad = ad.ad.responsive_display_ad
                    if asset_id:
                        image_asset = client.get_type('AdImageAsset')
                        image_asset.asset = asset_id
                        responsive_display_ad.square_marketing_images.append(image_asset)
                    headline_asset = client.get_type('AdTextAsset')
                    headline_asset.text = headline1 or 'Discover Our Offer'
                    responsive_display_ad.headlines.append(headline_asset)
                    description_asset = client.get_type('AdTextAsset')
                    description_asset.text = description1 or 'Shop now for great deals!'
                    responsive_display_ad.descriptions.append(description_asset)
                    responsive_display_ad.final_urls.append(final_url or 'https://example.com')
                elif ad_type == 'YouTube Video Ads':
                    video_ad = ad.ad.video_ad
                    video_ad.video.youtube_video_id = asset_id
                    video_ad.in_stream_action.headline = headline1 or 'Watch Now'
                    video_ad.in_stream_action.call_to_action = cta.lower().replace(' ', '_')
                    video_ad.final_urls.append(final_url or 'https://example.com')
                elif ad_type == 'Performance Max Campaigns':
                    performance_max_ad = ad.ad.performance_max_ad
                    if asset_id:
                        image_asset = client.get_type('AdImageAsset')
                        image_asset.asset = asset_id
                        performance_max_ad.marketing_images.append(image_asset)
                    headline_asset = client.get_type('AdTextAsset')
                    headline_asset.text = headline1 or 'Great Deals'
                    performance_max_ad.headlines.append(headline_asset)
                    description_asset = client.get_type('AdTextAsset')
                    description_asset.text = description1 or 'Shop today!'
                    performance_max_ad.descriptions.append(description_asset)
                    performance_max_ad.final_urls.append(final_url or 'https://example.com')
                elif ad_type == 'Discovery Ads':
                    discovery_ad = ad.ad.discovery_ad
                    if asset_id:
                        image_asset = client.get_type('AdImageAsset')
                        image_asset.asset = asset_id
                        discovery_ad.marketing_images.append(image_asset)
                    discovery_ad.headline = headline1 or 'Discover Now'
                    discovery_ad.description = description1 or 'Explore our offers'
                    discovery_ad.final_urls.append(final_url or 'https://example.com')
                elif ad_type == 'Call-Only Ads':
                    call_ad = ad.ad.call_ad
                    call_ad.phone_number = phone_number
                    call_ad.headline1 = headline1 or 'Call Us Today'
                    call_ad.headline2 = headline2 or 'Get Support Now'
                    call_ad.description1 = description1 or 'Fast service'
                    call_ad.description2 = description2 or '24/7 support'
                    call_ad.final_urls.append(final_url or 'https://example.com')
                elif ad_type == 'App Promotion Ads':
                    app_ad = ad.ad.app_ad
                    app_ad.app_id = app_id
                    app_ad.app_store = client.enums.MobileAppStoreEnum.GOOGLE_PLAY
                    if asset_id:
                        image_asset = client.get_type('AdImageAsset')
                        image_asset.asset = asset_id
                        app_ad.images.append(image_asset)
                    headline_asset = client.get_type('AdTextAsset')
                    headline_asset.text = headline1 or 'Download Our App'
                    app_ad.headlines.append(headline_asset)
                    description_asset = client.get_type('AdTextAsset')
                    description_asset.text = description1 or 'Free to install'
                    app_ad.descriptions.append(description_asset)
                    app_ad.final_urls.append(app_store_url or 'https://example.com')
                ad_group_ad_response = ad_group_ad_service.mutate_ad_group_ads(
                    customer_id=customer_id, operations=[ad_group_ad_operation]
                )
                ad_id = ad_group_ad_response.results[0].resource_name.split('/')[-1]
                logger.info(f"Created ad with ID: {ad_id}")

            # Save to GoogleAdStrategy
            strategy = GoogleAdStrategy(
                user=request.user,
                goal=goal,
                budget=budget,
                duration=duration,
                audience_gender=gender,
                audience_start=age_start,
                audience_end=age_end,
                audience_interest=interests,
                ad_type=ad_type,
                cta=cta,
                video=video,
                image=image,
                campaign_id=campaign_id,
                ad_group_id=ad_group_id,
                ad_id=ad_id,
                target_location=target_location,
                keywords=keywords,
                headlines=headlines,
                descriptions=descriptions,
                final_url=final_url,
                create_ad=create_ad,
                app_id=app_id,
                app_store_url=app_store_url,
                phone_number=phone_number
            )
            strategy.save()

            # Success message
            if create_ad and ad_id:
                messages.success(request, f"Google campaign, ad group, and ad created! Campaign ID: {campaign_id}, Ad Group ID: {ad_group_id}, Ad ID: {ad_id}")
            else:
                messages.success(request, f"Google campaign and ad group created! Campaign ID: {campaign_id}, Ad Group ID: {ad_group_id}")
            return redirect('strategies')

        except GoogleAdsException as e:
            logger.error(f"Google Ads API error: {str(e)}")
            messages.error(request, f"Error creating campaign or ad: {str(e)}")
            return redirect('strategies')
        except Exception as e:
            logger.error(f"Error in submit_google_form: {str(e)}")
            messages.error(request, f"Error processing form: {str(e)}")
            return redirect('strategies')
    return render(request, 'google_form.html')




###EXPEREMENT ###
