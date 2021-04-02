import React, { useState, useEffect } from "react";
import { Layout, Menu, Breadcrumb, Row, Button,Radio } from 'antd';
import GridCards from "./Sections/GridCards";
import { withRouter } from 'react-router-dom';
import axios from 'axios';
import Profile from "../Profile/Profile";
import FileUploadPage from "./Sections/FileUploadPage";
import './MainPage.css';
import { Typography, Form, message, Input, Icon } from 'antd';
import Dropzone from 'react-dropzone';
import { AlertTwoTone, FileAddOutlined } from '@ant-design/icons';
import {useSelector} from 'react-redux';

//import { Table } from 'react-bootstrap';
const { Header, Content, Footer, Sider } = Layout;

const {Title, Text} = Typography;

function MainPage(props) {
    const [UserInfo, setUserInfo] = useState([])
    //const [ProjectResult, setProjectResult] = useState([]) //제출 누르고 project db 가져오기
    
    const [Projects, setProjects] = useState([])
    const [MedalProjects, setMedalProjects] = useState([])
    const [FreeRiderProjects, setFreeRiderProjects] = useState([])
    const [ProjectContributionAverage, setProjectContributionAverage] = useState(0)
    // 재확인 기능
    const [isModalVisible, setIsModalVisible] = useState(false);

    const user = useSelector(state => state.user);
    const [ProjectTitle, setProjectTitle] =useState("")
    const [FilePath, setFilePath] =useState("")

    
    const [Member, setMember] = useState("") 
    //데이터분석팀으로 받아야할 값
    //const [Members, setMembers] = useState([])
    //const [MembersContribution, setMembersContribution] = useState([])
    //const [ProjectResult, setProjectResult] = useState([])


    const Members = ["younhee", "song", "sing", "sung"]
    const MembersContribution = [45,20,20,1]
    const ProjectResult = ['img1', 'img2'] 
    
    const handleChangeTitle = (e) => {
        console.log(e.currentTarget)
        setProjectTitle(e.currentTarget.value)
    }

    const onDrop = (files) => {

        let formData = new FormData();
        const config = {
            header: { 'content-type': 'multipart/form-data' }
        }
        formData.append("file", files[0])

        console.log(files);
        
        axios.post('/api/project/uploadfiles', formData, config)
        .then(response => {
            if (response.data.success) {
                let variable = {
                    filePath: response.data.filePath,
                    fileName: response.data.fileName
                }
                setFilePath(response.data.filePath)
                //setMembers(response.data.members)
                //setMembersContribution(response.data.members_contribution_degree)
                //setProjectResult(response.data.img_path)
                console.log(response.data.message)
            } else {
                alert('파일 업로드 실패')
            }
        })
    }
    //여기까지 카톡분석파일 받기


    const showModal = () => {
      setIsModalVisible(true);
    };
    
    const handleOk = () => {
        onClickDelete();
        setIsModalVisible(false);
    };
    
    const handleCancel = () => {
        console.log("취소하셨습니다.");
        setIsModalVisible(false);
    };

    
    /////// 추가한거!!!!!
    // 클릭하면 프로젝트 지워진다.
    const onClickDelete = (id, member)=>{
        const variables = {
            id,
            member
        }
        let variable ={
            userId : localStorage.getItem('userId')
        }
        axios.post('/api/project/deleteProject', variables)
        .then(response=>{
            if(response.data.success){
                alert('리스트에서 지우는데 성공했습니다.')
                axios.post('/api/project/getProjects', variable)
                .then(response=>{
                    if(response.data.success){
                        setProjects(response.data.projects)
                        let sum =0;
                        response.data.projects.forEach(function(project){sum+=project.contributionDegree});
                        if(response.data.projects.length ===0){
                            setProjectContributionAverage(0)
                        }else{
                        setProjectContributionAverage(Math.round(sum / response.data.projects.length))
                        }
                        console.log(response.data.projects)
                    }else{
                        alert("저장된 프로젝트들을 가져오지 못했습니다.")
                    }
                })
        
                axios.post('/api/project/getMedalProjects', variable)
                .then(response=>{
                if(response.data.success){
                    setMedalProjects(response.data.medalProjects)
                    console.log(response.data.medalProjects)
                }else{
                    alert("저장된 프로젝트들을 가져오지 못했습니다.")
                }
                })
                axios.post('/api/project/getFreeRiderProjects', variable)
                .then(response=>{
                    if(response.data.success){
                        setFreeRiderProjects(response.data.freeRiderProjects)
                        console.log(response.data.freeRiderProjects)
                    }else{
                        alert("저장된 프로젝트들을 가져오지 못했습니다.")
                    }
                })

            }else{
                alert('리스트에서 지우는데 실패했습니다.')
            }
        })
    }
    /////// 추가한거!!!!!


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

    const onSaveResult = (e)=>{
        // 민영님이 저장하신 txt path경로,title & 데이터분석팀이 저장한 img path경로, members의 기여도 필요.
        // getMedal 여부= 자신의 기여도>= (100%n)*1.3 정도? 1.3인분 이상이면 medal획득?
        e.preventDefault();
        let isPossibleMedal = 0 //default
        let isPossibleFreeRider = 0 //default
        let MemberContributionDegree = MembersContribution[Member] 
        
        if (MemberContributionDegree ===Math.max.apply(null, MembersContribution)){
            isPossibleMedal = 1
        }

        MemberContributionDegree = MembersContribution[Member] * Members.length
        if (MemberContributionDegree <= 50){
            isPossibleFreeRider = 1
        }
        //

        if(ProjectTitle ==="" ||FilePath===""){
            return alert("프로젝트 명을 입력해주세요.")
        }
        let projectVariables= {
             member:localStorage.getItem('userId'),
             contributionDegree: MemberContributionDegree,
             title: ProjectTitle,
             kakaoFile: FilePath,
             getMedal :isPossibleMedal,
             members: Members,
             getFreeRider: isPossibleFreeRider,
             //contributionResult: ProjectResult

        }
        axios.post('/api/project/saveProject', projectVariables)
        .then(response=>{
            if(response.data.success){
                console.log(response.data)
            }else{
              alert("프로젝트 결과 분석 데이터를 저장하는데 실패했습니다.")
            }
         })

         let userVariable ={
            userId : localStorage.getItem('userId')
        }
         axios.post('/api/project/getProjects', userVariable)
         .then(response=>{
             if(response.data.success){
                setProjects(response.data.projects)
                console.log(response.data.projects)
                let sum =0;
                response.data.projects.forEach(function(project){sum+=project.contributionDegree});
                if(response.data.projects.length ===0){
                    setProjectContributionAverage(0)
                }else{
                setProjectContributionAverage(Math.round(sum / response.data.projects.length))
                }
                
                
             }else{
                 alert("저장된 프로젝트들을 가져오지 못했습니다.")
             }
         })
         axios.post('/api/project/getMedalProjects', userVariable)
         .then(response=>{
             if(response.data.success){
                 setMedalProjects(response.data.medalProjects)
                 console.log(response.data.projects)
             }else{
                 alert("저장된 프로젝트들을 가져오지 못했습니다.")
             }
         })

         axios.post('/api/project/getFreeRiderProjects', userVariable)
        .then(response=>{
            if(response.data.success){
                setFreeRiderProjects(response.data.freeRiderProjects)
                console.log(response.data.freeRiderProjects)
            }else{
                alert("저장된 프로젝트들을 가져오지 못했습니다.")
            }
        })

    }
        /////// 추가한거!!!!!
    // 프로젝트들 테이블로 띄우기
    
    /////// 추가한거!!!!!
    const projectsTable = Projects.map((project, index) => {

        return <tr>
            <td class="tablechild">{index+1}</td>
            <td class="tablechild">{project.title}</td>
            {project.contributionDegree >= 100 ? <td class="tablechild" style={{color:'#1A7EC0'}}>{project.contributionDegree}</td>:  
            <td class="tablechild" style={{color:'rgba(216, 84, 84, 0.856)'}}> {project.contributionDegree}</td> }
            <td class="tablechild">
            {/*사실 title이 아니라 project._id임 */}
            <Button type="primary" onClick={()=>onClickDelete(project._id, project.member)}>
                삭제 
            </Button>
            </td>
        </tr>
    })

    useEffect(()=>{
        //유저 정보가져오기.
        let variable ={
            userId : localStorage.getItem('userId')
        }
        axios.post('/api/users/getUser', variable)
        .then(response=>{
            if(response.data.success){
                setUserInfo(response.data.userInfo[0])
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
                let sum =0;

                response.data.projects.forEach(function(project){sum+=project.contributionDegree});
                if(response.data.projects.length ===0){
                    setProjectContributionAverage(0)
                }else{
                setProjectContributionAverage(Math.round(sum / response.data.projects.length))
                }
                console.log(response.data.projects)
            }else{
                alert("저장된 프로젝트들을 가져오지 못했습니다.")
            }
        })
        //처음에 금메달을 획득한 프로젝트들 가져오기
        axios.post('/api/project/getMedalProjects', variable)
        .then(response=>{
            if(response.data.success){
                setMedalProjects(response.data.medalProjects)
                console.log(response.data.medalProjects)
            }else{
                alert("저장된 프로젝트들을 가져오지 못했습니다.")
            }
        })

        axios.post('/api/project/getFreeRiderProjects', variable)
        .then(response=>{
            if(response.data.success){
                setFreeRiderProjects(response.data.freeRiderProjects)
                console.log(response.data.freeRiderProjects)
            }else{
                alert("저장된 프로젝트들을 가져오지 못했습니다.")
            }
        })
        

    },[])

    


    return (
        <>
        <Layout style={{ minHeight: '100vh', backgroundColor:'#ffffff' }}>
            <Sider style={{backgroundColor:'#EDF8FF'}}>
               {/*프로파일 */}
               {UserInfo && MedalProjects && 
               <Profile medalProjects = {MedalProjects} freeRiderProjects ={FreeRiderProjects} userName={UserInfo.name} projectContributionAverage ={ProjectContributionAverage} /> }
            </Sider>
            <Layout  style={{ minHeight: '100vh', backgroundColor:'#ffffff', width:'80%', margin:'3rem'}}>
            <div style={{margin: '1rem'}}>
                <div style={{ padding: 12}}>
                         {/*카톡 txt파일 */}
                         <div style={{maxWidth:'500px',margin:'1rem auto', textAlign:'center'}}>
            <div style ={{ marginBottom:'2rem'}}>
                <Title level={3} style={{fontSize:'40pt', color:'#61a1e2'}}>NO PAIN, NO GAIN</Title>
                <Title level={3}>대화 내용 분석기</Title>
            </div>

           <Form onSubmit={onSaveResult}>
                <div style={{display:'flex', justifyContent:'space-between'}}>
                    <Title level={4} style={{width:'100px'}}>프로젝트</Title>
                    <Input
                    onChange={handleChangeTitle}
                    value={ProjectTitle}
                    className="input"
                    placeholder="프로젝트명을 입력해주세요" />
                </div>
                <br></br>
                <Dropzone
                    onDrop={onDrop}
                    multiple={false}
                    accept='text/*'
                        maxSize={800000000}>
                        {({ getRootProps, getInputProps }) => (
                            <div style={{ width: '500px', height: '150px', marginBottom:'1rem', border: '10px solid #28A0FF', borderRadius:'0.25rem',background:'#1E96FF', display:'inline-block',alignItems: 'center', justifyContent: 'center' }}
                                {...getRootProps()}
                            >
                                <input {...getInputProps()} />
                                <br></br>
                                {/*FileAddOutlined 나중에*/}
                                {/*<FileAddOutlined style={{fontSize:'3em', color:'white'}} />*/}
                                <br> 
                                </br><br></br>
                                {FilePath?<div style={{color:'white'}}>파일이 업로드 되었습니다.</div>
                                :<Text strong style={{color:'white'}}>Click or drag file to this area to upload</Text>}
                            </div>
                        )}
                    </Dropzone>
           </Form>
            
            
        </div>
                         </div>

                        <div  style={{ margin: "auto", width:"75%"}}>
                            <h2 style={{fontSize:'25px'}}>분석결과</h2>
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
                            
                            <label> 이름 </label>
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
                        <div style={{margin: "auto", width:"75%" }} >
                                <h1 style={{fontSize:'25px', marginTop:'20px'}}> 나의 분석 기록 </h1>
                                <p>
                                    기여도 100점은 1인의 역할을 다했을 경우의 점수입니다.
                                </p>
                            
                            <table striped bordered hover size="sm">
                                <thead>
                                    <tr>
                                        <th class="tableheader">No</th>
                                        <th class="tableheader" style={{width:"63%", paddingLeft: '10px'}}>프로젝트 명</th>
                                        <th class="tableheader" style={{width:"17%"}}>기여도</th>
                                        <th class="tableheader">관리</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    
                                    {projectsTable}

                                </tbody>

                            </table>
                        </div>

                    </div>

                    
                    
            
        
            </Layout>
            <Button onClick={onClickLogout} style={{positon:'absolute', top:'10px', right:'10px'}}>LOGOUT</Button>
        </Layout>
        </>
    )
}


export default withRouter(MainPage);

