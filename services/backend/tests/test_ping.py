from app import main


def test_ping(client):
    response = client.get("/ping")
    assert response.status_code == 200
    assert response.json() == {"environment": "dev", "ping": "pong!", "testing": False}
