# Client-Specific Vapi Assistant Dashboard Guide

**Author:** Manus AI  
**Date:** June 29, 2025  
**Version:** 1.0

## Overview

This guide shows how to create client-specific dashboards where each client can access analytics for their dedicated Vapi AI assistant. This creates a professional client portal experience where clients can monitor their own call analytics, performance metrics, and case generation data.

## Architecture Overview

### Multi-Tenant System Design
- **Client Isolation**: Each client has their own dedicated Vapi assistant
- **Secure Access**: Client-specific authentication and data access
- **Custom Analytics**: Tailored dashboards for each client's needs
- **White-Label Ready**: Customizable branding per client

## Backend Implementation

### Step 1: Enhanced Client and Assistant Models

```python
# src/models/client.py - Client and Assistant Management
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from enum import Enum
import uuid

db = SQLAlchemy()

class ClientStatus(Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"
    TRIAL = "trial"

class Client(db.Model):
    __tablename__ = 'clients'
    
    id = db.Column(db.Integer, primary_key=True)
    uuid = db.Column(db.String(36), unique=True, nullable=False, default=lambda: str(uuid.uuid4()))
    
    # Client Information
    name = db.Column(db.String(255), nullable=False)
    company_name = db.Column(db.String(255))
    email = db.Column(db.String(255), unique=True, nullable=False)
    phone = db.Column(db.String(50))
    
    # Subscription & Status
    status = db.Column(db.Enum(ClientStatus), default=ClientStatus.TRIAL)
    subscription_plan = db.Column(db.String(100))
    subscription_start = db.Column(db.DateTime)
    subscription_end = db.Column(db.DateTime)
    
    # Branding & Customization
    logo_url = db.Column(db.String(500))
    primary_color = db.Column(db.String(7), default='#3B82F6')  # Hex color
    company_website = db.Column(db.String(255))
    
    # Settings
    timezone = db.Column(db.String(50), default='UTC')
    date_format = db.Column(db.String(20), default='MM/DD/YYYY')
    
    # Tracking
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = db.Column(db.DateTime)
    
    # Relationships
    assistants = db.relationship('VapiAssistant', backref='client', lazy=True, cascade='all, delete-orphan')
    users = db.relationship('ClientUser', backref='client', lazy=True, cascade='all, delete-orphan')
    calls = db.relationship('Call', backref='client', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.uuid,
            'name': self.name,
            'company_name': self.company_name,
            'email': self.email,
            'phone': self.phone,
            'status': self.status.value,
            'subscription_plan': self.subscription_plan,
            'logo_url': self.logo_url,
            'primary_color': self.primary_color,
            'company_website': self.company_website,
            'timezone': self.timezone,
            'created_at': self.created_at.isoformat(),
            'last_login': self.last_login.isoformat() if self.last_login else None
        }
    
    def is_active(self):
        """Check if client subscription is active."""
        if self.status != ClientStatus.ACTIVE:
            return False
        
        if self.subscription_end and datetime.utcnow() > self.subscription_end:
            return False
        
        return True

class VapiAssistant(db.Model):
    __tablename__ = 'vapi_assistants'
    
    id = db.Column(db.Integer, primary_key=True)
    uuid = db.Column(db.String(36), unique=True, nullable=False, default=lambda: str(uuid.uuid4()))
    
    # Vapi Integration
    vapi_assistant_id = db.Column(db.String(255), unique=True, nullable=False)
    vapi_phone_number = db.Column(db.String(50))
    
    # Client Association
    client_id = db.Column(db.Integer, db.ForeignKey('clients.id'), nullable=False)
    
    # Assistant Configuration
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    is_active = db.Column(db.Boolean, default=True)
    
    # Voice & Behavior Settings
    voice_model = db.Column(db.String(100))
    language = db.Column(db.String(10), default='en')
    personality_prompt = db.Column(db.Text)
    
    # Legal Practice Specific
    practice_area = db.Column(db.String(100))  # Personal Injury, Family Law, etc.
    qualification_criteria = db.Column(db.JSON)  # Custom qualification rules
    
    # Performance Settings
    max_call_duration = db.Column(db.Integer, default=1800)  # 30 minutes
    business_hours_start = db.Column(db.Time)
    business_hours_end = db.Column(db.Time)
    
    # Tracking
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_call_at = db.Column(db.DateTime)
    
    # Relationships
    calls = db.relationship('Call', backref='assistant', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.uuid,
            'vapi_assistant_id': self.vapi_assistant_id,
            'vapi_phone_number': self.vapi_phone_number,
            'name': self.name,
            'description': self.description,
            'is_active': self.is_active,
            'voice_model': self.voice_model,
            'language': self.language,
            'practice_area': self.practice_area,
            'created_at': self.created_at.isoformat(),
            'last_call_at': self.last_call_at.isoformat() if self.last_call_at else None
        }

class ClientUser(db.Model):
    __tablename__ = 'client_users'
    
    id = db.Column(db.Integer, primary_key=True)
    uuid = db.Column(db.String(36), unique=True, nullable=False, default=lambda: str(uuid.uuid4()))
    
    # User Information
    email = db.Column(db.String(255), unique=True, nullable=False)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    
    # Client Association
    client_id = db.Column(db.Integer, db.ForeignKey('clients.id'), nullable=False)
    
    # Access Control
    role = db.Column(db.String(50), default='viewer')  # admin, manager, viewer
    is_primary_contact = db.Column(db.Boolean, default=False)
    is_active = db.Column(db.Boolean, default=True)
    
    # Authentication (if using separate client auth)
    password_hash = db.Column(db.String(255))
    last_login = db.Column(db.DateTime)
    
    # Tracking
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.uuid,
            'email': self.email,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'full_name': f"{self.first_name} {self.last_name}",
            'role': self.role,
            'is_primary_contact': self.is_primary_contact,
            'is_active': self.is_active,
            'last_login': self.last_login.isoformat() if self.last_login else None
        }
```

