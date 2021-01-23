import os

from typing import Generator
import pytest
from fastapi.testclient import TestClient

from app.main import create_application
from app.config import get_settings, Settings

from tortoise.contrib.test import finalizer, initializer


def get_settings_override():
    return Settings(testing=1)


@pytest.fixture(scope="module")
def client() -> Generator:
    # set up
    app = create_application()
    # app.dependency_overrides[get_settings] = get_settings_override
    settings = get_settings()
    initializer(["app.models"], db_url=settings.database_test_url)
    with TestClient(app) as test_client:

        # testing
        yield test_client
    finalizer()


@pytest.fixture(scope="module")
def event_loop(client: TestClient) -> Generator:
    yield client.task.get_loop()
