from fastapi import APIRouter, HTTPException
from app.api import crud

from app.schemas import (
    TaskPayloadSchema,
    TaskResponseSchema,
    IntervalPayloadSchema,
    IntervalResponseSchema,
)
from app.utils import to_dict

from typing import List

router = APIRouter()


@router.post("/", response_model=TaskResponseSchema, status_code=201)
async def create_task(payload: TaskPayloadSchema) -> TaskResponseSchema:
    project = await crud.post_task(payload)
    return project


@router.get("/{task_id}", response_model=TaskResponseSchema)
async def get_task(task_id: int) -> TaskResponseSchema:
    task = await crud.get_task(task_id)
    if task is None:
        raise HTTPException(404, "This project id does not exist")
    return task


@router.post("/{task_id}", response_model=IntervalResponseSchema)
async def get_task(
    task_id: int, payload: IntervalPayloadSchema
) -> IntervalResponseSchema:

    print(payload.started, payload.ended)
    interval = await crud.post_interval(task_id, payload)
    return interval


@router.get("/{task_id}/intervals", response_model=List[IntervalResponseSchema])
async def get_task_intervals(task_id: int) -> List[IntervalResponseSchema]:
    intervals = await crud.get_task_intervals(task_id)
    if intervals is None:
        raise HTTPException(404, "This project id does not exist")
    return intervals
