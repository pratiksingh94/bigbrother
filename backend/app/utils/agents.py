from datetime import datetime

def get_presence(last_seen):
    delta = datetime.now() - last_seen

    if delta.total_seconds() < 120:
        return "online"
    
    return "offline"