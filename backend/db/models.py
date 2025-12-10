from backend.api.server import db
from sqlalchemy.exc import SQLAlchemyError



class Fruit(db.Model):
    """
    Model for the fruits table in the database.
    """
    __tablename__ = "fruits"
    id = db.Column(db.Integer, primary_key=True)
    fruit = db.Column(db.String(255), nullable=False)

    def __init__(self, fruit: str):
        """
        Create a Fruit object.

        Parameters
        ----------
        fruit : str
            The name of the fruit
        """
        self.fruit = fruit

    def to_json(self):
        """
        Returns a JSON representation of the fruit.

        Returns
        -------
        dict
            A dictionary containing the fruit information.
        """
        return {
            "id": self.id,
            "fruit": self.fruit,
        }

    # CREATE
    def save(self):
        """
        Save the current instance to the database.
        """
        try:
            db.session.add(self)
            db.session.commit()
        except SQLAlchemyError as e:
            db.session.rollback()
            raise e

    # UPDATE
    def update(self, fruit_name: str):
        """
        Update the name of the fruit.
        """
        try:
            self.fruit = fruit_name
            db.session.commit()
        except SQLAlchemyError as e:
            db.session.rollback()
            raise e

    # DELETE
    def delete(self):
        """
        Delete the current instance from the database.
        """
        try:
            db.session.delete(self)
            db.session.commit()
        except SQLAlchemyError as e:
            db.session.rollback()
            raise e