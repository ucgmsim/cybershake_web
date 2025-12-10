# ruff: noqa: I001
# This is because db needs to be imported before Earthquake

from pathlib import Path
from typing import Annotated

import typer

from backend.api.server import db
from backend.db.models import Fruit

app = typer.Typer()

# Sample data for dropdown
ITEMS = ['Apple', 'Banana', 'Cherry']


@app.command(help="Creates the database and adds the fruits")
def create_db(
):
    # Drop and create the tables
    db.drop_all()
    db.create_all()
    db.session.commit()

    # Add the earthquakes to the database
    for fruit in ITEMS:
        fruit_ob = Fruit(fruit)
        db.session.add(fruit_ob)

    db.session.commit()
    print("Finished adding fruits to the database")


if __name__ == "__main__":
    app()