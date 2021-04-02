import React from 'react'
import { useState } from 'react'
import { Typography, Button, Form, message, Input, Icon } from 'antd';
import axios from 'axios';
import Dropzone from 'react-dropzone';
import { FileAddOutlined } from '@ant-design/icons';
import {useSelector} from 'react-redux';
import './Upload.css';

const {Title, Text} = Typography;

function FileUploadPage(props) {
    
    const user = useSelector(state => state.user);
    const [ProjectTitle, setProjectTitle] =useState("")
    const [FilePath, setFilePath] =useState("")

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

            } else {
                alert('파일 업로드 실패')
            }
        })
    }

    const onSubmit = (e) =>{
        e.preventDefault();

        if (ProjectTitle === "" ||FilePath === "" ) {
            return alert('Please first fill all the fields')
        }

        const variables = {
            //스키마에 따라서 바뀜
            member: user.userData._id,
            title: ProjectTitle,
            filePath: FilePath
        }
        axios.post('/api/project/uploadProject', variables)
            .then(response=>{
                if(response.data.success){
                    alert('파일 업로드가 되었습니다.')
                    props.history.push('/')
                }
                else{
                    alert('파일 업로드에 실패하였습니다.')
                }
            })
    }

    return (
        <div style={{maxWidth:'500px',margin:'1rem auto', textAlign:'center'}}>
            <div style ={{ marginBottom:'2rem'}}>
                <Title level={3}>대화 내용 분석기</Title>
            </div>

           <Form onSubmit={onSubmit}>
                <div style={{display:'flex', justifyContent:'space-between'}}>
                    <Title level={4}>프로젝트명</Title>
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
                                {FilePath?<div style={{color:'white'}}>파일이 업로드 되엇습니다.</div>:<Text strong style={{color:'white'}}>Click or drag file to this area to upload</Text>
}
                            </div>
                        )}
                    </Dropzone>
                
                <Button type="primary" size="large" onClick={onSubmit} style={{width:'100px', textAlgin:'center'}}>
                    제출
                </Button>
           
               

           </Form>
            
            
        </div>
    )
}

export default FileUploadPage
