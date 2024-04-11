require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require("express");
const ejs = require("ejs");

const homeStartingContent = "Your home content goes here...";
const scheduleContent = "Your schedule content goes here...";
const contactContent = "Your contact content goes here...";
const registrationContent = "Your registration content goes here...";
const privacyContent = "Your privacy content goes here...";

const app = express();

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  serverApi: ServerApiVersion.v1,
  connectTimeoutMS: 30000,
  socketTimeoutMS: 30000,
  maxPoolSize: 10,
});


async function main() {
  const maxRetries = 5; // Set the maximum number of connection retries
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      await client.connect();
      break; // If the connection is successful, break out of the loop
    } catch (e) {
      console.error(`Connection attempt ${retryCount + 1} failed:`, e);
      retryCount++;
      const delay = Math.pow(2, retryCount) * 1000;

      // Wait for a moment before retrying (adjust as needed)
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  if (retryCount === maxRetries) {
    console.error('Max connection retries reached. Exiting application.');
    process.exit(1);
  } else {
    console.log('Connected to MongoDB successfully.');
  }

}

process.on('exit', () => {
  if (client.isConnected()) {
    console.log('Closing MongoDB connection...');
    client.close();
  }
});

main().then(() => {
  // Start your Express server or any other application logic
  app.listen(3000, function () {
    console.log("Server started on port 3000");
  });
}).catch(console.error);

