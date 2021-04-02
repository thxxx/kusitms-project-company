import React, { useEffect, useState } from 'react'

import { FaCode } from "react-icons/fa";
import { Card, Avatar, Col, Typography, Row, Form, Modal, Button } from 'antd';
import axios from 'axios';
import moment from 'moment';

import { Table, Jumbotron } from 'react-bootstrap';
import '../LandingPage/landing.css';

const { Title } = Typography;
const { Meta } = Card;

function LandingPage() {

    const [Videos, setVideos] = useState([])
    // 몽고디비에서 가져온다 값을. axios get으로 보내고,
    /*
    const [Projects, setProjects] = useState([])

    useEffect(() => {
        axios.get('/api/project/getProjects')
        .then(response => {
            if (response.data.success) {
                console.log(response.data.projects.title)
                setProjects(response.data.projects)
            } else{
                alert('Failed to get Projects')
            }
        })
    }, [])
    */

    useEffect(() => {
        axios.get('/api/video/getVideos')
            .then(response => {
                if (response.data.success) {
                    console.log(response.data.videos)
                    setVideos(response.data.videos)
                } else {
                    alert('Failed to get Videos')
                }
            })
    }, [])

/*
    const renderCards = Projects.map((project, index) => {

        var uploadDate = project.uploadDate;

        return <Col lg={24} md={24} xs={24}>
            <div style={{ position: 'relative' }}>
                <a href={`/video/${video._id}`} >
                <div className=" duration"
                    style={{ bottom: 0, right:0, position: 'absolute', margin: '4px', 
                    color: '#fff', backgroundColor: 'rgba(17, 17, 17, 0.8)', opacity: 0.8, 
                    padding: '2px 4px', borderRadius:'2px', letterSpacing:'0.5px', fontSize:'12px',
                    fontWeight:'500', lineHeight:'12px' }}>
                    <span> {minutes} : {seconds}</span>
                </div>
                </a>
            </div><br />
            
            <span>{video.writer} </span><br />

            <span style={{ marginLeft: '3rem' }}>  {video.title} : {video.views}</span>
            
            - <span> {moment(video.createdAt).format("MMM Do YY")} </span>
        </Col>

    })

*/
// 삭제 버튼


const [isModalVisible, setIsModalVisible] = useState(false);

const showModal = () => {
  setIsModalVisible(true);
};

const handleOk = () => {
    onClickDelete();
    setIsModalVisible(false);
};

const handleCancel = () => {
    console.log("잘하");
    setIsModalVisible(false);
};

const onClickDelete = (videoId, writer)=>{
    const variables = {
        videoId,
        writer
    }
    axios.post('/api/video/deleteVideo', variables)
    .then(response=>{
        if(response.data.success){
            alert('리스트에서 지우는데 성공했습니다.')
        }else{
            alert('리스트에서 지우는데 실패했습니다.')
        }
    })
}



    const renderCards = Videos.map((video, index) => {

        var minutes = Math.floor(video.duration / 60);
        var seconds = Math.floor(video.duration - minutes * 60);

        return <Row>
            <div style={{ position: 'relative' }}>
                <a href={`/video/${video._id}`} >
                <div className=" duration"
                    style={{ bottom: 0, right:0, position: 'absolute', margin: '4px', 
                    color: '#fff', backgroundColor: 'rgba(17, 17, 17, 0.8)', opacity: 0.8, 
                    padding: '2px 4px', borderRadius:'2px', letterSpacing:'0.5px', fontSize:'12px',
                    fontWeight:'500', lineHeight:'12px' }}>
                    <span> {minutes} : {seconds}</span>
                </div>
                </a>

            </div><br />
            <Col>
                <span style={{ marginLeft: '3rem' }}> {video.writer} </span><br />
            </Col>
            <Col>
            <span style={{ marginLeft: '3rem' }}>  {video.title} : {video.views}</span>
            - <span> {moment(video.createdAt).format("MMM Do YY")} </span>
            </Col>
        </Row>

    })

    const redee = Videos.map((video, index) => {

        return <tr>
            <td>{index}</td>
            <td>{video.title}</td>
            <td>{video.writer}</td>
            <td>201.2.2</td>
            <td>
            <Button type="primary" onClick={showModal}>
                Open Modal
            </Button>
            </td>
        </tr>
    })
    
    return (
        <div style={{ width: '85%', margin: '3rem auto' }}>
            <Title level={2} > 나의 분석 기록 </Title>
            <hr />

        <header style={{margin: "auto", width:"75%" }} >
            <Jumbotron>
                <h1> 나의 분석 기록 </h1>
                <p>
                    You can delete or view details
                </p>
            </Jumbotron>
            
            <Table striped bordered hover size="sm">
                <thead>
                    <tr>
                        <th>No</th>
                        <th style={{width:"70%"}}>Title</th>
                        <th>Author</th>
                        <th>기여도</th>
                        <th>관리</th>
                    </tr>
                </thead>

                <tbody>

                    {redee}

                
                <Modal title="Basic Modal" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
                    <p>Some contents...</p>
                    <p>Some contents...</p>
                    <p>Some contents...</p>
                </Modal>

                </tbody>

            </Table>
        </header>


            <Row gutter={[32, 16]}>
                
                {renderCards}

                <Col lg={6} md={8} xs={24}> {/* 윈도우 크기가 가장 클때 크기, 중간일때, 작을때 크기. */}

                </Col>
            </Row>
        </div>
    )
}

