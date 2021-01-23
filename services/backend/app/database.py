import logging

from fastapi import FastAPI
from tortoise.contrib.fastapi import register_tortoise
from pydantic import BaseSettings

log = logging.getLogger(__name__)


def init_db(app: FastAPI, settings: BaseSettings) -> None:
    register_tortoise(
        app,
        db_url=settings.database_url,
        modules={"models": ["app.models"]},
        generate_schemas=False,
        add_exception_handlers=True,
    )
