/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
const MONGODB_CONNECTION_STRING = process.env.DB;
//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});

const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  commentcount: { type: Number, default: 0 },
  comments: [String]
});

const Book = mongoose.model('Book', bookSchema);

module.exports = function(app) {
  app
    .route('/api/books')
    .get(async function(req, res) {
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      await Book.find({}, '-__v -comments', (err, book) => {
        if (err) throw err;
        res.status(200).json(book);
      });
    })

    .post(async function(req, res) {
      var title = req.body.title;
      //response will contain new book object including atleast _id and title

      if (title) {
        const book = new Book({
          title: req.body.title
        });

        book.save();
        return res.status(201).json({ title: book.title, _id: book._id });
      } else {
        return res.status(400).send('must include title');
      }
    })

    .delete(async function(req, res) {
      //if successful response will be 'complete delete successful'
      await Book.deleteMany({});

      res.status(200).send('complete delete successful');
    });

  app
    .route('/api/books/:id')
    .get(async (req, res) => {
      const bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      try {
        res.json(await Book.findById(bookid, '-__v -commentcount'));
      } catch (error) {
        res.status(400).send('no book exists');
      }
    })

    .post(async (req, res) => {
      const bookid = req.params.id;
      const comment = req.body.comment;
      const book = await Book.findById(bookid, '-__v');

      book.commentcount++;
      book.comments.push(comment);
      book.save();

      const bookObject = {
        title: book.title,
        _id: book._id,
        comments: book.comments
      };

      res.status(201).json(bookObject);
    })

    .delete(async (req, res) => {
      const bookid = req.params.id;

      try {
        await Book.findByIdAndRemove(bookid);
        res.status(200).send('delete successful');
      } catch (error) {
        res.status(400).send('no book exists');
      }
    });
};