export default LandingPage




const express = require('express');
const { Project } = require('../models/Project');
const router = express.Router();


//=================================
//             project
//=================================

router.post("/getProjects", (req, res) => {
    Project.find({ "member": req.body.userId })
    .exec((err, projects)=>{
        if(err) return res.status(400).send(err)
        res.status(200).json({success:true, projects})
    })
});

router.post("/saveProject", (req, res) => {
    const project = new Project(req.body)
    project.save((err, doc)=>{
        if(err) return res.send(err)
        res.status(200).json({success:true, doc})
    })
});

router.post("/deleteProject", (req, res) => {

    Project.findOneAndDelete({ "title" : req.body.title, "member" : req.body.member })
    .exec((err, doc) => {
        if(err) return res.status(400).send(err) 
        res.status(200).json({success: true, doc })
    })

});

module.exports = router;


import React, { useState } from 'react';
import { Modal, Button } from 'antd';

const App = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    console.log("오케이");
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    console.log("아냐");
    setIsModalVisible(false);
  };

  return (
    <>
      <Button type="primary" onClick={showModal}>
        Open Modal
      </Button>
      <Modal title="Basic Modal" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
      </Modal>
    </>
  );
};

ReactDOM.render(<App />, mountNode);














import React, { useState, useEffect } from "react";
import { Layout, Menu, Breadcrumb, Row, Button,Radio } from 'antd';
import GridCards from "./Sections/GridCards";
import { withRouter } from 'react-router-dom';
import axios from 'axios';
import Profile from "../Profile/Profile";
import { Table, Button, Jumbotron } from 'react-bootstrap';

