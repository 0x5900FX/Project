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
    """
    Decorator to enforce role-based access and optional ownership for properties.
    Usage:
        @role_required("admin") -> only admin
        @role_required("seller", check_ownership=True) -> seller can access only their own resource
    """
    from app.models import Property  # imported here to avoid circular import

    def decorator(f):
        @wraps(f)
        @token_required  # ensures request.user is available
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


def generate_token(user, expires_in=86300):
    """
    Generate JWT token for a user.
    :param user: User object
    :param expires_in: Expiration time in seconds (default 1 hour)
    """
    payload = {
        "user_id": user.id,
        "exp": datetime.now() + timedelta(seconds=expires_in),
        "role": user.role,  # include role
    }
    token = jwt.encode(payload, current_app.config["SECRET_KEY"], algorithm="HS256")
    return token


def token_required(f):
    """
    Decorator to enforce JWT token authentication.
    Use 'Authorization: Bearer <token>' in headers.
    """
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
        except Exception:
            return jsonify({"error": "Token is invalid or expired"}), 401

        return f(*args, **kwargs)
    return decorated
