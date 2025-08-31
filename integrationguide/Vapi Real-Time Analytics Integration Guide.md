# Vapi Real-Time Analytics Integration Guide

**Author:** Manus AI  
**Date:** June 29, 2025  
**Version:** 1.0

## Overview

This guide shows you how to connect your voice analytics page to Vapi's API to get real-time AI assistant data including recent calls, call volume, total calls for the day, and comprehensive analytics.

## Vapi API Integration Architecture

### Data Flow
1. **Backend Service**: Fetches data from Vapi API on scheduled intervals
2. **Database Storage**: Stores call data locally for fast queries and analytics
3. **Real-Time Updates**: WebSocket connections for live dashboard updates
4. **Frontend Dashboard**: Displays real-time metrics and analytics

## Backend Implementation

### Step 1: Vapi API Service

```python
# src/services/vapi_service.py - Vapi API Integration Service
import requests
import os
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import logging

logger = logging.getLogger(__name__)

class VapiService:
    def __init__(self):
        self.api_key = os.environ.get('VAPI_API_KEY')
        self.base_url = 'https://api.vapi.ai'
        self.headers = {
            'Authorization': f'Bearer {self.api_key}',
            'Content-Type': 'application/json'
        }
    
    def get_calls(self, limit: int = 100, offset: int = 0, 
                  start_date: Optional[str] = None, 
                  end_date: Optional[str] = None) -> Dict:
        """Fetch calls from Vapi API."""
        try:
            params = {
                'limit': limit,
                'offset': offset
            }
            
            if start_date:
                params['createdAtGte'] = start_date
            if end_date:
                params['createdAtLte'] = end_date
            
            response = requests.get(
                f'{self.base_url}/call',
                headers=self.headers,
                params=params,
                timeout=30
            )
            response.raise_for_status()
            
            return response.json()
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Error fetching calls from Vapi: {str(e)}")
            raise Exception(f"Failed to fetch calls: {str(e)}")
    
    def get_call_details(self, call_id: str) -> Dict:
        """Fetch detailed information for a specific call."""
        try:
            response = requests.get(
                f'{self.base_url}/call/{call_id}',
                headers=self.headers,
                timeout=30
            )
            response.raise_for_status()
            
            return response.json()
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Error fetching call details from Vapi: {str(e)}")
            raise Exception(f"Failed to fetch call details: {str(e)}")
    
    def get_analytics(self, start_date: str, end_date: str) -> Dict:
        """Fetch analytics data from Vapi."""
        try:
            params = {
                'startDate': start_date,
                'endDate': end_date
            }
            
            response = requests.get(
                f'{self.base_url}/analytics',
                headers=self.headers,
                params=params,
                timeout=30
            )
            response.raise_for_status()
            
            return response.json()
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Error fetching analytics from Vapi: {str(e)}")
            raise Exception(f"Failed to fetch analytics: {str(e)}")
    
    def get_assistants(self) -> List[Dict]:
        """Fetch all AI assistants from Vapi."""
        try:
            response = requests.get(
                f'{self.base_url}/assistant',
                headers=self.headers,
                timeout=30
            )
            response.raise_for_status()
            
            return response.json()
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Error fetching assistants from Vapi: {str(e)}")
            raise Exception(f"Failed to fetch assistants: {str(e)}")
    
    def get_daily_metrics(self, date: Optional[str] = None) -> Dict:
        """Get daily metrics for a specific date."""
        if not date:
            date = datetime.now().strftime('%Y-%m-%d')
        
        start_datetime = f"{date}T00:00:00Z"
        end_datetime = f"{date}T23:59:59Z"
        
        try:
            calls_data = self.get_calls(
                limit=1000,  # Adjust based on your daily volume
                start_date=start_datetime,
                end_date=end_datetime
            )
            
            calls = calls_data.get('data', [])
            
            # Calculate metrics
            total_calls = len(calls)
            total_duration = sum(call.get('duration', 0) for call in calls)
            successful_calls = len([call for call in calls if call.get('status') == 'completed'])
            failed_calls = len([call for call in calls if call.get('status') == 'failed'])
            
            # Calculate average duration
            avg_duration = total_duration / total_calls if total_calls > 0 else 0
            
            # Group by hour for hourly breakdown
            hourly_breakdown = {}
            for call in calls:
                created_at = datetime.fromisoformat(call.get('createdAt', '').replace('Z', '+00:00'))
                hour = created_at.hour
                if hour not in hourly_breakdown:
                    hourly_breakdown[hour] = 0
                hourly_breakdown[hour] += 1
            
            return {
                'date': date,
                'total_calls': total_calls,
                'successful_calls': successful_calls,
                'failed_calls': failed_calls,
                'total_duration_seconds': total_duration,
                'average_duration_seconds': avg_duration,
                'success_rate': (successful_calls / total_calls * 100) if total_calls > 0 else 0,
                'hourly_breakdown': hourly_breakdown,
                'calls': calls
            }
            
        except Exception as e:
            logger.error(f"Error calculating daily metrics: {str(e)}")
            raise
    
    def get_recent_calls(self, limit: int = 10) -> List[Dict]:
        """Get most recent calls."""
        try:
            calls_data = self.get_calls(limit=limit)
            calls = calls_data.get('data', [])
            
            # Sort by creation date (most recent first)
            sorted_calls = sorted(
                calls, 
                key=lambda x: x.get('createdAt', ''), 
                reverse=True
            )
            
            return sorted_calls[:limit]
            
        except Exception as e:
            logger.error(f"Error fetching recent calls: {str(e)}")
            raise

# Initialize service
vapi_service = VapiService()
```

