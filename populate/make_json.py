import requests
import csv
import os
from datetime import datetime
from collections import defaultdict
import json
import tqdm




def make_json():
    by_ltla = defaultdict(list)
    by_lineage = defaultdict(list)
    with open("10_lineage.csv", "r") as csvfile:
        dataset = []
        reader = csv.reader(csvfile, delimiter=",")
        next(reader)
        for i, row in tqdm.tqdm(enumerate(reader)):
            j, lad, date, mean, upper, lower, param, lineage = row

            if mean !="":
                mean = round(float(mean),3)
                upper = round(float(upper),3)
                lower = round(float(lower),3)

            item = {
                'date':date,
                'parameter': param,
                'location': lad,
                'mean': mean,
                'upper': upper,
                'lower': lower,
                'lineage' : lineage
            }
            by_ltla[lad].append(item)
            by_lineage[lineage].append(item)
        for k,v in tqdm.tqdm(by_ltla.items()):
            with open(f'../public/data/ltla/{k}.json', 'w') as outfile:
                json.dump({'data':v}, outfile)
        for k,v in tqdm.tqdm(by_lineage.items()):
            with open(f'../public/data/lineage/{k}.json', 'w') as outfile:
                json.dump({'data':v}, outfile)
        with open(f'../src/assets/lists.json', 'w') as outfile:
                json.dump({'ltlas':list(by_ltla.keys()),'lineages':list(by_lineage.keys() )}, outfile)
        



# new
if __name__ == "__main__":
    make_json()