import('emailjs').then((emailjsModule) => {
  const { SMTPClient } = emailjsModule;

  const emailConfig = {
    user: 'bangaloreadigurupuja@gmail.com',
    password: process.env.EMAIL_PASSWORD,
    host: 'smtp.gmail.com',
    ssl: true,
  };

  const emailClient = new SMTPClient(emailConfig);

  async function sendEmail(urn, userEmail,userName) {
    try {
      const message = {
        from: 'Registration Team <bangaloreadigurupuja@gmail.com>',
        to: `${userName} <${userEmail}>`,
        cc: 'else <sykarpujaseminar@gmail.com>',
        subject: 'Registration Confirmation - Shri AdiGuru Puja Bengaluru 2024',
        attachment: [
          { data: `<html>
              <strong>Dear ${userName}</strong>,<br>
              Jai Shri Mataji 🙏🏻💝<br><br>
              Thank you for completing the registration process. We are delighted to inform you that your registration for the <strong>Shri AdiGuru Puja</strong> has been successful.😄<br><br>
              Your Unique Registration Number (URN) is: <strong>${urn}</strong>.<br><br>
              We look forward to celebrating this auspicious occasion with you.<br><br>
              Best Regards,<br>
              <strong>The Registration Team 💝</strong>
              </html>`, alternative: true }
        ]
      };
      await emailClient.sendAsync(message);
    } catch (err) {
      console.error('Error sending email:', err);
    }
  }

  async function insertNewRegex(client, newItem){
    await client.db("blog").collection("registration").insertOne(newItem);
  }

  async function insertNewPayex(client, newItem){
    await client.db("blog").collection("payerDetails").insertOne(newItem);
  }

  async function insertSyDetails(client, details) {
    await client.db("blog").collection("sydetails").insertMany(details);
  }

  app.use(express.static(__dirname + "/public"));

  app.use(express.urlencoded({extended:true}));

  app.set('view engine', 'ejs');

  app.use(express.static(__dirname + "/public"));

  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong! Please retry or contact technical team.');
  });

  app.get("/",async function(req,res){
    
    res.render("home",{content:homeStartingContent});
  });

  app.get("/schedule",function(req,res){
    res.render("schedule",{content:scheduleContent});
  });

  app.get("/bengaluru",function(req,res){
    res.render("bengaluru",{content:scheduleContent});
  });

  app.get("/privacy",function(req,res){
    res.render("privacy",{content:privacyContent});
  });

  app.get("/contact",function(req,res){
    res.render("contact",{content:contactContent});
  });

  app.get("/confirmation", function (req, res) {
    // You can render the confirmation view without any dynamic data if needed
    res.render("confirmation");
  });

  // Assuming you have a route like this in your app.js or index.js
  app.get("/registration", function (req, res) {
    // You can set default values or calculate them based on your logic
    const numAdults = 0; // Replace with your actual value or calculation
    const numBals = 0; // Replace with your actual value or calculation
    const numYuvas = 0; // Replace with your actual value or calculation
    const totalAmount = 0; // totalAmount to be paid

    res.render("registration", { content: registrationContent, numAdults, numYuvas, numBals, totalAmount });
  });

  app.post("/registration", async function (req, res) {
    let urn = generateurn();
    const numAdults = parseInt(req.body.numAdults, 10);
    const numYuvas = parseInt(req.body.numYuvas, 10);
    const numBals = parseInt(req.body.numBals, 10);

    const yuvaDetails = [];
    const adultDetails = [];
    const balDetails = [];
    const syDetails = [];

    // Loop through and save yuva details
    for (let i = 1; i <= numYuvas; i++) {
      const yuvaName = req.body[`yuvaName${i}`];
      const yuvaAddress = req.body[`yuvaAddress${i}`];
      const yuvaGender = req.body[`yuvaGender${i}`];

      syDetails.push({ name: yuvaName, address: yuvaAddress, gender: yuvaGender, mobile: req.body.payerMobile, category: "Y", urn:urn });
      yuvaDetails.push({ name: yuvaName, address: yuvaAddress, gender: yuvaGender });
    }

    // Loop through and save adult details
    for (let i = 1; i <= numAdults; i++) {
      const adultName = req.body[`adultName${i}`];
      const adultAddress = req.body[`adultAddress${i}`];
      const adultGender = req.body[`adultGender${i}`];
      const seniorCitizen = req.body[`seniorCitizen${i}`];

      syDetails.push({ name: adultName, address: adultAddress, gender: adultGender, mobile: req.body.payerMobile, category: "A", urn:urn });
      adultDetails.push({ name: adultName, address: adultAddress, gender: adultGender, seniorCitizen:seniorCitizen  });
    }
    
    // Loop through and save bal details
    for (let i = 1; i <= numBals; i++) {
      const balName = req.body[`balName${i}`];
      const balAddress = req.body[`balAddress${i}`];
      const balGender = req.body[`balGender${i}`];
      
      syDetails.push({ name: balName, address: balAddress, gender: balGender, mobile: req.body.payerMobile, category: "C", urn:urn });
      balDetails.push({ name: balName, address: balAddress, gender: balGender });
    }
    
    let payerDetails = {
      firstName: req.body.payerFirstName,
      email: req.body.payerEmail,
      mobileNo: req.body.payerMobile,
      district: req.body.payerDistrict,
      state: req.body.payerState,
      panNo: req.body.payerPAN,
    };
    const payerEmail = payerDetails.email;
    const payerName = payerDetails.firstName;
    
    // console.log(payerDetails);

    // console.log(req.body);
    
    try {
      const totalAmount = parseInt(req.body.totalAmount, 10)
      
      await insertNewRegex(client, {
        adults: adultDetails,
        yuvas: yuvaDetails,
        bals: balDetails,
        numAdults: numAdults,
        numYuvas: numYuvas,
        numBals: numBals,
        payerDetails: payerDetails,
        urn: urn,
        utrNumber:req.body.utrNumber,
        totalAmount:totalAmount,
        arrivalDate: req.body.arrivalDate,  
        arrivalTime: req.body.arrivalTime,
        arrivalLocation: req.body.arrivalLocation,
        registrationDate: new Date()
      });

      await insertNewPayex(client, {
        payerDetails: payerDetails,
        adults: numAdults,
        yuvas: numYuvas,
        bals: numBals,
        urn: urn,
        utrNumber:req.body.utrNumber,
        totalAmount:totalAmount,
        amountReceived:0,
        registrationDate: new Date(),
      });
      await insertSyDetails(client, syDetails);
      if (payerEmail) {
        await sendEmail(urn, payerEmail, payerName);
      }
      res.render("confirmation", { urn });
    } catch (error) {
      console.error(error);
      console.error(error.stack);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
}).catch((error) => {
  console.error('Error importing emailjs:', error);
});

// app.listen(3000, function() {
//     console.log("Server started on port 3000");
// });

function generateurn() {
  // Generate a random number or string (you can adjust the length as needed)
  const randomPart = Math.floor(Math.random() * 100000);

  // You can add more complexity or uniqueness if needed
  const registrationNumber = `JSM${randomPart}`;

  return registrationNumber;
}