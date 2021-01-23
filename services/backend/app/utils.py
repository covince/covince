def to_dict(obj):
    return {key: value for key, value in obj.__dict__.items() if key[0] != "_"}