const { Header, Content, Footer, Sider } = Layout;
function MainPage(props) {
    const [UserInfo, setUserInfo] = useState([])
    //const [ProjectResult, setProjectResult] = useState([]) //제출 누르고 project db 가져오기
    const ProjectResult = ['img1', 'img2'] 
    const [Member, setMember] = useState("") //usestate 안해도될듯?
    const [Members, setMembers] = useState(['gg', 'aa', 'bb', 'vv']) //usestate안해도될듯?
    const [Projects, setProjects] = useState([])
 

    const onClickLogout = ()=>{
        axios.get('/api/users/logout').then(response => {
            if (response.status === 200) {
              props.history.push("/");
            } else {
              alert('Log Out Failed')
            }
          });
    }
    const onChangeRadio =(e)=>{
        setMember(e.target.value); //index값으로 저장됨. 
    }

    
    /////// 추가한거!!!!!
    // 클릭하면 프로젝트 지워진다.
    const onClickDelete = (title, member)=>{
        const variables = {
            title,
            member
        }

        

        axios.post('/api/project/deleteProject', variables)
        .then(response=>{
            if(response.data.success){
                alert('리스트에서 지우는데 성공했습니다.')
            }else{
                alert('리스트에서 지우는데 실패했습니다.')
            }
        })
    }
    /////// 추가한거!!!!!

    const onSaveResult = (e)=>{
        // 민영님이 저장하신 txt path경로,title & 데이터분석팀이 저장한 img path경로, members의 기여도 필요.
        // getMedal 여부= 자신의 기여도>= (100%n)*1.3 정도? 1.3인분 이상이면 medal획득?
        e.preventDefault();
        // let variables = {
        //     member:localStorage.getItem('userId'),
        //     contributionDegree: 40,
        //     title: 'project1',
        //     kakaoFile: 
        // }
        // axios.post('/api/project/savePeoject', variables)
        // .then(response=>{
        //     if(response.data.success){

        //     }else{
        //         alert("프로젝트 결과 분석 데이터를 저장하는데 실패했습니다.")
        //     }
        // })

    }
    useEffect(()=>{
        //유저 정보가져오기.
        let variable ={
            userId : localStorage.getItem('userId')
        }
        axios.post('/api/users/getUser', variable)
        .then(response=>{
            if(response.data.success){
                setUserInfo(response.data.userInfo)
                console.log(response.data.userInfo)
            }else{
                alert("저장된 유저정보를 가져오지 못했습니다.")
            }
        })
        
        // 처음에 자신이 그동안 했던 프로젝트들을 가져오기.
        axios.post('/api/project/getProjects', variable)
        .then(response=>{
            if(response.data.success){
                setProjects(response.data.projects)
                console.log(response.data.projects)
            }else{
                alert("저장된 프로젝트들을 가져오지 못했습니다.")
            }
        })
    },[])

    
    /////// 추가한거!!!!!
    // 프로젝트들 테이블로 띄우기
    const projectsTable = Projects.map((project, index) => {

        return <tr>
            <td>{index}</td>
            <td>{project.title}</td>
            <td>{project.contributionDegree}</td>
            <td>201.2.2</td>
            <td>
            <button onClick={()=>onClickDelete(project.title, porject.member)}>삭제</button>
            </td>
        </tr>
    })
    /////// 추가한거!!!!!


    return (
        <>
        <Layout style={{ minHeight: '100vh', backgroundColor:'#ffffff' }}>
            <Sider style={{backgroundColor:'#EDF8FF'}}>
               {/*프로파일 */}
               <Profile projects = {Projects} userInfo={UserInfo} />
            </Sider>
            <Layout  style={{ minHeight: '100vh', backgroundColor:'#ffffff', width:'80%', margin:'3rem'}}>
                    
                    <div style={{margin: '3rem'}}>
                        <div style={{ padding: 12}}>
                         <h2>카톡 분석기</h2>
                         {/*카톡 txt파일 */}
                         </div>

                        <div  style={{ padding: 12}}>
                            <h2>분석결과</h2>
                            <hr/>
                            

                            <Row gutter={[16, 16]}>
                            {ProjectResult && ProjectResult.map((result, index)=>(
                            <React.Fragment key={index}>
                                <GridCards 
                                    result={result}
                                />
                            </React.Fragment>
                            ))}
                            </Row>
                            
                            <Radio.Group onChange={onChangeRadio} value={Member}>
                                {Members && Members.map((member, index)=>(
                                <React.Fragment key={index}>
                                    <Radio value={index}>{member}</Radio>
                                </React.Fragment>
                                ))}
                            </Radio.Group>
                            <br/>
                            <div style={{display:'flex', justifyContent:'center', alignItems:'center'}}>
                            <Button type="primary" onClick={onSaveResult}>저장</Button>
                            </div>
                        </div>

                        {/*분석 기록 테이블 */}
                        <header style={{margin: "auto", width:"75%" }} >
                            <Jumbotron>
                                <h1> 나의 분석 기록 </h1>
                                <p>
                                    You can delete or view details
                                </p>
                            </Jumbotron>
                            
                            <Table striped bordered hover size="sm">
                                <thead>
                                    <tr>
                                        <th>No</th>
                                        <th style={{width:"60%"}}>프로젝트 명</th>
                                        <th>기여도</th>
                                        <th>날짜</th>
                                        <th>관리</th>
                                    </tr>
                                </thead>

                                <tbody>

                                    {projectsTable}

                                </tbody>

                            </Table>
                        </header>
                        

                        </div>

                    
                    
            
        
            </Layout>
            <Button onClick={onClickLogout} style={{positon:'absolute', top:'10px', right:'10px'}}>LOGOUT</Button>
        </Layout>
        </>
    )
}


export default withRouter(MainPage);



const express = require('express');
const { Project } = require('../models/Project');
const router = express.Router();


//=================================
//             project
//=================================

router.post("/getProjects", (req, res) => {
    Project.find({ "member": req.body.userId })
    .exec((err, projects)=>{
        if(err) return res.status(400).send(err)
        res.status(200).json({success:true, projects})
    })
});

router.post("/saveProject", (req, res) => {
    const project = new Project(req.body)
    project.save((err, doc)=>{
        if(err) return res.send(err)
        res.status(200).json({success:true, doc})
    })
});

router.post("/deleteProject", (req, res) => {

    Project.findOneAndDelete({ "title" : req.body.title, "member" : req.body.member })
    .exec((err, doc) => {
        if(err) return res.status(400).send(err) 
        res.status(200).json({success: true, doc })
    })

});

module.exports = router;


import React, { useState } from 'react';
import { Modal, Button } from 'antd';

const App = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    console.log("오케이");
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    console.log("아냐");
    setIsModalVisible(false);
  };

  return (
    <>
      <Button type="primary" onClick={showModal}>
        Open Modal
      </Button>
      <Modal title="Basic Modal" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
      </Modal>
    </>
  );
};

ReactDOM.render(<App />, mountNode);




const express = require('express');
const { Project } = require('../models/Project');
const router = express.Router();


//=================================
//             project
//=================================

router.post("/getProjects", (req, res) => {
    Project.find({ "member": req.body.userId })
    .exec((err, projects)=>{
        if(err) return res.status(400).send(err)
        res.status(200).json({success:true, projects})
    })
});

router.post("/saveProject", (req, res) => {
    const project = new Project(req.body)
    project.save((err, doc)=>{
        if(err) return res.send(err)
        res.status(200).json({success:true, doc})
    })
});

router.post("/deleteProject", (req, res) => {

    Project.findOneAndDelete({ "title" : req.body.title, "member" : req.body.member })
    .exec((err, doc) => {
        if(err) return res.status(400).send(err) 
        res.status(200).json({success: true, doc })
    })

});

module.exports = router;
