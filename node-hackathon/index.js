const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const mongodb = require("mongodb");

const bcrypt = require("bcryptjs");
const dotenv = require('dotenv').config();
const nodemailer = require('nodemailer');
const randomstring = require("randomstring");

const app = express();
//const app = express();
app.use(bodyParser.json());
app.use(cors());

const db_url = process.env.db_url;

app.post("/register", async (req, res) => {
    try {
        let client = await mongodb.MongoClient.connect(db_url);
        let db = client.db("studentdb");
      //let data = await db.collection("users").findOne({ email: req.body.email });
      if (req.body.role == 'admin') {
        let salt = await bcrypt.genSalt(12);
        let hash = await bcrypt.hash(req.body.password, salt);
        req.body.password = hash;
        let result = await db.collection("admin").insertOne(req.body);
        res.status(200).json({ message: "Registered successfully" });
        client.close();
      } else {
        let salt = await bcrypt.genSalt(12);
        let hash = await bcrypt.hash(req.body.password, salt);
        req.body.password = hash;
        let result = await db.collection("clients").insertOne(req.body);
        res.status(200).json({ message: "Registered successfully" });
        client.close();
      }
    } catch (err) {
      console.log(err);
    }
  });
  app.post("/login", async (req, res) => {
    try {
        let client = await mongodb.MongoClient.connect(db_url);
        let db = client.db("studentdb");
      
      if (req.body.role == 'admin') {
        let data = await db.collection("admin").findOne({ email: req.body.email });
        let compare = await bcrypt.compare(req.body.password, data.password);
        if (compare) {
          console.log("valid user", compare);
          res.status(200).json({
            status: 200,
            message: "login success",
            msg:compare
          });
        } else {
          res.status(403).json({
            status: 403,
            message: "invalid password",
            msg:compare

          });
        }
        //client.close();
      } else {
        let data = await db.collection("clients").findOne({ email: req.body.email });
        let compare = await bcrypt.compare(req.body.password, data.password);
        if (compare) {
          console.log("valid user", compare);
          res.status(200).json({
            status: 200,
            message: "login success",
            msg:compare
          });
        } else {
          res.status(403).json({
            status: 403,
            message: "invalid password",
            msg:compare

          });
        }
      }
    } catch (err) {
      console.log(err);
    }
  });

  app.post("/add",async(req,res)=>{
      try{
        let client = await mongodb.MongoClient.connect(db_url);
        let db = client.db("studentdb"); 
        let result = await db.collection("theater").insertOne(req.body);
        console.log(result)
        res.status(200).json({ message: "Theater Added" });
      }
      catch(err){
          console.log(err);
      }
  })

  app.get("/theater",async(req,res)=>{
      try{
    let client = await mongodb.MongoClient.connect(db_url);
    let db = client.db("studentdb");
    let data = await db.collection("theater").find().toArray();
      res.status(200).json(data);
      }
      catch(err){
          console.log(err);
      }

  })


  app.post("/getShows",async(req,res)=>{
      try{
    let client = await mongodb.MongoClient.connect(db_url);
    let db = client.db("studentdb");
    let data = await db.collection("theater").find({movie:req.body.movie , date:req.body.date}).toArray();
    res.status(200).json(data);

      }
      catch(err){
          console.log(err);
      }
  
  })

  app.post("/book",async(req,res)=>{
      try{
        let client = await mongodb.MongoClient.connect(db_url);
        let db = client.db("studentdb");
        let result = await db.collection("bookings").insertOne(req.body);
        console.log(result)
        let seats = req.body.bseats-req.body.seats;
        console.log(seats,req.body.s,req.body.seats)
        let result1 = await db.collection("theater").updateOne({name:req.body.name,movie:req.body.movie,date:req.body.date},{$set:{shows:{time:{available:seats,stime:req.body.time}}}});
       console.log(result1)
       var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
        user: 'manoharchunchu1249@gmail.com',
        pass: 'manohar123456'
        }
        });
        
        var mailOptions = {
        from: 'manoharchunchu1249@gmail.com',
        to: req.body.mail,
        subject: 'Ticket Details',
        text: `Movie name ${req.body.movie}`,
        html: `<h3>Theater: ${req.body.name} </h3><h3>Date:${req.body.date}</h3><h3>Time:${req.body.time}</h3><h3>BookedBy:${req.body.customer}</h3>`,
        };
        
        transporter.sendMail(mailOptions, function(error, info){
        if (error) {
        console.log(error);
        } else {
        console.log('Email sent: ' + info.response);
        
        }
        });
    
        res.status(200).json({ message: "Booking Successfull" });
      }
      catch(err){
          console.log(err);
      }
  })
  app.post("/getBookings",async(req,res)=>{
      try{
        let client = await mongodb.MongoClient.connect(db_url);
        let db = client.db("studentdb");
        let data = await db.collection("bookings").find({date:req.body.date}).toArray();
        res.status(200).json({ message: "Booking Successfull" ,
            result:data});
      }
      catch(err){
          console.log(err);
      }
  })


  app.listen(process.env.PORT || 5000,()=>{
    console.log(db_url);
});