### Step 2: Database Models for Call Storage

```python
# src/models/call.py - Call data models
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from enum import Enum

db = SQLAlchemy()

class CallStatus(Enum):
    QUEUED = "queued"
    RINGING = "ringing"
    IN_PROGRESS = "in-progress"
    FORWARDING = "forwarding"
    COMPLETED = "completed"
    BUSY = "busy"
    NO_ANSWER = "no-answer"
    FAILED = "failed"
    CANCELED = "canceled"

class Call(db.Model):
    __tablename__ = 'calls'
    
    id = db.Column(db.Integer, primary_key=True)
    vapi_call_id = db.Column(db.String(255), unique=True, nullable=False)
    assistant_id = db.Column(db.String(255))
    phone_number = db.Column(db.String(50))
    status = db.Column(db.Enum(CallStatus), nullable=False)
    
    # Call timing
    created_at = db.Column(db.DateTime, nullable=False)
    started_at = db.Column(db.DateTime)
    ended_at = db.Column(db.DateTime)
    duration_seconds = db.Column(db.Integer, default=0)
    
    # Call details
    cost = db.Column(db.Float)
    transcript = db.Column(db.Text)
    summary = db.Column(db.Text)
    
    # Analysis fields
    is_qualified = db.Column(db.Boolean, default=False)
    case_type = db.Column(db.String(100))
    estimated_value = db.Column(db.Float)
    
    # Metadata
    raw_data = db.Column(db.JSON)  # Store full Vapi response
    last_updated = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.vapi_call_id,
            'assistant_id': self.assistant_id,
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
    
    @classmethod
    def create_from_vapi_data(cls, vapi_call_data):
        """Create Call instance from Vapi API data."""
        call = cls(
            vapi_call_id=vapi_call_data.get('id'),
            assistant_id=vapi_call_data.get('assistantId'),
            phone_number=vapi_call_data.get('customer', {}).get('number'),
            status=CallStatus(vapi_call_data.get('status', 'queued')),
            created_at=datetime.fromisoformat(
                vapi_call_data.get('createdAt', '').replace('Z', '+00:00')
            ) if vapi_call_data.get('createdAt') else datetime.utcnow(),
            started_at=datetime.fromisoformat(
                vapi_call_data.get('startedAt', '').replace('Z', '+00:00')
            ) if vapi_call_data.get('startedAt') else None,
            ended_at=datetime.fromisoformat(
                vapi_call_data.get('endedAt', '').replace('Z', '+00:00')
            ) if vapi_call_data.get('endedAt') else None,
            duration_seconds=vapi_call_data.get('duration', 0),
            cost=vapi_call_data.get('cost'),
            transcript=vapi_call_data.get('transcript'),
            summary=vapi_call_data.get('summary'),
            raw_data=vapi_call_data
        )
        
        return call

class DailyMetrics(db.Model):
    __tablename__ = 'daily_metrics'
    
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.Date, unique=True, nullable=False)
    
    # Call counts
    total_calls = db.Column(db.Integer, default=0)
    successful_calls = db.Column(db.Integer, default=0)
    failed_calls = db.Column(db.Integer, default=0)
    qualified_calls = db.Column(db.Integer, default=0)
    
    # Duration metrics
    total_duration_seconds = db.Column(db.Integer, default=0)
    average_duration_seconds = db.Column(db.Float, default=0)
    
    # Financial metrics
    total_cost = db.Column(db.Float, default=0)
    estimated_revenue = db.Column(db.Float, default=0)
    
    # Rates
    success_rate = db.Column(db.Float, default=0)
    qualification_rate = db.Column(db.Float, default=0)
    
    # Hourly breakdown (JSON)
    hourly_breakdown = db.Column(db.JSON)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'date': self.date.isoformat(),
            'total_calls': self.total_calls,
            'successful_calls': self.successful_calls,
            'failed_calls': self.failed_calls,
            'qualified_calls': self.qualified_calls,
            'total_duration_seconds': self.total_duration_seconds,
            'average_duration_seconds': self.average_duration_seconds,
            'total_cost': self.total_cost,
            'estimated_revenue': self.estimated_revenue,
            'success_rate': self.success_rate,
            'qualification_rate': self.qualification_rate,
            'hourly_breakdown': self.hourly_breakdown
        }
```

