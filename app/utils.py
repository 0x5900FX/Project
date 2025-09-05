# app/utils.py
from functools import wraps
from flask import request, jsonify, current_app
from app.models import User
import base64
from datetime import datetime, timedelta
import jwt


def basic_auth_required(f):
    """
    Decorator to enforce HTTP Basic Authentication.
    Attaches the authenticated user to request.user
    """
    @wraps(f)
    def wrapper(*args, **kwargs):
        auth = request.headers.get("Authorization")
        if not auth or not auth.startswith("Basic "):
            return jsonify({"error": "Missing or invalid Authorization header"}), 401
        try:
            b64_credentials = auth.split(" ")[1]
            decoded = base64.b64decode(b64_credentials).decode("utf-8")
            username, password = decoded.split(":")
        except Exception:
            return jsonify({"error": "Invalid authentication"}), 401

        user = User.query.filter_by(username=username).first()
        if not user or not user.check_password(password):
            return jsonify({"error": "Invalid username or password"}), 401

        request.user = user  # Attach user to request
        return f(*args, **kwargs)
    return wrapper


def role_required(*allowed_roles, check_ownership=False):
    from app.models import Property
    def decorator(f):
        @wraps(f)
        @token_required
        def wrapper(*args, **kwargs):
            user = getattr(request, "user", None)
            if not user or user.role not in allowed_roles:
                return jsonify({"error": "Forbidden: insufficient role"}), 403
            if check_ownership:
                property_id = kwargs.get("property_id")
                if not property_id:
                    return jsonify({"error": "Resource ID not provided"}), 400
                prop = Property.query.get(property_id)
                if not prop:
                    return jsonify({"error": "Property not found"}), 404
                if prop.seller_id != user.id and user.role != "admin":
                    return jsonify({"error": "Forbidden: not the owner"}), 403
            return f(*args, **kwargs)
        return wrapper
    return decorator

def generate_token(user, expires_in=86400):
    payload = {
        "user_id": user.id,
        "username": user.username,
        "role": user.role,
        "exp": datetime.utcnow() + timedelta(seconds=expires_in),
        "iat": datetime.utcnow(),
    }
    token = jwt.encode(payload, current_app.config["SECRET_KEY"], algorithm="HS256")
    return token

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
        if not token:
            return jsonify({"error": "Token is missing"}), 401
        try:
            data = jwt.decode(token, current_app.config["SECRET_KEY"], algorithms=["HS256"])
            user = User.query.get(data["user_id"])
            if not user:
                raise Exception("User not found")
            request.user = user
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token has expired"}), 401
        except Exception as e:
            return jsonify({"error": f"Token is invalid: {str(e)}"}), 401
        return f(*args, **kwargs)
    return decorated
