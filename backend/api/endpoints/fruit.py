from flask import jsonify, request
from flask_cors import cross_origin

from backend.api import constants as const
from backend.api import server, utils
from backend.db import db
from backend.db.models import Fruit


@server.app.route(const.GET_FRUITS, methods=["GET"])
@cross_origin(expose_headers=["Content-Type", "Authorization"])
@utils.endpoint_exception_handling(server.app)
def get_items():
    server.app.logger.info(f"Received request at {const.GET_FRUITS}")
    # Get the fruits from the database
    fruits = db.get_fruits()
    # Return the fruits as JSON
    return jsonify(fruits), 200

@server.app.route(const.GET_FRUITS, methods=["POST"])
@cross_origin(expose_headers=["Content-Type", "Authorization"])
@utils.endpoint_exception_handling(server.app)
def create_fruit():
    server.app.logger.info("POST request to create fruit")

    data = request.get_json()
    fruit_name = data.get("fruit_name")

    if not fruit_name:
        return jsonify({"error": "Fruit name is required"}), 400

    fruit = Fruit(fruit=fruit_name)
    fruit.save()

    return jsonify(fruit.to_json()), 201

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
