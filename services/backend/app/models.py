from tortoise import fields, models
from typing import Union

class Data(models.Model):
    id = fields.IntField(pk=True)
    parameter = fields.CharField(max_length=8)
    location = fields.CharField(max_length=9)
    date = fields.DatetimeField()
    mean = fields.FloatField()
    upper = fields.FloatField()
    lower = fields.FloatField()
