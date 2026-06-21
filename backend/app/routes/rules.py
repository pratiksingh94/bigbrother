from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.rule import Rule
from app.schemas.rules import RuleRequest, RuleResponse, RulesResponse

router = APIRouter()

@router.get("", response_model=RulesResponse)
def get_rules(db: Session = Depends(get_db)):
    rules = db.scalars(select(Rule).order_by(Rule.created_at.desc())).all()
    return {"rules": rules}


@router.post("", response_model=RuleResponse)
def create_rule(req: RuleRequest, db: Session = Depends(get_db)):
    rule = Rule(**req.model_dump())
    db.add(rule)
    db.commit()
    db.refresh(rule)
    return rule

@router.patch("/{id}", response_model=RuleResponse)
def update_rule(id: int, req: RuleRequest, db: Session = Depends(get_db)):
    rule = db.scalar(select(Rule).where(Rule.id == id))
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")
    
    for k, v in req.model_dump().items():
        setattr(rule, k, v)
    
    db.commit()
    db.refresh(rule)

    return rule

@router.delete("/{id}")
def delete_rule(id: int, db: Session = Depends(get_db)):
    rule = db.scalar(select(Rule).where(Rule.id == id))
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")
    db.delete(rule)
    db.commit()

    return {"status": "ok"}


@router.patch("/{id}/toggle")
def toggle_rule(id: int, db: Session = Depends(get_db)):
    rule = db.scalar(select(Rule).where(Rule.id == id))
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")
    rule.enabled = not rule.enabled
    db.commit()
    return {"status": "ok"}