### Step 3: Data Sync Service

```python
# src/services/data_sync_service.py - Sync data from Vapi
from datetime import datetime, timedelta
from ..models.call import Call, DailyMetrics, db
from .vapi_service import vapi_service
import logging

logger = logging.getLogger(__name__)

class DataSyncService:
    def __init__(self):
        self.vapi = vapi_service
    
    def sync_recent_calls(self, limit: int = 100):
        """Sync recent calls from Vapi."""
        try:
            logger.info(f"Syncing {limit} recent calls from Vapi")
            
            # Get recent calls from Vapi
            vapi_calls = self.vapi.get_recent_calls(limit)
            
            synced_count = 0
            updated_count = 0
            
            for vapi_call in vapi_calls:
                call_id = vapi_call.get('id')
                
                # Check if call already exists
                existing_call = Call.query.filter_by(vapi_call_id=call_id).first()
                
                if existing_call:
                    # Update existing call
                    self._update_call_from_vapi_data(existing_call, vapi_call)
                    updated_count += 1
                else:
                    # Create new call
                    new_call = Call.create_from_vapi_data(vapi_call)
                    db.session.add(new_call)
                    synced_count += 1
            
            db.session.commit()
            
            logger.info(f"Sync completed: {synced_count} new calls, {updated_count} updated calls")
            
            return {
                'synced_count': synced_count,
                'updated_count': updated_count,
                'total_processed': len(vapi_calls)
            }
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error syncing calls: {str(e)}")
            raise
    
    def sync_daily_metrics(self, date: str = None):
        """Sync daily metrics for a specific date."""
        try:
            if not date:
                date = datetime.now().strftime('%Y-%m-%d')
            
            logger.info(f"Syncing daily metrics for {date}")
            
            # Get metrics from Vapi
            vapi_metrics = self.vapi.get_daily_metrics(date)
            
            # Find or create daily metrics record
            date_obj = datetime.strptime(date, '%Y-%m-%d').date()
            daily_metrics = DailyMetrics.query.filter_by(date=date_obj).first()
            
            if not daily_metrics:
                daily_metrics = DailyMetrics(date=date_obj)
                db.session.add(daily_metrics)
            
            # Update metrics
            daily_metrics.total_calls = vapi_metrics['total_calls']
            daily_metrics.successful_calls = vapi_metrics['successful_calls']
            daily_metrics.failed_calls = vapi_metrics['failed_calls']
            daily_metrics.total_duration_seconds = vapi_metrics['total_duration_seconds']
            daily_metrics.average_duration_seconds = vapi_metrics['average_duration_seconds']
            daily_metrics.success_rate = vapi_metrics['success_rate']
            daily_metrics.hourly_breakdown = vapi_metrics['hourly_breakdown']
            
            # Calculate additional metrics from local data
            qualified_calls = Call.query.filter(
                Call.created_at >= datetime.combine(date_obj, datetime.min.time()),
                Call.created_at < datetime.combine(date_obj + timedelta(days=1), datetime.min.time()),
                Call.is_qualified == True
            ).count()
            
            daily_metrics.qualified_calls = qualified_calls
            daily_metrics.qualification_rate = (qualified_calls / daily_metrics.total_calls * 100) if daily_metrics.total_calls > 0 else 0
            
            db.session.commit()
            
            logger.info(f"Daily metrics synced for {date}")
            
            return daily_metrics.to_dict()
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error syncing daily metrics: {str(e)}")
            raise
    
    def _update_call_from_vapi_data(self, call: Call, vapi_data: dict):
        """Update existing call with new Vapi data."""
        call.status = CallStatus(vapi_data.get('status', call.status.value))
        call.started_at = datetime.fromisoformat(
            vapi_data.get('startedAt', '').replace('Z', '+00:00')
        ) if vapi_data.get('startedAt') else call.started_at
        call.ended_at = datetime.fromisoformat(
            vapi_data.get('endedAt', '').replace('Z', '+00:00')
        ) if vapi_data.get('endedAt') else call.ended_at
        call.duration_seconds = vapi_data.get('duration', call.duration_seconds)
        call.cost = vapi_data.get('cost', call.cost)
        call.transcript = vapi_data.get('transcript', call.transcript)
        call.summary = vapi_data.get('summary', call.summary)
        call.raw_data = vapi_data

# Initialize service
data_sync_service = DataSyncService()
```