### Step 2: Enhanced Call Model with Client Association

```python
# src/models/call.py - Enhanced Call Model with Client Association
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from enum import Enum

# Add to existing Call model
class Call(db.Model):
    __tablename__ = 'calls'
    
    # ... existing fields ...
    
    # Client Association
    client_id = db.Column(db.Integer, db.ForeignKey('clients.id'), nullable=False)
    assistant_id = db.Column(db.Integer, db.ForeignKey('vapi_assistants.id'), nullable=False)
    
    # ... rest of existing fields ...
    
    def to_dict(self, include_client_info=False):
        data = {
            'id': self.vapi_call_id,
            'assistant_id': self.assistant.uuid if self.assistant else None,
            'phone_number': self.phone_number,
            'status': self.status.value,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'started_at': self.started_at.isoformat() if self.started_at else None,
            'ended_at': self.ended_at.isoformat() if self.ended_at else None,
            'duration_seconds': self.duration_seconds,
            'cost': self.cost,
            'transcript': self.transcript,
            'summary': self.summary,
            'is_qualified': self.is_qualified,
            'case_type': self.case_type,
            'estimated_value': self.estimated_value
        }
        
        if include_client_info and self.client:
            data['client'] = {
                'id': self.client.uuid,
                'name': self.client.name,
                'company_name': self.client.company_name
            }
        
        return data
```

### Step 3: Client-Specific Analytics Service

