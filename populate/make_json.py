import requests
import csv
import os
from datetime import datetime
import json



def make_json():
    with open("full_data_table.csv", "r") as csvfile:
        dataset = []
        reader = csv.reader(csvfile, delimiter=",")
        next(reader)
        for i, row in enumerate(reader):
            j, lad, date, mean, upper, lower, param, lineage = row

            
            item = {
                'date':date,
                'parameter': param,
                'location': lad,
                'mean': mean,
                'upper': upper,
                'lower': lower,
                'lineage' : lineage
            }
            dataset.append(item)
        with open('../src/assets/data_full.json', 'w') as outfile:
            json.dump({'data':dataset}, outfile)
        



# new
if __name__ == "__main__":
    make_json()

