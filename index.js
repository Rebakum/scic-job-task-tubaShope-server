const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const app = express()
const port = process.env.PORT || 5000
const corsOptions = {
  origin: [
    'http://localhost:5174',
    'http://localhost:5173',
    'https://tubashope.web.app'
  ]
}

//Middleware
app.use(cors(corsOptions));
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.upnu39b.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {

    const productCollection = client.db('tubaShopeDB').collection('product');
    const testimonialCollection = client.db('tubaShopeDB').collection('testimonial');

    //----------- product get----------
    // app.get('/products', async (req, res) => {
    //   const products = await productCollection.find().toArray()
    //   res.send(products)
    // })
    //----------- product get----------
    app.get('/products', async (req, res) => {
      const searchQuery = req.query.search || '';
      const query = searchQuery
        ? { productName: { $regex: searchQuery, $options: 'i' } }
        : {};

      const products = await productCollection.find(query).toArray();
      res.send(products);
    });



    // This is a combine api which contain all features
    app.get("/all-products", async (req, res) => {
      const { search, brand, category, price, sortPrice, sortDate, page, size } = req.query;

      // defile a object for all queries
      const queries = {};

      // searching statement
      if (search) {
        queries.$or = [
          { productName: { $regex: search, $options: "i" } },
          { price: { $regex: search, $options: "i" } },
          { category: { $regex: search, $options: "i" } },
          { brandName: { $regex: search, $options: "i" } },
        ]
      }


      // create a pipline for find out all conditional data
      const pipline = [
        { $match: queries }
      ]


        // now find result
        try{
            const result = await productCollection.aggregate(pipline).toArray();
            res.send(result)
        }
        catch(err){
          console.log(err)
        }
    })




    //----------------testimonial--------
    app.get('/testimonials', async (req, res) => {
      const result = await testimonialCollection.find().toArray()
      res.send(result)
    })




    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);
app.get('/', (req, res) => {
  res.send('tuba shope server running')
});
app.listen(port, () => {
  console.log(`server is running on ${port}`)
})

