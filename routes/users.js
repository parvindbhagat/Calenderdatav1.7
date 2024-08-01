const mongoose = require('mongoose');
const plm = require('passport-local-mongoose');


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://parvindbhagat:N2DbOtD5LZFcsXTV@cluster0.fginkoc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

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
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);


// Connect to MongoDB Atlas
mongoose.connect(uri)
.then(() => {
  console.log('Connected to MongoDB Atlas');
})
.catch((err) => {
  console.error('Error connecting to MongoDB Atlas:', err.message);
});
//mongoose.connect("mongodb://127.0.0.1:27017/calendar_db");

const userSchema = new mongoose.Schema({
  fullName: String,
  username: String,
 //email to be used as username, username field is mandatory for passport local
  location: String,
  industry: String,
  role: String,
  empCode: String,
  contact: Number,
  dates:{
    type: Array,
    default: []
  }
})
userSchema.plugin(plm);
module.exports = mongoose.model("user", userSchema);