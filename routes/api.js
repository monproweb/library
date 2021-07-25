'use strict';
const mongoose = require('mongoose');
const mongodb = require('mongodb');
const bookSchema = require('../schema');

module.exports = function (app) {

  app.route('/api/books')
    .get((req, res, next) => {

      bookSchema.find()
        .select('-__v')
        .exec()
        .then(result => {
          return res.json(result);
        })
        .catch(next);

    })
    
    .post((req, res, next) => {
      
      const {title} = req.body;
      //create a new book
      const book = new bookSchema({
        title
      });
      //create the response object since save() does not allow chaining select() to specify desired fields
      const response = {
        _id: book._id,
        title: title
      };

      book.save()
      .then(result => {
        if(result) return res.json(response);
      })
      .catch(err => {
        //fcc has specified custom response messages for validation errors, so no need to parse the error object to find the reason an operation fails
        if(err) return res.send('missing required field title');
      });

    })
    
    .delete(function(req, res, next){
      //while this request deletes all books, the response is never shown
      bookSchema.deleteMany({})
      .exec()
      .then(result => {
        //res.send('complete delete successful');
        return res.json('complete delete successful');
      })
      //here the only error likely to occur is a server error
      .catch(next)

    });



  app.route('/api/books/:id')
    .get((req, res, next) => {
      let bookid = req.params.id;
      
      bookSchema.findById(bookid)
      .exec()
      .then(result => {
        if(!result) return res.send('no book exists');  
        return res.json(result);
      })
      //here the only error likely to occur is a server error or an invalid id error
      .catch(err => res.send('no book exists'));

    })
    
    .post((req, res, next) => {
      let bookid = req.params.id;
      let comment = req.body.comment;

      if(!comment) return res.send('missing required field comment');
      //since any request to this route requires the comment field and there will be no comment deletion functionality, simply incrementing commentcount (via $inc) is fine.
      let updateComment = {
        $push : {comments: comment},
        $inc : {commentcount: 1}
      };

      bookSchema.findByIdAndUpdate(bookid, updateComment, {new: true},
      (err, result) => {
        //same response for both id syntax error (err) and bookid that doesn't exist in the db (result) 
        if(err || !result) return res.send('no book exists');
        return res.json(result);
      });

    })
    
    .delete((req, res, next) => {
      let bookid = req.params.id;

      bookSchema.findByIdAndDelete(bookid, (err, result) => {
        if(err || !result) return res.send('no book exists');
        else {
          return res.send('delete successful');
        }
      });

    });
  
};