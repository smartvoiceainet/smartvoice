# Google Authentication Integration Guide for Voice AI Features

**Author:** Manus AI  
**Date:** June 29, 2025  
**Version:** 1.0

## Overview

This guide shows how to integrate the voice AI features with your existing Google authentication system in your Windsurf React website. Instead of replacing your current auth, we'll extend it to include role-based permissions and voice AI access controls.

## Integration Strategy

### Hybrid Approach
- **Keep Google Auth**: Maintain your existing Google OAuth flow
- **Add User Management**: Extend with roles and permissions for voice AI features
- **Seamless Experience**: Users continue logging in with Google as before
- **Enhanced Security**: Add legal practice-specific access controls

## Backend Integration

### Step 1: Extend Your User Model

```python
# src/models/user.py - Enhanced User Model for Google Auth
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from enum import Enum

db = SQLAlchemy()

class UserRole(Enum):
    ADMIN = "admin"
    ATTORNEY = "attorney"
    PARALEGAL = "paralegal"
    STAFF = "staff"
    PENDING = "pending"  # For new Google users awaiting role assignment

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    uuid = db.Column(db.String(36), unique=True, nullable=False)
    
    # Google OAuth fields
    google_id = db.Column(db.String(255), unique=True, nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    profile_picture = db.Column(db.String(500))
    
    # Voice AI specific fields
    role = db.Column(db.Enum(UserRole), nullable=False, default=UserRole.PENDING)
    is_active = db.Column(db.Boolean, default=True)
    is_voice_ai_enabled = db.Column(db.Boolean, default=False)
    voice_ai_activated_at = db.Column(db.DateTime)
    voice_ai_activated_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    
    # Tracking fields
    last_login = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def has_voice_ai_access(self):
        """Check if user has access to voice AI features."""
        return (
            self.is_active and 
            self.is_voice_ai_enabled and 
            self.role != UserRole.PENDING
        )
    
    def has_permission(self, permission):
        """Check if user has specific permission for voice AI features."""
        if not self.has_voice_ai_access():
            return False
            
        role_permissions = {
            UserRole.ADMIN: ['view_all', 'manage_users', 'manage_system', 'view_analytics', 'manage_calls'],
            UserRole.ATTORNEY: ['view_analytics', 'manage_calls', 'view_cases'],
            UserRole.PARALEGAL: ['view_analytics', 'view_calls', 'view_cases'],
            UserRole.STAFF: ['view_calls'],
            UserRole.PENDING: []
        }
        return permission in role_permissions.get(self.role, [])
    
    def to_dict(self):
        """Convert user to dictionary."""
        return {
            'id': self.uuid,
            'google_id': self.google_id,
            'email': self.email,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'full_name': f"{self.first_name} {self.last_name}",
            'profile_picture': self.profile_picture,
            'role': self.role.value,
            'is_active': self.is_active,
            'has_voice_ai_access': self.has_voice_ai_access(),
            'last_login': self.last_login.isoformat() if self.last_login else None,
            'created_at': self.created_at.isoformat()
        }

    @classmethod
    def create_from_google(cls, google_user_info):
        """Create user from Google OAuth response."""
        import uuid
        
        user = cls(
            uuid=str(uuid.uuid4()),
            google_id=google_user_info['id'],
            email=google_user_info['email'],
            first_name=google_user_info.get('given_name', ''),
            last_name=google_user_info.get('family_name', ''),
            profile_picture=google_user_info.get('picture'),
            role=UserRole.PENDING,  # Requires admin approval for voice AI access
            last_login=datetime.utcnow()
        )
        
        db.session.add(user)
        db.session.commit()
        return user
    
    @classmethod
    def find_or_create_from_google(cls, google_user_info):
        """Find existing user or create new one from Google OAuth."""
        user = cls.query.filter_by(google_id=google_user_info['id']).first()
        
        if not user:
            # Check if user exists by email (for migration)
            user = cls.query.filter_by(email=google_user_info['email']).first()
            if user:
                # Update existing user with Google ID
                user.google_id = google_user_info['id']
                user.profile_picture = google_user_info.get('picture')
            else:
                # Create new user
                user = cls.create_from_google(google_user_info)
        else:
            # Update last login and profile info
            user.last_login = datetime.utcnow()
            user.profile_picture = google_user_info.get('picture')
            user.first_name = google_user_info.get('given_name', user.first_name)
            user.last_name = google_user_info.get('family_name', user.last_name)
        
        db.session.commit()
        return user
```

