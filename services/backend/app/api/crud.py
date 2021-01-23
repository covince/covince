#from app.schemas import ExerciseSchema, ExercisePayloadSchema
from app.schemas import DataPayloadSchema, DataResponseSchema
from app.models import Data
from tortoise.query_utils import Prefetch
from typing import Union
from datetime import datetime

# from tortoise.transactions import in_transaction
# from tortoise import Tortoise
from typing import List


async def create_entry(payload: DataPayloadSchema) -> DataResponseSchema:
    entry = Data(
        parameter=payload.parameter, 
        location=payload.location, 
        date=payload.date,
        mean=payload.mean, 
        upper=payload.upper, 
        lower=payload.lower
        )
    await entry.save()
    return entry

async def get_location(location) -> List[DataResponseSchema]:
    params = await Data.filter(location=location).order_by('date').all() #.prefetch_related("tasks")
    #tasks = await project.tasks.all().values()
    
    return params

async def get_date(date) -> List[DataResponseSchema]:
    params = await Data.filter(date=date).all()
    return params


# async def post_exercise(payload: ExercisePayloadSchema) -> ExerciseSchema:
#     print(payload)
#     exercise = Exercises(name=payload.name)
#     await exercise.save()
#     print(exercise)
#     return exercise


# async def post_workout(payload: WorkoutPayloadSchema) -> WorkoutSchema:
#     print(payload)
#     workout = Workouts(name=payload.name)
#     await workout.save()
#     print(workout)
#     return workout


# async def post_project(payload: ProjectPayloadSchema) -> ProjectSchema:
#     description = payload.description if payload.description is not None else ""
#     project = Project(name=payload.name, description=description)
#     await project.save()
#     return project


# async def get_projects() -> List:
#     # async with in_transaction(Tortoise.get_connection("default")) as connection:
#     #    projects = await connection.execute_query('SELECT * FROM project;')

#     projects = await Project.all().values()
#     # tasks = await Project.all().prefetch_related('tasks')
#     # all_projects = []
#     # for p, t in zip(projects, tasks):
#     #     task = await t.tasks.all().values()
#     #     p['tasks'] = task
#     #     all_projects.append(p)

#     # print(all_projects)
#     return projects


# async def get_project_tasks(project_id) -> List:
#     project = await Project.filter(id=project_id).first().prefetch_related("tasks")
#     tasks = await project.tasks.all().values()
#     return tasks


# async def get_project(project_id: int) -> ProjectSchema:
#     return await Project.filter(id=project_id).first()


# async def put_project(id: int, payload: ProjectPayloadSchema) -> Union[dict, None]:
#     project = await Project.filter(id=id).update(
#         name=payload.name, description=payload.description
#     )
#     if project:
#         updated_project = await Project.filter(id=id).first().values()
#         return updated_project[0]
#     return None


# async def delete_project(project_id: int):
#     return await Project.filter(id=project_id).delete()


# async def get_task(task_id: int):
#     return await Task.filter(id=task_id).first()


# async def post_task(project_id: int, name: str):
#     project = await get_project(project_id)
#     task = Task(name=name, project=project)
#     await task.save()
#     print(task)
#     return task


# async def post_interval(task_id: int, payload: IntervalPayloadSchema):
#     print("GOT HERE", type(payload.started))
#     task = await get_task(task_id)
#     interval = Interval(
#         started=payload.started.replace(
#             tzinfo=None
#         ),  # datetime.strptime(payload.started, "%a, %d %b %Y %H:%M:%S %Z"),
#         ended=payload.ended.replace(
#             tzinfo=None
#         ),  # datetime.strptime(payload.ended, "%a, %d %b %Y %H:%M:%S %Z"),
#         task=task,
#     )
#     await interval.save()
#     return interval


# async def get_task_intervals(task_id) -> List:

#     task = await Task.filter(id=task_id).first().prefetch_related("intervals")
#     intervals = await task.intervals.all().values()
#     return intervals