```python
# src/services/client_analytics_service.py - Client-specific analytics
from datetime import datetime, timedelta
from ..models.client import Client, VapiAssistant
from ..models.call import Call, DailyMetrics, db
from sqlalchemy import func
import logging

logger = logging.getLogger(__name__)

class ClientAnalyticsService:
    def __init__(self):
        pass
    
    def get_client_dashboard_data(self, client_id: str, date_range: str = '30d'):
        """Get comprehensive dashboard data for a specific client."""
        try:
            # Find client
            client = Client.query.filter_by(uuid=client_id).first()
            if not client:
                raise ValueError("Client not found")
            
            # Calculate date range
            end_date = datetime.now()
            if date_range == '1d':
                start_date = end_date - timedelta(days=1)
            elif date_range == '7d':
                start_date = end_date - timedelta(days=7)
            elif date_range == '30d':
                start_date = end_date - timedelta(days=30)
            else:
                start_date = end_date - timedelta(days=30)
            
            # Get client's assistants
            assistants = VapiAssistant.query.filter_by(client_id=client.id).all()
            assistant_ids = [a.id for a in assistants]
            
            # Get calls for this client
            calls_query = Call.query.filter(
                Call.client_id == client.id,
                Call.created_at >= start_date,
                Call.created_at <= end_date
            )
            
            total_calls = calls_query.count()
            calls = calls_query.order_by(Call.created_at.desc()).limit(100).all()
            
            # Calculate metrics
            successful_calls = calls_query.filter(Call.status == 'completed').count()
            qualified_calls = calls_query.filter(Call.is_qualified == True).count()
            
            total_duration = db.session.query(func.sum(Call.duration_seconds)).filter(
                Call.client_id == client.id,
                Call.created_at >= start_date,
                Call.created_at <= end_date
            ).scalar() or 0
            
            total_cost = db.session.query(func.sum(Call.cost)).filter(
                Call.client_id == client.id,
                Call.created_at >= start_date,
                Call.created_at <= end_date
            ).scalar() or 0
            
            # Calculate rates
            success_rate = (successful_calls / total_calls * 100) if total_calls > 0 else 0
            qualification_rate = (qualified_calls / total_calls * 100) if total_calls > 0 else 0
            avg_duration = total_duration / total_calls if total_calls > 0 else 0
            
            # Get daily breakdown
            daily_breakdown = self._get_daily_breakdown(client.id, start_date, end_date)
            
            # Get hourly breakdown for today
            today_start = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
            hourly_breakdown = self._get_hourly_breakdown(client.id, today_start)
            
            # Get case type breakdown
            case_type_breakdown = self._get_case_type_breakdown(client.id, start_date, end_date)
            
            # Get recent calls
            recent_calls = calls_query.order_by(Call.created_at.desc()).limit(10).all()
            
            return {
                'client': client.to_dict(),
                'assistants': [assistant.to_dict() for assistant in assistants],
                'metrics': {
                    'total_calls': total_calls,
                    'successful_calls': successful_calls,
                    'qualified_calls': qualified_calls,
                    'success_rate': round(success_rate, 1),
                    'qualification_rate': round(qualification_rate, 1),
                    'total_duration_seconds': total_duration,
                    'average_duration_seconds': round(avg_duration, 1),
                    'total_cost': round(total_cost, 2) if total_cost else 0
                },
                'charts': {
                    'daily_breakdown': daily_breakdown,
                    'hourly_breakdown': hourly_breakdown,
                    'case_type_breakdown': case_type_breakdown
                },
                'recent_calls': [call.to_dict() for call in recent_calls],
                'date_range': {
                    'start': start_date.isoformat(),
                    'end': end_date.isoformat(),
                    'range': date_range
                }
            }
            
        except Exception as e:
            logger.error(f"Error getting client dashboard data: {str(e)}")
            raise
    
    def get_assistant_performance(self, client_id: str, assistant_id: str = None):
        """Get performance data for client's assistants."""
        try:
            client = Client.query.filter_by(uuid=client_id).first()
            if not client:
                raise ValueError("Client not found")
            
            if assistant_id:
                # Get specific assistant
                assistant = VapiAssistant.query.filter_by(
                    uuid=assistant_id, 
                    client_id=client.id
                ).first()
                if not assistant:
                    raise ValueError("Assistant not found")
                assistants = [assistant]
            else:
                # Get all client assistants
                assistants = VapiAssistant.query.filter_by(client_id=client.id).all()
            
            performance_data = []
            
            for assistant in assistants:
                # Get calls for this assistant
                calls = Call.query.filter_by(assistant_id=assistant.id).all()
                
                total_calls = len(calls)
                successful_calls = len([c for c in calls if c.status.value == 'completed'])
                qualified_calls = len([c for c in calls if c.is_qualified])
                total_duration = sum(c.duration_seconds or 0 for c in calls)
                total_cost = sum(c.cost or 0 for c in calls)
                
                performance_data.append({
                    'assistant': assistant.to_dict(),
                    'metrics': {
                        'total_calls': total_calls,
                        'successful_calls': successful_calls,
                        'qualified_calls': qualified_calls,
                        'success_rate': (successful_calls / total_calls * 100) if total_calls > 0 else 0,
                        'qualification_rate': (qualified_calls / total_calls * 100) if total_calls > 0 else 0,
                        'average_duration': (total_duration / total_calls) if total_calls > 0 else 0,
                        'total_cost': total_cost
                    }
                })
            
            return performance_data
            
        except Exception as e:
            logger.error(f"Error getting assistant performance: {str(e)}")
            raise
    
    def _get_daily_breakdown(self, client_id: int, start_date: datetime, end_date: datetime):
        """Get daily call breakdown for date range."""
        daily_data = db.session.query(
            func.date(Call.created_at).label('date'),
            func.count(Call.id).label('total_calls'),
            func.sum(func.case([(Call.status == 'completed', 1)], else_=0)).label('successful_calls'),
            func.sum(func.case([(Call.is_qualified == True, 1)], else_=0)).label('qualified_calls')
        ).filter(
            Call.client_id == client_id,
            Call.created_at >= start_date,
            Call.created_at <= end_date
        ).group_by(
            func.date(Call.created_at)
        ).order_by(
            func.date(Call.created_at)
        ).all()
        
        return [
            {
                'date': row.date.isoformat(),
                'total_calls': row.total_calls,
                'successful_calls': row.successful_calls,
                'qualified_calls': row.qualified_calls
            }
            for row in daily_data
        ]
    
    def _get_hourly_breakdown(self, client_id: int, start_date: datetime):
        """Get hourly call breakdown for today."""
        end_date = start_date + timedelta(days=1)
        
        hourly_data = db.session.query(
            func.extract('hour', Call.created_at).label('hour'),
            func.count(Call.id).label('calls')
        ).filter(
            Call.client_id == client_id,
            Call.created_at >= start_date,
            Call.created_at < end_date
        ).group_by(
            func.extract('hour', Call.created_at)
        ).order_by(
            func.extract('hour', Call.created_at)
        ).all()
        
        return [
            {
                'hour': int(row.hour),
                'calls': row.calls
            }
            for row in hourly_data
        ]
    
    def _get_case_type_breakdown(self, client_id: int, start_date: datetime, end_date: datetime):
        """Get case type breakdown."""
        case_type_data = db.session.query(
            Call.case_type,
            func.count(Call.id).label('count'),
            func.sum(func.case([(Call.is_qualified == True, 1)], else_=0)).label('qualified_count')
        ).filter(
            Call.client_id == client_id,
            Call.created_at >= start_date,
            Call.created_at <= end_date,
            Call.case_type.isnot(None)
        ).group_by(
            Call.case_type
        ).order_by(
            func.count(Call.id).desc()
        ).all()
        
        return [
            {
                'case_type': row.case_type,
                'total_calls': row.count,
                'qualified_calls': row.qualified_count,
                'qualification_rate': (row.qualified_count / row.count * 100) if row.count > 0 else 0
            }
            for row in case_type_data
        ]

# Initialize service
client_analytics_service = ClientAnalyticsService()
```

