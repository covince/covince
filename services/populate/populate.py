import requests
import csv
import os
from datetime import datetime
import json

class DateTimeEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, datetime):
            return o.isoformat()

        return json.JSONEncoder.default(self, o)


URL = "http://localhost:8002/data/batch"


def populate_db():
    with open("data.csv", "r") as csvfile:
        reader = csv.reader(csvfile, delimiter=",")
        next(reader)
        payloads = []
        for i, row in enumerate(reader):
            j, lad, date, mean, upper, lower, param = row
            date = datetime.strptime(date, '%Y-%m-%d')
            
            payload = {
                'parameter': param,
                'location': lad,
                'date': date,
                'mean': mean,
                'upper': upper,
                'lower': lower
            }
            payloads.append(payload)
        
        requests.post(
            URL, 
            data=json.dumps(payloads, cls=DateTimeEncoder),
            headers={'Content-type': 'application/json'}
            )


# new
if __name__ == "__main__":
    populate_db()

