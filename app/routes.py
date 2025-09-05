# app/routes.py
from flask import Blueprint, request, jsonify
from app.models import User
from app import db
from app.utils import role_required, token_required, generate_token

bp = Blueprint("api", __name__)

@bp.route("/users")
@role_required("admin")
def list_users():
    users = User.query.all()
    return {"users": [{"id": u.id, "username": u.username, "email": u.email, "role": u.role} for u in users]}

@bp.route("/users", methods=["POST"])
def create_user():
    data = request.get_json() or {}
    if not all(k in data for k in ("username", "email", "password")):
        return {"error": "username, email, and password are required"}, 400
    if User.query.filter_by(username=data["username"]).first():
        return {"error": "Username already exists"}, 400
    role = data.get("role", "buyer")  # default role
    new_user = User(username=data["username"], email=data["email"], role=role)
    new_user.set_password(data["password"])
    db.session.add(new_user)
    db.session.commit()
    return {"id": new_user.id, "username": new_user.username, "email": new_user.email, "role": new_user.role}, 201

@bp.route("/users/<int:user_id>", methods=["GET"])
@role_required("admin")
def get_user(user_id):
    user = User.query.get(user_id)
    if not user: return {"error": "User not found"}, 404
    return {"id": user.id, "username": user.username, "email": user.email, "role": user.role}

@bp.route("/users/<int:user_id>", methods=["PUT"])
@token_required
def update_user(user_id):
    user = User.query.get(user_id)
    if not user: return {"error": "User not found"}, 404
    # Only admin or the user themselves
    if request.user.role != "admin" and request.user.id != user.id:
        return {"error": "Permission denied"}, 403
    data = request.get_json() or {}
    if "username" in data: user.username = data["username"]
    if "email" in data: user.email = data["email"]
    if request.user.role == "admin" and "role" in data: user.role = data["role"]
    db.session.commit()
    return {"message": "User updated"}

@bp.route("/users/<int:user_id>/password", methods=["PUT"])
@token_required
def change_password(user_id):
    user = User.query.get(user_id)
    if not user: return {"error": "User not found"}, 404
    if request.user.id != user.id and request.user.role != "admin":
        return {"error": "Permission denied"}, 403
    data = request.get_json() or {}
    if "new_password" not in data: return {"error": "New password required"}, 400
    user.set_password(data["new_password"])
    db.session.commit()
    return {"message": "Password updated successfully"}

@bp.route("/users/<int:user_id>/avatar", methods=["POST"])
@token_required
def upload_avatar(user_id):
    # Optional: Implement storing file similar to property image; for now, just stub success.
    return {"message": "Avatar upload endpoint not yet implemented"}, 200

@bp.route("/login", methods=["POST"])
def login():
    if request.is_json:
        data = request.get_json()
    else:
        data = request.form.to_dict()

    if not data or not all(k in data for k in ("username", "password")):
        return jsonify({"error": "username and password are required"}), 400

    user = User.query.filter_by(username=data["username"]).first()
    if not user or not user.check_password(data["password"]):
        return jsonify({"error": "Invalid username or password"}), 401

    token = generate_token(user)
    return jsonify({"token": token})


@bp.route("/refresh", methods=["POST"])
@token_required
def refresh_token():
    user = request.user
    new_token = generate_token(user)
    return jsonify({"token": new_token})

@bp.route("/logout", methods=["POST"])
@token_required
def logout():
    return jsonify({"message": "Successfully logged out"})
