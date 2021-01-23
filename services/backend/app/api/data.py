from fastapi import APIRouter, HTTPException
from datetime import datetime
from app.api import crud
#import crud

from app.schemas import DataPayloadSchema, DataResponseSchema

from app.utils import to_dict

from typing import List

router = APIRouter()


@router.post("/", response_model=DataResponseSchema, status_code=201)
async def create_entry(payload: DataPayloadSchema) -> DataResponseSchema:
    entry = await crud.create_entry(payload)
    return entry


@router.post("/batch", response_model=List[DataResponseSchema], status_code=201)
async def create_batch_entries(payload: List[DataPayloadSchema]) -> List[DataResponseSchema]:
    entries = []
    for p in payload:
        entry = await crud.create_entry(p)
        entries.append(entry)

    return entry

# @router.get("/", response_model=List[ProjectResponseSchema])
# async def get_projects():
#     projects = await crud.get_projects()
#     return projects


@router.get("/location/{location}", response_model=List[DataResponseSchema])
async def get_location_data(location: str) -> List[DataResponseSchema]:
    location_data = await crud.get_location(location)
    if location_data is None:
        raise HTTPException(404, "This project id does not exist")
    
    return location_data


@router.get("/date/{date}", response_model=List[DataResponseSchema])
async def get_location_data(date: str) -> List[DataResponseSchema]:
    date_data = await crud.get_date(datetime.strptime(date, '%Y-%m-%d'))
    if date_data is None:
        raise HTTPException(404, "This project id does not exist")
    
    return date_data


# @router.put("/{project_id}", response_model=ProjectSchema)
# async def get_project(project_id: int, payload: ProjectPayloadSchema) -> ProjectSchema:
#     print(payload)
#     project = await crud.put_project(project_id, payload)
#     # if project is None:
#     #    raise HTTPException(404, "This project id does not exist")
#     print(project)
#     return project


# @router.get("/{project_id}/tasks", response_model=List[TaskResponseSchema])
# async def get_project_tasks(project_id: int) -> List[TaskResponseSchema]:
#     project = await crud.get_project_tasks(project_id)
#     if project is None:
#         raise HTTPException(404, "This project id does not exist")
#     return project


# @router.post("/{project_id}/tasks", response_model=TaskResponseSchema)
# async def create_task(
#     project_id: int, payload: TaskPayloadSchema
# ) -> TaskResponseSchema:
#     task = await crud.post_task(project_id, payload.name)
#     if task is None:
#         raise HTTPException(404, "This project id does not exist")
#     print("Project", task)
#     return task


# @router.delete("/{project_id}")
# async def delete_project(project_id: int):
#     res = await crud.delete_project(project_id)

#     print(res)

#     return {"message": f"Delete Project {project_id}"}