### Step 4: Client Portal API Routes

```python
# src/api/client_portal_routes.py - Client portal API endpoints
from flask import Blueprint, request, jsonify
from ..models.client import Client, VapiAssistant, ClientUser
from ..services.client_analytics_service import client_analytics_service
from ..utils.decorators import require_client_auth

client_portal_bp = Blueprint('client_portal', __name__, url_prefix='/api/client')

@client_portal_bp.route('/dashboard', methods=['GET'])
@require_client_auth
def get_client_dashboard():
    """Get client-specific dashboard data."""
    try:
        client_id = request.current_client.uuid
        date_range = request.args.get('range', '30d')
        
        dashboard_data = client_analytics_service.get_client_dashboard_data(
            client_id, 
            date_range
        )
        
        return jsonify(dashboard_data), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to fetch dashboard data: {str(e)}'}), 500

@client_portal_bp.route('/assistants', methods=['GET'])
@require_client_auth
def get_client_assistants():
    """Get client's AI assistants."""
    try:
        client = request.current_client
        assistants = VapiAssistant.query.filter_by(client_id=client.id).all()
        
        return jsonify({
            'assistants': [assistant.to_dict() for assistant in assistants]
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to fetch assistants: {str(e)}'}), 500

@client_portal_bp.route('/assistants/<assistant_id>/performance', methods=['GET'])
@require_client_auth
def get_assistant_performance(assistant_id):
    """Get performance data for specific assistant."""
    try:
        client_id = request.current_client.uuid
        
        performance_data = client_analytics_service.get_assistant_performance(
            client_id, 
            assistant_id
        )
        
        return jsonify({
            'performance': performance_data[0] if performance_data else None
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to fetch assistant performance: {str(e)}'}), 500

@client_portal_bp.route('/calls', methods=['GET'])
@require_client_auth
def get_client_calls():
    """Get client's calls with pagination and filtering."""
    try:
        client = request.current_client
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        calls_query = Call.query.filter_by(client_id=client.id).order_by(Call.created_at.desc())
        
        # Apply filters
        assistant_id = request.args.get('assistant_id')
        if assistant_id:
            assistant = VapiAssistant.query.filter_by(
                uuid=assistant_id, 
                client_id=client.id
            ).first()
            if assistant:
                calls_query = calls_query.filter_by(assistant_id=assistant.id)
        
        status = request.args.get('status')
        if status:
            calls_query = calls_query.filter_by(status=status)
        
        qualified = request.args.get('qualified')
        if qualified is not None:
            calls_query = calls_query.filter_by(is_qualified=qualified.lower() == 'true')
        
        # Paginate
        pagination = calls_query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        return jsonify({
            'calls': [call.to_dict() for call in pagination.items],
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': pagination.total,
                'pages': pagination.pages,
                'has_next': pagination.has_next,
                'has_prev': pagination.has_prev
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to fetch calls: {str(e)}'}), 500

@client_portal_bp.route('/profile', methods=['GET'])
@require_client_auth
def get_client_profile():
    """Get client profile information."""
    try:
        client = request.current_client
        
        return jsonify({
            'client': client.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to fetch profile: {str(e)}'}), 500
```

