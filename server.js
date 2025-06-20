require('dotenv').config();

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const Schema = mongoose.Schema
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const cron = require('node-cron');
const axios = require('axios');
const { body } = require('express-validator');
const multer = require('multer');
const { google } = require('googleapis');
const fs = require('fs');
const stream = require("stream");
const { customAlphabet } = require('nanoid');
const autoIncrement = require("mongoose-sequence")(mongoose);


//function keepServerAwaike() {
//  http.get('https://mymongoose.onrender.com', (res) => {
//    console.log(`Status Code: ${res.statusCode}`);
//}).on('error', (e) => {
//  console.error(`Error: ${e.message}`);
//});
//}

// Schedule the task to run every 5 minutes
//cron.schedule('*/14 * * * *', () => {
//  console.log('Sending keep-alive request to server...');
// keepServerAwaike();
//});

// Google Drive API setup

const serverUrl = 'https://namsimsu.mydatabase.com.ng';

const keepAlive = () => {
    axios.get(serverUrl)
        .then(response => {
            console.log(`server response with status:${response.status}`)
        })
        .catch(error => {
            console.log(`error keeping server alive:${error.message}`)
        })
}

const oauth2Client = new google.auth.OAuth2(
    '299799989715-9j5t32aoriem1chgjkd1d91vleh9njni.apps.googleusercontent.com',
    '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',
    'https://developers.google.com/oauthplayground'
);

oauth2Client.setCredentials({ refresh_token: '1//04SleHQlO68aLCgYIARAAGAQSNwF-L9IrZKYFd3YWazjkliZA_Z3tO98_P1q76Eb-_zLAugY-fN2A6M0kHNABfJL9OEnrB90YC3c' });

const drive = google.drive({ version: 'v3', auth: oauth2Client });


//function keepServerAwaike() {
//axios.get('https://mymongoose.onrender.com', (res) => {
// console.log(`Status Code: ${res.statusCode}`);
//}).on('error', (e) => {
//console.error(`Error: ${e.message}`);
//});
//}

//Schedule the task to run every 5 minutes
cron.schedule('*/14 * * * *', () => {
    console.log('Sending keep-alive request to server...');
    keepAlive;
});

console.log('Keep-alive script started.');



const app = express()
const PORT = process.env.PORT || 8000

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

//const uid = function Generateuniquid() { return ('0000' + (Math.random() * (100000 - 101) + 101) | 0).slice(-5); }



app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

mongoose.set('strictQuery', false);
const connectDB = async() => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}



var NoteSchemer = new Schema({
    field: { type: String, default: () => uuidv4(), required: true },
       Aname: {
        Name: { type: String, uppercase: true },
        Mname: { type: String, uppercase: true },
        Surname: { type: String, uppercase: true }
    },
    fullname: { type: String, uppercase: true },
    State: { type: String, uppercase: true },
    LocalGovt: { type: String, uppercase: true },
    Sex: { type: String, uppercase: true },
    Bloodgroup: { type: String, uppercase: true },
    Gender: { type: String, uppercase: true },
    Bloodgroup: { type: String, uppercase: true },
    PhoneNo: { type: String, uppercase: true },
    EmergencyNo: { type: String, uppercase: true },
    RegNo: { type: String, uppercase: true, unique: true },
    Validity: { type: String, uppercase: true },
    picturepath: { type: String },
    imgurl: { type: String },
    imgurli: { type: String },
    time: { type: String, uppercase: true }
},
{ id: false},);

NoteSchemer.plugin(autoIncrement, {inc_field:'id'});


var Rightrealm = mongoose.model("Rightrealm", NoteSchemer);

app.use('/public', express.static(__dirname + '/public'));

const uuidfh = customAlphabet('123456890',5);

async function uploadImageToGoogleDrive(file) {
    const bufferStream = new stream.PassThrough();
    bufferStream.end(file.buffer);
    const uuid = uuidfh() + '.jpg';
    const fileMetadata = {
        name: uuid,
        //name: file.originalname,
        parents: ["10KpoRo-jHT62ko_7BNH9khxA2S_6GY42"],
    };

    const media = {
        mimeType: file.mimetype,
        body: bufferStream
    };

    const response = await drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id,webViewLink,name'
    });

    return response.data
}

app.get('/detail', async(req, res) => {
    try {
        const data = await Rightrealm.find() .sort({_id:-1});
        res.json(data);
    } catch (err) {
        console.log(err);
        res.status(500).send("Internal Server Error");
    }
});

app.get('/ASSA', async(req, res) => {
    try {
        const data = await Note.find();
        const dataa = data.filter(o => o.School === 'AMARAKU SECONDARY SCHOOL AMARAKU')
        res.json(dataa);
    } catch (err) {
        console.log(err);
        res.status(500).send("Internal Server Error");
    }
});

app.post("/", upload.single('image'), async(req, res) => {
    try {
        const Pathoo = await uploadImageToGoogleDrive(req.file);
       const imagePath = Pathoo.name;
        const urli =  Pathoo.webViewLink;
        const urlii =  'https://lh3.googleusercontent.com/d/' + Pathoo.id + '=s400?authuser=0';

        function pad(n) {
            return n < 10 ? '0' + n : n;
        }

        // Get the current date and time
        const now = new Date();
        const year = now.getFullYear();
        const month = pad(now.getMonth() + 1); // Months are zero-based
        const day = pad(now.getDate());
        const hours = pad(now.getHours());
        const minutes = pad(now.getMinutes());
        const seconds = pad(now.getSeconds());

        // Format the date and time
        const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;


        let newNote = new Note({
            Aname: {
                 Name: req.body.Name,
                 Mname: req.body.Mname,
                 Surname: req.body.Surname
             },
            fullname: req.body.fullname,
            State: req.body.State,
            LocalGovt: req.body.LocalGovt,
            Sex: req.body.Sex,
            Bloodgroup: req.body.Bloodgroup,
            PhoneNo: req.body.PhoneNo,
            EmergencyNo: req.body.EmergencyNo,
            RegNo: req.body.RegNo,
            Validity: req.body.Validity,
            picturepath: imagePath,
            imgurl: urli,
            imgurli: urlii,
            time: formattedDate,
            
        });


        await newNote.save();
        res.redirect(`rightrealm/sample.html`)
    } catch (error) {
        res.status(500).send('Error saving data');
    } //finally {
    //fs.unlinkSync(req.file.path); // Clean up the uploaded file
    //}
    //res.json({message: `Post added successfully! Your Post Id is ${newPost.id}`,});
    //res.redirect("/"); <h1 style="font-size:5rem; margin-top:0rem;text-align: center;">${newNote.EmergencyNo}</h1>
})




connectDB().then(() => {
    app.listen(PORT, () => {
        console.log("listening for requests");
    })
});
