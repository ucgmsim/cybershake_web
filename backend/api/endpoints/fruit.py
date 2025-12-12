import os
import csv
from flask import jsonify, request
from flask_cors import cross_origin

from backend.api import constants as const
from backend.api import server, utils
from backend.db import db
from backend.db.models import Fruit


CSV_DEFAULT_PATH = os.path.join("/home/joel/code/cybershake_web/backend/data", "points.csv")  # or use const.POINTS_CSV / server.config

@server.app.route(const.GET_POINTS, methods=["GET"])
@cross_origin(expose_headers=["Content-Type", "Authorization"])
@utils.endpoint_exception_handling(server.app)
def get_points():
    """
    Reads a CSV with headers 'lat','lon','value' and returns a JSON list of dicts.
    """
    server.app.logger.info(f"Received request at {const.GET_POINTS}")

    csv_path = server.app.config.get("POINTS_CSV", CSV_DEFAULT_PATH)
    points = []

    if not os.path.exists(csv_path):
        server.app.logger.error(f"Points CSV not found: {csv_path}")
        return jsonify({"error": "points file not found"}), 404

    with open(csv_path, newline="") as fh:
        reader = csv.DictReader(fh)
        for i, row in enumerate(reader):
            try:
                lat = float(row.get("lat", row.get("latitude", "")))
                lon = float(row.get("lon", row.get("longitude", "")))
                value = float(row.get("value", row.get("val", "")))
            except (TypeError, ValueError):
                # skip malformed rows
                continue
            points.append({"lat": lat, "lon": lon, "value": value})

    return jsonify(points), 200

@server.app.route(const.UPDATE_FRUIT, methods=["PUT"])
@cross_origin(expose_headers=["Content-Type", "Authorization"])
@utils.endpoint_exception_handling(server.app)
def update_fruit(fruit_id):
    server.app.logger.info(f"PUT request to update fruit ID {fruit_id}")

    data = request.get_json()
    new_name = data.get("fruit")

    fruit = Fruit.get_by_id(fruit_id)
    if not fruit:
        return jsonify({"error": "Fruit not found"}), 404

    fruit.update(new_name)
    return jsonify(fruit.to_json()), 200

@server.app.route(const.DELETE_FRUIT, methods=["DELETE"])
@cross_origin(expose_headers=["Content-Type", "Authorization"])
@utils.endpoint_exception_handling(server.app)
def delete_fruit(fruit_id):
    server.app.logger.info(f"DELETE request to delete fruit ID {fruit_id}")

    fruit = Fruit.get_by_id(fruit_id)
    if not fruit:
        return jsonify({"error": "Fruit not found"}), 404

    fruit.delete()
    return jsonify({"message": "Fruit deleted"}), 200
