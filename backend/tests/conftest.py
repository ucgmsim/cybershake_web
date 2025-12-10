import pytest
from flask import Flask
from backend.api.server import db
from backend.db.models import Fruit


@pytest.fixture(scope="function")
def test_app():
    app = Flask(__name__)
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.app_context().push()
    db.init_app(app)

    db.create_all()
    yield app
    db.session.remove()
    db.drop_all()


@pytest.fixture
def add_sample_fruits():
    def _add():
        fruits = ["Apple", "Banana", "Cherry"]
        for f in fruits:
            db.session.add(Fruit(f))
        db.session.commit()
    return _add
