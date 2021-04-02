const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const projectSchema = mongoose.Schema({
    member:{
        type:Schema.Types.ObjectId,
        ref:'User'
    },
    contributionDegree:{
        type:Number
    },
    contributionResult:{
        type:Array
    },
    kakaoFile:{
        type:String
    },
    title:{
        type:String
    },
    members:{
        type:Array
    },
    getMedal:{
        type:Number //기본값 0 있으면 1 금메달임
    },
    getFreeRider:{
        type:Number //기본값 0 , 1이면 무임승차
    }


}, {timestamps:true})




const Project = mongoose.model('Project', projectSchema);

module.exports = { Project }