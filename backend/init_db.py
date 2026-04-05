from database import engine, Base
import models

def create_tables():
    print("Conectare la portul 5435...")
    print("Se creeaza tabelele 'users' și 'orders'...")

    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    print("Tabelele au fost create.")

if __name__ == "__main__":
    create_tables()