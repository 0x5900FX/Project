# app/__init__.py
import os
from flask import Flask, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from dotenv import load_dotenv
from flask_cors import CORS

db = SQLAlchemy()
migrate = Migrate()

def create_app():
    # Load environment variables from .env
    load_dotenv()

    app = Flask(__name__)

    # ---------------- CONFIG ----------------
    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv(
        "DATABASE_URL", "sqlite:///dev.db"
    )
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "supersecretkey")

    # Limit upload size (optional but recommended)
    app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024  # 16 MB

    # ---------------- UPLOAD FOLDERS ----------------
    IMAGE_UPLOAD_FOLDER = os.path.join(os.getcwd(), "uploads", "images")
    DOCS_UPLOAD_FOLDER = os.path.join(os.getcwd(), "uploads", "docs")
    os.makedirs(IMAGE_UPLOAD_FOLDER, exist_ok=True)
    os.makedirs(DOCS_UPLOAD_FOLDER, exist_ok=True)

    app.config["UPLOAD_FOLDER_IMAGES"] = IMAGE_UPLOAD_FOLDER
    app.config["UPLOAD_FOLDER_DOCS"] = DOCS_UPLOAD_FOLDER

    # ---------------- INIT EXTENSIONS ----------------
    db.init_app(app)
    migrate.init_app(app, db)

    # Enable CORS for frontend dev servers
    CORS(
        app,
        resources={r"/*": {"origins": [
            "http://localhost:3000",
            "http://127.0.0.1:3000"
        ]}},
        supports_credentials=True
    )

    # ---------------- ROUTES ----------------
    from app.routes import bp as user_bp
    from app.property_routes import property_bp

    app.register_blueprint(user_bp)
    app.register_blueprint(property_bp)

    # ---------------- SERVE UPLOADED FILES ----------------
    @app.route("/uploads/images/<filename>")
    def uploaded_image(filename):
        return send_from_directory(app.config["UPLOAD_FOLDER_IMAGES"], filename)

    @app.route("/uploads/docs/<filename>")
    def uploaded_doc(filename):
        return send_from_directory(app.config["UPLOAD_FOLDER_DOCS"], filename)

    return app
