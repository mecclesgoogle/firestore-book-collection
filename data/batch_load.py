"""Batch loads cantwaitbooks2022.csv into a firestore collection named 'cantwaitbooks2022'.

This module will load the csv, cleanse the data, and insert into firestore.

You must set the following environment vars:

* TOKEN 
  Get this by running `export TOKEN=$(gcloud auth print-access-token)` in your shell.
* PROJECT_ID
  Must point to a Firestore project.

Dataset reference:
https://www.kaggle.com/datasets/kkhandekar/cant-wait-books-of-2022-goodreads?resource=download

* You'll need a user account to access this data.
"""

from collections import defaultdict
import csv
import os
import re

from google.cloud import firestore
import google.oauth2.credentials

credentials = google.oauth2.credentials.Credentials(os.getenv('TOKEN'))
fs = firestore.Client(credentials=credentials, project=os.getenv('PROJECT_ID'))

def clean_data(book: dict) -> dict:
  """Cleans the raw data of superfluous characters and type cases numeric fields.

  Args:
    book: Book dictionary 
  Returns:
    Dictionary with modified values
  """
  cleaned_book = defaultdict("-")
  cleaned_book['BookName'] = book['BookName'].replace('\n', '')
  # Rating is always <= 5 and 2 decimal places
  cleaned_book['AverageRating'] = float(re.search('\d\.\d{2}', book['AverageRating']).group())
  cleaned_book['RatingCount'] = extractInt(book['RatingCount'])
  cleaned_book['Score'] = extractInt(book['Score'])
  cleaned_book['TotalPeopleVoted'] = extractInt(book['TotalPeopleVoted'])
  cleaned_book['AuthorName'] = book['AuthorName']
  return cleaned_book

def extractInt(text: str) -> int:
  """ Extracts a integer from a string, dealing with commas."""
  return int(re.search('\d+(,\d)?', text).group().replace(',', ''))

def batch_write_to_firestore(db: firestore.Client, books: list):
  """Writes a list of books to a firestore collection named 'cantwaitbooks2022'.

  Args:
    db: Firestore client
    books: list of Book dicts
  """
  batch = db.batch()
  col_ref = db.collection(u'cantwaitbooks2022')
  for book in books:
    doc_ref = col_ref.document() # No argument -> auto-gen ID
    batch.set(doc_ref, {
      u'bookname': book['BookName'], 
      u'author': book['AuthorName'], 
      u'avg_rating': book['AverageRating'],
      u'rating_count': book['RatingCount'], 
      u'score': book['Score'], 
      u'total_people_voted': book['TotalPeopleVoted']
    })

  batch.commit()


with open('cantwaitbooks2022.csv', newline='') as books:
    books_reader = csv.DictReader(books)
    cleaned_book_data = []
    for row in books_reader:
      cleaned_book_data.append(clean_data(row))

    print('Batch writing data to firestore')
    # We do this 500 at a time due to the limit.
    for i in range(0, len(cleaned_book_data), 500):
      chunk = cleaned_book_data[i:i+500]
      print(f'Writing chunk of len {len(chunk)}')
      batch_write_to_firestore(fs, chunk)
