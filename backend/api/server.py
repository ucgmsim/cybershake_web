import logging
from pathlib import Path

import flask
from flask_sqlalchemy import SQLAlchemy

from backend.api.custom_log_handler import MultiProcessSafeTimedRotatingFileHandler

app = flask.Flask(str(Path(__file__).parent))
app.app_context().push()

logfile = Path(__file__).parent / "logs/logfile.log"
logfile.parent.mkdir(parents=True, exist_ok=True)

TRFhandler = MultiProcessSafeTimedRotatingFileHandler(filename=logfile, when="midnight")

logging.basicConfig(
    format="[%(asctime)s] %(levelname)s in %(module)s: %(message)s",
    level=logging.DEBUG,
    handlers=[TRFhandler],
)
logging.getLogger("flask_cors").level = logging.DEBUG

TRFhandler.setLevel(logging.DEBUG)
# To prevent having a same log twice
app.logger.propagate = False
app.logger.addHandler(TRFhandler)
logging.getLogger("matplotlib").setLevel(logging.ERROR)

# Connection details for the DB
db_path = Path(__file__).parent.parent / "db/db.db"
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///" + str(db_path)
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)

# Add the endpoints
from backend.api.endpoints import fruit