### Step 4: API Routes for Analytics

```python
# src/api/analytics_routes.py - Analytics API endpoints
from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta
from ..models.call import Call, DailyMetrics, db
from ..services.data_sync_service import data_sync_service
from ..utils.decorators import require_auth, require_permission

analytics_bp = Blueprint('analytics', __name__, url_prefix='/api/analytics')

@analytics_bp.route('/dashboard', methods=['GET'])
@require_auth
@require_permission('view_analytics')
def get_dashboard_data():
    """Get real-time dashboard data."""
    try:
        # Sync recent data first
        data_sync_service.sync_recent_calls(limit=50)
        
        today = datetime.now().date()
        
        # Get today's metrics
        today_metrics = DailyMetrics.query.filter_by(date=today).first()
        if not today_metrics:
            # Create today's metrics if not exists
            data_sync_service.sync_daily_metrics()
            today_metrics = DailyMetrics.query.filter_by(date=today).first()
        
        # Get recent calls
        recent_calls = Call.query.order_by(Call.created_at.desc()).limit(10).all()
        
        # Get hourly data for today
        start_of_day = datetime.combine(today, datetime.min.time())
        end_of_day = datetime.combine(today, datetime.max.time())
        
        hourly_calls = db.session.query(
            db.func.extract('hour', Call.created_at).label('hour'),
            db.func.count(Call.id).label('count')
        ).filter(
            Call.created_at >= start_of_day,
            Call.created_at <= end_of_day
        ).group_by(
            db.func.extract('hour', Call.created_at)
        ).all()
        
        # Format hourly data
        hourly_data = [{'hour': int(hour), 'calls': count} for hour, count in hourly_calls]
        
        # Get week comparison
        week_ago = today - timedelta(days=7)
        week_metrics = DailyMetrics.query.filter(
            DailyMetrics.date >= week_ago,
            DailyMetrics.date <= today
        ).order_by(DailyMetrics.date).all()
        
        return jsonify({
            'today_metrics': today_metrics.to_dict() if today_metrics else {},
            'recent_calls': [call.to_dict() for call in recent_calls],
            'hourly_data': hourly_data,
            'week_metrics': [metrics.to_dict() for metrics in week_metrics],
            'last_updated': datetime.now().isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to fetch dashboard data: {str(e)}'}), 500

@analytics_bp.route('/real-time', methods=['GET'])
@require_auth
@require_permission('view_analytics')
def get_real_time_data():
    """Get real-time data for live updates."""
    try:
        # Sync latest data
        sync_result = data_sync_service.sync_recent_calls(limit=20)
        
        today = datetime.now().date()
        
        # Get current metrics
        current_metrics = DailyMetrics.query.filter_by(date=today).first()
        if current_metrics:
            data_sync_service.sync_daily_metrics()
            current_metrics = DailyMetrics.query.filter_by(date=today).first()
        
        # Get calls from last hour
        one_hour_ago = datetime.now() - timedelta(hours=1)
        recent_calls = Call.query.filter(
            Call.created_at >= one_hour_ago
        ).order_by(Call.created_at.desc()).limit(5).all()
        
        return jsonify({
            'current_metrics': current_metrics.to_dict() if current_metrics else {},
            'recent_calls': [call.to_dict() for call in recent_calls],
            'sync_info': sync_result,
            'timestamp': datetime.now().isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to fetch real-time data: {str(e)}'}), 500

@analytics_bp.route('/calls/recent', methods=['GET'])
@require_auth
@require_permission('view_calls')
def get_recent_calls():
    """Get recent calls with pagination."""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        # Sync recent data
        data_sync_service.sync_recent_calls(limit=50)
        
        calls_query = Call.query.order_by(Call.created_at.desc())
        
        # Apply filters if provided
        status = request.args.get('status')
        if status:
            calls_query = calls_query.filter(Call.status == status)
        
        date_from = request.args.get('date_from')
        if date_from:
            date_from_obj = datetime.fromisoformat(date_from)
            calls_query = calls_query.filter(Call.created_at >= date_from_obj)
        
        date_to = request.args.get('date_to')
        if date_to:
            date_to_obj = datetime.fromisoformat(date_to)
            calls_query = calls_query.filter(Call.created_at <= date_to_obj)
        
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

@analytics_bp.route('/sync', methods=['POST'])
@require_auth
@require_permission('manage_system')
def manual_sync():
    """Manually trigger data sync."""
    try:
        sync_type = request.json.get('type', 'calls')
        
        if sync_type == 'calls':
            result = data_sync_service.sync_recent_calls(limit=100)
        elif sync_type == 'metrics':
            date = request.json.get('date')
            result = data_sync_service.sync_daily_metrics(date)
        else:
            return jsonify({'error': 'Invalid sync type'}), 400
        
        return jsonify({
            'message': 'Sync completed successfully',
            'result': result
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Sync failed: {str(e)}'}), 500
```

