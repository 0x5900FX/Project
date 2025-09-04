# app/__init__.py
import os
from flask import Flask, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from dotenv import load_dotenv
from flask_cors import CORS  # import CORS here

db = SQLAlchemy()
migrate = Migrate()

def create_app():
    load_dotenv()
    app = Flask(__name__)

    # ---------------- CONFIG ----------------
    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv(
        "DATABASE_URL", "sqlite:///dev.db"
    )
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "supersecretkey")


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

    @app.route("/")
    def index():
        return {"message": "API is running"}

    # ----------------- ENABLE CORS ------------------
    CORS(app)  # apply CORS to the same app, do NOT create a new app

    return app
