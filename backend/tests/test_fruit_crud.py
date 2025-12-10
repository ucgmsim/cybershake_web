from backend.db import db as fruit_db


def test_create_fruit(test_app):
    fruit = fruit_db.create_fruit("Mango")
    assert fruit["fruit"] == "Mango"
    assert "id" in fruit


def test_get_fruits(test_app, add_sample_fruits):
    add_sample_fruits()
    fruits = fruit_db.get_fruits()
    assert len(fruits) == 3
    assert fruits[0]["fruit"] in ["Apple", "Banana", "Cherry"]


def test_update_fruit(test_app):
    fruit = fruit_db.create_fruit("Orange")
    updated = fruit_db.update_fruit(fruit["id"], "Blood Orange")
    assert updated["fruit"] == "Blood Orange"


def test_update_fruit_not_found(test_app):
    result = fruit_db.update_fruit(999, "Not Real")
    assert result is None


def test_delete_fruit(test_app):
    fruit = fruit_db.create_fruit("Grape")
    result = fruit_db.delete_fruit(fruit["id"])
    assert result is True

    all_fruits = fruit_db.get_fruits()
    assert all(f["fruit"] != "Grape" for f in all_fruits)


def test_delete_fruit_not_found(test_app):
    result = fruit_db.delete_fruit(999)
    assert result is False