## Frontend Implementation

### Step 5: Real-Time Analytics Service

```javascript
// src/services/analyticsService.js - Frontend analytics service
import axios from 'axios';

class AnalyticsService {
  constructor() {
    this.baseURL = process.env.REACT_APP_VOICE_AI_API_URL || 'http://localhost:8000';
    this.refreshInterval = null;
    this.listeners = new Set();
  }

  // Get dashboard data
  async getDashboardData() {
    try {
      const response = await axios.get(`${this.baseURL}/api/analytics/dashboard`);
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  }

  // Get real-time data
  async getRealTimeData() {
    try {
      const response = await axios.get(`${this.baseURL}/api/analytics/real-time`);
      return response.data;
    } catch (error) {
      console.error('Error fetching real-time data:', error);
      throw error;
    }
  }

  // Get recent calls
  async getRecentCalls(filters = {}) {
    try {
      const response = await axios.get(`${this.baseURL}/api/analytics/calls/recent`, {
        params: filters
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching recent calls:', error);
      throw error;
    }
  }

  // Start real-time updates
  startRealTimeUpdates(callback, interval = 30000) {
    this.listeners.add(callback);
    
    if (!this.refreshInterval) {
      this.refreshInterval = setInterval(async () => {
        try {
          const data = await this.getRealTimeData();
          this.listeners.forEach(listener => listener(data));
        } catch (error) {
          console.error('Real-time update failed:', error);
        }
      }, interval);
    }
  }

  // Stop real-time updates
  stopRealTimeUpdates(callback) {
    this.listeners.delete(callback);
    
    if (this.listeners.size === 0 && this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  // Manual sync
  async triggerSync(type = 'calls') {
    try {
      const response = await axios.post(`${this.baseURL}/api/analytics/sync`, {
        type
      });
      return response.data;
    } catch (error) {
      console.error('Error triggering sync:', error);
      throw error;
    }
  }
}

export default new AnalyticsService();
```

