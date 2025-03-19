from functools import wraps
from flask import session, jsonify
from supabase_client import get_supabase_client

# Get Supabase client
supabase = get_supabase_client()

def register_user(email, password, username):
    """
    Register a new user with Supabase
    """
    try:
        # Register user with Supabase Auth
        auth_response = supabase.auth.sign_up({
            "email": email,
            "password": password
        })
        
        if auth_response.user:
            # Create profile in profiles table
            profile_data = {
                "id": auth_response.user.id,
                "username": username,
                "email": email,
                "created_at": auth_response.user.created_at
            }
            
            supabase.table('profiles').insert(profile_data).execute()
            
            return {
                "success": True,
                "user": {
                    "id": auth_response.user.id,
                    "email": auth_response.user.email,
                    "username": username
                }
            }
        else:
            return {
                "success": False,
                "error": "Failed to create user"
            }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

def login_user(email, password):
    """
    Login a user with Supabase
    """
    try:
        # Login user with Supabase Auth
        auth_response = supabase.auth.sign_in_with_password({
            "email": email,
            "password": password
        })
        
        if auth_response.user:
            # Store user session
            session['user_id'] = auth_response.user.id
            session['email'] = auth_response.user.email
            
            # Get user profile
            profile_response = supabase.table('profiles').select('*').eq('id', auth_response.user.id).execute()
            
            if profile_response.data and len(profile_response.data) > 0:
                profile = profile_response.data[0]
                return {
                    "success": True,
                    "user": {
                        "id": auth_response.user.id,
                        "email": auth_response.user.email,
                        "username": profile.get('username')
                    }
                }
            else:
                return {
                    "success": False,
                    "error": "Profile not found"
                }
        else:
            return {
                "success": False,
                "error": "Invalid credentials"
            }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

def logout_user():
    """
    Logout the current user
    """
    try:
        # Clear session
        session.clear()
        return {
            "success": True,
            "message": "Logged out successfully"
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

def get_current_user():
    """
    Get the current user from session
    """
    user_id = session.get('user_id')
    if not user_id:
        return None
        
    try:
        # Get user profile from Supabase
        profile_response = supabase.table('profiles').select('*').eq('id', user_id).execute()
        
        if profile_response.data and len(profile_response.data) > 0:
            profile = profile_response.data[0]
            return {
                "id": user_id,
                "email": session.get('email'),
                "username": profile.get('username')
            }
        return None
    except Exception as e:
        print(f"Error getting current user: {str(e)}")
        return None

def login_required(f):
    """
    Decorator to require login for routes
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not session.get('user_id'):
            return jsonify({"error": "Authentication required"}), 401
        return f(*args, **kwargs)
    return decorated_function