## Frontend Implementation

### Step 5: Client Portal Dashboard Component

```javascript
// src/components/ClientPortal/ClientDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Phone, TrendingUp, Clock, Users, Building, Settings } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const ClientDashboard = ({ clientId }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [selectedDateRange, setSelectedDateRange] = useState('30d');
  const [selectedAssistant, setSelectedAssistant] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [clientId, selectedDateRange]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/client/dashboard?range=${selectedDateRange}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('client_token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch dashboard data');
      
      const data = await response.json();
      setDashboardData(data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  const { client, assistants, metrics, charts, recent_calls } = dashboardData;

  return (
    <div className="space-y-6">
      {/* Header with client branding */}
      <div className="bg-white rounded-lg shadow p-6" style={{ borderTop: `4px solid ${client.primary_color}` }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {client.logo_url && (
              <img 
                src={client.logo_url} 
                alt={client.company_name} 
                className="h-12 w-12 rounded-lg mr-4"
              />
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {client.company_name || client.name} Dashboard
              </h1>
              <p className="text-gray-600">Voice AI Analytics & Performance</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Date Range Selector */}
            <select
              value={selectedDateRange}
              onChange={(e) => setSelectedDateRange(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="1d">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
            
            {/* Assistant Filter */}
            <select
              value={selectedAssistant}
              onChange={(e) => setSelectedAssistant(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="all">All Assistants</option>
              {assistants.map(assistant => (
                <option key={assistant.id} value={assistant.id}>
                  {assistant.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Calls"
          value={metrics.total_calls}
          icon={Phone}
          color={client.primary_color}
        />
        <MetricCard
          title="Success Rate"
          value={`${metrics.success_rate}%`}
          icon={TrendingUp}
          color="#10B981"
        />
        <MetricCard
          title="Qualified Leads"
          value={metrics.qualified_calls}
          icon={Users}
          color="#8B5CF6"
          subtitle={`${metrics.qualification_rate}% rate`}
        />
        <MetricCard
          title="Avg Duration"
          value={formatDuration(metrics.average_duration_seconds)}
          icon={Clock}
          color="#F59E0B"
        />
      </div>

      {/* Assistant Performance */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">AI Assistant Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assistants.map(assistant => (
            <AssistantCard 
              key={assistant.id} 
              assistant={assistant}
              primaryColor={client.primary_color}
            />
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Trend */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Call Volume Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={charts.daily_breakdown}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="total_calls" 
                stroke={client.primary_color} 
                strokeWidth={2}
                name="Total Calls"
              />
              <Line 
                type="monotone" 
                dataKey="qualified_calls" 
                stroke="#10B981" 
                strokeWidth={2}
                name="Qualified Calls"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Case Types */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Case Types</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={charts.case_type_breakdown}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ case_type, percent }) => `${case_type} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="total_calls"
              >
                {charts.case_type_breakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Calls */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Recent Calls</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Qualified
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Case Type
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recent_calls.map((call) => (
                <tr key={call.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(call.created_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {call.phone_number || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDuration(call.duration_seconds)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={call.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <QualificationBadge qualified={call.is_qualified} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {call.case_type || 'Unknown'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Helper Components
const MetricCard = ({ title, value, icon: Icon, color, subtitle }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center">
      <div className="rounded-md p-3" style={{ backgroundColor: color + '20' }}>
        <Icon className="h-6 w-6" style={{ color }} />
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
        {subtitle && (
          <p className="text-xs text-gray-500">{subtitle}</p>
        )}
      </div>
    </div>
  </div>
);

const AssistantCard = ({ assistant, primaryColor }) => (
  <div className="border border-gray-200 rounded-lg p-4">
    <div className="flex items-center justify-between mb-2">
      <h4 className="font-medium text-gray-900">{assistant.name}</h4>
      <div className={`w-3 h-3 rounded-full ${assistant.is_active ? 'bg-green-400' : 'bg-gray-400'}`}></div>
    </div>
    <p className="text-sm text-gray-600 mb-2">{assistant.practice_area}</p>
    <div className="text-xs text-gray-500">
      <p>Phone: {assistant.vapi_phone_number}</p>
      <p>Last Call: {assistant.last_call_at ? new Date(assistant.last_call_at).toLocaleDateString() : 'Never'}</p>
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  const statusColors = {
    'completed': 'bg-green-100 text-green-800',
    'in-progress': 'bg-blue-100 text-blue-800',
    'failed': 'bg-red-100 text-red-800',
    'queued': 'bg-yellow-100 text-yellow-800'
  };

  return (
    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
      {status}
    </span>
  );
};

const QualificationBadge = ({ qualified }) => (
  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
    qualified ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
  }`}>
    {qualified ? 'Qualified' : 'Not Qualified'}
  </span>
);

// Helper functions
const formatDuration = (seconds) => {
  if (!seconds) return '0s';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return minutes > 0 ? `${minutes}m ${remainingSeconds}s` : `${remainingSeconds}s`;
};

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

export default ClientDashboard;
```

### Step 6: Client Authentication Integration

```javascript
// src/contexts/ClientAuthContext.jsx - Client-specific authentication
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';

const ClientAuthContext = createContext();

const clientAuthReducer = (state, action) => {
  switch (action.type) {
    case 'CLIENT_LOGIN_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        client: action.payload.client,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
        error: null
      };
    case 'CLIENT_LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        client: null,
        user: null,
        token: null
      };
    // ... other cases
    default:
      return state;
  }
};

export const ClientAuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(clientAuthReducer, {
    isAuthenticated: false,
    client: null,
    user: null,
    token: null,
    loading: false,
    error: null
  });

  const loginWithClientCredentials = async (clientId, userEmail, password) => {
    // Implementation for client-specific login
    // This could integrate with your existing Google auth
    // but add client-specific context
  };

  const value = {
    ...state,
    loginWithClientCredentials,
    // ... other methods
  };

  return (
    <ClientAuthContext.Provider value={value}>
      {children}
    </ClientAuthContext.Provider>
  );
};

export const useClientAuth = () => {
  const context = useContext(ClientAuthContext);
  if (!context) {
    throw new Error('useClientAuth must be used within a ClientAuthProvider');
  }
  return context;
};
```

## Integration with Your Existing System

### Step 7: Client Portal Routes

```javascript
// Add to your existing Windsurf React app routing
import ClientDashboard from './components/ClientPortal/ClientDashboard';
import { ClientAuthProvider } from './contexts/ClientAuthContext';

// Add client portal routes
const App = () => {
  return (
    <div className="App">
      {/* Your existing routes */}
      
      {/* Client Portal Routes */}
      <Route path="/client/:clientId/dashboard" element={
        <ClientAuthProvider>
          <ClientDashboard />
        </ClientAuthProvider>
      } />
      
      {/* Rest of your app */}
    </div>
  );
};
```

## Benefits of Client-Specific Dashboards

### 🎯 **Professional Client Experience**
- **Branded Dashboards**: Each client sees their own branding and colors
- **Dedicated Analytics**: Client-specific metrics and performance data
- **Assistant Management**: View and manage their dedicated AI assistants
- **Real-Time Updates**: Live data for their specific assistants

### 🔒 **Secure Multi-Tenant Architecture**
- **Data Isolation**: Each client only sees their own data
- **Role-Based Access**: Different access levels for client users
- **Secure Authentication**: Client-specific authentication and authorization
- **Audit Trails**: Track all client portal activities

### 📊 **Comprehensive Analytics**
- **Call Performance**: Success rates, qualification rates, duration metrics
- **Assistant Analytics**: Performance data for each AI assistant
- **Case Type Breakdown**: Analysis by legal practice area
- **Trend Analysis**: Daily, weekly, and monthly performance trends

### 💼 **Business Value**
- **Client Retention**: Professional portal increases client satisfaction
- **Transparency**: Clients can see the value of your AI services
- **Upselling Opportunities**: Performance data supports service expansion
- **Competitive Advantage**: Professional client portal differentiates your service

This creates a complete white-label client portal where each of your clients can log in to see analytics and performance data for their dedicated Vapi AI assistant!