### Step 2: Google OAuth Integration Routes

```python
# src/auth/google_routes.py - Google OAuth Integration
from flask import Blueprint, request, jsonify, current_app, session
from google.oauth2 import id_token
from google.auth.transport import requests
import jwt
from datetime import datetime, timedelta
from .models import User, db
from ..utils.decorators import require_auth

google_auth_bp = Blueprint('google_auth', __name__, url_prefix='/api/auth/google')

@google_auth_bp.route('/verify', methods=['POST'])
def verify_google_token():
    """Verify Google OAuth token and create/update user."""
    try:
        data = request.get_json()
        google_token = data.get('token')
        
        if not google_token:
            return jsonify({'error': 'Google token is required'}), 400
        
        # Verify Google token
        try:
            google_user_info = id_token.verify_oauth2_token(
                google_token,
                requests.Request(),
                current_app.config['GOOGLE_CLIENT_ID']
            )
        except ValueError as e:
            return jsonify({'error': 'Invalid Google token'}), 401
        
        # Find or create user
        user = User.find_or_create_from_google(google_user_info)
        
        # Generate JWT token for your app
        access_token = generate_access_token(user)
        
        return jsonify({
            'message': 'Google authentication successful',
            'user': user.to_dict(),
            'access_token': access_token,
            'requires_voice_ai_approval': not user.has_voice_ai_access()
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Google auth error: {str(e)}")
        return jsonify({'error': 'Authentication failed'}), 500

@google_auth_bp.route('/request-access', methods=['POST'])
@require_auth
def request_voice_ai_access():
    """Request access to voice AI features."""
    try:
        user = request.current_user
        
        if user.has_voice_ai_access():
            return jsonify({'message': 'You already have voice AI access'}), 200
        
        # Create access request (you can implement notification to admins)
        # For now, we'll just update the user's status to pending
        user.role = UserRole.PENDING
        db.session.commit()
        
        # TODO: Send notification to admins about access request
        # send_admin_notification(user, 'voice_ai_access_request')
        
        return jsonify({
            'message': 'Voice AI access request submitted. An administrator will review your request.'
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Access request error: {str(e)}")
        return jsonify({'error': 'Failed to submit access request'}), 500

def generate_access_token(user):
    """Generate JWT access token for the user."""
    payload = {
        'user_id': user.uuid,
        'google_id': user.google_id,
        'email': user.email,
        'role': user.role.value,
        'has_voice_ai_access': user.has_voice_ai_access(),
        'exp': datetime.utcnow() + timedelta(hours=24),  # Longer expiry for Google auth
        'iat': datetime.utcnow(),
        'type': 'access'
    }
    return jwt.encode(payload, current_app.config['JWT_SECRET_KEY'], algorithm='HS256')
```

### Step 3: Admin User Management Routes

```python
# src/admin/user_management_routes.py - Admin routes for user management
from flask import Blueprint, request, jsonify
from ..auth.models import User, UserRole, db
from ..utils.decorators import require_auth, require_permission

admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')

@admin_bp.route('/users', methods=['GET'])
@require_auth
@require_permission('manage_users')
def get_users():
    """Get all users for admin management."""
    try:
        users = User.query.all()
        return jsonify({
            'users': [user.to_dict() for user in users]
        }), 200
    except Exception as e:
        return jsonify({'error': 'Failed to fetch users'}), 500

@admin_bp.route('/users/<user_id>/voice-ai-access', methods=['POST'])
@require_auth
@require_permission('manage_users')
def grant_voice_ai_access(user_id):
    """Grant voice AI access to a user."""
    try:
        data = request.get_json()
        role = data.get('role', 'staff')
        
        user = User.query.filter_by(uuid=user_id).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Validate role
        try:
            user_role = UserRole(role)
        except ValueError:
            return jsonify({'error': 'Invalid role'}), 400
        
        # Grant access
        user.role = user_role
        user.is_voice_ai_enabled = True
        user.voice_ai_activated_at = datetime.utcnow()
        user.voice_ai_activated_by = request.current_user.id
        
        db.session.commit()
        
        # TODO: Send notification to user about access granted
        # send_user_notification(user, 'voice_ai_access_granted')
        
        return jsonify({
            'message': f'Voice AI access granted to {user.email}',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to grant access'}), 500

@admin_bp.route('/users/<user_id>/voice-ai-access', methods=['DELETE'])
@require_auth
@require_permission('manage_users')
def revoke_voice_ai_access(user_id):
    """Revoke voice AI access from a user."""
    try:
        user = User.query.filter_by(uuid=user_id).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        user.is_voice_ai_enabled = False
        user.role = UserRole.PENDING
        
        db.session.commit()
        
        return jsonify({
            'message': f'Voice AI access revoked from {user.email}',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to revoke access'}), 500
```

