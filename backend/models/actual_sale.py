from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from db.database import Base


class ActualSale(Base):
    __tablename__ = "actual_sales"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(DateTime, nullable=False)
    customer = Column(String, nullable=False)
    barcode = Column(String, nullable=False)
    qty = Column(Integer, nullable=False)
    net_amount = Column(Float, nullable=False)

    salesman_id = Column(Integer, ForeignKey("salesmen.id"), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

    salesman = relationship("Salesman", backref="actual_sales")
