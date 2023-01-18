require("dotenv").config();
const express = require('express');
const multer = require('multer');
const { s3Uploadv2 } = require("./s3");
const uuid = require('uuid').v4;

const app = express();




const storage = multer.memoryStorage()

const fileFilter = (req,file,cb)=>{
    if(file.mimetype.split("/")[0] === 'image'){
        cb(null, true)
    }else{
        cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE"),false)
    }
}

const upload = multer({ storage,fileFilter, 
    limits:
    {
        fileSize: 1000000000, 
        file: 2}})
app.post('/upload', upload.array("file"), async(req, res) => {
    try {
        const results = await s3Uploadv2(req.files)
        console.log(results)
        return res.json({ status: "success"});
    } catch (err) {
        console.log(err)
    }
    
});

app.use((error,req,res,next)=>{
    if(error instanceof multer.MulterError){
        if(error.code === "LIMIT_FILE_SIZE"){
            return res.json({
                message: "file is too large"
            });
        }

        if(error.code === "LIMIT_FILE_COUNT"){
            return res.json({
                message: "File limit reached"
            })
        }

        if(error.code === "LIMIT_UNEXPECTED_FILE"){
            return res.status(400).json({
                message: "File must be an image"
            })
        }
    }
})

app.listen(4000, () => console.log("Listening on port 4000"));