const express = require('express');
const { Project } = require('../models/Project');
const router = express.Router();
const multer=require("multer");
const {PythonShell} = require('python-shell');



//=================================
//             project
//=================================


var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/txt')
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}`) 
    },
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname)
        if (ext !== '.txt') { //txt만 될수 있도록
            return cb(res.status(400).end('only txt is allowed'), false);
        }
        cb(null, true)
    }
})

var upload = multer({ storage: storage }).single("file")



router.post("/getProjects", (req, res) => {
    Project.find({ "member": req.body.userId })
    .exec((err, projects)=>{
        if(err) return res.status(400).send(err)
        res.status(200).json({success:true, projects})
    })
});

router.post("/getMedalProjects", (req, res) => {
    Project.find({ "member": req.body.userId, "getMedal": 1})
    .exec((err, medalProjects)=>{
        if(err) return res.status(400).send(err)
        res.status(200).json({success:true, medalProjects})
    })
});

router.post("/getFreeRiderProjects", (req, res) => {
    Project.find({ "member": req.body.userId, "getFreeRider": 1})
    .exec((err, freeRiderProjects)=>{
        if(err) return res.status(400).send(err)
        res.status(200).json({success:true, freeRiderProjects})
    })
});


router.post("/saveProject", (req, res) => {
    const project = new Project(req.body)
    project.save((err, doc)=>{
        if(err) return res.send(err)
        res.status(200).json({success:true, doc})
    })
});

router.post("/uploadfiles", (req, res, next) => {
    console.log("hi")
    //여기서 python 실행하기 
    //PythonShell.runString('x=1+1;print(x)', null, function (err) {
        //if (err) throw err;
        //console.log('finished');
    //})

    

    upload(req, res, err => {
        if (err) {
            return res.json({ success: false, err })
        }
        let filePath = res.req.file.path;
        var options={ //이 옵션으로 파이썬과 통신
            mode : 'text', //txt파일같은거. 
            encoding : 'utf8', //인코딩 utfi
            pythonOptions:['-u'],
            scriptPath:`${__dirname}`, //스크립트 있는곳
            args : [filePath], //python에게 전달
            //pythonPath: '/usr/bin/python3' //파이썬 폴더
        };
        
        let members = [];
        let members_contribution_degree= [];
        let img_path = [];
        var test = new PythonShell('/test.py', options); 
        test.on('message', function (message){
            console.log(message);
        })
        // members: members, members_contribution_degree: members_contribution_degree, img_path:img_path
        return res.json({ success: true, filePath: res.req.file.path, fileName: res.req.file.filename })
    })

});

router.post("/uploadProject", (req, res) => {
    //파일 정보들 저장
    
    const project = new Project(req.body)
    project.save((err, doc)=>{
        if(err) return res.json({success:false, err})
        res.status(200).json({success:true})
    })
});


router.post("/deleteProject", (req, res) => {

    Project.findOneAndDelete({ "_id" : req.body.id, "member" : req.body.member })
    .exec((err, doc) => {
        if(err) return res.status(400).send(err) 
        res.status(200).json({success: true, doc })
    })

});

module.exports = router;