### Step 6: Real-Time Analytics Dashboard Component

```javascript
// src/components/VoiceAI/RealTimeAnalyticsDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Phone, Clock, TrendingUp, Users, RefreshCw, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import analyticsService from '../../services/analyticsService';

const RealTimeAnalyticsDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [realTimeData, setRealTimeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isLive, setIsLive] = useState(true);

  // Load initial dashboard data
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Set up real-time updates
  useEffect(() => {
    if (isLive) {
      const handleRealTimeUpdate = (data) => {
        setRealTimeData(data);
        setLastUpdated(new Date());
      };

      analyticsService.startRealTimeUpdates(handleRealTimeUpdate, 30000);

      return () => {
        analyticsService.stopRealTimeUpdates(handleRealTimeUpdate);
      };
    }
  }, [isLive]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await analyticsService.getDashboardData();
      setDashboardData(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleManualRefresh = async () => {
    await loadDashboardData();
  };

  const toggleLiveUpdates = () => {
    setIsLive(!isLive);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const todayMetrics = realTimeData?.current_metrics || dashboardData?.today_metrics || {};
  const recentCalls = realTimeData?.recent_calls || dashboardData?.recent_calls || [];

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Real-Time Voice AI Analytics</h2>
            <p className="text-gray-600 mt-1">
              Live data from your Vapi AI assistants
              {lastUpdated && (
                <span className="ml-2 text-sm">
                  • Last updated: {lastUpdated.toLocaleTimeString()}
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleLiveUpdates}
              className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium ${
                isLive 
                  ? 'bg-green-100 text-green-800 border border-green-200' 
                  : 'bg-gray-100 text-gray-800 border border-gray-200'
              }`}
            >
              <Activity className={`h-4 w-4 mr-2 ${isLive ? 'animate-pulse' : ''}`} />
              {isLive ? 'Live' : 'Paused'}
            </button>
            <button
              onClick={handleManualRefresh}
              className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Real-time metrics cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Calls Today"
          value={todayMetrics.total_calls || 0}
          icon={Phone}
          color="blue"
          trend={realTimeData?.sync_info?.synced_count || 0}
          trendLabel="new"
        />
        <MetricCard
          title="Success Rate"
          value={`${(todayMetrics.success_rate || 0).toFixed(1)}%`}
          icon={TrendingUp}
          color="green"
        />
        <MetricCard
          title="Avg Duration"
          value={formatDuration(todayMetrics.average_duration_seconds || 0)}
          icon={Clock}
          color="purple"
        />
        <MetricCard
          title="Qualified Calls"
          value={todayMetrics.qualified_calls || 0}
          icon={Users}
          color="orange"
          trend={`${(todayMetrics.qualification_rate || 0).toFixed(1)}%`}
          trendLabel="rate"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly call volume */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Today's Call Volume</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={formatHourlyData(dashboardData?.hourly_data || [])}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="calls" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Weekly trend */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">7-Day Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dashboardData?.week_metrics || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="total_calls" 
                stroke="#3B82F6" 
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
      </div>

      {/* Recent calls table */}
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
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentCalls.map((call) => (
                <tr key={call.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(call.created_at).toLocaleTimeString()}
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Helper components
const MetricCard = ({ title, value, icon: Icon, color, trend, trendLabel }) => {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500'
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`${colorClasses[color]} rounded-md p-3`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          {trend !== undefined && (
            <p className="text-xs text-gray-500 mt-1">
              {trend} {trendLabel}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

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

const QualificationBadge = ({ qualified }) => {
  return (
    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
      qualified ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
    }`}>
      {qualified ? 'Qualified' : 'Not Qualified'}
    </span>
  );
};

// Helper functions
const formatDuration = (seconds) => {
  if (!seconds) return '0s';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return minutes > 0 ? `${minutes}m ${remainingSeconds}s` : `${remainingSeconds}s`;
};

const formatHourlyData = (hourlyData) => {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  return hours.map(hour => ({
    hour: `${hour}:00`,
    calls: hourlyData.find(d => d.hour === hour)?.calls || 0
  }));
};

export default RealTimeAnalyticsDashboard;
```

## Environment Configuration

### Step 7: Environment Variables

```bash
# .env file
VAPI_API_KEY=your_vapi_api_key_here
VAPI_WEBHOOK_SECRET=your_webhook_secret_here
DATABASE_URL=postgresql://user:password@localhost/voiceai_db
JWT_SECRET_KEY=your_jwt_secret_key
```

## Scheduled Data Sync

### Step 8: Background Tasks

```python
# src/tasks/sync_tasks.py - Background sync tasks
from celery import Celery
from datetime import datetime, timedelta
from ..services.data_sync_service import data_sync_service
import logging

logger = logging.getLogger(__name__)

# Initialize Celery
celery = Celery('voice_ai_sync')

@celery.task
def sync_recent_calls_task():
    """Background task to sync recent calls."""
    try:
        result = data_sync_service.sync_recent_calls(limit=100)
        logger.info(f"Scheduled call sync completed: {result}")
        return result
    except Exception as e:
        logger.error(f"Scheduled call sync failed: {str(e)}")
        raise

@celery.task
def sync_daily_metrics_task(date=None):
    """Background task to sync daily metrics."""
    try:
        if not date:
            date = datetime.now().strftime('%Y-%m-%d')
        
        result = data_sync_service.sync_daily_metrics(date)
        logger.info(f"Scheduled metrics sync completed for {date}")
        return result
    except Exception as e:
        logger.error(f"Scheduled metrics sync failed: {str(e)}")
        raise

# Schedule tasks
from celery.schedules import crontab

celery.conf.beat_schedule = {
    'sync-recent-calls': {
        'task': 'src.tasks.sync_tasks.sync_recent_calls_task',
        'schedule': 300.0,  # Every 5 minutes
    },
    'sync-daily-metrics': {
        'task': 'src.tasks.sync_tasks.sync_daily_metrics_task',
        'schedule': crontab(minute=0),  # Every hour
    },
}
```

## Summary

This integration provides:

1. **Real-Time Data**: Live sync with Vapi API every 5 minutes
2. **Comprehensive Analytics**: Daily metrics, hourly breakdowns, trends
3. **Live Dashboard**: Real-time updates with WebSocket-like polling
4. **Data Storage**: Local database for fast queries and historical data
5. **Background Sync**: Automated data synchronization
6. **Manual Controls**: Refresh buttons and sync triggers

Your voice analytics page will now display live data from Vapi including:
- Total calls for the day
- Recent call activity
- Call volume trends
- Success rates and metrics
- Real-time call status updates

The system automatically syncs data from Vapi and provides a professional dashboard for monitoring your AI assistant performance!

