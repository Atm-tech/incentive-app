from sqlalchemy.orm import Session
from models.system import SystemState

def get_status(db: Session):
    return db.query(SystemState).first()

def mark_setup_complete(db: Session):
    state = db.query(SystemState).first()
    if not state:
        state = SystemState(setup_complete=True)
        db.add(state)
    else:
        state.setup_complete = True
    db.commit()
    return state
