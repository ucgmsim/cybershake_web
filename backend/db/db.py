from sqlalchemy.exc import SQLAlchemyError
from backend.db.models import Fruit


def get_fruits():
    """
    Get the fruits from the database.

    Returns:
        list of dict: List of fruit data
    """
    fruits = Fruit.query.all()
    return [fruit.to_json() for fruit in fruits]



def create_fruit(fruit_name):
    """
    Create a new fruit entry.

    Args:
        fruit_name (str): Name of the fruit

    Returns:
        dict: Created fruit data
    """
    new_fruit = Fruit(fruit=fruit_name)
    new_fruit.save()
    return new_fruit.to_json()


def update_fruit(fruit_id, new_name):
    """
    Update the name of a fruit.

    Args:
        fruit_id (int): Fruit ID to update
        new_name (str): New name for the fruit
    """
    fruit = Fruit.query.get(fruit_id)
    if not fruit:
        return None
    fruit.update(new_name)
    return fruit.to_json()


def delete_fruit(fruit_id):
    """
    Delete a fruit by ID.

    Args:
        fruit_id (int): Fruit ID to delete
    """
    try:
        fruit = Fruit.query.get(fruit_id)
        if not fruit:
            return False
        fruit.delete()
        return True
    except SQLAlchemyError as e:
        return False