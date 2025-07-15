from django.urls import path
from . import views


urlpatterns = [
    path('', views.signup, name='signup'),
    path('signin/', views.signin, name='signin'),
    path('signup/', views.signup, name='signup'),
    path('signout/', views.signout, name='signout'),
    path('dashboard/', views.dashboard, name='dashboard'),
    path('api/dashboard-data/', views.get_dashboard_data, name='get_dashboard_data'),
    # Placeholder URLs for sidebar links (views to be implemented later)
    path('customer_insights/', views.customer_insights, name='customer_insights'),
    path('customer_insights/', views.customer_insights, name='customer_insights'),
    path('customer_insights_data/', views.customer_insights_data, name='customer_insights_data'),
    path('rfm-analysis/', views.rfm_analysis, name='rfm_analysis'),
    # path('rfm-churn-visualizations/', views.rfm_churn_visualizations, name='rfm_churn_visualizations'),
    path('customer-profile/', views.customer_profile, name='customer_profile'),
    path('eda-charts/', views.eda_charts, name='eda_charts'),
    path('cohort-analysis/', views.cohort_analysis, name='cohort_analysis'),
    path('strategies/', views.strategies, name='strategies'),
    path('financial-insights/', views.financial_insights, name='financial_insights'),
    path('product-insights/', views.product_insights, name='product_insights'),
    # New Customer Profile URL patterns
    path('customer_profile/', views.customer_profile, name='customer_profile'),
    path('customer_profile_data/', views.customer_profile_data, name='customer_profile_data'),
    # New Financial Insights URL patterns
   path('financial_insights/', views.financial_insights, name='financial_insights'),
    path('financial-insights-data/', views.financial_insights_data, name='financial_insights_data'),
    # Add other paths as needed
    # Product Insights URL patterns
    path('product_insights/', views.product_insights, name='product_insights'),
    path('product_insights_data/', views.product_insights_data, name='product_insights_data'),
    ## NEW ##
    path('rfm-churn-visualizations/', views.rfm_churn_visualizations, name='rfm_churn_visualizations'),
    path('rfm-churn-visualizations-data/', views.rfm_churn_visualizations_data, name='rfm_churn_visualizations_data'),

    ## NEW ## 
    path('cohort-data/', views.cohort_data, name='cohort_data'),
    ## STRARTIGIES ##
    # Ad strategy patterns
    path('strategies/', views.strategies, name='strategies'),
    path('generate_multiple_strategies/', views.generate_multiple_strategies, name='generate_multiple_strategies'),
    path('save_edited_strategy/', views.save_edited_strategy, name='save_edited_strategy'),
    path('select_strategy/', views.select_strategy, name='select_strategy'),

    path('google_form/', views.google_form, name='google_form'),
    path('meta_form/', views.meta_form, name='meta_form'),

    path('eda-charts/', views.eda_charts, name='eda_charts'),
    path('rfm-analysis/', views.rfm_analysis, name='rfm_analysis'),
    path('chart-data/', views.chart_data, name='chart_data'),
  
    
]