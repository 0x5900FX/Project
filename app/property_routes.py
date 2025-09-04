# app/property_routes.py
from flask import Blueprint, request, current_app, jsonify
from werkzeug.utils import secure_filename
from app.models import Property
from app import db
from app.utils import token_required, role_required
import os

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif"}

property_bp = Blueprint("properties", __name__, url_prefix="/properties")

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

# ---------------- LIST PROPERTIES ----------------
@property_bp.route("", methods=["GET"])
@token_required
def list_properties():
    # For admin, return all properties; for others, only verified
    if request.user.role == 'admin':
        properties = Property.query.all()
    else:
        properties = Property.query.filter_by(verified=True).all()
    return {
        "properties": [
            {
                "id": p.id,
                "title": p.title,
                "description": p.description,
                "price": p.price,
                "seller_id": p.seller_id,
                "image_url": p.image_url,
                "verified": p.verified,
                "docs_url": p.docs_url
            } for p in properties
        ]
    }

# ---------------- CREATE PROPERTY ----------------
@property_bp.route("", methods=["POST"])
@token_required
@role_required("admin", "seller")
def create_property():
    data = request.get_json()
    if not data or not all(k in data for k in ("title", "price")):
        return {"error": "title and price are required"}, 400

    new_property = Property(
        title=data["title"],
        description=data.get("description", ""),
        price=data["price"],
        image_url=data.get("image_url"),
        seller_id=request.user.id
    )
    db.session.add(new_property)
    db.session.commit()

    return {
        "id": new_property.id,
        "title": new_property.title,
        "description": new_property.description,
        "price": new_property.price,
        "seller_id": new_property.seller_id
    }, 201

# ---------------- UPDATE PROPERTY ----------------
@property_bp.route("/<int:property_id>", methods=["PUT"])
@token_required
@role_required("admin", "seller", check_ownership=True)
def update_property(property_id):
    prop = Property.query.get(property_id)
    if not prop:
        return {"error": "Property not found"}, 404

    data = request.get_json()
    if not data:
        return {"error": "No data provided"}, 400

    prop.title = data.get("title", prop.title)
    prop.description = data.get("description", prop.description)
    prop.price = data.get("price", prop.price)
    prop.image_url = data.get("image_url", prop.image_url)

    db.session.commit()
    return {
        "id": prop.id,
        "title": prop.title,
        "description": prop.description,
        "price": prop.price,
        "seller_id": prop.seller_id
    }

# ---------------- DELETE PROPERTY ----------------
@property_bp.route("/<int:property_id>", methods=["DELETE"])
@token_required
@role_required("admin", "seller", check_ownership=True)
def delete_property(property_id):
    prop = Property.query.get(property_id)
    if not prop:
        return {"error": "Property not found"}, 404

    db.session.delete(prop)
    db.session.commit()
    return {"message": f"Property {property_id} deleted"}

# ---------------- UPLOAD PROPERTY IMAGE ----------------
@property_bp.route("/<int:property_id>/upload_image", methods=["POST"])
@token_required
@role_required("seller", check_ownership=True)
def upload_image(property_id):
    prop = Property.query.get(property_id)
    if not prop:
        return {"error": "Property not found"}, 404

    if "file" not in request.files:
        return {"error": "No file part"}, 400

    file = request.files["file"]
    if file.filename == "":
        return {"error": "No selected file"}, 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file.save(os.path.join(current_app.config["UPLOAD_FOLDER_IMAGES"], filename))
        prop.image_url = f"/uploads/images/{filename}"
        db.session.commit()
        return {"image_url": prop.image_url}, 201

    return {"error": "File type not allowed"}, 400

# ---------------- UPLOAD VERIFICATION DOCS ----------------
@property_bp.route("/<int:property_id>/upload_docs", methods=["POST"])
@token_required
@role_required("seller", check_ownership=True)
def upload_docs(property_id):
    prop = Property.query.get(property_id)
    if not prop:
        return {"error": "Property not found"}, 404

    if "file" not in request.files:
        return {"error": "No file part"}, 400

    file = request.files["file"]
    if file.filename == "":
        return {"error": "No selected file"}, 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file.save(os.path.join(current_app.config["UPLOAD_FOLDER_DOCS"], filename))
        prop.docs_url = f"/uploads/docs/{filename}"
        prop.verified = False  # reset verification when new doc uploaded
        db.session.commit()
        return {"docs_url": prop.docs_url, "verified": prop.verified}, 201

    return {"error": "File type not allowed"}, 400

# ---------------- ADMIN VERIFY PROPERTY ----------------
@property_bp.route("/<int:property_id>/verify", methods=["PUT"])
@token_required
@role_required("admin")
def verify_property(property_id):
    prop = Property.query.get(property_id)
    if not prop:
        return {"error": "Property not found"}, 404

    data = request.get_json()
    if not data or "verified" not in data:
        return {"error": "Verified status required"}, 400

    prop.verified = bool(data["verified"])
    db.session.commit()
    status = "verified" if prop.verified else "unverified"
    return {"message": f"Property {property_id} is now {status}"}
