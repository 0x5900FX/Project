from flask import Blueprint, request, jsonify
from app.models import User
from app import db
from app.utils import role_required, token_required, generate_token

bp = Blueprint("api", __name__)

# ------------------- USERS -------------------

@bp.route("/users")
@token_required
@role_required("admin")  # Only admin can list users
def list_users():
    users = User.query.all()
    return {
        "users": [
            {"id": u.id, "username": u.username, "email": u.email, "role": u.role}
            for u in users
        ]
    }

@bp.route("/users", methods=["POST"])
def create_user():
    data = request.get_json()
    if not data or not all(k in data for k in ("username", "email", "role", "password")):
        return {"error": "username, email, role, and password are required"}, 400

    if User.query.filter_by(username=data["username"]).first():
        return {"error": "Username already exists"}, 400

    new_user = User(
        username=data["username"],
        email=data["email"],
        role=data["role"]
    )
    new_user.set_password(data["password"])
    db.session.add(new_user)
    db.session.commit()

    return {
        "id": new_user.id,
        "username": new_user.username,
        "email": new_user.email,
        "role": new_user.role
    }, 201

@bp.route("/users/<int:user_id>", methods=["DELETE"])
@token_required
@role_required("admin")
def delete_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return {"error": "User not found"}, 404
    db.session.delete(user)
    db.session.commit()
    return {"message": f"User {user_id} deleted"}

@bp.route("/users/<int:user_id>/password", methods=["PUT"])
@token_required
def change_password(user_id):
    user = User.query.get(user_id)
    if not user:
        return {"error": "User not found"}, 404

    # Only the user themselves or an admin can change the password
    if request.user.id != user.id and request.user.role != "admin":
        return {"error": "Permission denied"}, 403

    data = request.get_json()
    if not data or "new_password" not in data:
        return {"error": "New password required"}, 400

    user.set_password(data["new_password"])
    db.session.commit()

    return {"message": "Password updated successfully"}

# ------------------- LOGIN -------------------

@bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    if not data or not all(k in data for k in ("username", "password")):
        return {"error": "username and password are required"}, 400

    user = User.query.filter_by(username=data["username"]).first()
    if not user or not user.check_password(data["password"]):
        return {"error": "Invalid username or password"}, 401

    token = generate_token(user)
    return {"token": token}

