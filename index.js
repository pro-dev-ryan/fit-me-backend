import express from 'express';
import dotenv from 'dotenv';
import mysql from 'mysql';
import cors from 'cors';
import multer  from 'multer';
import path from 'path'

const store = multer.diskStorage({
destination: (req, file, cb)=>{
cb(null, 'upload_images')
},
filename: (req,file,cb)=>{
  const fileExt  = path.extname(file.originalname);
  const fileName = file.originalname.replace(fileExt, "").toLowerCase().split(' ').join('-') + "-" + Date.now()
  cb(null, fileName + fileExt )
}
})
const uploads = multer({
storage: store,
limits:{
  fileSize: 500000
}
})
const port = process.env.PORT || 5000;
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const db = mysql.createConnection(
 {host:process.env.HOST,
  user:process.env.USER,
  password:process.env.PASS,
  database:process.env.DATABASE}
)

db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL: ' + err.stack);
        return;
    }
    console.log('Connected to MySQL as id ' + db.threadId);
});


app.get('/', (req, res)=> res.send('Engine is on action'));

app.get("/users", (req,res)=> {
  const query = "SELECT * FROM users"
  db.query(query, (err, data)=>{
    if(err){
    console.error(err);
    return res.send("Something Went Wrong")
    }
    return res.send(data)
  })
})

app.post("/users",uploads.single('avatar') ,(req, res)=> {
  const query = "INSERT INTO users (`email`, `password`, `type`) VALUES (?)";
  const values = [
    `${req.body.email}`,
    `${req.body.password}`,
    `${req.body.type}`
  ];

  db.query(query, [values],(err, data)=>{
    if(err) return res.send("Something Went Wrong")
    else return res.send(data)
  })
 res.send('Member Added')
})

app.listen(port , ()=> {
  'app is listening on', port})
