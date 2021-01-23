import json

import pytest


def test_create_exercise(client):
    response = client.post(
        "/exercises/",
        data=json.dumps({"name": "Pull up"}),
    )

    assert response.status_code == 201
    assert response.json()["id"] == 1
    assert response.json()["name"] == "Pull up"
    assert "created_at" in response.json()
    assert "modified_at" in response.json()


# def test_create_project_no_description(client):
#     response = client.post("/projects/", data=json.dumps({"name": "Project 1",}))

#     assert response.status_code == 201
#     assert response.json()["id"] == 2
#     assert response.json()["name"] == "Project 1"
#     assert response.json()["description"] == ""


# def test_create_project_invalid_json(client):
#     response = client.post("/projects/", data=json.dumps({}))
#     assert response.status_code == 422


# def test_get_projects(client):
#     response = client.get("/projects/")

#     assert response.status_code == 200
#     assert len(response.json()) == 2


# def test_get_project(client):
#     response = client.get("/projects/1")

#     assert response.status_code == 200
#     assert response.json()["id"] == 1
#     assert response.json()["name"] == "Project 1"
#     assert response.json()["description"] == "Another thing"

#     response = client.get("/projects/2")
#     assert response.status_code == 200
#     assert response.json()["id"] == 2
#     assert response.json()["name"] == "Project 1"
#     assert response.json()["description"] == ""


# def test_get_invalid_project(client):
#     response = client.get("/projects/3")

#     assert response.status_code == 404


# def test_delete_project(client):
#     response = client.delete("/projects/1")
#     assert response.status_code == 200

#     response = client.get("/projects/1")
#     assert response.status_code == 404
