import json

import pytest


def test_create_exercise(client):
    response = client.post(
        "/workouts/",
        data=json.dumps({"name": "Push"}),
    )

    assert response.status_code == 201
    assert response.json()["id"] == 1
    assert response.json()["name"] == "Push"
    assert "created_at" in response.json()
    assert "modified_at" in response.json()