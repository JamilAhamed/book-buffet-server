const express = require('express')
const app = express();
// const port = 5000;
const cors = require('cors');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()

const port =process.env.PORT || 5000;
// console.log(process.env.DB_USER)


app.use(cors());
app.use(express.json());


app.get('/', (req, res) => {
  res.send('Welcome to Book-Buffet Server')
})


// const ObjectID = require('mongodb').ObjectID;

const {ObjectId} = require('mongodb');

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.q1a8q.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
//  console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  console.log(err);
  const booksCollection = client.db("bookBuffet").collection("books");
  const ordersCollection = client.db("bookBuffet").collection("Orders");

  //delete
  app.delete('/deleteBook/:id', (req, res) => {
    booksCollection.deleteOne({ _id: ObjectId(`${req.params.id}`) })
      .then(result => {
        res.send(result.deletedCount > 0)
      })
  })

  app.delete('/deleteOrder/:id', (req, res) => {
    ordersCollection.deleteOne({ _id: ObjectId(`${req.params.id}`) })
      .then(result => {
        res.send(result.deletedCount > 0)
      })
  })


  //patch
  app.patch('/edit/:id', (req, res) => {
    booksCollection.updateOne({ _id: ObjectId(`${req.params.id}`) }, {
      $set: { name: req.body.name, author: req.body.author, price: req.body.price }
    })
      .then(result => res.send(result.modifiedCount > 0))
  })

  //add
  app.post('/addBook', (req, res) => {
    const productInfo = req.body;
    booksCollection.insertOne(productInfo)
      .then(result => {
        res.send(result.insertedCount > 0)
      })
  })

  app.post('/addOrders', (req, res) => {
    const orderInfo = req.body;
    ordersCollection.insertOne(orderInfo)
      .then(result => {
        res.send(result.insertedCount > 0)
      })
  })


  //get value from api
  app.get('/orders', (req, res) => {
    ordersCollection.find({})
      .toArray((err, documents) => {
        res.send(documents)
      })
  })

  app.get('/userOrders', (req, res) => {
    const queryEmail = req.query.email;

    ordersCollection.find({ email: queryEmail })
      .toArray((err, documents) => {
        res.send(documents)
      })
  })

  app.get('/books', (req, res) => {
    booksCollection.find({})
      .toArray((err, documents) => {
        res.send(documents)
      })
  })
  app.get('/book/:id', (req, res) => {
    booksCollection.find({ _id: ObjectId(`${req.params.id}`) })
      .toArray((err, documents) => {
        res.send(documents)
      })
  })
});

app.listen(process.env.PORT || port)