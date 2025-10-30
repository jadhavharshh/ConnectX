#!/usr/bin/env python3
"""
schema_overview.py
Connects to MongoDB Atlas and prints an overview of the schema of each collection.
"""
import os
from pymongo import MongoClient
from pprint import pprint


def get_field_types(collection, sample_size=100):
    """
    Sample documents from the collection and infer field types.
    Returns a dict mapping field names to lists of observed type names.
    """
    fields = {}
    for doc in collection.find().limit(sample_size):
        for key, value in doc.items():
            fields.setdefault(key, set()).add(type(value).__name__)
    # Convert sets to lists for readability
    return {k: list(v) for k, v in fields.items()}


def main():
    # Read the MongoDB Atlas connection string from environment
    uri = "mongodb+srv://harshjadhavcodes:Q3b11kzsGPMvfihJ@connectx.awqtw.mongodb.net/"
    if not uri:
        print("Error: Please set the DATABASE_URL environment variable to your connection string.")
        return

    # Connect to the Atlas cluster
    client = MongoClient(uri)

    # List all user databases (excluding internal ones)
    all_dbs = client.list_database_names()
    db_names = [db for db in all_dbs if db not in ("admin", "local", "config")]
    print("Databases found:", db_names)

    # For each database, list collections and infer schema
    for db_name in db_names:
        db = client[db_name]
        coll_names = db.list_collection_names()
        print(f"\nDatabase: {db_name}")
        print(" Collections:", coll_names or "— no collections —")
        for coll_name in coll_names:
            coll = db[coll_name]
            field_types = get_field_types(coll)
            print(f"  Collection: {coll_name}")
            print("   Field types:")
            pprint(field_types)


if __name__ == "__main__":
    main()
