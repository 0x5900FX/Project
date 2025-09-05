# app/property_routes.py

import os
import uuid
from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
from app import db
from app.models import Property
from app.utils import token_required, role_required

property_bp = Blueprint("properties", __name__, url_prefix="/properties")

ALLOWED_IMAGE_EXTENSIONS = {"png", "jpg", "jpeg", "gif"}
ALLOWED_DOC_EXTENSIONS = {"pdf", "png", "jpg", "jpeg"}


def allowed_file(filename, doc=False):
    if "." not in filename:
        return False
    ext = filename.rsplit(".", 1)[1].lower()
    return ext in (ALLOWED_DOC_EXTENSIONS if doc else ALLOWED_IMAGE_EXTENSIONS)


def unique_filename(filename):
    ext = filename.rsplit(".", 1)[1].lower()
    return f"{uuid.uuid4().hex}.{ext}"


def property_to_dict(p):
    return {
        "id": p.id,
        "title": p.title,
        "description": p.description,
        "price": p.price,
        "seller_id": p.seller_id,
        "image_url": p.image_url,
        "verified": p.verified,
        "docs_url": p.docs_url,
        "location": p.location,
        "propertyType": p.property_type,
        "bedrooms": p.bedrooms,
        "bathrooms": p.bathrooms,
        "area": p.area,
        "created_at": p.created_at.isoformat() if p.created_at else None,
    }


@property_bp.route("", methods=["GET"])
@token_required
def list_properties():
    if request.user.role == "admin":
        properties = Property.query.all()
    elif request.user.role == "seller":
        properties = Property.query.filter_by(seller_id=request.user.id).all()
    else:
        properties = Property.query.filter_by(verified=True).all()
    return jsonify({"properties": [property_to_dict(p) for p in properties]})


@property_bp.route("/<int:property_id>", methods=["GET"])
@token_required
def get_property(property_id):
    prop = Property.query.get(property_id)
    if not prop:
        return jsonify({"error": "Property not found"}), 404
    if request.user.role == "buyer" and not prop.verified:
        return jsonify({"error": "Not available"}), 403
    if request.user.role == "seller" and prop.seller_id != request.user.id and not prop.verified:
        return jsonify({"error": "Not available"}), 403
    return jsonify(property_to_dict(prop))


@property_bp.route("", methods=["POST"])
@role_required("admin", "seller")
def create_property():
    data = request.get_json() or {}
    if not data.get("title") or not data.get("price"):
        return jsonify({"error": "title and price are required"}), 400
    new_property = Property(
        title=data["title"],
        description=data.get("description", ""),
        price=float(data["price"]),
        image_url=data.get("image_url"),
        seller_id=request.user.id,
        location=data.get("location"),
        property_type=data.get("propertyType"),
        bedrooms=data.get("bedrooms"),
        bathrooms=data.get("bathrooms"),
        area=data.get("area"),
    )
    db.session.add(new_property)
    db.session.commit()
    return jsonify(property_to_dict(new_property)), 201

@property_bp.route("/<int:property_id>", methods=["PUT"])
@role_required("admin", "seller", check_ownership=True)
def update_property(property_id):
    prop = Property.query.get(property_id)
    if not prop:
        return jsonify({"error": "Property not found"}), 404
    data = request.get_json() or {}

    prop.title = data.get("title", prop.title)
    prop.description = data.get("description", prop.description)
    prop.price = float(data.get("price", prop.price))
    prop.image_url = data.get("image_url", prop.image_url)
    prop.location = data.get("location", prop.location)
    prop.property_type = data.get("propertyType", prop.property_type)
    prop.bedrooms = data.get("bedrooms", prop.bedrooms)
    prop.bathrooms = data.get("bathrooms", prop.bathrooms)
    prop.area = data.get("area", prop.area)

    # ✅ Allow admin to verify property
    if request.user.role == "admin" and "verified" in data:
        prop.verified = bool(data["verified"])

    db.session.commit()
    return jsonify(property_to_dict(prop))



@property_bp.route("/<int:property_id>", methods=["DELETE"])
@role_required("admin", "seller", check_ownership=True)
def delete_property(property_id):
    prop = Property.query.get(property_id)
    if not prop:
        return jsonify({"error": "Property not found"}), 404
    db.session.delete(prop)
    db.session.commit()
    return jsonify({"message": f"Property {property_id} deleted"})


@property_bp.route("/<int:property_id>/upload_image", methods=["POST"])
@role_required("seller", check_ownership=True)
def upload_image(property_id):
    prop = Property.query.get(property_id)
    if not prop:
        return jsonify({"error": "Property not found"}), 404
    if "file" not in request.files:
        return jsonify({"error": "No file part"}), 400
    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400
    if not allowed_file(file.filename, doc=False):
        return jsonify({"error": "File type not allowed"}), 400
    filename = secure_filename(unique_filename(file.filename))
    file.save(os.path.join(current_app.config["UPLOAD_FOLDER_IMAGES"], filename))
    prop.image_url = f"/uploads/images/{filename}"
    db.session.commit()
    return jsonify({"image_url": prop.image_url}), 201


@property_bp.route("/<int:property_id>/upload_docs", methods=["POST"])
@role_required("seller", check_ownership=True)
def upload_docs(property_id):
    prop = Property.query.get(property_id)
    if not prop:
        return jsonify({"error": "Property not found"}), 404
    if "file" not in request.files:
        return jsonify({"error": "No file part"}), 400
    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400
    if not allowed_file(file.filename, doc=True):
        return jsonify({"error": "File type not allowed"}), 400
    filename = secure_filename(unique_filename(file.filename))
    file.save(os.path.join(current_app.config["UPLOAD_FOLDER_DOCS"], filename))
    prop.docs_url = f"/uploads/docs/{filename}"
    prop.verified = False
    db.session.commit()
    return jsonify({"docs_url": prop.docs_url, "verified": prop.verified}), 201
