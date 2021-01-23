from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime
from tortoise.contrib.pydantic import pydantic_model_creator


class DataPayloadSchema(BaseModel):
    location: str
    parameter: str
    date: datetime
    mean: float
    upper: float
    lower: float

class DataResponseSchema(DataPayloadSchema):
    id: int
    
    class Config:
        orm_mode = True

class ExercisePayloadSchema(BaseModel):
    name: str


class ExerciseSchema(ExercisePayloadSchema):
    id: int
    created_at: datetime
    modified_at: datetime

    class Config:
        orm_mode = True


class WorkoutPayloadSchema(BaseModel):
    name: str


class WorkoutSchema(WorkoutPayloadSchema):
    id: int
    created_at: datetime
    modified_at: datetime

    class Config:
        orm_mode = True


# class ProjectPayloadSchema(BaseModel):
#     name: str
#     description: Optional[str] = None


# class ProjectResponseSchema(ProjectPayloadSchema):
#     id: int
#     created_at: datetime
#     # tasks: List[TaskResponseSchema]


# class TaskPayloadSchema(BaseModel):
#     name: str


# class TaskResponseSchema(TaskPayloadSchema):
#     id: int
#     project_id: int

#     class Config:
#         orm_mode = True


# class IntervalPayloadSchema(BaseModel):
#     started: datetime
#     ended: datetime


# class IntervalResponseSchema(IntervalPayloadSchema):
#     id: int

#     class Config:
#         orm_mode = True


# ProjectSchema = pydantic_model_creator(Project)
# TaskSchema = pydantic_model_creator(Task)
