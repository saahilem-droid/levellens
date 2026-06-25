import os

def get_available_dates():

    data_folder = "data"

    dates = []

    for item in os.listdir(data_folder):

        path = os.path.join(
            data_folder,
            item
        )

        if os.path.isdir(path):
            dates.append(item)

    dates.sort()

    return dates