## Frontend Integration

### Step 4: Enhanced Auth Context for Google

```javascript
// src/contexts/AuthContext.jsx - Enhanced for Google Auth
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// Enhanced auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case 'GOOGLE_AUTH_SUCCESS':
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.access_token,
        requiresVoiceAiApproval: action.payload.requires_voice_ai_approval,
        error: null
      };
    case 'VOICE_AI_ACCESS_UPDATED':
      return {
        ...state,
        user: { ...state.user, has_voice_ai_access: action.payload },
        requiresVoiceAiApproval: !action.payload
      };
    // ... other cases from previous auth context
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    isAuthenticated: false,
    user: null,
    token: null,
    loading: false,
    error: null,
    requiresVoiceAiApproval: false
  });

  const API_BASE_URL = process.env.REACT_APP_VOICE_AI_API_URL || 'http://localhost:8000';

  const handleGoogleAuthSuccess = async (googleToken) => {
    dispatch({ type: 'LOGIN_START' });

    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/google/verify`, {
        token: googleToken
      });

      const { user, access_token, requires_voice_ai_approval } = response.data;

      // Store token and user data
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('user_data', JSON.stringify(user));

      dispatch({
        type: 'GOOGLE_AUTH_SUCCESS',
        payload: {
          user,
          access_token,
          requires_voice_ai_approval
        }
      });

      return { success: true, requiresApproval: requires_voice_ai_approval };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Google authentication failed';
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  };

  const requestVoiceAiAccess = async () => {
    try {
      await axios.post(`${API_BASE_URL}/api/auth/google/request-access`);
      return { success: true, message: 'Access request submitted successfully' };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to submit access request';
      return { success: false, error: errorMessage };
    }
  };

  const hasVoiceAiAccess = () => {
    return state.user?.has_voice_ai_access || false;
  };

  const hasPermission = (permission) => {
    if (!hasVoiceAiAccess()) return false;
    
    const rolePermissions = {
      admin: ['view_all', 'manage_users', 'manage_system', 'view_analytics', 'manage_calls'],
      attorney: ['view_analytics', 'manage_calls', 'view_cases'],
      paralegal: ['view_analytics', 'view_calls', 'view_cases'],
      staff: ['view_calls']
    };

    return rolePermissions[state.user?.role]?.includes(permission) || false;
  };

  // ... rest of the auth context methods

  const value = {
    ...state,
    handleGoogleAuthSuccess,
    requestVoiceAiAccess,
    hasVoiceAiAccess,
    hasPermission,
    // ... other methods
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

### Step 5: Voice AI Access Request Component

```javascript
// src/components/VoiceAI/AccessRequestBanner.jsx
import React, { useState } from 'react';
import { Shield, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const AccessRequestBanner = () => {
  const { user, requiresVoiceAiApproval, requestVoiceAiAccess } = useAuth();
  const [requestStatus, setRequestStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!requiresVoiceAiApproval) return null;

  const handleRequestAccess = async () => {
    setLoading(true);
    const result = await requestVoiceAiAccess();
    setRequestStatus(result);
    setLoading(false);
  };

  if (requestStatus?.success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
        <div className="flex items-center">
          <CheckCircle className="h-6 w-6 text-green-500 mr-3" />
          <div>
            <h3 className="text-lg font-medium text-green-800">Access Request Submitted</h3>
            <p className="text-green-700 mt-1">
              Your request for voice AI access has been submitted. An administrator will review and approve your access shortly.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
      <div className="flex items-start">
        <Shield className="h-6 w-6 text-blue-500 mr-3 mt-1" />
        <div className="flex-1">
          <h3 className="text-lg font-medium text-blue-800">Voice AI Access Required</h3>
          <p className="text-blue-700 mt-1 mb-4">
            Welcome {user?.first_name}! To access the voice AI features, you need approval from an administrator. 
            This ensures secure access to sensitive legal practice management tools.
          </p>
          
          {requestStatus?.error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded flex items-center">
              <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
              <span className="text-red-700 text-sm">{requestStatus.error}</span>
            </div>
          )}
          
          <button
            onClick={handleRequestAccess}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Submitting Request...
              </>
            ) : (
              <>
                <Clock className="h-4 w-4 mr-2" />
                Request Voice AI Access
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccessRequestBanner;
```

### Step 6: Enhanced Protected Route

```javascript
// src/components/Auth/ProtectedRoute.jsx - Enhanced for Google Auth
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import AccessRequestBanner from '../VoiceAI/AccessRequestBanner';

const ProtectedRoute = ({ children, requiredPermission, fallback }) => {
  const { isAuthenticated, hasVoiceAiAccess, hasPermission, loading, requiresVoiceAiApproval } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If not authenticated, show message (Google auth should handle this)
  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md mx-auto">
          <h3 className="text-lg font-medium text-blue-800 mb-2">Authentication Required</h3>
          <p className="text-blue-700">
            Please sign in with Google to access voice AI features.
          </p>
        </div>
      </div>
    );
  }

  // Show access request banner if voice AI approval is needed
  if (requiresVoiceAiApproval) {
    return <AccessRequestBanner />;
  }

  // Check voice AI access
  if (!hasVoiceAiAccess()) {
    return (
      <div className="text-center py-12">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto">
          <h3 className="text-lg font-medium text-yellow-800 mb-2">Voice AI Access Pending</h3>
          <p className="text-yellow-700">
            Your voice AI access request is being reviewed by an administrator.
          </p>
        </div>
      </div>
    );
  }

  // Check specific permissions if required
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="text-center py-12">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto">
          <h3 className="text-lg font-medium text-yellow-800 mb-2">Access Restricted</h3>
          <p className="text-yellow-700">
            You don't have permission to access this feature. Please contact your administrator.
          </p>
        </div>
      </div>
    );
  }

  // Render protected content
  return children;
};

export default ProtectedRoute;
```

## Integration with Your Existing Google Auth

### Step 7: Modify Your Existing Google Auth Handler

```javascript
// In your existing Google auth success handler
const handleGoogleSignIn = async (googleResponse) => {
  // Your existing Google auth logic...
  
  // Add voice AI integration
  const { handleGoogleAuthSuccess } = useAuth();
  const result = await handleGoogleAuthSuccess(googleResponse.credential);
  
  if (result.success) {
    if (result.requiresApproval) {
      // Show access request UI
      console.log('Voice AI access requires approval');
    } else {
      // User has full access
      console.log('Full voice AI access granted');
    }
  }
};
```

## Benefits of This Approach

### ✅ **No Disruption**
- Your existing Google auth continues to work exactly as before
- Users keep their familiar login experience
- No changes needed to your current authentication flow

### ✅ **Enhanced Security**
- Role-based access control for sensitive legal features
- Admin approval process for voice AI access
- Granular permissions for different staff levels

### ✅ **Seamless Integration**
- Voice AI features integrate naturally with your existing app
- Users see access request prompts when needed
- Admins can manage permissions through dedicated interface

### ✅ **Professional Workflow**
- Appropriate for legal practice requirements
- Audit trail for access grants and revocations
- Compliance-ready user management

## Migration Strategy

1. **Phase 1**: Deploy backend changes (user model extensions)
2. **Phase 2**: Update frontend auth context to handle voice AI permissions
3. **Phase 3**: Add access request components and admin management
4. **Phase 4**: Protect voice AI features with enhanced ProtectedRoute
5. **Phase 5**: Set up initial admin users and role assignments

Your existing Google authentication will continue working unchanged, while the voice AI features get the professional-grade access control they need for legal practice management!

